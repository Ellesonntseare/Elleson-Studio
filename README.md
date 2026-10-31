# Elleson Studio 0.5.0

## Local Director and animation update — 1 November 2026

Select any character, text layer or object and choose **Direct selected item**. Write what should happen, choose a point (including another scene) or draw a route, then choose **Make a plan**. Review the proposed actions, preview them and choose **Apply**. Undo restores the previous project. The local AI proposes supported editor actions. Existing artwork and rig joints determine which body movements are possible.

Director supports named items together, exact start times, movement strength, saved per-item styles, listener reactions, reachable object interactions and immediate dialogue replies. Replies follow existing audio and prepare editable new dialogue; generate its voice after reviewing the text. Speak direction records at most 60 seconds and transcribes locally before planning. Performance choices change motion pace and strength. A selected range of an existing single-scene action can be sped up or slowed down while preserving the surrounding movement.

The official Qwen3 4B Q4_K_M model and llama.cpp CPU runtime live outside the repository and app archive, under `%LOCALAPPDATA%/Elleson Studio/AI`. Run `node speech/setup-director.cjs` for resumable setup; it verifies model and runtime SHA256 values and saves their licenses and source records. The model is 2,497,280,256 bytes (about 2.33 GiB), with additional runtime and memory requirements. Inference runs on the PC; the measured checks took about 20–82 seconds per instruction on this CPU. New computers need this separate model setup.

Scene edges support dragging from either side, with a selectable trim point on the scene bar. Keep scene going carries ending positions, walking phase and held objects forward. Audio waveforms show the actual sound. Focus and panel controls give the central preview more room. Animation improvements include natural walk starts/stops, reviewed foot-slide correction, supplied-view blending, rig-preserving artwork replacement, editable audio-accent gestures and direct grip adjustment. Voice edits offer reviewed visual/caption/camera retiming, and local speech reuses a warm worker.

## Voice-over update — 30 October 2026

The toolbar Voice-over button opens narrator generation directly. Longer scripts are generated in sentence-aware sections, previewed/downloaded as one WAV, and placed continuously across scenes. Text is no longer cut off at 2,000 characters in the interface. Project scene/audio capacity and available memory still apply. Stop after this section cancels before changing the project.

Seven Kokoro voices (Heart, Bella, Fenrir, George, Michael, Nicole and Emma) and four Piper draft voices are available locally. Natural voice buttons, remembered choices, custom pronunciations and phrase pacing reduce repeat setup.

Optional ElevenLabs voices appear in a separate online group. Preview and generation send the script to ElevenLabs and consume account credits. The server uses Multilingual v2 and joins MP3 responses into WAV for the same editable timeline and local lip-sync workflow. Credentials stay in the main process: use ELEVENLABS_API_KEY or the private %APPDATA%/EllesonStudio/elevenlabs.env file. Never put a key inside dist, a shared project, or the installer. Local voice generation does not contact ElevenLabs.

The ElevenLabs catalog connection was verified without generating new paid speech. Contract tests use mock API responses and real MP3 decoding. API reference: https://elevenlabs.io/docs/api-reference/text-to-speech/convert.


Local Windows animation editor with a dark workspace, imported picture rigs, offline voices and a multitrack timeline.

## Usability update

- Selection status distinguishes a missing selection from a manual editing lock. Pose-library clicks automatically select a sole scene character or let you choose between several characters; locked characters offer an explicit unlock-and-pose action.
- Character controls are grouped into Add, Appearance, Animate and Voice. Canvas handles keep a usable screen size, with a nearby selection toolbar and a draggable walking-destination marker.
- Drop images, video or audio onto the canvas or timeline. Timeline tools fit the project, reveal the playhead, jump scenes and zoom around the pointer with Ctrl/Alt + wheel.
- Choose audio, generate local mouth cues and preview voice/mouth movement inside the Voice section, without opening a second speech dialog.
- Combined performance files save body motion, travel, expressions, hand gestures and voice settings together. They use the target's own artwork/audio, reject conflicting paths or interactions and preserve animation outside the chosen range. Existing motion, pose, grip and voice-take libraries remain available.
- Draft/Balanced/High preview quality and a bounded 64 MB frame cache improve repeated animation playback. Edits, undo and project changes clear the cache. Video/GIF scenes use live playback; source artwork preloads into the shared image cache. Preview settings never reduce export dimensions.
- Export review shows the actual container/codec, dimensions, frame rate, duration, audio handling and an estimated size range. Size is an estimate, not a guaranteed output size.

