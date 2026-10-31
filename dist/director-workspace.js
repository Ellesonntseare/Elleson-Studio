'use strict';

// All direction planning operates on a copy. The existing Apply button is the
// single commit point, so preview, diagnostics and rejected plans never save.
const planSingleCharacterDirection=planDirectedActions;
let directorResult=null,directorRoutePicking=false,directorRoute=[],directorMic=null;
const directorVariants={original:{name:'As directed',energy:1,pace:1},calm:{name:'Calm',energy:.6,pace:.85},energetic:{name:'Energetic',energy:1.3,pace:1.15},dramatic:{name:'Dramatic',energy:1.6,pace:.9}};

function directorActorLocation(p,id){for(const s of p.scenes){const actor=s.objects.find(o=>o.id===id);if(actor)return{scene:s,actor}}return null}
function directorActionTime(action,cursor,p){const t=action.at??cursor;if(!Number.isFinite(t)||t<0||t>=p.scenes.reduce((n,s)=>n+s.duration,0))throw Error('Choose an action time inside the project.');return t}
function actorDirectorStyle(actor){return actor.directorStyle||{name:'Default',energy:1,pace:1,emotion:'neutral',reactions:.5}}
function directorEnergy(action,actor,variant){return clamp((action.energy??actorDirectorStyle(actor).energy)*variant.energy,.2,2)}

function planDirectedObjectMotion(p,found,at,action,context,energy,pace){
 const first=narrationSceneAt(p,at),item=directorActorInScene(p,found.actor,found.scene,first.scene),initial=withSceneTime(first.scene,at-first.offset,()=>stateAt(item,at-first.offset)),destination=context.destination;
 let end=at+clamp(action.duration/pace,.2,30);
 if(action.kind==='move'&&destination){const target=p.scenes.find(s=>s.id===destination.sceneId);if(!target)throw Error('Choose a destination in this project.');const offset=storySceneOffsetFor(p,target);if(offset>first.offset)end=offset+clamp(destination.at||2,.2,target.duration-.1);else if(offset<first.offset)throw Error('Choose a destination later in the timeline.');}
 if(end>totalDuration()+.001)throw Error('Make more room in the project for this movement.');
 const route=context.route||[],points=[{x:initial.x,y:initial.y},...(route.length?route:destination?[destination]:[])],lengths=points.slice(1).map((point,i)=>Math.hypot(point.x-points[i].x,point.y-points[i].y)),length=lengths.reduce((a,b)=>a+b,0);
 if(action.kind==='move'&&points.length<2)throw Error('Choose a destination or draw a route for this item.');
 function position(f){let distance=length*f;for(let i=0;i<lengths.length;i++){if(distance<=lengths[i]||i===lengths.length-1){const mix=lengths[i]?distance/lengths[i]:0;return{x:points[i].x+(points[i+1].x-points[i].x)*mix,y:points[i].y+(points[i+1].y-points[i].y)*mix}}distance-=lengths[i]}return points.at(-1)}
 function changes(f){if(action.kind==='move')return position(f);if(action.kind==='rotate')return{rotation:initial.rotation+(action.amount??90)*f};if(action.kind==='scale')return{scale:clamp(initial.scale*(1+((action.amount??1.2)-1)*f),.05,10)};if(['fade','show','hide'].includes(action.kind)){const target=action.kind==='show'?1:action.kind==='hide'?0:clamp(action.amount??0,0,1);return{opacity:initial.opacity+(target-initial.opacity)*f}}return{y:initial.y-Math.sin(f*Math.PI)*clamp(action.amount??35,0,360)*energy}}
 let offset=0;for(const s of p.scenes){const a=Math.max(at,offset),b=Math.min(end,offset+s.duration);if(b-a>.001){const o=directorActorInScene(p,found.actor,found.scene,s);if(o.motionPath||o.timelinePlayback||(o.actionBlocks||[]).some(block=>block.type==='walk'&&block.start<b-offset&&block.start+block.duration>a-offset))throw Error('This item already has movement at that time. Choose its existing action to change, or choose another time.');
   const start=a-offset,finish=b-offset,fields=Object.keys(changes(0));
   for(const key of o.keys)if(key.t>=start&&key.t<=finish)Object.assign(key.v,changes((offset+key.t-at)/(end-at)));
   const samples=action.kind==='bounce'?Math.ceil((b-a)*15):route.length?Math.max(2,route.length*3):1;
   for(let i=0;i<=samples;i++){const local=start+(finish-start)*i/samples,base=withSceneTime(s,local,()=>rawStateAt(o,local));writePoseKey(o,{...base,...changes((offset+local-at)/(end-at))},local)}
   if(o.keys.length>10000)throw Error('This item has too many animation keys.');
  }offset+=s.duration}
 return end;
}

