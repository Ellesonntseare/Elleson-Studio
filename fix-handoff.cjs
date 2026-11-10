const fs = require('node:fs');
const path = require('node:path');
function edit(file, transform) { const p=path.join(__dirname,'dist',file);fs.writeFileSync(p,transform(fs.readFileSync(p,'utf8'))); }
edit('app.js',s=>s
 .replace("function renderControls(){", "function renderControls(){queueMicrotask(renderExtras);")
 .replace("if(!object())return;const o=structuredClone(object());", "if(!object()||object().locked)return;const o=structuredClone(object());")
 .replace("current().objects.some(o=>o.keys.some(k=>k.t>d))", "current().objects.some(o=>o.keys.some(k=>k.t>d))||(current().captions||[]).some(c=>c.end>d)")
 .replace("localStorage.setItem('paperpop-v1',snap);renderCast();render()", "time=Math.min(time,current().duration);try{localStorage.setItem('paperpop-v1',snap)}catch{toast('Storage full. Download a project backup.')}renderCast();render()"));
edit('studio.js',s=>s
 .replace('Automatic transcription is available in the Windows companion.', 'Automatic transcription is not installed. This tool only times text you supply.')
 .replace('Choose WebM or use the Windows converter.', 'Choose WebM. No desktop converter is installed.')
 .replace("if(!o)return toast('Select a layer first.');", "if(!o)return toast('Select a layer first.');if(o.locked)return toast('Unlock this layer before editing.');")
 .replace("$('lipSync').disabled=o?.type!=='character';", "$('lipSync').disabled=o?.type!=='character'||!!o?.locked;for(const id of ['alignX','alignY','hideLayer','assignGroup','groupName','savedMotions','duplicate','remove','front','back','addKey'])$(id).disabled=!o||!!o.locked;")
 .replace("if(o?.locked){$('controls').querySelectorAll('input,select,button').forEach(e=>e.disabled=true)}", "$('controls').querySelectorAll('input,select,button').forEach(e=>e.disabled=!!o?.locked)")
 .replace("function loadProject(p){stop();", "function loadProject(p){if(!valid(p))throw Error('Invalid project');stop();")
 .replace("historyStack=[];futureStack=[];", "historyStack=[JSON.stringify(p)];futureStack=[];")
 .replace("if(!window.MediaRecorder)", "if(recording)return;if(!window.MediaRecorder||!$('stage').captureStream)")
 .replace("recording=true;document.body.classList.add('recording');", "recording=true;document.body.classList.add('recording');const frozen=[...document.querySelectorAll('button,input,select,textarea')].map(el=>[el,el.disabled]);frozen.forEach(([el])=>el.disabled=true);")
 .replace("src?.stop();stream?.getTracks()", "try{src?.stop()}catch{}stream?.getTracks()")
 .replace("recording=false;document.body.classList.remove('recording');", "recording=false;frozen.forEach(([el,disabled])=>el.disabled=disabled);document.body.classList.remove('recording');")
 .replace("return [{start:t(1),end:t(5),text:lines.slice(i+1).join(' ')}]", "const start=t(1),end=t(5),text=lines.slice(i+1).join(' ').trim();return start>=0&&end>start&&text?[{start,end,text}]:[]"));
