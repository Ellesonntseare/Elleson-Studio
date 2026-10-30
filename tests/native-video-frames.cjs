const {_electron}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),{execFileSync}=require('node:child_process');
(async()=>{
 const root=path.resolve(__dirname,'..'),ffmpeg=path.join(root,'desktop/tools/ffmpeg.exe'),fixture=path.join(root,'test-output/native-video-source.webm');
 execFileSync(ffmpeg,['-nostdin','-hide_banner','-loglevel','error','-y','-f','lavfi','-i','color=red:s=160x90:r=30:d=1','-f','lavfi','-i','color=blue:s=160x90:r=30:d=1','-f','lavfi','-i','sine=frequency=440:duration=2','-filter_complex','[0:v][1:v]concat=n=2:v=1:a=0[v]','-map','[v]','-map','2:a','-c:v','libvpx','-c:a','libopus',fixture],{windowsHide:true});
 const app=await _electron.launch({executablePath:path.join(root,'node_modules/electron/dist/electron.exe'),args:[root],env:{...process.env,ELLESON_TEST_DATA:await fs.mkdtemp(path.join(os.tmpdir(),'elleson-native-video-test-')),ELLESON_TEST_HIDE:'1'}}),errors=[];
 try{
  const p=await app.firstWindow();p.on('pageerror',e=>errors.push(e.message));await p.waitForFunction(()=>typeof renderNativeFrames==='function');
  await p.evaluate(()=>{const s=scene('Video','#ffffff');s.template='blank';s.duration=1;loadProject({version:1,title:'Native video',cast:[{id:uid(),...baseChar}],scenes:[s],audioClips:[]})});
  await p.locator('#videoFile').setInputFiles(fixture);await p.waitForFunction(()=>!videoImportBusy&&tracks().length===1);
  await p.evaluate(()=>{const o=current().objects[0];o.sourceOffset=.2;o.speed=2;o.in=0;o.out=.9;o.width=960;o.height=540;o.keys=[{t:0,v:{...pose,x:480,y:270}}];current().duration=.9;current().transition='black';current().transitionDuration=.2;save();render()});
  const samples=[];
  for(const format of ['mp4','webm']){
   const output=path.join(root,'test-output/native-video-frames.'+format);await fs.unlink(output).catch(()=>{});
   await app.evaluate(({dialog},output)=>{dialog.showSaveDialog=async()=>({canceled:false,filePath:output})},output);
   if(format==='webm')await p.evaluate(()=>{project.audioClips=[];audioBuffers.clear();save();render()});
   await p.locator('#export').click();await p.locator('#resolution').selectOption('960');await p.locator('#videoFormat').selectOption(format);await p.locator('#renderVideo').click();
   await p.waitForFunction(()=>recording);await p.waitForFunction(()=>!recording,null,{timeout:60000});
   const bytes=await fs.readFile(output).catch(async error=>{console.log('Export status:',await p.locator('#toast').textContent());throw error}),sample=await p.evaluate(async src=>{const v=document.createElement('video');v.muted=true;v.src=src;await new Promise((ok,bad)=>{v.onloadeddata=ok;v.onerror=bad});const c=document.createElement('canvas');c.width=960;c.height=540;const g=c.getContext('2d');async function at(t){await new Promise(ok=>{v.onseeked=ok;v.currentTime=t});g.drawImage(v,0,0);return Array.from(g.getImageData(480,270,1,1).data)}return{duration:v.duration,red:await at(.1),blue:await at(.55),fade:await at(.85)}},'data:video/'+format+';base64,'+bytes.toString('base64'));
   assert(sample.red[0]>220&&sample.red[2]<30,'trimmed, sped-up source begins red');assert(sample.blue[2]>220&&sample.blue[0]<30,'exact source seek reaches blue');assert(Math.max(...sample.fade.slice(0,3))<90,'scene fade renders at the correct frame');assert(Math.abs(sample.duration-.9)<.1);
   assert(await p.evaluate(()=>[...videoMedia.values()].every(e=>e.video.paused)),'source videos stop after export');samples.push({format,...sample});
   if(format==='mp4'){const pcm=execFileSync(ffmpeg,['-nostdin','-hide_banner','-loglevel','error','-i',output,'-vn','-ac','1','-ar','16000','-f','f32le','pipe:1'],{windowsHide:true});let sum=0;for(let i=0;i<pcm.length;i+=4)sum+=pcm.readFloatLE(i)**2;assert(Math.sqrt(sum/(pcm.length/4))>.02,'linked source audio is audible')}
  }
  assert.deepEqual(errors,[]);console.log('PASS: deterministic native MP4 and silent WebM, imported-video source trim/speed, scene fade, mixed original audio and stopped source playback.',samples);
 }finally{await app.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