function adjustDirectedAction(actor,s,action,context){
 const block=actor.actionBlocks?.find(b=>b.id===context.editActionId);
 if(!block)throw Error('Choose the existing action to change first.');
 if(block.directorTimeMap)throw Error('Undo the earlier speed adjustment before changing this action again.');
 const speed=clamp(action.speed??1,.25,4),a=clamp(context.editFrom??0,0,block.duration),b=clamp(context.editTo??block.duration,a,block.duration);
 if(b-a<.05)throw Error('Choose at least 0.05 seconds of the action to change.');
 if(block.longWalkId&&project.scenes.some(other=>other!==s&&other.objects.some(o=>o.actionBlocks?.some(w=>w.longWalkId===block.longWalkId))))throw Error('Adjust a walk inside one scene first; this walk shares its step timing across scenes.');
 const old=block.duration,next=a+(b-a)/speed+(old-b),end=block.start+next;
 if(end>s.duration+.001||actor.actionBlocks.some(other=>other!==block&&other.start>=block.start+old-.001&&other.start<end-.001))throw Error('Make room after this action before slowing it down. Other actions will stay in place.');
 block.directorTimeMap={sourceDuration:old,from:a,to:b,speed};block.duration=next;
 return{start:block.start,end,oldDuration:old};
}

const evaluateBeforeDirectedTiming=evaluateCharacterActions;
evaluateCharacterActions=function(o,t,v){
 if(!(o.actionBlocks||[]).some(b=>b.directorTimeMap))return evaluateBeforeDirectedTiming(o,t,v);
 const blocks=o.actionBlocks.map(b=>{const m=b.directorTimeMap;if(!m)return b;const elapsed=t-b.start;if(elapsed<0)return{...b,duration:m.sourceDuration};const changed=(m.to-m.from)/m.speed,source=elapsed<=m.from?elapsed:elapsed<=m.from+changed?m.from+(elapsed-m.from)*m.speed:m.to+elapsed-m.from-changed;return{...b,start:t-source,duration:m.sourceDuration}});
 return evaluateBeforeDirectedTiming({...o,actionBlocks:blocks},t,v);
};

function addDirectedEmotion(s,actor,start,duration,emotion,energy){
 if(!Object.hasOwn(storyEmotions,emotion))throw Error('Choose a supported expression.');
 if(isAnimatedCharacter(actor)&&emotion!=='neutral')(s.storyCues??=[]).push({id:uid(),actorId:actor.id,at:start,duration:Math.min(duration,s.duration-start),emotion,action:'none',targetId:null,intensity:energy});
}
function addDirectedListener(s,actor,target,start,duration,energy){
 if(!isAnimatedCharacter(target)||target.id===actor.id)throw Error('Choose another character in this scene for the listener to watch.');
 actor.autoBlink=true;(s.storyCues??=[]).push({id:uid(),actorId:actor.id,at:start,duration,emotion:'neutral',action:'listen',targetId:target.id,intensity:Math.min(1,energy)});
 for(let at=start+.5;at+.7<start+duration;at+=2.8)(s.storyCues??=[]).push({id:uid(),actorId:actor.id,at,duration:.7,emotion:'neutral',action:'nod',targetId:null,intensity:Math.min(.5,energy*.25)});
}