Verification: `tests/usability.cjs`, `tests/usability-edges.cjs`, `tests/native-usability.cjs` (development and packaged), plus integration, minimal UI, project board, body animation and rich text regressions. The native check decodes actual 1920 × 1080 MP4 artwork after draft cached playback and direct local lip-sync.

Run `npm run preview` and open http://127.0.0.1:4317. The preview refreshes when `dist/revision.json` changes and saves the workspace before reloading. Browser-preview and desktop application storage are separate.

## Current animation, text and project workspaces

- Guided picture rigging places movable anatomy markers, previews suggested cut polygons and builds missing connected parts. Cut-outs still need review and edge cleanup; guides are placed by the user rather than detected automatically.
- Picture characters can keep supplied front, side and back rigs, with keyed view changes, common body-role IDs and existing voice/action/object references. Hidden surfaces require supplied artwork.
- Motion clips capture selected body regions and can be saved locally or as portable JSON. Preview speed, strength, mirroring, travel and repeats before applying compatible joint controls. Cleanup smooths keys and can bake a reachable foot contact over a short interval, with original/edited comparison and undo.
- Voice takes embed up to eight auditioned WAV versions per script line. Listening leaves the dialogue unchanged; choosing a take replaces its voice, refreshes phonetic lip-sync and rearranges timing. Story rehearsal uses static storyboard frames with the real timeline mix and per-scene notes.
- Editable text supports direct canvas wording changes, selected-word fonts/colours/sizes, wrapping boxes with a draggable width handle, labels attached to moving objects, individually timed word appearances, and literal cross-scene find/replace with preview, locked-layer protection and one-step undo. These stay editable in project backups.
- Projects now has In progress, Unpublished and Finished columns, search/status filters and up to eight project tabs. Switching saves the outgoing draft and restores media, playhead and each tab’s undo history during the session. Status labels organise local work; exporting does not publish a project.

Verified current features include actual cut-outs and view pixels, transferred limb motion in an MP4, voice-take generation with real lip-sync, rehearsal audio, project/tab switching and text persistence. An actual 1920 × 1080 H.264 MP4 contains rich text, wrapping, individual word timing and a following label.

The 34 requested feature additions and improvements are implemented and feature-tested. MP4 is the main export; WebM, MOV and GIF are also supported. Actual Full HD and 4K output dimensions, container signatures, rendered animation and audio alignment were checked. Installer build and installed-app verification are tracked in CHECKLIST.md.

## Production tools — current source preview

- **Animate → Characters & objects** makes a character pick up, hold, carry, hand over, point at or release an object. Choose the character, hand, object and timing. The object follows the solved hand while walking or using custom poses. Imported characters need connected arm parts. Pickup and handover require reachable positions.
- **Script → Plan scenes** turns scene headings, paragraphs and named dialogue into a reviewable storyboard. Edit scene titles, durations, framing and suggested objects, then create editable scenes. This assistant uses local text rules and object keywords. Existing presenters can be reused.
- Select a vector object and open **Animate individual parts** to key laptop lids/screens, individual chart bars, clock hands and other supported details. Main position/scale keys remain independent. Flat clay/realistic PNGs support whole-object animation.
- **Create voice** offers four optional Kokoro voices alongside the original four Piper profiles. Try Natural, Narrator, Bright, Gentle or Serious delivery and preview the actual local speech. Delivery changes pace and pauses; full emotional acting is not supported. The narrator and each character remember separate choices.
- **More tools → Continue into next scene** carries the selected character's pose, position, appearance and held objects into a new or existing scene. Linked copies update instead of multiplying; old speech and actions are cleared so the next scene can have its own performance.

