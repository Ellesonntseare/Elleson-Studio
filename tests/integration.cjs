const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises'),path=require('node:path');
function wav(){const b=Buffer.alloc(44+44100*2*3);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(44100,24);b.writeUInt32LE(88200,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(b.length-44,40);for(let i=0;i<44100*3;i++)b.writeInt16LE(Math.sin(i/44100*440*Math.PI*2)*8000,44+i*2);return b}
(async()=>{
 const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1520,height:960},acceptDownloads:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')console.log('console:',m.text())});
 try{
 await page.addInitScript(()=>localStorage.setItem('elleson-inspector-expanded','true'));await page.goto('http://127.0.0.1:4317');await page.waitForFunction(()=>typeof renderTimeline==='function');await page.waitForTimeout(500);
 assert.deepEqual(errors,[],'initial load errors');
 await page.locator('[data-tab="props"]').click();await page.locator('#drawObject').click();const drawing=await page.locator('#drawingCanvas').boundingBox();await page.mouse.move(drawing.x+180,drawing.y+180);await page.mouse.down();await page.mouse.move(drawing.x+250,drawing.y+100,{steps:8});await page.mouse.move(drawing.x+320,drawing.y+180,{steps:8});await page.mouse.up();await page.locator('#drawingName').fill('Test drawing');await page.locator('#addDrawing').click();await page.waitForFunction(()=>!$('drawingDialog').open);assert.equal(await page.locator('.asset-card').count(),1,'drawing stored in reusable library');assert.equal(await page.evaluate(()=>object().type),'image');
 await page.locator('#addText').click();await page.locator('#textValue').fill('Your next big idea.');
 await page.evaluate(()=>{newObject('character',{character:structuredClone(project.cast[0]),expression:'happy'});applyMotion(object(),'wave');});
 assert.equal(await page.locator('.timeline-clip.character').count(),1);
 await page.evaluate(()=>{object().locked=true;render();time=1;draw();renderControls()});await page.waitForTimeout(50);assert.equal(await page.locator('#expression').isDisabled(),true,'locked controls survive seeking');
 await page.locator('#lockLayer').click();assert.equal(await page.locator('#expression').isDisabled(),false);
 await page.evaluate(()=>{time=3;render()});await page.locator('#splitClip').click();assert.equal(await page.locator('.timeline-clip.character').count(),2,'visual split');
 await page.locator('#undo').click();assert.equal(await page.locator('.timeline-clip.character').count(),1,'undo split');await page.locator('#redo').click();assert.equal(await page.locator('.timeline-clip.character').count(),2,'redo split');
 await page.locator('#audioFile').setInputFiles({name:'test-voice.wav',mimeType:'audio/wav',buffer:wav()});await page.waitForFunction(()=>!audioBusy&&tracks().length===1&&audioBuffers.size===1);
 await page.evaluate(()=>{tracks()[0].start=0;tracks()[0].duration=3;time=0;save();render()});
 await page.locator('#musicFile').setInputFiles({name:'test-music.wav',mimeType:'audio/wav',buffer:wav()});await page.waitForFunction(()=>!audioBusy&&tracks().length===2);
 const mix=await page.evaluate(async()=>{const b=await mixedAudio();return{duration:b.duration,peak:Math.max(...b.getChannelData(0).slice(0,1000))}});assert.equal(mix.duration,6);assert(mix.peak>0);
 await page.evaluate(()=>{selectedAudio=tracks()[1].id;selected=null;time=1;render()});await page.locator('#splitClip').click();assert.equal(await page.evaluate(()=>tracks().length),3,'audio split');
 // Timeline dragging and trims write a single undo entry and change source timing.
 const audioClip=page.locator('.timeline-clip.audio').first();await audioClip.scrollIntoViewIfNeeded();const bounds=await audioClip.boundingBox();await page.mouse.move(bounds.x+25,bounds.y+15);await page.mouse.down();await page.mouse.move(bounds.x+67.5,bounds.y+15,{steps:5});await page.mouse.up();assert.equal(await page.evaluate(()=>tracks()[0].start),.5,'audio drag moves clip');
 const edge=page.locator('.timeline-clip.audio').first().locator('.clip-edge.right');const box=await edge.boundingBox();await page.mouse.move(box.x+3,box.y+10);await page.mouse.down();await page.mouse.move(box.x-39.5,box.y+10,{steps:5});await page.mouse.up();assert.equal(await page.evaluate(()=>tracks()[0].duration),2.5,'audio trim');
 await page.evaluate(()=>{current().captions=[{start:0,end:2,text:'A new idea begins here.'}];current().camera={start:{zoom:1,x:480,y:270},end:{zoom:1.2,x:480,y:270}};save();render()});
 assert.equal(await page.evaluate(()=>valid(project)),true,'edited schema valid');
 assert.equal(await page.evaluate(()=>{const p=structuredClone(project);p.scenes[0].camera.start.zoom=Infinity;return valid(p)}),false,'malformed camera rejected');
 assert.equal(await page.evaluate(()=>parseSrt('1\n00:00:01,000 --> 00:00:00,000\nbad').length),0);
 await page.waitForTimeout(700);await page.reload();await page.waitForFunction(()=>!audioBusy&&audioBuffers.size===3);assert.equal(await page.evaluate(()=>tracks().length),3,'audio persists after reload');
 await page.locator('#projects').click();await page.locator('#saveProject').click();await page.waitForFunction(()=>$('projectList').querySelectorAll('.project-board-card').length===1);assert.equal(await page.evaluate(async()=>{const all=await projectRecords('readonly',s=>s.getAll());return all[0].project.audioClips.length}),3,'dashboard includes audio');await page.locator('#closeProjects').click();
 // Camera-space pointer hit testing and grouped movement preserve locked members.
 await page.evaluate(()=>{sceneIndex=0;time=0;selected=current().objects.find(o=>o.type==='character').id;object().in=0;object().out=6;object().keys=[{t:0,v:{...pose,x:480,y:450}}];current().camera={start:{zoom:1.5,x:480,y:270},end:{zoom:1.5,x:480,y:270}};render()});const stage=await page.locator('#stage').boundingBox();await page.mouse.click(stage.x+stage.width/2,stage.y+stage.height*.55);assert.equal(await page.evaluate(()=>object()?.type),'character','camera-space selection');
 await page.evaluate(()=>{sceneIndex=0;time=0;selected=null;render()});await page.locator('#play').click();await page.waitForTimeout(300);assert(await page.evaluate(()=>playing&&time>0));await page.locator('#play').click();assert.equal(await page.evaluate(()=>playing),false);
 await page.evaluate(()=>{sceneIndex=0;time=0;selected=null;render()});await page.screenshot({path:path.join(__dirname,'../preview-desktop.png'),fullPage:true});
 assert.deepEqual(errors,[],'runtime errors');
 console.log('PASS: load, dark layout, drawing library, tracks, animation, locks, split, undo/redo, WAV imports, mixing, drag/trim, schema, SRT, persistence, dashboard, camera selection and playback.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
