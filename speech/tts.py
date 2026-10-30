"""Offline voice synthesis using the local Piper runtime and a configured model."""
import ctypes
import json
import os
from pathlib import Path
import sys
import wave
import math
import re
import unicodedata

root = Path(__file__).resolve().parent
sys.path.insert(0, str(root / "python-packages"))
sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["ORT_LOG_SEVERITY_LEVEL"] = "3"
dll_handles = []
if os.name == "nt":
    for folder in [root / "native", root / "python-packages/piper", root / "python-packages/onnxruntime/capi"]:
        if folder.exists():
            dll_handles.append(os.add_dll_directory(str(folder)))
    runtime = root / "native/MSVCP140.dll"
    if runtime.exists():
        ctypes.WinDLL(str(runtime))

def prepare_speech_text(text, pronunciations):
    text = unicodedata.normalize('NFKC', text).translate(str.maketrans({'\u2018': "'", '\u2019': "'", '\u201c': '"', '\u201d': '"', '\u00a0': ' ', '\u2014': ', ', '\u2013': ', '}))
    # One substitution pass prevents cascading replacements of names.
    mapping = {p['word'].strip().casefold(): p['say'].strip() for p in pronunciations}
    if mapping:
        pattern = r'(?<!\w)(?:' + '|'.join(re.escape(word) for word in sorted(mapping, key=len, reverse=True)) + r')(?!\w)'
        text = re.sub(pattern, lambda m: mapping[m.group(0).casefold()], text, flags=re.IGNORECASE)
    return text


def main():
    all_config = json.loads((root / "config.json").read_text(encoding="utf-8"))
    config = all_config["tts"]
    request = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    text = request.get("text", "").strip()
    if not text or len(text) > 2000:
        raise ValueError("Enter between 1 and 2000 characters of dialogue.")
    text = prepare_speech_text(text, request.get('pronunciations', []))
    profiles = config["voices"] + all_config.get("kokoro", {}).get("voices", [])
    selected = next((v for v in profiles if v["id"] == request.get("voice")), None)
    if not selected:
        raise ValueError("Choose an installed voice.")
    speed = float(request.get("speed", 1))
    if not math.isfinite(speed) or not .6 <= speed <= 1.6:
        raise ValueError("Voice speed must be between 0.6 and 1.6.")
    delivery = request.get("delivery", "natural")
    deliveries = {"natural": (1, .23, .09), "narrator": (.98, .28, .12), "bright": (1.04, .18, .08), "gentle": (.95, .28, .12), "serious": (.98, .26, .11)}
    if delivery not in deliveries:
        raise ValueError("Choose a supported delivery style.")
    pace, sentence_pause, clause_pause = deliveries[delivery]
    speed = max(.5, min(1.8, speed * pace))
    if selected.get("engine") == "kokoro":
        sys.path.insert(0, str(root / "kokoro-packages"))
        from kokoro_onnx import Kokoro
        import numpy as np
        import onnxruntime as ort
        options = ort.SessionOptions()
        options.intra_op_num_threads = 4
        options.inter_op_num_threads = 1
        options.log_severity_level = 3
        model = all_config["kokoro"]
        session = ort.InferenceSession(str(root / model["model"]), sess_options=options, providers=["CPUExecutionProvider"])
        engine = Kokoro.from_session(session, str(root / model["styles"]))
        audio, sample_rate = engine.create(text, voice=selected["speaker"], speed=speed, lang=selected.get("language", "en-us"), sentence_pause=sentence_pause, clause_pause=clause_pause)
        if len(audio) / sample_rate > 60:
            raise ValueError("This line exceeds 60 seconds. Split the text into shorter turns.")
        if len(audio) < 100 or not np.isfinite(audio).all():
            raise ValueError("No usable speech was produced.")
        peak = float(np.max(np.abs(audio)))
        if peak > .98:
            audio = audio * (.98 / peak)
        pcm = (np.clip(audio, -1, 1) * 32767).astype("<i2").tobytes()
        with wave.open(sys.argv[2], "wb") as output:
            output.setnchannels(1)
            output.setsampwidth(2)
            output.setframerate(sample_rate)
            output.writeframes(pcm)
        print(json.dumps({"duration": len(audio) / sample_rate, "sampleRate": sample_rate, "voice": selected["id"], "engine": "kokoro", "delivery": delivery}))
        return
    from piper import PiperVoice, SynthesisConfig
    voice = PiperVoice.load(str(root / config["model"]), use_cuda=False)
    synthesis = SynthesisConfig(speaker_id=selected["speaker"], length_scale=1 / speed, normalize_audio=True)
    frames = 0
    with wave.open(sys.argv[2], "wb") as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(voice.config.sample_rate)
        for chunk in voice.synthesize(text, syn_config=synthesis):
            if frames and delivery != "natural":
                pause_frames = int(sentence_pause * voice.config.sample_rate)
                output.writeframes(b"\x00\x00" * pause_frames)
                frames += pause_frames
            audio = chunk.audio_int16_bytes
            frames += len(audio) // 2
            if frames / voice.config.sample_rate > 60:
                raise ValueError("This line exceeds 60 seconds. Split the text into shorter turns.")
            output.writeframes(audio)
    if frames < 100:
        raise ValueError("No speech was produced. Try a different line.")
    print(json.dumps({"duration": frames / voice.config.sample_rate, "sampleRate": voice.config.sample_rate, "voice": selected["id"]}))

if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