Desktop video export samples every timeline frame at 30 fps before encoding MP4 or WebM, preserving hand interactions and part animation even when rendering takes longer than playback. Temporary PNG frames are limited to 4 GB; choose shorter sequences or a lower resolution for large projects. The browser preview retains real-time WebM export.

These additions are included in the 0.5.0 source and build.

Production update verification: `tests/production-tools.cjs`, `tests/production-links.cjs`, `tests/native-production.cjs`, `tests/native-video-frames.cjs`, `tests/native-animation.cjs`, and `tests/offline-voice.cjs --kokoro` (also `--native`) passed actual UI, persistence, rendered-pixel, audio and queue checks. The isolated portable Python runtime synthesized a 24 kHz Kokoro narrator sample. Minimal UI, body animation, general integration, project format and story export regressions also passed.

## Storytelling and body animation

The toolbar keeps **Script**, **Shots**, **Animate** and **Effects** visible. **More tools** groups the other workspaces, and advanced character settings expand when needed.

- **Script** stores dialogue per scene. Paste `Character name: dialogue`, assign a character or **Narrator**, import a recording or use **Create voice**, then **Arrange voices**. Expand **Timing & emotion** for pauses, overlaps, start times and performance cues. Linked reactions and camera shots follow their dialogue line.
- **Create voice** generates English speech locally with eleven installed voice profiles across Piper and Kokoro. Preview before adding. Characters remember their chosen voice; the narrator has a separate voice and slower default pace. Generated WAV audio mixes with music and effects on the timeline. Character lines can generate local phonetic lip-sync automatically; imported picture rigs need their mouth area set up.
- **Shots** adds wide, medium, close-up, two-person and over-the-shoulder framing, with cuts or eased changes. Automatic dialogue coverage follows speakers. Over-the-shoulder shots frame the available 2D artwork; supply back-view art for a visible back view.
- **Emotion & reaction cues** adds timed expressions, nods, listening and other gestures. Anchor a listener reaction to a line start or end, or place it freely on the timeline.
- Select a character, expand **Easy animate**, then choose **Customize body animation**. **Hands & arms**, **Legs** and **Head** have separate pose keys and timeline lanes. Scrub time and adjust a joint; choose smooth, even-speed or held interpolation. **Blend with automatic** adds your changes to walking and reactions. Wave and head gestures provide editable starting points; reset each region independently.
- **Walk to point** now bends hips and knees, plants stance feet and swings arms with elbow flex. Adjust stride, foot lift and arm swing. Imported rigs need connected thigh/shin joints for both legs; prepare separate overlapping parts for realistic artwork. Custom arm/head tracks can run while the legs walk. Starting a walk releases existing manual foot pins.

Local voices are clear starter neural speech with limited emotional acting. Imported head controls depend on rigged artwork and marked face areas; a single image cannot provide new head angles or articulated fingers. No training is needed for the procedural walk.

These features are included in 0.5.0. The older 0.4.0 installer remains archived.

## Explainer objects

Open **Objects → Browse 28 objects**. Filter by theme or drawing style and choose an object to add it beside your characters. The collection includes 24 original shaded vector illustrations: devices, office props, finance, education, communication and everyday objects. Laptop and phone also have soft clay and realistic transparent cut-out variants.

The **Explainer object** inspector changes vector primary/accent colors and toggles each object's detail animation: gear rotation, growing charts, steam, typing dots and other small movements. **Movement** adds a float, pop-in or pulse independently of those details. Speed adjusts their timing; ordinary pose keys, paths, effects and timeline trims remain available. Clay and realistic objects are flat artwork with whole-object motion. Their appearance is baked into the image.

Artwork embeds in project files for reuse and offline export. **Save selection** retains the object's animation settings in your reusable library. The original generated PNGs and built-in ImageGen prompt records are in `dist/assets/explainers/`; vectors are authored directly in `dist/explainer-assets.js`.