planDirectedActions=function(result,context=characterDirectorContext,variantName='original'){
 if(!context||context.project!==project)throw Error('Reopen Director mode after changing projects.');
 if(!result||!Array.isArray(result.actions)||!result.actions.length||result.actions.length>8)throw Error('The AI plan is empty or too long.');
 const original=project,signature=JSON.stringify(original),variant=directorVariants[variantName]||directorVariants.original,p=structuredClone(original),speech=[],review=[],issues=[];
 let cursor=storySceneOffsetFor(p,p.scenes.find(s=>s.id===context.sceneId))+context.start,start=cursor,end=cursor,lastSceneId=context.sceneId,lastActorId=context.actorId;
 try{
  project=p;
  for(const raw of result.actions){
   if(raw.enabled===false)continue;
   const found=directorActorLocation(p,raw.actorId||context.actorId);if(!found)throw Error('The directed character is no longer in the project.');
   if(found.actor.locked)throw Error('Unlock '+found.actor.name+' before directing it.');
   const action={...raw},at=directorActionTime(action,cursor,p),energy=directorEnergy(action,found.actor,variant),pace=actorDirectorStyle(found.actor).pace*variant.pace;
   if(!Number.isFinite(action.duration)||action.duration<.2||action.duration>30)throw Error('Keep each action between 0.2 and 30 seconds.');
   if(action.kind==='explain'){issues.push(action.text||'Choose an action supported by this character’s rig.');continue}
   let owner=narrationSceneAt(p,at),actor=directorActorInScene(p,found.actor,found.scene,owner.scene),local=at-owner.offset;
   const item={actor:actor.name,kind:action.kind,start:at,duration:action.duration,energy};
   if(action.mode==='adjust'){
    const changed=adjustDirectedAction(actor,owner.scene,action,context);item.start=owner.offset+changed.start;item.duration=changed.end-changed.start;cursor=owner.offset+changed.end;
   }else if(['move','rotate','scale','fade','bounce','show','hide'].includes(action.kind)){
    cursor=planDirectedObjectMotion(p,found,at,action,context,energy,pace);item.duration=cursor-at;
   }else if(action.kind==='wait'){
    if(local+action.duration>owner.scene.duration)throw Error('Make room in this scene for the pause.');cursor=at+action.duration;
   }else if(action.kind==='listen'){
    if(local+action.duration>owner.scene.duration)throw Error('Keep the listening reaction inside this scene.');
    const target=owner.scene.objects.find(o=>o.id===action.targetId)||directorMatch(owner.scene.objects,p.scenes.flatMap(s=>s.objects).find(o=>o.id===action.targetId)||{});
    addDirectedListener(owner.scene,actor,target,local,action.duration,energy);cursor=at+action.duration;
   }else if(['pickup','hold','release','handover'].includes(action.kind)){
    const hand=action.hand||'right',held=heldProps(owner.scene,actor.id,local).find(h=>propEventOwner(h.event,local)?.hand===hand),prop=action.kind==='handover'?held?.prop:owner.scene.objects.find(o=>o.id===action.targetId);
    if(!prop)throw Error(action.kind==='handover'?'This hand must hold an object before handing it over.':'Choose an object in this scene.');
    if(action.kind==='release'&&propEventOwner(propEventFor(owner.scene,prop.id,local),local)?.actorId!==actor.id)throw Error('This character must hold the object before putting it down.');
    const event=withSceneTime(owner.scene,local,()=>addPropInteraction({actorId:actor.id,propId:prop.id,otherId:action.kind==='handover'?action.targetId:null,kind:action.kind,hand,otherHand:hand==='right'?'left':'right',start:local,duration:action.duration,offset:held?.event.offset||{x:0,y:0},followRotation:held?.event.followRotation||false},owner.scene,{preview:true}));
    if(action.kind==='release'&&context.destination?.sceneId===owner.scene.id){
     const point=context.destination,handAt=interactionHand(actor,propBaseState(actor,local),hand);if(!handAt||Math.hypot(point.x-handAt.root.x,point.y-handAt.root.y)>handAt.reach*1.05)throw Error('Move closer to the chosen place before putting the object there.');
     writePoseKey(prop,{...event.fromPose,x:point.x,y:point.y},local+action.duration);
    }
    cursor=at+action.duration;
   }else{
    let actionStart=at;
    if(action.kind==='speak'&&action.afterCharacterId){
     const other=directorActorLocation(p,action.afterCharacterId)?.actor;if(!other)throw Error('Choose an existing speaker to follow.');
     const target=replyVoiceChoices(actor).find(c=>p.scenes.flatMap(storyLines).some(l=>l.id===c.lineId&&l.speakerId===other.id))||replyVoiceChoices(actor).find(c=>c.name.startsWith(other.name+' · '));
     if(!target)throw Error(other.name+' needs a voice on the timeline first.');actionStart=replyStartsAfter(target,clamp(action.pause??0,0,10));action.afterCharacterId='';
    }
    const startOwner=narrationSceneAt(p,Math.min(actionStart,totalDuration()-.0001)),sourceActor=directorActorInScene(p,found.actor,found.scene,startOwner.scene),singleContext={...context,project:p,actorId:sourceActor.id,sceneId:startOwner.scene.id,start:actionStart-startOwner.offset};
    action.duration=clamp(action.duration/pace,.2,30);
    let plan;
    const route=context.route||[];
    if(action.kind==='walk'&&route.length>1){
     if(route.some(point=>point.sceneId!==startOwner.scene.id))throw Error('Draw a route in one scene. Use Choose a point for a walk into another scene.');
     const from=withSceneTime(startOwner.scene,singleContext.start,()=>stateAt(sourceActor,singleContext.start)),points=[{x:from.x,y:from.y},...route],lengths=route.map((point,i)=>Math.hypot(point.x-points[i].x,point.y-points[i].y)),total=lengths.reduce((a,b)=>a+b,0);
     if(total<1)throw Error('Draw a longer route.');
     const group=uid();let distance=0,routeStart=actionStart;
     for(let i=0;i<route.length;i++){
      if(lengths[i]<1)continue;const duration=action.duration*lengths[i]/total;if(duration<.2)throw Error('Draw a simpler route or allow more walking time.');
      const localOwner=narrationSceneAt(p,routeStart),who=directorActorInScene(p,found.actor,found.scene,localOwner.scene);
      plan=planSingleCharacterDirection({summary:result.summary,actions:[{...action,duration}]},{...singleContext,project:p,sceneId:localOwner.scene.id,actorId:who.id,start:routeStart-localOwner.offset,destination:route[i]});
      Object.assign(p,plan.project);const made=p.scenes.find(s=>s.id===plan.sceneId).objects.find(o=>o.id===plan.actorId).actionBlocks.at(-1);
      Object.assign(made,{longWalkId:group,walkCycleOffset:distance,blendIn:i===0?.2:0,blendOut:i===route.length-1?.2:0});distance+=lengths[i];routeStart=plan.end;
     }
    }else plan=planSingleCharacterDirection({summary:result.summary,actions:[action]},singleContext);
    Object.assign(p,plan.project);cursor=plan.end;speech.push(...plan.speech);lastSceneId=plan.sceneId;lastActorId=plan.actorId;item.start=actionStart;item.duration=plan.end-actionStart;
    // Set the strength of only the actions made by this instruction.
    const previousIds=new Set(original.scenes.flatMap(s=>s.objects).flatMap(o=>(o.actionBlocks||[]).map(b=>b.id)));
    for(const s of p.scenes)for(const o of s.objects)for(const b of o.actionBlocks||[])if(!previousIds.has(b.id)&&b.directorEnergy===undefined)b.directorEnergy=energy;
   }
   const expression=action.emotion||actorDirectorStyle(found.actor).emotion||'neutral';
   let offset=0;for(const s of p.scenes){const a=Math.max(item.start,offset),b=Math.min(cursor,offset+s.duration);if(b>a&&expression!=='neutral'){const who=directorMatch(s.objects,found.actor);if(who)addDirectedEmotion(s,who,a-offset,b-a,expression,energy)}offset+=s.duration}
   if(action.kind==='speak'){const made=speech.at(-1),line=made&&storyLines(p.scenes.find(s=>s.id===made.sceneId)).find(l=>l.id===made.lineId);if(line){line.emotion=expression;line.gesture='talk';line.directorEnergy=energy;line.pause=clamp(raw.pause??0,0,10)}}
   start=Math.min(start,item.start);end=Math.max(end,cursor);lastSceneId=narrationSceneAt(p,Math.min(cursor,totalDuration()-.0001)).scene.id;lastActorId=directorMatch(p.scenes.find(s=>s.id===lastSceneId).objects,found.actor)?.id||lastActorId;review.push(item);
  }
  if(!review.length&&!issues.length)throw Error('Select at least one action.');
  if(!valid(p))throw Error('This plan cannot fit the project safely. Shorten it or make more room.');
  return{project:p,signature,start,end,sceneId:lastSceneId,actorId:lastActorId,speech,summary:result.summary,review,issues};
 }finally{project=original}
};

