'use strict';
// Help is part of the interface only; it never changes a video project.
let learningHelpOn=true,learningHelpTimer=null,learningHelpHideTimer=null;
try{learningHelpOn=localStorage.getItem('elleson-show-learning-help')!=='false'}catch{}
const learningHelpStyle=document.createElement('style');learningHelpStyle.textContent='.studio-help-tip{display:inline-flex;flex:none;align-items:center;justify-content:center;box-sizing:border-box;width:13px;height:13px;min-width:13px;margin:0 4px;border:1px solid #777e8a;border-radius:50%;color:#9aA1ad;background:transparent;font:600 9px Georgia,serif;line-height:1;cursor:help;vertical-align:middle;user-select:none;letter-spacing:0}.studio-help-tip:hover,.studio-help-tip:focus-visible{color:#e2e5ed;border-color:#ccd2df;outline:2px solid #ab94ff55;outline-offset:2px}.hide-learning-help .studio-help-tip{display:none!important}#studioHelpPopover{position:fixed;inset:auto;margin:0;box-sizing:border-box;width:290px;max-width:calc(100vw - 24px);padding:12px 14px;border:1px solid #626978;border-radius:8px;background:#252a34;color:#f1f3f8;box-shadow:0 5px 22px #0008;font:12px/1.55 "Segoe UI",sans-serif;white-space:normal;z-index:2147483647}#studioHelpPopover::backdrop{background:transparent;pointer-events:none}#learningHelpToggle{white-space:nowrap}.studio-help-summary{display:inline-flex;align-items:center}';document.head.append(learningHelpStyle);
const learningHelpPopover=document.createElement('div');learningHelpPopover.id='studioHelpPopover';learningHelpPopover.setAttribute('role','tooltip');learningHelpPopover.setAttribute('popover','manual');document.body.append(learningHelpPopover);
const learningHelpToggle=document.createElement('button');learningHelpToggle.id='learningHelpToggle';learningHelpToggle.onclick=()=>{learningHelpOn=!learningHelpOn;try{localStorage.setItem('elleson-show-learning-help',String(learningHelpOn))}catch{}refreshLearningHelp()};document.querySelector('header').append(learningHelpToggle);
function hideLearningHelp(){clearTimeout(learningHelpTimer);clearTimeout(learningHelpHideTimer);if(learningHelpPopover.matches(':popover-open'))learningHelpPopover.hidePopover();learningHelpPopover.removeAttribute('data-help-for')}
function refreshLearningHelp(){document.body.classList.toggle('hide-learning-help',!learningHelpOn);learningHelpToggle.textContent=learningHelpOn?'Help on':'Help off';learningHelpToggle.setAttribute('aria-pressed',String(learningHelpOn));learningHelpToggle.title=learningHelpOn?'Hide the small information icons':'Show information icons that explain the controls';if(!learningHelpOn)hideLearningHelp()}
function showLearningHelp(tip){if(!learningHelpOn||!tip.isConnected)return;clearTimeout(learningHelpHideTimer);learningHelpPopover.textContent=tip.dataset.helpText;learningHelpPopover.dataset.helpFor=tip.dataset.helpFor;learningHelpPopover.showPopover();const r=tip.getBoundingClientRect(),h=learningHelpPopover.offsetHeight,w=learningHelpPopover.offsetWidth;learningHelpPopover.style.left=Math.max(12,Math.min(innerWidth-w-12,r.left-w/2+r.width/2))+'px';learningHelpPopover.style.top=(r.bottom+8+h<innerHeight-12?r.bottom+8:Math.max(12,r.top-h-8))+'px'}
function addLearningHelp(target,text,label,key){if(!target||target.dataset.learningHelpAttached)return;target.dataset.learningHelpAttached='true';const tip=document.createElement('span');tip.className='studio-help-tip';tip.textContent='i';tip.tabIndex=0;tip.setAttribute('role','button');tip.setAttribute('aria-label','Help: '+label+'. '+text);tip.setAttribute('aria-describedby','studioHelpPopover');tip.dataset.helpText=text;tip.dataset.helpFor=key;
 tip.onpointerenter=()=>{clearTimeout(learningHelpTimer);learningHelpTimer=setTimeout(()=>showLearningHelp(tip),200)};tip.onpointerleave=()=>{clearTimeout(learningHelpTimer);learningHelpHideTimer=setTimeout(hideLearningHelp,120)};tip.onfocus=()=>showLearningHelp(tip);tip.onblur=hideLearningHelp;tip.onclick=e=>{e.preventDefault();e.stopPropagation();showLearningHelp(tip)};tip.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();e.stopPropagation();showLearningHelp(tip)}else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();hideLearningHelp()}};
 if(target.tagName==='SUMMARY'||target.classList.contains('note'))target.append(tip);else if(target.tagName==='LABEL'){const input=target.querySelector('input,select,textarea');if(input)input.before(tip);else target.append(tip)}else if(['INPUT','SELECT','TEXTAREA'].includes(target.tagName)&&target.closest('label'))target.before(tip);else target.after(tip);
}
const learningHelpEntries={
 title:['Video name','Type a name for this video. Studio saves this name with the project.'],
 projects:['Projects','Open your saved videos. Choose a project to continue editing it.'],
 download:['Save project file','Save an editable copy to your computer. Open that file in Studio later to keep editing. This is different from exporting a finished video.'],
 open:['Open project','Choose a Studio project file from your computer. It opens with its saved scenes and media.'],
 export:['Export video','Make a finished video that you can play or share. Choose a format and picture size, then start the export.'],
 undo:['Undo','Take back your last edit. Click again to take back another edit. You can also press Ctrl+Z.'],
 redo:['Redo','Bring back the edit you just undid. You can also press Ctrl+Shift+Z.'],
 play:['Play or pause','Watch the video from the playhead. Click again to pause. Space does the same thing.'],
 rewind:['Return to start','Move back to the beginning so you can watch again.'],
 duration:['Scene length','Set how long this scene lasts. If it contains later clips or actions, shorten those first.'],
 timelineZoom:['Timeline zoom','Make timeline clips look wider for precise editing, or smaller to see more of the video. This does not change the video length.'],
 timelineFit:['Fit video on timeline','Show the whole video across the timeline. Use this if clips are far off the screen.'],
 timelineCurrent:['Find playhead','Scroll the timeline to the line that marks the current time.'],
 previousScene:['Previous scene','Jump to the beginning of the scene before this one.'],
 nextScene:['Next scene','Jump to the beginning of the next scene.'],
 addKey:['Save position or pose','Move the playhead, then save how this item looks at that time. Save a different position or pose at another time to create movement.'],
 flowMagnet:['Snap clips','Help clip edges line up with another clip or the playhead. Turn the magnet on, then drag a clip or its edge. Hold Alt to move freely.'],
 flowRangeMode:['Mark a trim range','Select the part of a clip that you want to keep. Turn this on and drag inside a clip, or hold Shift while dragging. I marks the start and O marks the end.'],
 flowTrimRange:['Keep marked part','Keep only the highlighted part of your clip. Mark a start and end first, then click this button. Undo brings the trimmed parts back.'],
 flowExtendMode:['Extend animation','Choose what happens when you drag a character clip longer. Repeat keeps it moving, Slow spreads the movement out, and Hold keeps the end pose.'],
 rippleMode:['Move later clips','When you trim a clip, move later clips in this scene to make room or close space. Turn this off to leave their times unchanged.'],
 rippleDelete:['Delete and close space','Delete the selected clip and move later clips earlier in the same scene. The scene length stays the same.'],
 beatTools:['Beats and markers','Add points that help you line up edits. Choose music to find beats, or add a marker at the playhead.'],
 copySceneNext:['Copy scene next','Create another copy beside this scene, including its animation and sound. Use this when you want to repeat a scene.'],
 continueSceneNext:['Continue scene','Create the next scene with the same background and the last poses. Use it to continue the story without rebuilding the scene.'],
 timelineSceneTransition:['Scene transition','Blend this scene into the next one. Choose a style and how long the change lasts. You need a scene after this one.'],
 sceneBoundaryType:['Transition style','Choose how one scene becomes the next. Crossfade blends them; Slide moves them across; Cut changes straight away.'],
 sceneBoundaryDuration:['Transition length','Set how many seconds the change between scenes takes. A longer time makes the change slower.'],
 timelineShowActions:['Show action tracks','Show extra rows for movements such as walking and waving. Turn this off to leave more room for characters and other assets.'],
 openStoryTools:['Script and dialogue','Write what each character says. Choose the speaker for each line, create or attach a voice, then arrange the lines on the timeline.'],
 openStoryShots:['Camera shots','Choose which part of the scene the viewer sees. Add a wide shot or a closer view of a character at a chosen time.'],
 openEasyAnimation:['Quick character actions','Give a character a ready-made action or pose. Select the character, choose an action, then adjust its start and length.'],
 openClipEffects:['Transitions and picture effects','Change the look of images or video, or add a change between neighboring clips. Choose the clips, preview the effect, then apply it.'],
 openNarratorVoice:['Narrator voice','Turn written words into a voice-over for the video. Paste your script, choose a voice, preview it, then add it to the timeline.'],
 characterSpeechText:['Character dialogue','Type the words this character should say. Then choose Create voice from text and pick its voice.'],
 createCharacterVoice:['Create character voice','Open voice generation for this character. Check the words, choose a voice, then add the result. The voice and mouth timing belong to this character.'],
 characterVoice:['Character audio','Choose an existing sound clip for this character to speak to. For a new voice from words, use the character dialogue box instead.'],
 generateCharacterLipSync:['Match mouth to voice','Make the mouth move with the selected voice clip. Choose this character’s audio first, then generate and preview the mouth movement.'],
 voiceSetMouth:['Choose mouth area','Show Studio where the mouth is on your picture character. Mark that area before asking it to move with a voice.'],
 offlineVoiceChoice:['Voice','Choose who reads these words. Preview to hear it. Local voices use your PC; ElevenLabs voices use your connected account and credits.'],
 offlineVoiceSpeed:['Voice pace','Choose how quickly the words are spoken. Preview after changing it so you can check the timing.'],
 offlineVoiceDelivery:['Speaking style','Adjust the pace and pauses of the voice. Try a style and preview it with your own words.'],
 offlineVoiceLipSync:['Add mouth movement','Make mouth timing for the speaking character when adding this voice. Picture characters need a mouth area set up first.'],
 previewOfflineVoice:['Preview voice','Hear the words in the selected voice before adding them to the video. Online voice previews use account credits.'],
 longWalkSeconds:['Walking time','Enter how many seconds the character should walk. Long walks continue into new scenes with the same background.'],
 longWalkInPlace:['Walk in place','Keep the character in one position while its legs walk. Turn this off when you want it to travel to a destination.'],
 walkCharacterTo:['Choose walking destination','Select a character, click this control, then click where it should walk on the scene. Adjust its walking time afterwards.'],
 characterLookTarget:['Look at an item','Choose another character or object for this character to look towards. Clear the choice to control the head yourself.'],
 characterPointTarget:['Point at an item','Choose a character or object for this character to point towards. Move the target to change where the arm points.'],
 openMotionLibrary:['Saved movements','Save a movement you want to reuse, or apply one you saved earlier. Choose a character and the time where it should start.'],
 continueSelectedCharacter:['Continue character','Carry this character’s pose and position into another scene. Choose whether to carry its appearance and held objects too.'],
 openAudioDucking:['Lower music during speech','Make music quieter while someone speaks. Select the music to lower, set how much to lower it, and preview the result.'],
 duckReduction:['How much quieter','Choose how much the music drops during speech. A larger number makes it quieter.'],
 duckAttack:['Lowering time','Choose how quickly the music becomes quieter when speech begins. A little time makes the change gentler.'],
 duckRelease:['Return time','Choose how quickly the music returns after speech ends. A longer time makes the return smoother.'],
 openNormalize:['Even out volume','Adjust a sound clip to a chosen loudness. Use it when one recording is much quieter or louder than the others.'],
 openGraphEditor:['Movement speed curve','Shape how quickly a movement starts and stops. Choose a property, then adjust its curve and preview the movement.'],
 openMotionRecording:['Record a movement','Record a movement by performing it on the scene. Choose the character and recording options, record, then review the result.'],
 openBodyAnimation:['Animate body parts','Change arms, legs or head separately. Move the playhead and save different poses to create the movement.'],
 rigGuideBuild:['Build character joints','Turn the marked body parts into a character that can move. Check the joint points before building it.'],
 rigGuideCheck:['Check character joints','Check whether the marked body parts have the joints needed for movement. Fix any missing points before animating.'],
 layerAnimationSpeed:['Animation speed','Change how long this item’s movement takes. This changes the animation itself; the preview speed only changes how you watch it.'],
 previewPlaybackSpeed:['Preview speed','Watch the video faster or slower while editing. This does not change the finished video.'],
 transitionMatchTag:['Match scene items','Give matching items in two scenes the same tag. The Match transition uses it to connect their movement across the scene change.'],
 clipTransitionIntensity:['Effect strength','Choose how strong this transition looks. Reduce it for a gentler change, then preview before applying.'],
 loopClipTransition:['Repeat transition preview','Watch the transition again and again while adjusting it. Apply it when you are happy with the change.'],
 applySceneContinuity:['Carry into next scene','Copy the selected character into the chosen scene using the pose and position you picked. Undo restores the previous result.'],
 openSceneRehearsal:['Preview scene and dialogue','Watch this scene with its dialogue before exporting. Use it to check who speaks, when they speak, and what the camera shows.'],
 sequenceTools:['Reusable scenes','Save scenes you want to use again, or insert a saved scene group into this video.'],
 recoveryTools:['Recover earlier work','Look for an earlier saved version of the project. Review the version before restoring it.'],
 openExportQueue:['Export list','Prepare several video exports and run them one after another. Choose the settings for each item before starting.'],
 resolution:['Video picture size','Choose the finished video size. 1080p gives Full HD. Larger pictures usually take longer to export.'],
 videoFormat:['Video file type','Choose the type of finished file. MP4 is a common choice for playing and sharing video.'],
 renderVideo:['Make video file','Start making the finished video with the export settings you chose. Wait for the export to finish before opening the file.']
};
const learningCommonNames={openAudioDucking:'Lower music',openNormalize:'Match volume',generateCharacterLipSync:'Match mouth to voice',voiceSetMouth:'Choose mouth area',openGraphEditor:'Speed curve',openBodyAnimation:'Body movement',openSceneRehearsal:'Preview scene'};
const learningSummaryHelp={
 'Voice & lip-sync':['Voice & mouth movement','Type words to create a character voice, or choose an existing audio clip. Match the mouth to that voice and preview them together.'],
 'Onion skin':['Show nearby frames','Show faint pictures from nearby times while posing a character. Use them to compare positions and make the movement smoother.'],
 'Crop & mask':['Crop and shape','Crop away unwanted edges, or show the image inside a shape. Adjust the controls and check the scene preview.'],
 'Performance & expressions':['Face and expressions','Choose expressions and small gestures. Move the playhead before saving changes that should happen later.'],
 'Joint assistance':['Joint help','Keep joints within the limits you choose. Use it to help avoid awkward arm or leg bends while posing.'],
 'Foot correction':['Keep feet steady','Reduce foot sliding during a movement. Choose the contact points and preview the result before keeping it.'],
 'Phrase delivery':['How each phrase sounds','Give different parts of the text their own pace or pause. Preview the whole voice to check how the phrases fit together.'],
 'Voice takes':['Saved voice versions','Keep different versions of the same line. Listen to them and choose the one you want to use.']
};
const learningLabelHelp={
 'Start':'Set when this item first appears in its scene. Drag the left clip edge to change it on the timeline.',
 'End':'Set when this item stops appearing. Drag the right clip edge to change it on the timeline.',
 'Source start':'Choose where playback begins inside the original recording. This does not move the clip to a different time on your timeline.',
 'Fade in':'Bring the picture or sound in gradually. Enter how many seconds the fade should take.',
 'Fade out':'Let the picture or sound disappear gradually. Enter how many seconds the fade should take.',
 'Overlap':'Start this line before the previous voice finishes. Enter how many seconds the two voices should overlap.',
 'Ease in (s)':'Start the movement gently. Enter how long it should take to reach its normal movement.',
 'Ease out (s)':'Finish the movement gently. Enter how long the character should take to settle at the end.',
 'Match name':'Use the same name for matching items in two scenes. The Match transition uses these names to connect the items.',
 'Video shape':'Choose a wide, square or upright video. Check the scene after changing it so your items still fit.',
 'Letter spacing':'Move the letters closer together or farther apart.',
 'Line spacing':'Change the gap between lines of text.',
 'Animation speed':'Make this item’s movement faster or slower. Apply the speed, then preview the result.',
 'Duration':'Choose how long this scene, clip or action lasts. The number is in seconds.',
 'Pause after line':'Leave a short silence after this character finishes speaking. Enter the time in seconds.'
};
function decorateLearningHelp(){if(typeof compactStudioCopy==='function')compactStudioCopy();for(const [id,[label,text]]of Object.entries(learningHelpEntries)){const target=$(id);if(!target)continue;if(learningCommonNames[id]&&target.tagName==='BUTTON'&&target.textContent!==learningCommonNames[id])target.textContent=learningCommonNames[id];addLearningHelp(target,text,label,id)}for(const summary of document.querySelectorAll('details>summary')){if(summary.dataset.learningHelpAttached)continue;const name=[...summary.childNodes].find(n=>n.nodeType===Node.TEXT_NODE)?.textContent.trim(),entry=learningSummaryHelp[name]||Object.entries(learningSummaryHelp).find(([old])=>(typeof studioSummaryCopy==='object'&&studioSummaryCopy[old]===name))?.[1];if(!entry)continue;addLearningHelp(summary,entry[1],name,'summary-'+name)}for(const label of document.querySelectorAll('label')){if(label.querySelector('.studio-help-tip'))continue;const name=[...label.childNodes].find(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim())?.textContent.trim();if(learningLabelHelp[name])addLearningHelp(label,learningLabelHelp[name],name,'label-'+name)}}
let learningHelpScheduled=false;const learningHelpObserver=new MutationObserver(records=>{if(learningHelpScheduled||records.every(r=>r.target===learningHelpPopover||r.target.closest?.('.studio-help-tip,#studioHelpPopover')||[...r.addedNodes].every(n=>n.nodeType===1&&n.matches('.studio-help-tip'))&&r.removedNodes.length===0))return;learningHelpScheduled=true;setTimeout(()=>{learningHelpScheduled=false;decorateLearningHelp()},0)});learningHelpObserver.observe(document.body,{childList:true,subtree:true});
learningHelpPopover.onpointerenter=()=>clearTimeout(learningHelpHideTimer);learningHelpPopover.onpointerleave=hideLearningHelp;document.addEventListener('close',hideLearningHelp,true);document.addEventListener('scroll',hideLearningHelp,true);window.addEventListener('resize',hideLearningHelp);refreshLearningHelp();decorateLearningHelp();
