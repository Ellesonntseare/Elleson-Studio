'use strict';
// Presentation wording only. Never rename a user's project, scene, character or asset.
const studioCopyNames={
 projects:'Projects',download:'Save project',export:'Export',openStoryTools:'Script',openStoryShots:'Camera',openEasyAnimation:'Animate',openClipEffects:'Effects',openNarratorVoice:'Voice',
 addText:'Text',addScene:'Scene',createScene:'New scene',deleteScene:'Delete scene',sceneLeft:'Move earlier',sceneRight:'Move later',newChar:'New character',imageRig:'Picture character',libraryBodyAnimation:'Body movement',libraryMotionClips:'Saved movements',libraryPropInteractions:'Use objects',
 timelineEditClip:'Edit',timelineDuplicateClip:'Duplicate',timelineDeleteClip:'Delete',timelineShortcuts:'Shortcuts',timelineFit:'Fit timeline',timelineCurrent:'Find playhead',timelineShowActions:null,timelineSceneTransition:'Transition',copySceneNext:'Copy scene',continueSceneNext:'Continue scene',addSound:'Add audio',beatTools:'Beats and markers',rippleDelete:'Delete and close gap',
 openAudioDucking:'Lower music',openNormalize:'Match volume',speechTools:'Captions and mouth',openGraphEditor:'Speed curve',openMotionRecording:'Record movement',drawAnimation:'Draw animation',openBatchTrim:'Trim clips',openBatchKeys:'Edit keyframes',openStoryboard:'Scenes',sequenceTools:'Saved scenes',recoveryTools:'Recover project',openExportQueue:'Export list',
 addKey:'Add keyframe',saveVisualPose:'Save pose',browseCharacterPoses:'Poses',walkCharacterTo:'Walk to a point',generateCharacterLipSync:'Match mouth to voice',previewCharacterVoice:'Preview voice and mouth',voiceSetMouth:'Choose mouth area',openMotionLibrary:'Saved movements',openBodyAnimation:'Body movement',continueSelectedCharacter:'Continue character',
 editSelectedCharacterAppearance:'Edit appearance',useStoryVoices:null,removeCharacterAction:'Delete action',blendAllCharacterActions:'Smooth actions',applyLayerAnimationSpeed:'Apply speed',
 closeOfflineVoice:'Close',createCharacterVoice:'Create voice',previewOfflineVoice:'Preview voice',downloadGeneratedVoice:'Save audio',cancelVoiceGeneration:'Stop voice',naturalFemaleVoice:'Female voice',naturalMaleVoice:'Male voice',naturalBritishVoice:'British voice',saveVoiceTake:'Save version',
 storyAddLine:'Add line',appendScriptLines:'Add script',arrangeConversation:'Arrange voices',generateDialogueMouths:'Match mouths',previewConversation:'Preview scene',downloadDialogueScript:'Save script',storyOpenShots:'Camera shots',
 sceneBoundaryNames:null,applySceneBoundary:'Apply',previewSceneBoundary:'Preview',applySceneContinuity:'Continue',openSceneContinuity:'Continue character',
 previewClipTransition:'Preview',applyClipTransition:'Apply transition',removeClipTransition:'Remove transition',applyClipLook:'Apply look',
 openSceneRehearsal:'Preview scene',playSceneRehearsal:'Play',openMouthCueEditor:'Mouth shapes',rigGuideBuild:'Build joints',rigGuideCheck:'Check joints',applyBatchTrim:'Apply trim',previewBatchTrim:'Preview trim',
 renderVideo:'Export',startExportQueue:'Export all',stopExportQueue:'Stop export',fitVideo:'Fit picture',fillVideo:'Fill screen',reverseVideo:'Reverse video',freezeFrame:'Freeze frame',resetCrop:'Reset crop'
};
const studioLabelCopy={
 'Paper colour':'Background color','Paper color':'Background color','Canvas format':'Video shape','Transition length':'Transition time','Transition intensity':'Effect strength','Recorded audio and lip-sync speed':'Audio speed','Audio / lip-sync speed':'Audio speed',
 'Travel speed':'Walking speed','Timing factor':'Animation speed','Walk for (seconds)':'Walking time (s)','Facing':'Face towards','Length':'Duration','In':'Start','Out':'End','Trim in':'Source start','Character audio':'Voice clip','Pace':'Voice pace',
 'Match tag':'Match name','Blend in (s)':'Ease in (s)','Blend out (s)':'Ease out (s)','Preview quality':'Preview detail','Font weight':'Text weight','Leading':'Line spacing','Tracking':'Letter spacing','Duck reduction':'Lower by','Reduction (dB)':'Lower by (dB)','Attack (s)':'Fade down (s)','Release (s)':'Fade up (s)',
 'Sensitivity':'Beat detail','Overlap previous':'Overlap','Manual start':'Start time','Pause after':'Pause after line','Length (s)':'Duration (s)','Source offset':'Source start','Mouth strength':'Mouth movement','Expression blend':'Expression change','Onion skin':'Nearby frames','What this character says':'Dialogue'
};
const studioSummaryCopy={
 'Voice & lip-sync':'Voice and mouth','Voice & mouth movement':'Voice and mouth','Performance & expressions':'Face and gestures','Face and expressions':'Face and gestures','Animation speed':'Movement speed','Layer timing':'Clip timing','Onion skin':'Nearby frames','Show nearby frames':'Nearby frames','Graph editor':'Speed curve',
 'Motion path':'Movement path','Joint assistance':'Joint help','Inverse kinematics':'Connected joints','Foot correction':'Steady feet','Keep feet steady':'Steady feet','Saved voice takes':'Voice versions','Voice takes':'Voice versions','Saved voice versions':'Voice versions','Phrase delivery':'Phrase settings','How each phrase sounds':'Phrase settings',
 'Emotion & reaction cues':'Expressions and reactions','Paste a script':'Paste script','More character controls':'More controls','More animation controls':'More controls','Line actions':'More options','Live transition preview':'Transition preview','Crop & mask':'Crop and shape','Crop and shape':'Crop and shape','Walk for longer':'Longer walk'
};
const studioPlainTerms=text=>text.replace(/\blip-sync\b/gi,'mouth movement').replace(/\bvisemes?\b/gi,'mouth shapes').replace(/\bonion skin\b/gi,'nearby frames').replace(/\baudio ducking\b/gi,'lowering music during speech').replace(/\bphonetic\s+/gi,'').replace(/\btransients\b/gi,'beats');
function setStudioLabelText(el,text){const node=[...el.childNodes].find(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim());if(node&&node.textContent.trim()!==text)node.textContent=text+' '}
function compactStudioCopy(){
 for(const [id,name]of Object.entries(studioCopyNames)){const el=$(id);if(!el||name===null||el.tagName!=='BUTTON')continue;if(el.textContent!==name)el.textContent=name}
 const more=$('studioMoreTools')?.querySelector('summary');if(more)setStudioLabelText(more,'Tools');
 const voiceStyle=$('offlineVoiceDelivery')?.closest('label');if(voiceStyle)setStudioLabelText(voiceStyle,'Voice style');
 for(const el of document.querySelectorAll('label')){const node=[...el.childNodes].find(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim()),name=node?.textContent.trim();if(studioLabelCopy[name]&&studioLabelCopy[name]!==name)node.textContent=studioLabelCopy[name]+' '}
 for(const el of document.querySelectorAll('details>summary')){const node=[...el.childNodes].find(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim()),name=node?.textContent.trim();if(studioSummaryCopy[name]&&studioSummaryCopy[name]!==name)node.textContent=studioSummaryCopy[name]+' '}
 const libraryTitle=document.querySelector('.library>h2');if(libraryTitle&&libraryTitle.textContent!=='Library')libraryTitle.textContent='Library';for(const el of document.querySelectorAll('.stagebar .eyebrow'))if(el.textContent!=='Preview')el.textContent='Preview';
 const help=document.querySelector('.timeline-help');if(help&&help.textContent!=='Drag to move · Drag edges to trim')help.textContent='Drag to move · Drag edges to trim';
 const footer=document.querySelector('.library-bottom p');if(footer&&footer.textContent!=='Saved on this device. Save a project file to keep a backup.')footer.textContent='Saved on this device. Save a project file to keep a backup.';
 for(const note of document.querySelectorAll('.note:not([id])')){
  if(note.dataset.compactCopy||note.children.length||note.getAttribute('role')==='status')continue;const original=note.textContent.trim();if(original.length<150)continue;
  // Money, limits and error messages stay visible in full.
  if(/credits|account|failed|error|unavailable|not installed|cannot|must |limited to|limit of/i.test(original))continue;
  const first=studioPlainTerms(original).match(/^(.+?[.!?])(?:\s|$)/)?.[1];if(!first||first.length>140)continue;
  note.dataset.compactCopy='true';note.textContent=first;if(typeof addLearningHelp==='function')addLearningHelp(note,studioPlainTerms(original),'How to use this section','section-'+original.slice(0,50));
 }
 for(const [id,text]of [['offlineVoiceText','Type or paste the words to speak.'],['storyScriptText','Name: dialogue'],['longWalkSeconds','Seconds']]){const el=$(id);if(el)el.placeholder=text}
}
