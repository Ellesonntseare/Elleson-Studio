# Elleson Studio 0.5.0

## Voice-over update — 30 October 2026

The toolbar Voice-over button opens narrator generation directly. Longer scripts are generated in sentence-aware sections, previewed/downloaded as one WAV, and placed continuously across scenes. Text is no longer cut off at 2,000 characters in the interface. Project scene/audio capacity and available memory still apply. Stop after this section cancels before changing the project.

Seven Kokoro voices (Heart, Bella, Fenrir, George, Michael, Nicole and Emma) and four Piper draft voices are available locally. Natural voice buttons, remembered choices, custom pronunciations and phrase pacing reduce repeat setup.

Optional ElevenLabs voices appear in a separate online group. Preview and generation send the script to ElevenLabs and consume account credits. The server uses Multilingual v2 and joins MP3 responses into WAV for the same editable timeline and local lip-sync workflow. Credentials stay in the main process: use ELEVENLABS_API_KEY or the private %APPDATA%/EllesonStudio/elevenlabs.env file. Never put a key inside dist, a shared project, or the installer. Local voice generation does not contact ElevenLabs.

The ElevenLabs catalog connection was verified without generating new paid speech. Contract tests use mock API responses and real MP3 decoding. API reference: https://elevenlabs.io/docs/api-reference/text-to-speech/convert.


## Usability update

Pose-library clicks no longer describe an unselected character as locked. A sole character is selected automatically; multiple characters get a choice list. Manual editing locks have an explicit unlock action.

The update adds character sections, clearer selection handles and a floating toolbar; file drops; timeline fit/zoom/scene navigation; draggable walking destinations; direct character audio/lip-sync preview; combined performance presets; bounded preview caching and quality choices; and detailed export review with estimated file size. Motion clips, poses, grips and voice takes already existed and remain available alongside combined performances.

Full HD MP4 was decoded and verified after draft preview caching, with direct local Rhubarb analysis, supplied picture-character views, exact duration and project restoration. The installed-app update preserves the external offline speech tools and existing project storage. The previously delivered installer remains the original 0.5.0 installer until a new installer is requested.

Windows desktop animation and video editor. MP4 (H.264/AAC) is the default, at Full HD. Local speech generation, transcription and phonetic lip-sync run on the PC; ElevenLabs is an optional online provider.

## Animation and storytelling

- Guided picture rigging, adjustable joint markers, reviewed cuts, connected parents, colour-preserving edge feathering and overlap highlighting.
- Supplied front/side/back character artwork, keyed view changes, connected walking and per-region body animation. Hidden views and realistic hand shapes require supplied artwork.
- Reusable motion clips with speed, mirroring, strength and repeats; previewed cleanup and reachable foot-contact correction.
- Joint limits and drag snapping; editable mouth cues and opening strength; stock hand shapes and imported hand PNGs; reusable hand poses and object grips.
- Smooth expression transitions, adjustable look anticipation and camera-follow dead zones/smoothing.
- Independent object-part keys with custom timing curves. Live transition loops preview duration and intensity before applying.
- Eleven offline voice profiles across Piper and Kokoro, separate narrator/character choices, saved voice takes and phrase pauses/emphasis. Delivery changes pace and level; acting quality depends on the supplied model.
- Scene continuity, script-to-storyboard suggestions, dialogue timing, listener reactions, shot coverage and storyboard checks for missing voice/mouth setup or timing issues.

## Text, audio and timeline

- Direct canvas wording edits, mixed fonts/colours/sizes in one layer, wrapping boxes with width handles, moving object labels, individual word animation and previewed cross-scene find/replace.
- Curved audio fades and equal-power crossfades, per-line music ducking, recorded voice/lip-sync speed and phrase-level local synthesis.
- Preview playback speed, coherent animation retiming, constant-speed walking, atomic multi-clip trims and multi-key selection/copy/paste/shift with undo.

## Projects and export

- In progress, Unpublished and Finished project columns, search/filter, media-safe saved drafts and up to eight open project tabs. Switching preserves the outgoing draft, playhead and each tab’s editing history during the session.
- MP4, VP9 WebM, MOV and silent GIF. Explicit encoders and file-header/extension checks keep the container type correct. GIF loops are limited to 20 seconds and 256 colours.
- Whole-project, selected-scene and custom time-range rendering with aligned trimmed audio. Native export samples exact 30 fps timeline frames; temporary frame storage is capped at 4 GB.
- Actual output checks decoded 1920 × 1080 MP4/WebM/MOV/GIF and 3840 × 2160 MP4. Portrait and square frames use their displayed dimensions, with no stretching. Imported images retain their original source detail.

The dark workspace retains four primary tools and expands advanced controls when needed. Existing saved projects and media are retained on upgrade; separate backups are recommended for portable archives.

## Easier animation

- **Cast → Rig a picture** imports realistic photos, generated artwork or illustrations. Trace polygons to cut parts, set joint pivots, choose parent joints and pose the character directly on the canvas. Separate transparent body-part PNGs can be assembled in the same workspace. Save rigs for reuse.
- Select a stock or imported character, choose **Voice & lip-sync → Character audio**, then **Generate lip-sync**. Import a new voice directly from that inspector. Imported rigs use a mouth area attached to the head, with optional A–H/X mouth PNGs matching the artwork.
- **Easy animate** provides visual poses, saved custom poses and draggable Wave, Point, Jump, Sit, Talk and Walk action blocks. Choose **Walk to point**, then click the destination. Look and point targets follow another object.
- **Draw animation** adds brush/shape frames, duplicate frames, onion skins, exposure holds, playback and image-frame import.
- **Scenes → Canvas format** switches landscape, vertical or square output. **Fit scene content** fits unlocked objects into the crop.
- **Export queue** stores project snapshots with independent aspect, resolution and format settings. Choose one desktop output folder, stop after the current job and resume later. Existing output filenames receive a numbered suffix.