## Editing

- Create scenes, choose templates or upload backgrounds, then add characters, text, images, drawings and video footage.
- Use **Upload video** above the editor or drop a video onto the canvas area. Imported footage and optional original sound appear on the timeline and stay in project backups.
- Open **Transitions & effects** above the editor for built-in crossfade, slide, zoom, blur dissolve and white-flash transitions, plus color looks. Place two image/video clips end-to-start, choose the outgoing and incoming clip, then apply a transition. The timeline's ↔ badge reopens its settings. Transitions use the outgoing clip's final section and the next clip's opening frame, preserving scene and audio timing.
- Import MP4/WebM from **Media**. Supported footage plays in the canvas, with optional original audio decoded onto a linked track. Video movement, trimming and splitting keep linked audio in sync. Manually moving/trimming the audio detaches it. Codec support depends on the browser.
- In **Cast**, create or edit characters with face and eye shapes, hairstyles, outfits, facial hair, hats, accessories and colors. Saving an edited cast member can update its unlocked scene instances; locked instances keep their existing appearance.
- The toolbar below the canvas switches between **Select**, **Pose joints** and **Motion path**. In Pose joints, drag a character's hands, elbows, knees, feet or head to key its 2D pose at the playhead. Direct posing freezes its current loop pose; imported characters use the pivots configured in their cut-out rig. Seek and drag the keyframe diamonds inside visual timeline clips; arrow keys move a focused diamond by one frame.
- In Select, Shift/Ctrl-click layers or drag a selection box to select several. Use the corner and rotation handles, or the selection controls in the inspector, to transform them together. Ctrl+G groups the selection; Ctrl+Shift+G ungroups it. Locked group members prevent group transforms.
- Draw a selected layer's route with **Motion path**, or use **Camera route** in the inspector for camera movement. Click to add points, drag points to reshape, press Enter to finish or Esc to restore the original route. The inspector controls start/end times, smooth or straight segments, constant speed or easing, and whether a layer follows the route's direction.
- Drag clip bodies to move them and lower edge handles to trim. Audio has separate top corner handles: drag the beginning right to fade in, or the end left to fade out. Shaded ramps show fade lengths. Playback and exported mixes use the same envelope.
- **Sounds → Explainer essentials** is the new default: 11 cinematic sweeps, transitions, a riser, a notification and foley cues. **Legacy game & UI** holds the earlier 113 effects. Search, categories, preview and favorites work within each collection. Added clips embed their audio and source credit. All 124 effects are CC0; source, format and checksum records are in `dist/sounds/explainer/SOURCES.json` and `dist/sounds/CREDITS.md`.
- Clip effects include warm, monochrome, vivid and soft looks plus visual fades. Scene exit transitions include paper fade, black, white, wipe, crossfade, slide, zoom and matching objects, with adjustable duration. The new transitions reveal the next scene's opening frame during the outgoing scene's final seconds; scene and audio timing stay unchanged, with no timeline overlap. Matching objects pairs layers of the same type by name or match tag.
- The Object Workshop draws transparent objects and saves them in a reusable local library.
- Characters support idle/walk/talk loops, automatic blinking, head turns and tilt, hand gestures, and expressions that change at the playhead. Animation timing includes ease-in, ease-out, bounce, hold and a draggable custom cubic curve.
- Text supports typewriter, word-by-word, rise and fade animations, with headline, lower-third and subtitle presets.
- **Captions & lip-sync** performs real local speech recognition with word timestamps and phonetic mouth analysis. Generated captions can highlight the current spoken word. Choose a narration track and character in the dialog. The small recognition model needs review for names, accents and noise. See `speech/README.md` for the installed local runtime.
- Video controls include 0.25×–4× speed with synchronized linked audio, local reversal, freeze-frame images, cropping and masks. Slow clips extend the scene up to its 60-second limit; video audio changes pitch with playback speed. Changing source timing requires regenerating captions.
- **Sequences** saves a scene or full project with its animation, characters, audio, captions and media, then inserts a copy at the end of another project.
- **Scenes → Explainer template pack** adds an editable chart, comparison, milestone timeline, world map, callout or lower third, either as a new scene or as layers in the current scene. Edit chart labels and values in the inspector; text and shapes remain individually editable. The map uses public-domain Natural Earth land outlines, credited in `dist/data/CREDITS.md`.
- **Storyboard** shows opening-frame previews with scene names, durations and script notes. Drag scene handles or use the arrows to reorder, and download all script notes as text. Audio wholly contained in one scene follows that scene; music or other audio spanning scenes keeps its absolute project timing. Shortening a scene is blocked if it would cut off later content.
- **Recovery & media** keeps ten recovery points with shared media, supports restoring or downloading a previous version, checks imported media, and replaces broken media files. A notice appears after an interrupted session; the most recent valid autosaved workspace restores on reload.
- Space plays/pauses the project; Ctrl+Z / Ctrl+Shift+Z undo/redo. Drag the divider above the timeline to resize it.
- **Green screen / color key** in a selected image or video's inspector removes a chosen color. Click the original source preview to sample it, then adjust tolerance, edge softness and spill cleanup. Crop, mask, clip looks and opacity still apply. Freeze frames retain the key settings. This is color-based keying; it does not automatically segment people from arbitrary backgrounds.
- **Normalize audio** measures the current source range in all channels and applies sample-peak gain before Volume and fades. The dialog supports a target from −24 to −0.1 dBFS and caps boosts at 30 dB. Preview, ducking analysis and exported mixes share this gain. Reset and undo restore the previous level; source audio stays intact.
- **Text appearance & saved styles** adds multiline text, monospace type, weights, alignment, italic, outlines, shadows and background cards. Apply built-in or saved appearances to multiple unlocked text layers while preserving their content, poses and animation. Saved presets stay on this device; applied appearance travels in the project file.
- **Ripple** on the timeline makes edge trims move later clips and captions within the current scene. **Ripple delete** removes the selected clip and moves later content earlier. Scene length stays fixed; clips crossing the edit point keep their start. Locked followers block the edit. Select a video layer to ripple its linked sound. Normal clip movement remains available with Ripple off.
- **Beats / markers** detects audio transients with adjustable sensitivity. Drag markers or use their arrow keys to adjust; Enter seeks to a marker. Press **M** to mark the playhead. Clip movement snaps to nearby markers when enabled. Detected beats follow their audio source through moving, source trims and speed changes; manual markers use project time. Detection uses 20 ms analysis windows and needs review against the music.
- **Onion skins** overlays nearby poses of selected characters, text, drawings and shapes: blue for previous poses and orange for next poses. Set frame spacing, pose count and opacity in **Animation graph**. These guides appear only while editing; video layers do not receive onion skins.
- **Animation graph** edits each pose property's values and timing, with keyframe dots and custom tangent handles. Each property's outgoing segment can use its own easing. Add or delete keys at the playhead and seek to selected keys. Dragged keys snap to a 30 fps grid. Active motion paths continue to control position.
- **Audio ducking** lowers music around detected narration energy, with reduction, attack, release and threshold controls. Detection includes both audio channels, source trims, speed, volume and fades. Music returns during pauses. Each music clip can opt out; playback and exported mixes use the same gain envelope. Noise in a narration track can trigger ducking, so review the threshold with your recording.