// Gesture energy changes the difference from the resting pose, not world position.
const sampleBeforeDirectorEnergy=actionPoseSample;
actionPoseSample=function(type,f,base){return sampleBeforeDirectorEnergy(type,f,base)};
const evaluateBeforeDirectorEnergy=evaluateCharacterActions;
evaluateCharacterActions=function(o,t,v){const original={...v},out=evaluateBeforeDirectorEnergy(o,t,v),active=(o.actionBlocks||[]).filter(b=>b.type!=='walk'&&actionBlendWeight(b,t)>0&&b.directorEnergy!==undefined);if(active.length){const energy=active.reduce((n,b)=>n+b.directorEnergy,0)/active.length;for(const field of [...Object.keys(rigDefaults),'leftArm','leftElbow','rightArm','rightElbow','leg'])if(Number.isFinite(original[field])&&Number.isFinite(out[field]))out[field]=original[field]+(out[field]-original[field])*energy}return out};

function explainDirectorProblem(context=characterDirectorContext){
 const found=directorActorLocation(project,context?.actorId),notes=[];if(!found)return['Select an item, then open Director mode.'];
 if(found.actor.locked)notes.push('This item is locked. Unlock it in the layer list.');
 if(isAnimatedCharacter(found.actor)&&!canAnimateWalk(found.actor))notes.push('Walking needs both leg chains. Open the rig tools and assign the thigh and lower-leg joints.');
 if(found.scene.duration-context.start<.2)notes.push('The playhead is at the scene end. Move it earlier or make the scene longer.');
 if(!context.destination)notes.push(isAnimatedCharacter(found.actor)?'For walking or pointing, choose a point in the preview.':'For moving, choose a point in the preview.');
 if(found.actor.type==='puppet'&&!found.actor.mouth)notes.push('Talking mouth movement needs a mouth area on this picture character.');
 if(!notes.length)notes.push(isAnimatedCharacter(found.actor)?'Ready. To reach an object, move closer or choose another hand.':'Ready. This item can move, turn, change size, bounce or fade.');
 return notes;
}

