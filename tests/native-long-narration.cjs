'use strict';
const {_electron}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');

(async()=>{
 const root=path.resolve(__dirname,'..'),profile=process.env.ELLESON_VOICE_TEST_PROFILE||await fs.mkdtemp(path.join(os.tmpdir(),'elleson-long-narration-'));
 const source=process.argv.includes('--source'),executablePath=source?path.join(root,'node_modules/electron/dist/electron.exe'):path.join(process.env.LOCALAPPDATA,'Programs','Elleson Studio','Elleson Studio.exe');
 const app=await _electron.launch({executablePath,args:source?[root]:[],env:{...process.env,ELLESON_TEST_DATA:profile,ELLESON_TEST_HIDE:'1'},timeout:60000});
 const errors=[];
 const script=[
  'Every useful explanation begins with a question. How does an idea travel from one person to another? We can show that journey with a few simple pictures, a clear voice, and enough time for each thought to settle.',
  'Imagine a small workshop on a quiet street. Inside, a designer is drawing a new chair. She tests its shape, changes the legs, and asks a friend to sit down. The first version is only a beginning. Each careful change makes the design easier to understand.',
  'Now we move closer to the drawing. A line becomes an outline, and the outline becomes an object. We can move the parts independently, turn the head of a character, or let a hand point toward the detail that matters. The movement should support the explanation.',
  'A narrator gives the audience a path to follow. A short pause can separate two ideas. A slower sentence can give a difficult point room to breathe. The pictures and the voice should work together, so that people do not have to guess what happens next.',
  'Sound has a job too. Music can create a gentle rhythm underneath the story. It should stay quiet enough for every spoken word to be heard. When a scene changes, the sound can continue smoothly, connecting the pictures without interrupting the thought.',
  'Suppose the explanation lasts longer than a single scene. The words must continue in the right order. No sentence should disappear at a boundary, and no part should play twice. The editor can divide the recording into pieces while keeping the original performance together.',
  'The designer returns to her chair with a new idea. She moves one joint, checks the balance, and tries again. This is how a good explanation develops as well. We watch, listen, and make a small change where the meaning is not yet clear.',
  'Before sharing the finished video, we review the beginning, the middle, and the end. We check that the text can be read and that the voice can be heard. We save the project so that the next version can begin from the work we already completed.',
  'Finally, the audience sees the whole journey. An unfamiliar idea has become a sequence they can follow. The best result is not simply a moving picture. It is a story that helps someone understand, remember, and use what they have learned.'
 ].join('\n\n');
 assert(script.length>2000);
 try{
  const page=await app.firstWindow();await page.waitForLoadState('load');const waitForNarration=page.waitForFunction.bind(page);page.waitForFunction=(fn,arg,options={})=>waitForNarration(fn,arg,{polling:100,...options});page.on('pageerror',e=>errors.push(e.stack));page.on('console',m=>{if(m.text().startsWith('Narration test:'))console.log(m.text())});
  await page.waitForFunction(()=>typeof openNarratorComposer==='function');
  await page.evaluate(()=>{const first=scene('Opening','#f0f4fa'),second=scene('Existing scene','#203040');first.duration=6;second.duration=7;loadProject({version:1,title:'Long narration verification',cast:[{id:uid(),...baseChar}],scenes:[first,second],audioClips:[]});time=2;render()});
  await page.locator('#openNarratorVoice').click();await page.waitForFunction(()=>offlineVoiceReady);
  await page.locator('#naturalFemaleVoice').click();await page.locator('#offlineVoiceText').fill(script);
  await page.evaluate(()=>{let last='';window.narrationTestTimer=setInterval(()=>{const status=$('offlineVoiceStatus').textContent;if(status!==last){console.log('Narration test: '+status);last=status}},1000)});
  const began=Date.now();await page.locator('#previewOfflineVoice').click();
  await page.waitForFunction(text=>!offlineVoiceBusy&&offlineVoiceCache?.request.text===text,script,{timeout:600000});
  const generated=await page.evaluate(()=>{const b=offlineVoiceCache.buffer;let sum=0,peak=0;for(const value of b.getChannelData(0)){sum+=value*value;peak=Math.max(peak,Math.abs(value))}return{characters:offlineVoiceCache.request.text.length,voice:offlineVoiceCache.request.voice,duration:b.duration,frames:b.length,sampleRate:b.sampleRate,rms:Math.sqrt(sum/b.length),peak,sections:typeof narrationRequestSections==='function'?narrationRequestSections(offlineVoiceCache.request).length:splitNarrationText(offlineVoiceCache.request.text).length}});
  assert(generated.duration>60);assert(generated.rms>.01);assert(generated.peak<=.981);assert(generated.sections>1);
  // Hidden Electron windows do not always produce compositor screenshots; verify audio and persistence directly.
  await page.locator('#addOfflineVoice').click();await page.waitForFunction(()=>!offlineVoiceBusy&&!$('offlineVoiceDialog').open,null,{timeout:60000});
  const placed=await page.evaluate(()=>{clearInterval(window.narrationTestTimer);let cursor=0,mismatches=0;const original=offlineVoiceCache.buffer.getChannelData(0);for(const clip of tracks()){const values=audioBuffers.get(clip.id).getChannelData(0);for(let i=0;i<values.length;i++)if(values[i]!==original[cursor+i])mismatches++;cursor+=values.length}return{valid:valid(project),frames:cursor,mismatches,text:storyLines(project.scenes[0])[0].text,clips:tracks().map(c=>({id:c.id,start:c.start,duration:c.duration})),sceneDurations:project.scenes.map(s=>s.duration)}});
  assert(placed.valid);assert.equal(placed.frames,generated.frames);assert.equal(placed.mismatches,0);assert.equal(placed.text,script);assert.equal(placed.clips[0].start,2);assert.deepEqual(placed.sceneDurations.slice(0,2),[6,7]);
  for(let i=1;i<placed.clips.length;i++)assert(Math.abs(placed.clips[i].start-(placed.clips[i-1].start+placed.clips[i-1].duration))<1/generated.sampleRate);
  await page.waitForFunction(()=>$('saveStatus').textContent==='Saved on this device');
  await page.reload();await page.waitForFunction(()=>project.title==='Long narration verification'&&tracks().length>1);
  await page.waitForFunction(()=>tracks().every(c=>audioBuffers.has(c.id)),null,{timeout:60000});
  const restored=await page.evaluate(()=>({valid:valid(project),text:storyLines(project.scenes[0])[0].text,frames:tracks().reduce((n,c)=>n+audioBuffers.get(c.id).length,0),clips:tracks().map(c=>({id:c.id,start:c.start,duration:c.duration}))}));
  assert(restored.valid);assert.equal(restored.text,script);assert.equal(restored.frames,generated.frames);assert.deepEqual(restored.clips,placed.clips);
  await page.evaluate(async()=>{sceneIndex=1;time=0;render();await openOfflineVoice(storyLines(current())[0])});
  assert.equal(await page.locator('#offlineVoiceText').inputValue(),script);assert.deepEqual(errors,[]);
  const report={installed:!source,isolatedProfile:true,generated,placement:{...placed,text:undefined},savedAndReloaded:true,continuationOpensCompleteScript:true,elapsedSeconds:(Date.now()-began)/1000};
  await fs.writeFile(path.join(root,'test-output/native-long-narration-'+(source?'source':'installed')+'.json'),JSON.stringify(report,null,2));
  console.log('PASS: real local narration over 2,000 characters, exact sample continuity across scenes, autosave/reload and full-script editing.',report);
 }finally{await app.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