## Picture rigs and easier animation

- **Cast → Rig a picture** supports photos, generated art and illustrations. Trace polygons, cut body parts, set joint pivots and choose parents. Import separate transparent part PNGs when available. **Pose joints** rotates their joints directly; saved rigs can be added to later scenes.
- Select the character and use **Voice & lip-sync → Character audio** to choose an existing sound or import its voice. **Generate lip-sync** analyzes that audio locally. Mark a mouth area on imported rigs and optionally provide A–H/X PNG mouth artwork; the mouth follows its head joint.
- Realistic results depend on prepared artwork. This is 2D cut-out rigging with textured joint meshes; hidden areas, new facial angles and 3D geometry are not generated from a single picture.
- **Easy animate** provides six action types, click-to-walk, draggable timed action blocks, pose thumbnails, saved poses and look/point targets. Animation blocks appear below each character's timeline clip. Shortening scenes preserves their action timing.
- **Draw animation** provides brush and shape frames, exposure holds, duplicate frames, onion skins, playback and image-frame import.
- **Scenes → Canvas format** selects landscape, vertical or square. Existing content is cropped without distortion; **Fit scene content** fits unlocked layers. Preview and exports use the same framing.
- **Export queue** stores up to ten project snapshots with individual aspect, resolution and format. The desktop app renders MP4 or WebM to one chosen folder, preserves existing filenames and restores the exact editing project. Browser batch export uses WebM downloads. Rendering remains real-time.

