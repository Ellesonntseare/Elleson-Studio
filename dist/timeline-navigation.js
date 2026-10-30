'use strict';
const timelineNavigation=document.createElement('div');timelineNavigation.className='timeline-navigation';timelineNavigation.innerHTML='<button id="timelineZoomOut" title="Zoom out around the playhead">−</button><button id="timelineZoomIn" title="Zoom in around the playhead">+</button><button id="timelineFit" title="Fit the whole project">Fit project</button><button id="timelineCurrent" title="Bring the playhead into view">Playhead</button><button id="previousScene" title="Previous scene">‹ Scene</button><button id="nextScene" title="Next scene">Scene ›</button>';
$('timelineZoom').closest('label').after(timelineNavigation);$('timelineZoom').min='0.05';$('timelineZoom').max='300';$('timelineZoom').step='0.01';
function timelineLabelWidth(){return document.querySelector('.track-label')?.getBoundingClientRect().width||170}
function zoomTimeline(value,{at=globalTime(),screenX=null}={}){const body=$('timelineBody'),label=timelineLabelWidth(),anchor=screenX??clamp(label+at*timelineZoom-body.scrollLeft,label+20,body.clientWidth-20);timelineZoom=clamp(value,.05,300);$('timelineZoom').value=timelineZoom;renderTimeline();body.scrollLeft=Math.max(0,label+at*timelineZoom-anchor);return timelineZoom}
function revealTimelineTime(at=globalTime()){const body=$('timelineBody');body.scrollLeft=Math.max(0,timelineLabelWidth()+at*timelineZoom-body.clientWidth*.5)}
$('timelineZoom').oninput=e=>zoomTimeline(+e.target.value);
$('timelineZoomIn').onclick=()=>zoomTimeline(timelineZoom*1.3);$('timelineZoomOut').onclick=()=>zoomTimeline(timelineZoom/1.3);
$('timelineFit').onclick=()=>{zoomTimeline(($('timelineBody').clientWidth-timelineLabelWidth()-40)/Math.max(1,totalDuration()),{at:0,screenX:timelineLabelWidth()});$('timelineBody').scrollLeft=0};
$('timelineCurrent').onclick=()=>revealTimelineTime();
function jumpTimelineScene(delta){if(recording||window.editorTaskBusy)return;const index=clamp(sceneIndex+delta,0,project.scenes.length-1),at=project.scenes.slice(0,index).reduce((n,s)=>n+s.duration,0);seekGlobal(at);revealTimelineTime(at)}
$('previousScene').onclick=()=>jumpTimelineScene(-1);$('nextScene').onclick=()=>jumpTimelineScene(1);
$('timelineBody').addEventListener('wheel',e=>{if(!e.ctrlKey&&!e.metaKey&&!e.altKey)return;e.preventDefault();if(recording||timelineDrag)return;const body=$('timelineBody'),screenX=e.clientX-body.getBoundingClientRect().left,at=clamp((body.scrollLeft+screenX-timelineLabelWidth())/timelineZoom,0,totalDuration());zoomTimeline(timelineZoom*Math.exp(-e.deltaY*.002),{at,screenX})},{passive:false});
const extrasBeforeNavigation=renderExtras;renderExtras=function(){extrasBeforeNavigation();$('previousScene').disabled=sceneIndex===0||recording;$('nextScene').disabled=sceneIndex===project.scenes.length-1||recording};