const directorAdvanced=document.createElement('details');directorAdvanced.id='directorOptions';directorAdvanced.innerHTML=`<summary>Timing, route and acting</summary>
 <label>Start in selected scene (seconds)<input id="directorStartAt" type="number" min="0" step="0.05"></label><button id="directorUsePlayhead">Use playhead</button>
 <button id="directorDrawRoute">Draw walking route</button><button id="directorClearRoute">Clear route</button><p id="directorRouteStatus" class="note">Draw in the preview; the path stays editable until you apply it.</p>
 <label>Existing action to change<select id="directorExistingAction"><option value="">Add new actions</option></select></label>
 <label>Change from (seconds into action)<input id="directorEditFrom" type="number" min="0" step="0.05" value="0"></label><label>Change to (seconds into action)<input id="directorEditTo" type="number" min="0" step="0.05" value="1"></label>
 <label>Performance<select id="directorVariant"><option value="original">As directed</option><option value="calm">Calm</option><option value="energetic">Energetic</option><option value="dramatic">Dramatic</option></select></label>
 <details><summary>This item’s usual movement</summary><label>Style name<input id="directorStyleName" maxlength="80" value="My style"></label><label>Movement strength<input id="directorStyleEnergy" type="number" min="0.2" max="2" step="0.1" value="1"></label><label>Pace<input id="directorStylePace" type="number" min="0.5" max="2" step="0.1" value="1"></label><label>Usual emotion<select id="directorStyleEmotion"></select></label><button id="directorSaveStyle">Save for this item</button></details></details>`;
$('directorMakePlan').before(directorAdvanced);
const mic=storyButton('Speak direction',()=>toggleDirectorMicrophone());mic.id='directorMicrophone';$('directorInstruction').after(mic);
const why=storyButton('Help with a problem',()=>{$('directorStatus').textContent=explainDirectorProblem().join(' ')});why.id='directorExplain';$('directorMakePlan').after(why);
for(const [key,value]of Object.entries(storyEmotions)){const option=document.createElement('option');option.value=key;option.textContent=value[0];$('directorStyleEmotion').append(option)}

