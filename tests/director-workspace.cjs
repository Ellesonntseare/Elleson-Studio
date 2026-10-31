const {chromium}=require('playwright'),assert=require('assert/strict'),fs=require('fs');
(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:1450,height:950}}),errors=[];p.on('pageerror',e=>errors.push(e.message));try{
 await p.goto('http://127.0.0.1:4317');await p.waitForFunction(()=>typeof planDirectedObjectMotion==='function');
 const tests=await p.evaluate(()=>{
  const a=scene('First'),b=scene('Second');a.duration=b.duration=8;loadProject({version:1,title:'Director workspace checks',cast:[{id:uid(),...baseChar}],scenes:[a,b],audioClips:[]});
  const sam=newObject('character',{name:'Sam',character:structuredClone(project.cast[0])}),alex=newObject('character',{name:'Alex',character:structuredClone(project.cast[0])}),coin=newObject('coin',{name:'Coin'});sam.keys=[{t:0,v:{...pose,x:200,y:400}}];alex.keys=[{t:0,v:{...pose,x:340,y:400}}];
  const context={project,sceneId:a.id,actorId:sam.id,start:0,destination:{sceneId:a.id,x:600,y:400,at:2}},signature=JSON.stringify(project),history=historyStack.length;
  const plan=(actions,c=context,variant)=>planDirectedActions({summary:'Test directions',actions:actions.map(action=>({duration:2,text:'',afterCharacterId:'',...action}))},c,variant);
  const multi=plan([{kind:'wave',actorId:sam.id,at:1,emotion:'happy',energy:.5},{kind:'wave',actorId:alex.id,at:1,emotion:'excited',energy:1.4}]);
  const concurrent=multi.project.scenes[0].objects.filter(o=>o.type==='character').every(o=>o.actionBlocks[0].start===1),moods=multi.project.scenes[0].storyCues.length;
  const calm=plan([{kind:'wave'}],context,'calm'),energetic=plan([{kind:'wave'}],context,'energetic');
  const variants={calm:calm.end,energetic:energetic.end,low:calm.project.scenes[0].objects[0].actionBlocks[0].directorEnergy,high:energetic.project.scenes[0].objects[0].actionBlocks[0].directorEnergy};
  const route=plan([{kind:'walk',duration:6}],{...context,route:[{sceneId:a.id,x:300,y:400},{sceneId:a.id,x:400,y:350},{sceneId:a.id,x:500,y:400}]});
  const blocks=route.project.scenes[0].objects[0].actionBlocks,routeResult={count:blocks.length,last:blocks.at(-1).to,group:new Set(blocks.map(b=>b.longWalkId)).size,end:route.end};
  const listener=plan([{kind:'listen',actorId:alex.id,targetId:sam.id,duration:4}]);
  sam.actionBlocks=[{id:uid(),type:'walk',start:0,duration:4,from:{x:200,y:400},to:{x:500,y:400},travelEase:'linear'}];const before=stateAt(sam,1),oldTail=stateAt(sam,2.5),editContext={...context,editActionId:sam.actionBlocks[0].id,editFrom:2,editTo:4};
  const adjusted=plan([{kind:'walk',mode:'adjust',speed:.5}],editContext),after=stateAt(adjusted.project.scenes[0].objects[0],1),tail=stateAt(adjusted.project.scenes[0].objects[0],3);sam.actionBlocks=[];
  const hand=interactionHand(sam,propBaseState(sam,0),'right');coin.keys=[{t:0,v:{...pose,x:hand.point.x,y:hand.point.y}}];
  const interactions=plan([{kind:'pickup',targetId:coin.id,duration:1},{kind:'release',targetId:coin.id,duration:1}],{...context,destination:null});
  const beforePlan=project;let released;try{project=interactions.project;released=propEventOwner(propEventFor(project.scenes[0],coin.id,2),2)}finally{project=beforePlan}
  const locked=structuredClone(project);locked.scenes[0].objects[1].locked=true;let blocked=false;try{const old=project;project=locked;try{planDirectedActions({actions:[{kind:'wave',actorId:alex.id,duration:1}]},{...context,project:locked})}finally{project=old}}catch{blocked=true}
  const title=newObject('text',{name:'Title',text:'Editable text'}),objectContext={...context,actorId:title.id,destination:{sceneId:b.id,x:650,y:200,at:2}};
  const objects=plan([{kind:'move',duration:2,emotion:'happy'},{kind:'rotate',duration:1,amount:90}],objectContext);
  const first=objects.project.scenes[0].objects.find(o=>o.id===title.id),next=objects.project.scenes[1].objects.find(o=>o.name==='Title');
  const preserved=historyStack.length===history+1; // only the explicit newObject above saves
  return{concurrent,moods,variants,routeResult,listen:listener.project.scenes[0].storyCues.filter(c=>c.action==='listen').length,nods:listener.project.scenes[0].storyCues.filter(c=>c.action==='nod').length,edit:{duration:adjusted.project.scenes[0].objects[0].actionBlocks[0].duration,prefix:Math.abs(before.x-after.x),tail:Math.abs(oldTail.x-tail.x)},interactions:interactions.project.scenes[0].propInteractions.map(i=>i.kind),released,blocked,object:{valid:valid(objects.project),firstEnd:stateAt(first,8).x,nextStart:stateAt(next,0).x,nextEnd:stateAt(next,3).rotation},historyUntouched:preserved,valid:[multi,route,listener,adjusted,interactions].every(plan=>valid(plan.project))};
 });
 assert(tests.concurrent&&tests.moods===2&&tests.valid&&tests.blocked);assert(tests.variants.calm>tests.variants.energetic&&tests.variants.low<tests.variants.high);assert.equal(tests.routeResult.count,3);assert.equal(tests.routeResult.group,1);assert.equal(tests.routeResult.last.x,500);assert(Math.abs(tests.routeResult.end-6)<.001);assert.equal(tests.listen,1);assert(tests.nods>0);assert.equal(tests.edit.duration,6);assert(tests.edit.prefix<.01&&tests.edit.tail<.01);assert.deepEqual(tests.interactions,['pickup','release']);assert.equal(tests.released,null);assert(tests.object.valid);assert(Math.abs(tests.object.firstEnd-tests.object.nextStart)<.01);assert.equal(tests.object.nextEnd,90);assert(tests.historyUntouched);
 const ui=await p.evaluate(()=>{selectLayers([current().objects.find(o=>o.type==='text').id]);openCharacterDirector();return{open:$('characterDirector').open,name:$('directorCharacterName').textContent}});assert(ui.open&&ui.name.includes('Title'));
 await p.locator('#directorOptions').evaluate(e=>{e.open=true;e.querySelector('details').open=true});await p.locator('#directorStyleName').fill('Gentle objects');await p.locator('#directorStyleEnergy').fill('.7');await p.locator('#directorSaveStyle').evaluate(e=>e.click());assert.equal(await p.evaluate(()=>object().directorStyle.name),'Gentle objects');assert(await p.evaluate(()=>valid(project)));
 assert.deepEqual(errors,[]);console.log('PASS multi-item direction, exact simultaneous timing, mood/energy, route gait, partial speed edits, listener reactions, safe object interactions, text across scenes, saved acting style and copy-only planning.',tests);
 }finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
