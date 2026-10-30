# Elleson Studio source

This repository contains the animation editor, Electron desktop integration, local speech adapters, runtime preparation scripts, bundled browser assets and verification scripts. Saved user projects, downloaded runtimes, installers and API credentials are excluded.

## Develop on Windows

1. Install Node.js and run `npm ci` in the repository folder.
2. Run `npm start` for the desktop editor or `npm run preview` for the browser preview.
3. For local speech, see `speech/README.md` and the preparation scripts in `speech/`. Copy `speech/config.example.json` to `speech/config.json` and set its Python path for this machine. Downloaded engines, models and Python packages are separate from the source checkout.
4. Desktop export requires FFmpeg at `desktop/tools/ffmpeg.exe`; preserve its license notices. Desktop packaging also requires the speech runtime prepared by `desktop/prepare-runtime.cjs`. Run `npm run build` after preparing those dependencies.

ElevenLabs is optional. Set `ELEVENLABS_API_KEY` in the environment or the private Windows application-data configuration described in the main README. Keep credentials outside this repository. Local voices do not require ElevenLabs.

## Latest verified work

- Scene continuation, consistent walking knees and walking across scene boundaries.
- Timeline clip editing, Delete/Backspace, copy/paste, duplicate, split and keyboard shortcut cards.
- Visual assets and captions from all scenes remain visible in the timeline.
- Scene-boundary transition controls with duration and playback.
- Direct per-character voice creation with independent saved voice choices and mouth timing.

Focused checks are `tests/timeline-commands.cjs`, `tests/scene-strip-actions.cjs`, `tests/long-walk.cjs`, `tests/continuous-timeline.cjs` and `tests/native-scene-join.cjs`. Some native and media tests use installed runtimes or generated fixtures; this is documented by their setup code. They are not all self-contained in a fresh checkout.

Verification on 30 October 2026 included two actual local character voices, independent mouth timing, save/reload, and an actual 1080p MP4 with crossfading scene backgrounds and continuous audio. The installer files are separate from this repository; this upload is the source project.
