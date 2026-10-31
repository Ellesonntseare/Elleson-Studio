'use strict';
function buildSceneContinuation(source,{at=source.duration,duration=source.duration}={}){
 const copy=structuredClone(source),idMap=new Map();copy.id=uid();copy.name=source.name+' · continued';copy.duration=duration;copy.transition='cut';
 for(const key of ['dialogue','captions','storyCues','storyShots','propInteractions'])copy[key]=[];
 delete copy.cameraPath;delete copy.cameraFollow;delete copy.headTrimSource;delete copy.resizeCameraKeys;
 copy.objects=source.objects.filter(o=>visibleAt(o,at,source)).map(o=>{const next=continuitySnapshot(o,source,at);idMap.set(o.id,next.id);next.locked=!!o.locked;for(const field of ['viewKeys','handGestureKeys','wordAnimation','textFollow','fadeIn','fadeOut','entryTransition','exitTransition'])delete next[field];return next});
 for(const o of copy.objects)for(const key of ['lookTargetId','pointTargetId'])if(o[key])o[key]=idMap.get(o[key])||null;
 const camera=cameraAt(source,at);copy.camera={start:structuredClone(camera),end:structuredClone(camera)};
 return{scene:copy,idMap};
}
async function copyTimelineScene(index,continuation=false){
 if(recording||window.editorTaskBusy||audioBusy)throw Error('Finish the current media task first.');
 if(project.scenes.length>=99)throw Error('This project already has 99 scenes.');
 const source=project.scenes[index];if(!source)throw Error('Choose a scene first.');
 const draft=structuredClone(project),start=project.scenes.slice(0,index).reduce((n,s)=>n+s.duration,0),insertAt=start+source.duration;let next,addedAudio=[];
 if(continuation){const built=buildSceneContinuation(source);next=built.scene;if(typeof applyWalkingContinuationLinks==='function')applyWalkingContinuationLinks(draft.scenes[index],built)}
 else{
  next=structuredClone(source);next.id=uid();next.name=source.name+' · copy';const ids=new Map(next.objects.map(o=>[o.id,uid()])),audioIds=new Map();
  for(const o of next.objects){o.id=ids.get(o.id);if(o.exitTransition?.toId)o.exitTransition.toId=ids.get(o.exitTransition.toId)||null;}
  addedAudio=tracks().filter(c=>audioEnd(c)>start&&c.start<insertAt).map(c=>{const a=structuredClone(c),left=Math.max(start,c.start),right=Math.min(insertAt,audioEnd(c));audioIds.set(c.id,uid());a.id=audioIds.get(c.id);a.offset+=(left-c.start)*(c.rate||1);a.start=insertAt+left-start;a.duration=right-left;a.fadeIn=Math.min(a.fadeIn||0,a.duration);a.fadeOut=Math.min(a.fadeOut||0,a.duration);if(a.videoId)a.videoId=ids.get(a.videoId)||undefined;return a});
  remapStoryReferences({scenes:[next],audio:addedAudio},ids,audioIds,new Map([[source.id,next.id]]));
 }
 if((draft.audioClips||[]).length+addedAudio.length>=100)throw Error('This copy would exceed the project audio capacity.');
 for(const c of draft.audioClips||[])if(c.start>=insertAt-.000001)c.start+=next.duration;
 const copiedMarkers=continuation?[]:(draft.markers||[]).filter(m=>m.time>=start&&m.time<insertAt).map(m=>({...m,id:uid(),time:m.time+source.duration}));
 for(const m of draft.markers||[])if(m.time>=insertAt)m.time+=next.duration;
 if(draft.markers)draft.markers.push(...copiedMarkers);
 draft.scenes.splice(index+1,0,next);(draft.audioClips??=[]).push(...addedAudio);
 if(!valid(draft))throw Error('This scene cannot be copied safely with its current media.');
 stop();project=draft;sceneIndex=index+1;time=0;selected=null;selectedAudio=null;save();render();await hydrateAudio();toast(continuation?'Next scene created with the same environment and ending pose.':'Scene copied beside the original, including animation and audio.');return next;
}
const sceneStripActions=document.createElement('div');sceneStripActions.className='tool-row';sceneStripActions.id='sceneStripActions';sceneStripActions.style.cssText='padding:4px 10px;gap:8px;display:flex;align-items:center';
sceneStripActions.innerHTML='<span id="sceneStripName"></span><button id="copySceneNext">Copy scene next</button><button id="continueSceneNext">Continue scene</button>';
document.querySelector('.timeline-top').append(sceneStripActions);$('sceneStripName').style.display='none';sceneStripActions.style.cssText='display:contents';
for(const [id,continuation]of [['copySceneNext',false],['continueSceneNext',true]])$(id).onclick=()=>copyTimelineScene(sceneIndex,continuation).catch(e=>toast(e.message));
const timelineBeforeSceneStrip=renderTimeline;renderTimeline=function(){timelineBeforeSceneStrip();$('sceneStripName').textContent='Scene '+(sceneIndex+1)+' · '+current().name;for(const id of ['copySceneNext','continueSceneNext'])$(id).disabled=recording||project.scenes.length>=99;document.querySelectorAll('.timeline-clip.scene').forEach((clip,index)=>{clip.dataset.sceneIndex=index;clip.title+=' · Select to copy or continue above';clip.oncontextmenu=e=>{e.preventDefault();sceneIndex=index;time=0;selected=null;render();$('copySceneNext').focus()}})};
renderTimeline();