const openBeforeDirectorWorkspace=openCharacterDirector;
openCharacterDirector=function(o=object()){
 openBeforeDirectorWorkspace(o);if(!characterDirectorContext||!o||o.locked)return;
 directorResult=null;directorRoute=[];directorRoutePicking=false;$('directorPoint').textContent='You can choose a point in another scene.';$('directorStartAt').max=current().duration-.01;$('directorStartAt').value=time;
 const select=$('directorExistingAction');select.replaceChildren(new Option('Add new actions',''));for(const b of o.actionBlocks||[])select.add(new Option(b.type+' · '+b.start.toFixed(2)+'s',b.id));
 const style=actorDirectorStyle(o);$('directorStyleName').value=style.name;$('directorStyleEnergy').value=style.energy;$('directorStylePace').value=style.pace;$('directorStyleEmotion').value=style.emotion;
};
$('directorStartAt').onchange=()=>{const c=characterDirectorContext,s=project.scenes.find(s=>s.id===c?.sceneId);if(s)c.start=clamp(+$('directorStartAt').value||0,0,s.duration-.01);invalidateDirectorPlan()};
$('directorUsePlayhead').onclick=()=>{if(current().id!==characterDirectorContext?.sceneId)return $('directorStatus').textContent='Choose the item’s original scene to use its playhead.';$('directorStartAt').value=time;$('directorStartAt').onchange()};
$('directorExistingAction').onchange=()=>{const c=characterDirectorContext,o=directorActorLocation(project,c?.actorId)?.actor,b=o?.actionBlocks?.find(b=>b.id===$('directorExistingAction').value);if(b){$('directorEditFrom').value=0;$('directorEditTo').value=b.duration}invalidateDirectorPlan()};
function invalidateDirectorPlan(){stopDirectorPreview();characterDirectorPlan=null;$('directorApplyPlan').disabled=$('directorPreviewPlan').disabled=true}
for(const id of ['directorInstruction','directorEditFrom','directorEditTo'])$(id).addEventListener('input',invalidateDirectorPlan);
$('directorDrawRoute').onclick=()=>{directorRoutePicking=true;directorPicking=false;directorRoute=[];$('stage').style.cursor='crosshair';$('directorStatus').textContent='Drag across the preview to draw the walking route.'};
$('directorClearRoute').onclick=()=>{directorRoute=[];directorRoutePicking=false;draw();invalidateDirectorPlan();$('directorRouteStatus').textContent='Route cleared.'};
function simplifyDirectorRoute(points,tolerance=12){const out=[];for(const p of points)if(!out.length||Math.hypot(p.x-out.at(-1).x,p.y-out.at(-1).y)>=tolerance)out.push(p);if(points.length&&out.at(-1)!==points.at(-1))out.push(points.at(-1));return out.filter((_,i)=>i===0||i===out.length-1||i%Math.max(1,Math.ceil(out.length/16))===0).slice(0,18)}
$('stage').addEventListener('pointerdown',e=>{
 if(!directorRoutePicking||e.button)return;e.preventDefault();e.stopImmediatePropagation();const canvas=$('stage'),sceneId=current().id,points=[];canvas.setPointerCapture(e.pointerId);invalidateDirectorPlan();
 const move=event=>{const p=scenePoint(event);points.push({sceneId,x:p.x,y:p.y});directorRoute=simplifyDirectorRoute(points);draw()};move(e);
 const finish=event=>{canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',finish);canvas.removeEventListener('pointercancel',cancel);move(event);directorRoutePicking=false;canvas.style.cursor='';if(characterDirectorContext)characterDirectorContext.route=directorRoute;$('directorRouteStatus').textContent='Route: '+directorRoute.length+' points. Clear and draw again to change it.';draw()};
 const cancel=()=>{canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',finish);canvas.removeEventListener('pointercancel',cancel);directorRoutePicking=false;directorRoute=[];canvas.style.cursor='';draw()};
 canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',finish);canvas.addEventListener('pointercancel',cancel);
},true);
const drawBeforeDirectorRoute=draw;draw=function(){drawBeforeDirectorRoute();if(!$('characterDirector').open||directorRoute.length<2||directorRoute[0].sceneId!==current().id||recording)return;ctx.save();const camera=cameraAt(current(),time);ctx.translate(480,270);ctx.scale(camera.zoom,camera.zoom);ctx.translate(-camera.x,-camera.y);ctx.strokeStyle='#9b8aff';ctx.lineWidth=3;ctx.setLineDash([7,5]);ctx.beginPath();directorRoute.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();ctx.restore()};

const requestBeforeDirectorWorkspace=directorRequest;
directorRequest=function(){const request=requestBeforeDirectorWorkspace(),c=characterDirectorContext,found=directorActorLocation(project,c.actorId);c.editActionId=$('directorExistingAction').value;c.editFrom=+$('directorEditFrom').value;c.editTo=+$('directorEditTo').value;c.route=directorRoute;request.objects=project.scenes.flatMap(s=>s.objects.filter(o=>!isAnimatedCharacter(o)).map(o=>({id:o.id,name:o.name,type:o.type,sceneId:s.id}))).slice(0,200);request.assets=project.scenes.flatMap(s=>s.objects.map(o=>({id:o.id,name:o.name,type:o.type,sceneId:s.id,rigged:isAnimatedCharacter(o)}))).slice(0,250);request.actingStyle=actorDirectorStyle(found.actor);request.selectedAction=found.actor.actionBlocks?.find(b=>b.id===c.editActionId)||null;request.editRange={from:c.editFrom,to:c.editTo};request.route=directorRoute;request.start=c.start;request.startProjectTime=storySceneOffsetFor(project,found.scene)+c.start;return request};

function renderDirectorReview(){
 const result=directorResult;if(!result)return;const plan=planDirectedActions(result,characterDirectorContext,$('directorVariant').value);characterDirectorPlan=plan;
 $('directorPlanActions').replaceChildren();const summary=document.createElement('p');summary.textContent=result.summary;$('directorPlanActions').append(summary);
 for(const [i,action]of result.actions.entries()){
  const row=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.checked=action.enabled!==false;check.onchange=()=>{action.enabled=check.checked;try{renderDirectorReview()}catch(e){invalidateDirectorPlan();$('directorStatus').textContent=e.message}};
  const actor=directorActorLocation(project,action.actorId||characterDirectorContext.actorId)?.actor,name=document.createTextNode((actor?.name||'Character')+' · '+action.kind+(action.text?' · '+action.text:'')+' ');row.append(check,name);
  const duration=document.createElement('input');duration.type='number';duration.min='.2';duration.max='30';duration.step='.1';duration.value=action.duration;duration.style.width='65px';duration.setAttribute('aria-label','Action '+(i+1)+' seconds');duration.onchange=()=>{action.duration=+duration.value;try{renderDirectorReview()}catch(e){invalidateDirectorPlan();$('directorStatus').textContent=e.message}};row.append(duration);$('directorPlanActions').append(row);
 }
 for(const item of plan.review){const line=document.createElement('p');line.textContent=item.actor+' · '+item.kind+' · '+item.start.toFixed(2)+'–'+(item.start+item.duration).toFixed(2)+'s';$('directorPlanActions').append(line)}
 for(const issue of plan.issues){const line=document.createElement('p');line.textContent=issue;$('directorPlanActions').append(line)}
 $('directorPreviewPlan').disabled=$('directorApplyPlan').disabled=!plan.review.length;$('directorStatus').textContent='Review this version. The project has not changed.';
}
$('directorVariant').onchange=()=>{stopDirectorPreview();try{renderDirectorReview()}catch(e){invalidateDirectorPlan();$('directorStatus').textContent=e.message}};
$('directorMakePlan').onclick=async()=>{
 if(directorWorking)return;let request;try{request=directorRequest()}catch(e){return $('directorStatus').textContent=e.message}
 directorWorking=true;$('directorMakePlan').disabled=true;$('directorStatus').textContent='Planning on this PC…';const signature=JSON.stringify(project);
 try{const response=await fetch('/api/director/plan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(request)}),result=await response.json();if(!response.ok)throw Error(result.error||'The AI could not make a plan.');if(signature!==JSON.stringify(project))throw Error('The project changed. Make the plan again.');if(result.needsPoint&&!characterDirectorContext.destination&&!directorRoute.length)throw Error('Choose a point or draw a route first.');directorResult=result;renderDirectorReview()}
 catch(e){invalidateDirectorPlan();$('directorStatus').textContent=e.message+' '+explainDirectorProblem().join(' ')}finally{directorWorking=false;$('directorMakePlan').disabled=false}
};
$('directorSaveStyle').onclick=()=>{const found=directorActorLocation(project,characterDirectorContext?.actorId);if(!found||found.actor.locked)return;const style={name:$('directorStyleName').value.trim().slice(0,80)||'My style',energy:clamp(+$('directorStyleEnergy').value||1,.2,2),pace:clamp(+$('directorStylePace').value||1,.5,2),emotion:$('directorStyleEmotion').value,reactions:.5};for(const s of project.scenes)for(const o of s.objects)if(o.id===found.actor.id||found.actor.continuityId&&o.continuityId===found.actor.continuityId||o.continuitySource?.objectId===found.actor.id){if(o.locked)continue;o.directorStyle=structuredClone(style)}save();invalidateDirectorPlan();$('directorStatus').textContent='Movement style saved with this item and its linked copies.'};

async function transcribeDirectorAudio(blob){const context=new AudioContext();let buffer;try{buffer=await context.decodeAudioData(await blob.arrayBuffer())}finally{await context.close()}const response=await fetch('/api/transcribe?language=auto',{method:'POST',headers:{'Content-Type':'audio/wav'},body:wavBlob(buffer)}),result=await response.json();if(!response.ok)throw Error(result.error||'The recording could not be read.');const text=result.segments?.map(s=>s.text||(s.words||[]).map(w=>w.text).join(' ')).join(' ').trim();if(!text)throw Error('No words were heard. Try speaking more clearly.');return text}
async function toggleDirectorMicrophone(){
 if(directorMic){directorMic.recorder.stop();return}
 let stream;try{stream=await navigator.mediaDevices.getUserMedia({audio:true});const recorder=new MediaRecorder(stream),chunks=[],session={recorder,stream};directorMic=session;$('directorMicrophone').textContent='Stop recording';$('directorStatus').textContent='Listening. Stop when you finish; the instruction will appear for review.';const timeout=setTimeout(()=>{if(recorder.state!=='inactive')recorder.stop()},60000);
 recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};recorder.onstop=async()=>{clearTimeout(timeout);stream.getTracks().forEach(t=>t.stop());directorMic=null;$('directorMicrophone').textContent='Speak direction';if(session.cancelled)return;try{$('directorStatus').textContent='Writing your instruction locally…';const text=await transcribeDirectorAudio(new Blob(chunks,{type:recorder.mimeType}));if($('characterDirector').open){$('directorInstruction').value=text;invalidateDirectorPlan();$('directorStatus').textContent='Check the words, then choose Make a plan.'}}catch(e){$('directorStatus').textContent=e.message}};recorder.onerror=()=>{if(recorder.state!=='inactive')recorder.stop()};recorder.start();
 }catch(e){stream?.getTracks().forEach(t=>t.stop());$('directorStatus').textContent=e.name==='NotAllowedError'?'Microphone access was not allowed. You can type the direction instead.':e.message}
}
const closeBeforeDirectorWorkspace=$('closeCharacterDirector').onclick;$('closeCharacterDirector').onclick=()=>{if(directorMic){directorMic.cancelled=true;directorMic.recorder.stop()}directorRoutePicking=false;stopDirectorPreview();closeBeforeDirectorWorkspace();draw()};

const validBeforeDirectorWorkspace=valid;
valid=function(p){return validBeforeDirectorWorkspace(p)&&p.scenes.every(s=>s.objects.every(o=>(!o.directorStyle||typeof o.directorStyle.name==='string'&&o.directorStyle.name.length<=80&&Number.isFinite(o.directorStyle.energy)&&o.directorStyle.energy>=.2&&o.directorStyle.energy<=2&&Number.isFinite(o.directorStyle.pace)&&o.directorStyle.pace>=.5&&o.directorStyle.pace<=2&&Object.hasOwn(storyEmotions,o.directorStyle.emotion))&&(o.directedPoints||[]).every(d=>['start','duration','x','y'].every(k=>Number.isFinite(d[k]))&&d.start>=0&&d.duration>=.2&&d.start+d.duration<=s.duration+.001)&&(o.actionBlocks||[]).every(b=>(b.directorEnergy===undefined||Number.isFinite(b.directorEnergy)&&b.directorEnergy>=.2&&b.directorEnergy<=2)&&(!b.directorTimeMap||['sourceDuration','from','to','speed'].every(k=>Number.isFinite(b.directorTimeMap[k]))&&b.directorTimeMap.from>=0&&b.directorTimeMap.to>b.directorTimeMap.from&&b.directorTimeMap.to<=b.directorTimeMap.sourceDuration&&b.directorTimeMap.speed>=.25&&b.directorTimeMap.speed<=4))))};

directorStyle.textContent+='#characterDirector{width:350px}#directorOptions label,#directorPlanActions label{display:block;margin:9px 0}#directorPlanActions input[type=checkbox]{width:auto}#directorOptions input[type=number]{width:85px}';
