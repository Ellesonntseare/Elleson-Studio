'use strict';
let rippleBusy=false;
function editOptions(){return project.editing??={ripple:false,snapToBeats:true}}
document.querySelector('.timeline-top').insertAdjacentHTML('beforeend','<label class="toggle-tool"><input id="rippleMode" type="checkbox"> Ripple</label><button id="rippleDelete" title="Delete selected clip and move later clips in this scene">Ripple delete</button><button id="beatTools">Beats / markers</button>');
document.body.insertAdjacentHTML('beforeend',`<dialog id="beatDialog"><div class="tool-heading"><div><div class="eyebrow">CUT TO THE MUSIC</div><h2>Beats & markers</h2></div><button id="closeBeatDialog">Close</button></div><p class="note">Detect transients in your audio, adjust markers by dragging them, or press M in the editor to mark the playhead. Review detected beats against your music.</p><label>Audio clip<select id="beatSource"></select></label><div class="pro-tool-row"><label>Sensitivity<select id="beatSensitivity"><option value="2.2">Fewer beats</option><option value="1.55" selected>Balanced</option><option value="1.15">More beats</option></select></label><button id="detectBeats">Detect beats</button><button id="clearBeats">Clear clip beats</button></div><label class="toggle-tool"><input id="beatSnap" type="checkbox" checked> Snap moving clips to markers</label><div class="pro-tool-row"><input id="markerName" aria-label="Marker name" maxlength="80" placeholder="Marker name"><button id="addTimelineMarker">Add at playhead</button></div><div id="markerList" class="marker-list"></div><p id="beatResult" class="note"></p><p class="note">Ripple editing shifts later clips and captions within the current scene. Clips crossing the edit point keep their start, and scene length stays fixed. Locked followers block the edit.</p></dialog>`);
function timelineMarkers(excludeClip=null){
 const markers=(project.markers||[]).map(m=>({...m,kind:'manual'}));
 for(const c of tracks())if(c.id!==excludeClip)for(let i=0;i<(c.beats||[]).length;i++){const source=c.beats[i],t=c.start+(source-c.offset)/(c.rate||1);if(t>=c.start-.001&&t<=Math.min(audioEnd(c),totalDuration())+.001)markers.push({id:c.id+':'+i,time:t,label:'Beat · '+c.name,kind:'beat',clip:c,index:i})}
 return markers.sort((a,b)=>a.time-b.time);
}
function snappedDelta(start,delta,excludeClip){if(!editOptions().snapToBeats)return delta;const target=start+delta,near=timelineMarkers(excludeClip).filter(m=>Math.abs(m.time-target)<8/timelineZoom).sort((a,b)=>Math.abs(a.time-target)-Math.abs(b.time-target))[0];return near?near.time-start:delta}
function renderMarkerList(){const list=$('markerList');list.replaceChildren();const all=timelineMarkers();$('beatResult').textContent=all.length+' visible markers · '+globalTime().toFixed(2)+'s playhead';for(const m of all.slice(0,250)){const row=document.createElement('div'),seek=document.createElement('button'),remove=document.createElement('button');seek.textContent=m.time.toFixed(2)+'s · '+m.label;seek.onclick=()=>{seekGlobal(m.time);renderMarkerList()};remove.textContent='×';remove.setAttribute('aria-label','Delete marker');remove.onclick=()=>{if(m.kind==='beat')m.clip.beats.splice(m.index,1);else project.markers=project.markers.filter(x=>x.id!==m.id);save();renderTimeline();renderMarkerList()};row.append(seek,remove);list.append(row)}}
function addPlayheadMarker(){if((project.markers||[]).length>=1000)return toast('Keep fewer than 1000 manual markers.');(project.markers??=[]).push({id:uid(),time:globalTime(),label:$('markerName').value.trim()||'Marker '+((project.markers||[]).length+1)});save();renderTimeline();if($('beatDialog').open)renderMarkerList()}
$('beatTools').onclick=()=>{stop();const select=$('beatSource');select.replaceChildren();for(const c of tracks()){const option=document.createElement('option');option.value=c.id;option.textContent=c.name;select.append(option)}select.value=selectedAudio||tracks().find(c=>c.role==='music')?.id||tracks()[0]?.id||'';$('detectBeats').disabled=!select.value;$('clearBeats').disabled=!select.value;$('beatSnap').checked=editOptions().snapToBeats!==false;renderMarkerList();$('beatDialog').showModal()};
$('closeBeatDialog').onclick=()=>$('beatDialog').close();$('beatSnap').onchange=e=>{editOptions().snapToBeats=e.target.checked;save()};$('addTimelineMarker').onclick=addPlayheadMarker;
$('detectBeats').onclick=()=>{const c=tracks().find(c=>c.id===$('beatSource').value),buffer=audioBuffers.get(c?.id);if(!buffer)return toast('Wait for this audio clip to finish loading.');c.beats=detectedBeats(buffer,+$('beatSensitivity').value);save();renderTimeline();renderMarkerList();toast(c.beats.length?'Beat markers added. Review and adjust their timing.':'No clear beats found. Add markers manually with M.')};
$('clearBeats').onclick=()=>{const c=tracks().find(c=>c.id===$('beatSource').value);if(c){delete c.beats;save();renderTimeline();renderMarkerList()}};
$('rippleMode').onchange=e=>{editOptions().ripple=e.target.checked;save()};
function rippleFollowers(threshold,excludeVisual=new Set(),excludeAudio=new Set()){
 const offset=sceneOffset(),end=offset+current().duration;
 return{visual:current().objects.filter(o=>!excludeVisual.has(o.id)&&clipStart(o)>=threshold-.001),audio:tracks().filter(c=>!c.videoId&&!excludeAudio.has(c.id)&&c.start>=offset+threshold-.001&&audioEnd(c)<=end+.001),captions:(current().captions||[]).filter(c=>c.start>=threshold-.001)};
}
function shiftRippleFollowers(list,delta){
 if(Math.abs(delta)<.0001)return true;
 if(list.visual.some(o=>o.locked)){toast('Unlock the later layers before ripple editing.');return false}
 const d=current().duration,offset=sceneOffset();
 if(list.visual.some(o=>clipStart(o)+delta<-.001||clipEnd(o)+delta>d+.001)||list.audio.some(c=>c.start+delta<offset-.001||audioEnd(c)+delta>offset+d+.001)||list.captions.some(c=>c.start+delta<-.001||c.end+delta>d+.001)){toast('There is not enough space in this scene for that ripple edit.');return false}
 for(const o of list.visual)rippleMoveVisual(o,{mode:'move',delta});
 for(const c of list.audio)c.start+=delta;
 for(const c of list.captions){c.start+=delta;c.end+=delta;for(const w of c.words||[]){w.start+=delta;w.end+=delta}}
 return true;
}
function rippleRemoveSelection(){
 if(recording)return;stop();const audio=tracks().find(c=>c.id===selectedAudio),visual=audio?[]:selectedLayers();
 if(!audio&&!visual.length)return toast('Select a clip to ripple delete.');
 if(visual.some(o=>o.locked))return toast('Unlock the selected layers first.');
 if(audio?.videoId)return toast('Select the video layer to ripple its linked sound.');
 const offset=sceneOffset(),a=audio?audio.start-offset:Math.min(...visual.map(clipStart)),b=audio?audioEnd(audio)-offset:Math.max(...visual.map(o=>clipEnd(o)));
 if(a<-.001||b>current().duration+.001)return toast('Ripple delete audio within the current scene.');
 if(visual.some(o=>Math.abs(clipStart(o)-a)>.001||Math.abs(clipEnd(o)-b)>.001))return toast('Ripple delete one clip, or clips with matching in/out times.');
 const ids=new Set(visual.map(o=>o.id)),list=rippleFollowers(b,ids,new Set(audio?[audio.id]:[]));
 if(!shiftRippleFollowers(list,a-b))return;
 current().objects=current().objects.filter(o=>!ids.has(o.id));
 project.audioClips=tracks().filter(c=>audio?c.id!==audio.id:!ids.has(c.videoId));
 selectedAudio=null;selectLayers([]);time=Math.max(0,a);save();render();toast('Clip removed. Later clips moved earlier within this scene.');
}
$('rippleDelete').onclick=rippleRemoveSelection;
const rippleMoveVisual=moveVisual;moveVisual=function(o,change){
 if(rippleBusy||o.locked)return rippleMoveVisual(o,change);
 if(change.mode==='move')change={...change,delta:snappedDelta(sceneOffset()+clipStart(o),change.delta)};
 if(!editOptions().ripple||!['left','right'].includes(change.mode))return rippleMoveVisual(o,change);
 const original=structuredClone(o),a=clipStart(o),b=clipEnd(o),list=rippleFollowers(b,new Set([o.id])),linked=tracks().filter(c=>c.videoId===o.id).map(c=>[c,structuredClone(c)]);
 rippleBusy=true;try{rippleMoveVisual(o,change);const shrink=change.mode==='left'?clipStart(o)-a:b-clipEnd(o);if(change.mode==='left'&&shrink)rippleMoveVisual(o,{mode:'move',delta:-shrink});if(!shiftRippleFollowers(list,-shrink)){for(const k of Object.keys(o))delete o[k];Object.assign(o,original);for(const[c,data]of linked)Object.assign(c,data)}}finally{rippleBusy=false}
};
const rippleMoveAudio=moveAudio;moveAudio=function(c,change){
 if(rippleBusy)return rippleMoveAudio(c,change);
 if(change.mode==='move')change={...change,delta:snappedDelta(c.start,change.delta,c.id)};
 if(!editOptions().ripple||!['left','right'].includes(change.mode)||c.videoId)return rippleMoveAudio(c,change);
 const offset=sceneOffset();if(c.start<offset-.001||audioEnd(c)>offset+current().duration+.001)return rippleMoveAudio(c,change);
 const original=structuredClone(c),a=c.start,b=audioEnd(c),list=rippleFollowers(b-offset,new Set(),new Set([c.id]));
 rippleBusy=true;try{rippleMoveAudio(c,change);const shrink=change.mode==='left'?c.start-a:b-a-c.duration;if(change.mode==='left')c.start=a;if(!shiftRippleFollowers(list,-shrink)){for(const k of Object.keys(c))delete c[k];Object.assign(c,original)}}finally{rippleBusy=false}
};
const removeBeforeRipple=$('remove').onclick;$('remove').onclick=()=>editOptions().ripple?rippleRemoveSelection():removeBeforeRipple();
const markerSettings=renderClipSettings;renderClipSettings=function(){markerSettings();const button=Array.from($('clipSettings').querySelectorAll('button')).find(b=>b.textContent==='Remove audio');if(button&&editOptions().ripple)button.onclick=rippleRemoveSelection};
const timelineBeforeMarkers=renderTimeline;renderTimeline=function(){timelineBeforeMarkers();if(timelineDrag)return;$('rippleMode').checked=!!editOptions().ripple;const markers=timelineMarkers(),row=lane('◆  Beats & markers','marker-row');$('trackContent').insertBefore(row.row,$('trackContent').children[1]);for(const m of markers){const button=document.createElement('button');button.className='timeline-marker '+m.kind;button.dataset.markerId=m.id;button.style.left=m.time*timelineZoom+'px';button.title=m.label+' · '+m.time.toFixed(2)+'s';button.setAttribute('aria-label',button.title);button.textContent=m.kind==='beat'?'◆':'⚑';row.area.append(button);button.onpointerdown=e=>{e.stopPropagation();stop();const x=e.clientX,start=m.time;let target=start,moved=false;button.setPointerCapture(e.pointerId);window.canvasDragBusy=true;button.onpointermove=ev=>{moved||=Math.abs(ev.clientX-x)>2;target=clamp(start+(ev.clientX-x)/timelineZoom,0,totalDuration());if(m.kind==='beat')target=clamp(target,m.clip.start,audioEnd(m.clip));button.style.left=target*timelineZoom+'px'};const finish=cancel=>{button.onpointermove=null;button.onpointerup=null;button.onpointercancel=null;window.canvasDragBusy=false;if(!cancel){if(moved){if(m.kind==='beat')m.clip.beats[m.index]=m.clip.offset+(target-m.clip.start)*(m.clip.rate||1);else project.markers.find(x=>x.id===m.id).time=target;save()}else seekGlobal(start)}renderTimeline()};button.onpointerup=()=>finish(false);button.onpointercancel=()=>finish(true)};button.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();seekGlobal(m.time)}else if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();e.stopPropagation();const target=clamp(m.time+(e.key==='ArrowRight'?1:-1)/30,m.kind==='beat'?m.clip.start:0,m.kind==='beat'?Math.min(audioEnd(m.clip),totalDuration()):totalDuration());if(m.kind==='beat')m.clip.beats[m.index]=m.clip.offset+(target-m.clip.start)*(m.clip.rate||1);else project.markers.find(x=>x.id===m.id).time=target;save();renderTimeline();Array.from(document.querySelectorAll('.timeline-marker')).find(el=>el.dataset.markerId===m.id)?.focus()}}}};
document.addEventListener('keydown',e=>{if(e.target.matches('input,textarea,select')||document.querySelector('dialog[open]')||recording)return;if(e.key.toLowerCase()==='m'&&!e.ctrlKey&&!e.metaKey){e.preventDefault();addPlayheadMarker()}});
const timelineProValidator=valid;valid=function(p){return timelineProValidator(p)&&(!p.editing||typeof p.editing==='object'&&['ripple','snapToBeats'].every(k=>p.editing[k]===undefined||typeof p.editing[k]==='boolean'))&&(!p.markers||Array.isArray(p.markers)&&p.markers.length<=1000&&p.markers.every(m=>m&&typeof m.id==='string'&&typeof m.label==='string'&&m.label.length<=80&&Number.isFinite(m.time)&&m.time>=0&&m.time<=6000))&&(p.audioClips||[]).every(c=>!c.beats||Array.isArray(c.beats)&&c.beats.length<=5000&&c.beats.every(t=>Number.isFinite(t)&&t>=0&&t<=c.sourceDuration))};
render();