## Realistic character performance

In **Cast → Rig a picture**, open **Background removal & cut-out brush**. Local person segmentation uses the bundled MediaPipe runtime/model; edge-color removal handles plain backgrounds. Erase/restore brushes refine the mask and preserve an original copy for undo/reset. The model identifies the whole person, so trace the individual body parts yourself. Runtime sources/licenses are in dist/vendor/mediapipe/NOTICE.md.

Enable **Natural joint bending** per part, or **Soften limb joints** for elbows and knees. A textured triangle mesh blends child and parent transforms near the pivot. It bends the supplied artwork and does not generate missing pixels. Overlapping transparent parts produce cleaner joints.

After adding the rig, **Pose hands & feet** enables two-joint limb solving. Drag a hand/foot endpoint; its connected limb follows. Foot pins hold reachable feet in canvas space from the current time through the clip end, including during body movement. They can be released or relocated by dragging the pinned endpoint.

Mark eye and eyebrow regions to animate their original image patches. Optional PNG states support open/closed eyes and named expressions. **Face performance** keys blinking, brow lift/angle and expressions; patches follow the head. The voice audio selector and phonetic mouth artwork continue to work independently.

**Record movement** captures character position or a joint performance at 15/30 samples per second, with adjustable mouse smoothing. Drag to perform, release to finish, Esc to cancel. Successful takes produce ordinary editable pose keys in one undo step. Overlapping walk/path movement is overridden for position takes; joint takes override overlapping gesture actions. Future keys are preserved.

Select an action block to adjust its blend-in/out seconds. Adjacent actions crossfade around their boundary and isolated actions ease against the underlying pose. **Smooth all actions** sets short blends; zero creates hard transitions. Audio/clip timings stay fixed.

## Storage and export

The workspace, project dashboard and imported media use local IndexedDB. JSON project backups include images, video and audio. Named scene presets and animation actions use localStorage. The separate reusable object library is device-local; drawings already placed in a project are included in backups.

Browser video export records all scenes in real time at 540p, 1080p or 4K. Keep the window visible while recording. The Windows app includes FFmpeg for native MP4 export. Development and packaged desktop checks passed for project saving, MP4 encoding, offline captions, mouth analysis, video reversal, uploaded footage and bundled sound assets. 4K performance and long, media-heavy projects have not been validated. Imports are limited to 80 MB per video and 40 MB per audio file. Embedding media in project history increases memory use.

## Validation

With the preview server running:

