# Timeline and learning update

Prepared in an isolated working copy based on commit `dbe656c`. Applying this patch and updating the installed application are separate steps. The main checkout and installed application were not changed by this work.

## Features

- **Snap:** a magnet button aligns moving clips and trimmed edges to clip boundaries, scene joins, markers and the playhead. A guide shows the alignment. Hold Alt to bypass it. The preference is saved with the project.
- **Move between scenes:** drag a visual clip until its start enters another scene. The destination is highlighted. The clip moves with its assigned character voice, dialogue or linked video sound. A destination scene can grow, within the existing 60-second limit. Failed moves leave the project unchanged. Shared voice audio is copied so another speaker does not lose it.
- **Extend animation:** choose Hold pose, Repeat movement or Slow movement before extending an animated character clip. Ordinary full-clip walks continue their travel and step phase when repeated. Voice timing is not stretched by this control.
- **Marked trim range:** hold Shift and drag inside a clip, or enable the range tool. I and O mark the start and end at the playhead. The marked part is highlighted; the trim-range icon keeps it on the same row. Video trims keep source offsets and linked audio aligned. Undo restores the edit.
- **Learning help:** small grey information circles explain controls on hover or keyboard focus. The Help on/off button hides them later. Tooltips work over dialogs and stay inside the window.
- **Clearer wording:** shorter buttons, menus and field names across the app. Examples include Lower music, Match volume, Speed curve, Create voice and Nearby frames. Longer static instructions move into help. User project, character and scene names are never renamed. Cost notices, limits and errors stay visible.

## Validation

Passed in isolated Electron profiles:

- `node tests/timeline-flow.cjs`: real mouse snapping and cross-scene transfer; exact snap coordinates and bypass; Repeat/Slow/Hold pose/action samples; walk phase continuity; linked and shared audio; destination growth; atomic capacity failure; range marking, trim, Undo and reload.
- `node tests/learning-help.cjs`: 111 help icons in the test interface; grey 13px circles; hover and keyboard help; dialog tooltip bounds; stable icon count after repeated rendering; saved hide preference; unchanged user project data.
- `node tests/native-timeline-flow.cjs`: actual 1920x1080 MP4; distinct Hold/Slow/Repeat positions; audible mixed audio; restored editing state after export.
- `node tests/video-marked-range.cjs`: actual source video, marked trim and linked sound; a 1080p export begins at the marked source frame; mean pixel difference approximately 4.8/255 after encoding; audible audio.

These are focused checks for this batch, not a rerun of every historical test.

## Limits and choices

- Existing project limits remain: 99 scenes and 60 seconds per scene. The code rejects a move that cannot fit safely.
- Character movement transferred between scenes is preserved as editable pose keys sampled at the application's 30 fps export rate. Original procedural action blocks are replaced for the moved character; Undo restores them.
- Clips with prop interactions, following labels, or unsupported non-character paths are blocked from direct transfer so linked objects do not silently break. Use scene continuation for those cases.
- Repeating a non-walking movement repeats its original cycle. A full-clip walk continues travel; it can leave the visible canvas if extended far enough.
- I/O marks and the highlighted range are editing selections, not saved project content.
- This batch has not been merged into the main checkout, pushed to GitHub, or installed in the user's app. Apply and review it through the main Studio work before updating the installed application.
