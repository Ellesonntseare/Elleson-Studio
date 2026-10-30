# Local speech processing

The editor supports offline speech transcription, phonetic mouth analysis and local voice-over generation. The private desktop runtime supports processing without the development preview server. Local Piper and Kokoro voice generation is bundled in 0.5.0.

## Local voice generation

`node speech/install-tts.cjs` installs pinned Piper 1.8.0 and the English VCTK medium model into the project and portable desktop runtime. The installed model is 76,952,753 bytes, with SHA-256 `4e9fc85ab9009385319fc6bae7f55577f8a2d7ee77fd9159a5500eb6531f41e6`. Four configured profiles are exposed as English voices A–D. Model attribution, license notices, engine source archive and download manifest are retained under `tts-notices/`.

`GET /api/voices` lists installed profiles; `POST /api/tts` accepts text, a configured voice ID, pace and delivery. `tts.py` uses the local ONNX model on CPU, preloads the private C++ runtime and returns mono PCM16 WAV at 22,050 Hz. Local generation makes no network request. Each synthesis request accepts at most 2,000 characters; the Voice-over interface automatically sections long scripts and joins them, then places narration across scenes. Local pace is 0.6–1.6. Optional ElevenLabs voices use Multilingual v2 with pace 0.7–1.2 and require internet/account credits. The main-process adapter reads credentials from ELEVENLABS_API_KEY or private %APPDATA%/EllesonStudio/elevenlabs.env, outside the distributable.

In **Script → Create voice**, preview the audio before adding it to the dialogue. Character voice preferences and the narrator voice are independent. Optional Rhubarb analysis creates mouth timing for a character line; generated audio uses the same timeline mix as imported voices and music. These are starter neural voices with limited emotional acting.

Verification: `node tests/offline-voice.cjs` checks actual synthesis, separate voice choices, lip-sync and an exported speech/music mix. `node tests/offline-voice.cjs --native` exercises the desktop protocol and UI without packaging an installer.

## Optional Kokoro voices

Kokoro ONNX 0.6.1 is installed locally with the v1.0 fp32 model (325,532,387 bytes) and voice styles (28,214,398 bytes). Heart and Bella are US female profiles; Fenrir is a US male profile and George a UK male profile. Existing Piper defaults remain available. The same files and isolated dependencies are staged in the independent desktop runtime.

Choose Natural, Narrator, Bright, Gentle or Serious delivery. Profiles adjust neural speed and sentence/clause pauses; they do not promise expressive emotional acting. Kokoro outputs mono PCM16 WAV at 24 kHz. All generation runs on the local CPU. The text, pace and duration limits above still apply.

Model/source manifests and licenses are retained under `tts-notices/kokoro`: Apache 2.0 model, MIT wrapper, and GPL 3 phonemizer/eSpeak dependencies. Download fragments are excluded from packaging. Listen to `test-output/kokoro-narrator-sample.wav` and `test-output/kokoro-character-sample.wav` before choosing a voice for a project.

Use `node tests/offline-voice.cjs --kokoro` and `node tests/offline-voice.cjs --kokoro --native` to exercise actual synthesis, UI preferences, lip-sync and dialogue timing. The browser test also decodes the exported voice/music mix.

## Installed components

- faster-whisper 1.2.1 and CTranslate2 4.8.4, installed as project-local Python packages.
- Systran's multilingual faster-whisper-tiny model in `models/tiny`; downloaded files are verified against Hugging Face's published SHA-256 when available.
- Rhubarb Lip Sync 1.14.0 Windows binary and resources in `rhubarb/`; its original licenses and documentation are retained. Download URL and local SHA-256 are in `rhubarb-download.json`.
- A private Microsoft C++ runtime DLL in `native/`. The installed system runtime was too old for the current ML wheels and caused native crashes; preloading the newer local runtime fixes that on this PC. This local evaluation copy is not an application installer.

The interpreter path is stored in `config.json`. It currently points to the bundled Python 3.12 runtime available on this PC. Python dependencies are inside this project, not installed into the shared interpreter. The shared interpreter supplies NumPy.

## Operation

`server-api.cjs` accepts same-origin requests from the loopback editor only. Imported audio is sent to the local Node server as decoded WAV, converted to 16 kHz mono PCM, then processed by `transcribe.py` or Rhubarb. Audio is never uploaded to an external speech service. Temporary files are created under an isolated OS temp folder and removed after processing. Only one processing job runs at once; input is capped at five minutes per analysis.

`transcribe.py` loads Whisper from the local directory with `local_files_only=True`, uses CPU int8 inference and word timestamps, and filters silence with Silero VAD. PCM reading uses Python's built-in wave module to avoid a PyAV API incompatibility. The small multilingual model needs manual review for names, accents and noise. Word timing is estimated by the model, not manually distributed across a transcript.

Rhubarb uses its language-independent phonetic recognizer and returns timed A–H/X mouth cues. The renderer draws all nine shapes and follows the selected narration clip's source trim, timeline position and playback rate. This is phonetic analysis, not a volume-only animation, but timing still benefits from review.

## Verification

```
node tests/transcription.cjs
node tests/local-processing.cjs
```

Tests use a locally synthesized spoken recording, exercise the actual processing services through the browser, verify recognized words and timestamps, generate multi-scene captions and mouth cues, and reopen the project to check persistence.

Upstream projects and licenses:

- https://github.com/SYSTRAN/faster-whisper
- https://github.com/OpenNMT/CTranslate2
- https://huggingface.co/Systran/faster-whisper-tiny
- https://github.com/DanielSWolf/rhubarb-lip-sync

`desktop/prepare-runtime.cjs` prepares the independent runtime in `desktop-runtime/speech`, including the official Python 3.12.10 embeddable distribution, NumPy and the project-local processing dependencies. The packaged configuration uses a relative interpreter path. Each dependency's notices remain alongside it. The app package includes this directory as resources; source archives and download fragments are excluded.