```
npm test
node tests/media-effects.cjs
node tests/sound-library.cjs
node tests/keyframes.cjs
node tests/export.cjs
node tests/video-export.cjs
node tests/advanced-tools.cjs
node tests/local-processing.cjs
node tests/transcription.cjs
node tests/advanced-export.cjs
node tests/canvas-studio.cjs
node tests/canvas-edge-cases.cjs
node tests/storyboard-transitions.cjs
node tests/canvas-export.cjs
node tests/path-inspector.cjs
node tests/storyboard-duration.cjs
node tests/pro-timeline.cjs
node tests/pro-audio.cjs
node tests/pro-animation.cjs
node tests/creative-media.cjs
node tests/audio-normalize.cjs
node tests/text-styles.cjs
node tests/video-upload.cjs
node tests/clip-transitions.cjs
node tests/project-formats.cjs
node tests/flipbook.cjs
node tests/export-queue.cjs
node tests/image-rig.cjs
node tests/easy-animation.cjs
node tests/realistic-rig.cjs
node tests/realistic-export.cjs
node tests/performance-tools.cjs
node tests/motion-joints.cjs
node tests/native-mask.cjs
node tests/native-animation.cjs --packaged
```

Tests cover layout, drawing library, timeline drag/trim/split, animation, locks, undo/redo, audio mixing and fades, video source seeking and linked sound, imported media persistence, project dashboard, camera-space selection, caption parsing, sound-library assets and repeated video exports. Sound-library testing decodes every downloaded file and verifies it is not silent.

The canvas expansion tests cover custom character updates, direct joint posing under camera and character transforms, multiselect handles and locks, object/camera paths, template editing, storyboard notes and scene/audio reordering, transition pixels, persistence, and 1080p export without editor guides. Fourteen scripts passed the expansion regression run; logs are in `test-output/final-editing-checks.log` and `test-output/final-export-speech-checks.log`. Two additional tests passed for motion-path inspector coordinates and safe scene shortening with visual fades. The fixes also passed the affected canvas, media and animation checks. These checks did not build or test a packaged Windows application.

The editing expansion checks passed for ripple editing, detected/manual markers and snapping, stereo speech ducking measured in actual mixed audio, independent property curves, key/tangent dragging, onion skin persistence and exclusion from recorded video. Regression checks passed for media effects, animation tools, path controls, joint posing, timeline keys, storyboards, captions, local processing and repeated exports. Results are in `test-output/pro-editing-regression.log` and `test-output/pro-export-regression.log`; `tests/pro-animation.cjs` also records and checks a curved-motion export.

## Windows package

The previous 0.4.0 installer is release/0.4.0/Elleson-Studio-Setup-0.4.0.exe (436,901,514 bytes, 436.9 MB / 416.7 MiB). Its NSIS archive passed integrity testing. SHA-256: 799E8CFA126929A56229D31B9354A0F1F8873E774C8DEAFB4501D0E84BA7EB2E. Verification is recorded in release/0.4.0/installer-verification.json. This is an unsigned Windows x64 installer.

Version 0.4.0 includes all picture rigging and realistic animation tools, format-aware exports, export queue, frame animation, 113 sound effects, FFmpeg, an independent Python interpreter, the speech model/mouth analyzer, and local person-masking model/WASM. No running preview server or separate Python installation is required.

The actual packaged executable passed offline captions and lip-sync, uploaded-video reversal, native project saving, MP4 export, imported-rig motion and square/portrait queue exports, plus offline person masking. All 172 editor assets/modules and native entry files matched their packaged sources. Logs: test-output/desktop-0.4.0-packaged.log, animation-0.4.0-packaged.log, mask-0.4.0-packaged.log and installer-0.4.0-integrity.log.

Build staging supports a fresh version directory: node desktop/build.cjs --dir --output release/0.4.0. Set ELLESON_PACKAGED_DIR to that directory's win-unpacked folder when running tests with --packaged. Create the installer with node desktop/build.cjs --from-packaged --output release/0.4.0. Runtime/build tools are cached; the development project remains editable. The old 0.3.0 installer is retained separately.

## Remaining work

Automatic image rigging, advanced effect automation and cross-device sync are not implemented. The original transcript-timing tool remains available separately and only distributes supplied words; **Generate captions** performs actual local speech recognition. Phonetic mouth generation is approximate and should be reviewed. Export remains real-time, not deterministic offline rendering. The browser preview uses its loopback service; the desktop app routes the same operations through its private app protocol. The Windows package includes its Python runtime, model, phonetic analyzer and FFmpeg.
