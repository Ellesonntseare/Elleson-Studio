'use strict';
// Split segments retain their original track instead of creating another row.
const splitBeforeSameTrack=$('splitClip').onclick;$('splitClip').onclick=()=>{
 const c=tracks().find(c=>c.id===selectedAudio),o=object(),cut=c?globalTime()-c.start:time;
 if(c&&cut>=.1&&cut<=c.duration-.1)c.timelineTrackId??=uid();
 else if(!c&&o&&!o.locked&&cut>clipStart(o)+.05&&cut<clipEnd(o)-.05)o.timelineTrackId??=uid();
 splitBeforeSameTrack();
};
function regroupTimelineSegments(){
 const groups=new Map();for(const clip of document.querySelectorAll('.timeline-clip[data-object-id],.timeline-clip[data-audio-id]')){
  const owner=clip.dataset.ownerSceneId?project.scenes.find(s=>s.id===clip.dataset.ownerSceneId):current(),item=clip.dataset.audioId?tracks().find(c=>c.id===clip.dataset.audioId):owner?.objects.find(o=>o.id===clip.dataset.objectId);
  if(!item?.timelineTrackId)continue;const key=(clip.dataset.audioId?'audio':owner.id)+':'+item.timelineTrackId,row=clip.closest('.track-row'),first=groups.get(key);
  if(!first){groups.set(key,row);row.dataset.timelineTrackId=item.timelineTrackId;continue}
  first.querySelector('.track-lane').append(clip);if(!row.querySelector('.timeline-clip'))row.remove();
 }
 // Keep a character's split action segments together too.
 const actionGroups=new Map();for(const row of document.querySelectorAll('.action-track[data-actor-id]')){const actor=current().objects.find(o=>o.id===row.dataset.actorId);if(!actor?.timelineTrackId)continue;const first=actionGroups.get(actor.timelineTrackId);if(first){for(const clip of [...row.querySelectorAll('.timeline-clip')])first.querySelector('.track-lane').append(clip);row.remove()}else actionGroups.set(actor.timelineTrackId,row)}
}
const timelineBeforeSameTrack=renderTimeline;renderTimeline=function(){if(timelineDrag)return;timelineBeforeSameTrack();regroupTimelineSegments()};
const sameTrackStyle=document.createElement('style');sameTrackStyle.textContent='.timeline-clip .clip-edge{width:11px;z-index:8;background:#e8d9ff33}.timeline-clip .clip-edge:hover{background:#e8d9ff99}.timeline-clip .clip-edge:after{content:"";position:absolute;left:4px;top:8px;bottom:8px;border-left:2px solid #e8d9ff}.timeline-clip:not(.locked):active{cursor:grabbing}.timeline-clip .clip-name{pointer-events:none}';document.head.append(sameTrackStyle);
function trimTimelineAtPlayhead(edge){
 try{const target=ensureTimelineEdit(),kind=timelineSelection.kind;if(!['visual','audio'].includes(kind))throw Error('Select a character, asset or audio clip to trim.');const at=kind==='audio'?globalTime():time,a=kind==='audio'?target.start:clipStart(target),b=kind==='audio'?audioEnd(target):clipEnd(target);if(at<=a+.05||at>=b-.05)throw Error('Place the playhead inside the selected clip first.');stop();const change={mode:edge,delta:at-(edge==='left'?a:b)};if(kind==='audio')moveAudio(target,change);else moveVisual(target,change);save();render();toast(edge==='left'?'Trimmed the beginning. Clip stays on its track.':'Trimmed the end. Clip stays on its track.')}catch(e){toast(e.message)}
}
for(const [id,label,edge]of [['timelineTrimLeft','Trim left','left'],['timelineTrimRight','Trim right','right']]){const b=storyButton(label,()=>trimTimelineAtPlayhead(edge));b.id=id;b.title='Remove the part '+(edge==='left'?'before':'after')+' the playhead from the selected clip';$('timelineDeleteClip').after(b)}
// A full-length asset can be dragged later without silently refusing the move.
const moveBeforeTimelineRoom=moveVisual;moveVisual=function(o,change){
 if(change.mode==='move'&&!o.locked&&change.delta>0){const end=clipEnd(o),needed=Math.min(60,Math.ceil((end+change.delta)*20)/20);if(needed>current().duration){const anchors=sceneAudioAnchors(),oldEnd=sceneOffset()+current().duration,added=needed-current().duration;o.out=end;current().duration=needed;placeSceneAudio(anchors);for(const m of project.markers||[])if(m.time>=oldEnd)m.time+=added}}
 return moveBeforeTimelineRoom(o,change);
};
const validatorBeforeTrackIds=valid;valid=function(p){return validatorBeforeTrackIds(p)&&[...p.scenes.flatMap(s=>s.objects),...(p.audioClips||[])].every(c=>c.timelineTrackId===undefined||typeof c.timelineTrackId==='string'&&c.timelineTrackId.length<=160)};
renderTimeline();