## Realistic character tools

- **Background removal & cut-out brush** includes local person segmentation, plain edge-color removal, an erase/restore brush, mask undo and original-image restoration. The person model and WebAssembly runtime are bundled; pictures stay on the device. Review hair and complex backgrounds manually.
- **Natural joint bending** deforms the original part texture through a mesh around elbows and knees. Adjust reach and softness for each part, or choose **Soften limb joints**. Overlapping transparent artwork helps hide seams.
- **Pose hands & feet** enables connected two-joint solving on imported limbs. **Pin left/right foot** holds a reachable foot in canvas space from the current time to the clip end. Release pins before freely relocating the whole character.
- Mark eye and eyebrow areas in the rig editor. The existing image regions can blink, lift and rotate; optional open/closed/expression PNGs preserve your art style. Use **Face performance** to key blinks, brows and expressions.
- **Record movement** captures dragging at 15 or 30 samples per second, with mouse smoothing. Record whole-character position or a joint performance. Release to finish; Esc restores the original animation. Takes become editable timeline keyframes and use one undo step.
- Selected action blocks have **Blend in/out** controls and **Smooth all actions**. Adjacent actions crossfade without shifting clip/audio timing; zero blend keeps a hard change.

Rigging remains 2D cut-out animation. A single image cannot provide hidden body areas, depth or new facial angles. Automatic background masking finds the person, not separate limbs. Prepare parts and matching facial artwork for realistic results. Automatic joint detection, hidden-surface reconstruction and 3D animation are not included.

## Start editing

- Use **Upload video** above the editor, or drop footage onto the canvas area. Optional original audio is added to a linked timeline track.
- Add characters, text, drawings, images, music and the 113 included sound effects.
- Place video/image clips end-to-start, then open **Transitions & effects**. Apply crossfade, slide, zoom, blur dissolve or white flash. The timeline's ↔ badge reopens transition settings.
- Select a character and choose **Pose joints** to animate directly on the canvas. **Animation graph** edits property curves and onion-skin settings.
- Use **Normalize audio** to adjust clip peaks and **Audio ducking** to lower music around narration.
- Selected images/videos have color-key, crop, mask and speed controls. Text supports saved typography styles, cards, outlines and shadows.
- **Captions & lip-sync** uses bundled local speech and mouth-analysis tools. Review generated words and timing.
- Save a project backup with **Save project**. **Export video** can save MP4 through the included encoder.

The desktop app and browser preview have separate local workspaces. To move a project from the preview, download its project JSON and open it in the desktop app.

The speech runtime and model are included; a separate Python installation or running preview server is not required. Windows application signing is not configured for this local build.

Video export records the animation in real time. Long projects and 4K export have not received the same validation as the short 540p/1080p checks. Color keying removes a chosen background color; it is not automatic subject segmentation.

Third-party licenses and credits remain alongside the bundled sounds, map data, speech components, Python runtime, Electron and FFmpeg.

## 30 October — Animation and timeline update
Both knees bend in the walking direction. Long walks continue across scenes with the same environment and step rhythm. Copy scene next duplicates beside the source, and Continue scene carries the ending pose and background. The bottom timeline has direct Edit, Duplicate and Delete controls, a right-click clip menu, Delete/Backspace, Ctrl+C/V/D/B, Shift+Delete and a Keyboard shortcuts card. Scene and walking changes support Undo. Duplicate clips require room within a scene; projects allow 99 scenes. Ripple delete stays within the current scene.

Scene joins now have a visible transition button and duration controls. Visual assets and captions from other scenes remain visible on the timeline; select, delete, duplicate or trim them directly. Character Voice panels now include Create voice for the selected character, with stored independent voice choices and dialogue mouth timing. Verified two real local voices with isolated mouth timing and persistent assignments.

## Timeline trimming and character text speech
Split visual/audio segments retain their original timeline row. Wider left/right handles trim in place; Trim left/right buttons trim at the playhead. Full-length visual clips can move later by extending the current scene up to its 60-second limit, with Undo. All scene assets now render in stable scene order independently of selection; extra action rows have a Show action tracks toggle. Character Voice panels accept typed dialogue directly and pass it to voice generation with the selected speaker.

Timeline clip edges now extend outward as well as trim inward. Extending a visual clip beyond the current scene grows it up to 60 seconds while preserving later scene audio and marker alignment. Right-edge video/audio extension respects available source media; starts stop at project/scene zero. Locked layers remain fixed, and extension supports Undo/Redo and stays on its original row.

## 31 October — Timeline and learning update
Magnet snapping, cross-scene clip moves with assigned sound, Repeat/Slow/Hold extension, marked trim ranges with I/O, short interface labels, and optional grey hover-help circles. Help on/off hides the learning icons. Character scene transfers preserve motion as editable 30 fps pose keys. Clips with complex prop interactions or following labels use scene continuation.
