const fs=require('node:fs'),dir=__dirname+'/dist/';function edit(file,a,b){const p=dir+file,s=fs.readFileSync(p,'utf8');if(!s.includes(a))throw Error('Missing '+file+' '+a.slice(0,50));fs.writeFileSync(p,s.replace(a,b))}
edit('animation.js',"function expressionAt(o,t)","function rawStateAt(o,t){return stateAt({...o,characterLoop:'none',autoBlink:false},t)}\nfunction expressionAt(o,t)");
edit('animation.js',"setKey(o,{...stateAt(o,time),[input.dataset.field]", "setKey(o,{...rawStateAt(o,time),[input.dataset.field]");
edit('app.js',"const v=stateAt(o,time);v[i.dataset.field]", "const v=typeof rawStateAt==='function'?rawStateAt(o,time):stateAt(o,time);v[i.dataset.field]");
edit('app.js',"if(object())setKey(object(),stateAt(object(),time))", "if(object())setKey(object(),typeof rawStateAt==='function'?rawStateAt(object(),time):stateAt(object(),time))");
edit('studio.js',"items:members.map(x=>({o:x,v:stateAt(x,time)}))", "items:members.map(x=>({o:x,v:typeof rawStateAt==='function'?rawStateAt(x,time):stateAt(x,time)}))");
edit('editing-tools.js',"const state=stateAt(o,time);const image=newObject('image'", "const state=stateAt(o,time),at=clamp(time,0,current().duration-.1);const image=newObject('image'");
edit('editing-tools.js',"in:time,out:clipEnd(o),mask:o.mask", "in:at,out:Math.min(current().duration,Math.max(at+.1,clipEnd(o))),mask:o.mask");
edit('editing-tools.js',"image.keys=[{t:time,v:", "image.keys=[{t:at,v:");
edit('workspace-tools.js',"lastRecoverySignature=signature;recoveryDirty=false;", "lastRecoverySignature=signature;recoveryDirty=JSON.stringify(project)!==signature;");
