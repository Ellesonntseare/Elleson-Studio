"""Offline, CPU-based speech recognition for the local editor preview."""
import json
import os
import sys
import ctypes
from pathlib import Path

root = Path(__file__).resolve().parent
sys.path.insert(0, str(root / 'python-packages'))
sys.stdout.reconfigure(encoding='utf-8')
# Keep the local speech runtime independent of an older system-wide C++ runtime.
cpp_runtime = root / 'native' / 'MSVCP140.dll'
if cpp_runtime.exists():
    ctypes.WinDLL(str(cpp_runtime))

def main():
    from faster_whisper import WhisperModel
    import numpy as np
    import wave
    source, language = sys.argv[1], sys.argv[2]
    with wave.open(source, 'rb') as wav:
        if wav.getsampwidth() != 2:
            raise ValueError('Speech analysis expects 16-bit PCM audio.')
        channels, rate = wav.getnchannels(), wav.getframerate()
        audio = np.frombuffer(wav.readframes(wav.getnframes()), dtype='<i2').astype(np.float32) / 32768.0
        if channels > 1:
            audio = audio.reshape(-1, channels).mean(axis=1)
        if rate != 16000:
            audio = np.interp(np.arange(int(len(audio) * 16000 / rate)) * rate / 16000,
                              np.arange(len(audio)), audio).astype(np.float32)
    if not len(audio) or float(np.sqrt(np.mean(audio * audio))) < 0.0001:
        print(json.dumps({'language': language, 'segments': []}))
        return
    model = WhisperModel(str(root / 'models' / 'tiny'), device='cpu', compute_type='int8',
                         cpu_threads=min(4, os.cpu_count() or 2), local_files_only=True)
    segments, info = model.transcribe(audio, language=None if language == 'auto' else language,
                                      word_timestamps=True, beam_size=3, vad_filter=True,
                                      condition_on_previous_text=False)
    result = []
    for segment in segments:
        words = [{'start': round(w.start, 3), 'end': round(w.end, 3), 'text': w.word.strip()}
                 for w in (segment.words or []) if w.end > w.start and w.word.strip()]
        result.append({'start': round(segment.start, 3), 'end': round(segment.end, 3),
                       'text': segment.text.strip(), 'words': words})
    print(json.dumps({'language': info.language, 'segments': result}, ensure_ascii=False))

if __name__ == '__main__':
    main()
