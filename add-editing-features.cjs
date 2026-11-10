const fs=require('node:fs');const dir=__dirname+'/dist/';
function edit(name,from,to){const p=dir+name,s=fs.readFileSync(p,'utf8');if(!s.includes(from))throw Error('Expected source missing: '+name+' '+from.slice(0,80));fs.writeFileSync(p,s.replace(from,to))}
edit('index.html','<script src="drawing.js"></script>','<script src="effects.js"></script><script src="media.js"></script><script src="drawing.js"></script>');
edit('timeline.js','buffer,offset=0})','buffer,offset=0,audioClip=null})');
edit('timeline.js',' el.onpointerdown=e=>{',' if(audioClip&&typeof addAudioFadeHandles===\'function\')addAudioFadeHandles(el,audioClip);\n el.onpointerdown=e=>{');
edit('timeline.js',"timelineDrag={start,end,delta,mode};", "timelineDrag={start,end,delta,mode};if(audioClip&&typeof paintAudioFades==='function')paintAudioFades(el,audioClip,delta,mode);");
edit('timeline.js','buffer:audioBuffers.get(c.id),offset:c.offset,','buffer:audioBuffers.get(c.id),offset:c.offset,audioClip:c,');
edit('timeline.js',"source.start(ac.currentTime+Math.max(0,c.start-at),c.offset+skip,length);", "const when=ac.currentTime+Math.max(0,c.start-at);if(typeof scheduleEnvelope==='function')scheduleEnvelope(gain.gain,c,when,skip,length);source.start(when,c.offset+skip,length);");
edit('timeline.js','if(length>0)source.start(c.start,c.offset,length)',"if(length>0){if(typeof scheduleEnvelope==='function')scheduleEnvelope(gain.gain,c,c.start,0,length);source.start(c.start,c.offset,length)}");
edit('studio.js',"if(current().transition==='fade'&&time>current().duration-.35){ctx.globalAlpha=(time-current().duration+.35)/.35;rect(ctx,0,0,960,540,current().bg);ctx.globalAlpha=1}",'');
edit('app.js',"'coin','arrow','image'].includes(o.type)","'coin','arrow','image','video'].includes(o.type)");
edit('app.js',"&&(o.type!=='text'||typeof o.text==='string')", "&&(o.type!=='text'||typeof o.text==='string')&&(o.type!=='video'||typeof o.src==='string'&&/^data:video\\/[a-z0-9.+-]+;base64,/i.test(o.src)&&Number.isFinite(o.sourceDuration)&&o.sourceDuration>0&&Number.isFinite(o.sourceOffset)&&o.sourceOffset>=0&&Number.isFinite(o.width)&&o.width>0&&o.width<=960&&Number.isFinite(o.height)&&o.height>0&&o.height<=960)");
edit('app.js',"const v=stateAt(o,time);if(o.type==='character')character(ctx,o.character,v,lipExpression(o,time));else prop(ctx,o,v)","const v=stateAt(o,time);ctx.save();if(typeof applyVisualEffects==='function')applyVisualEffects(ctx,o,v,time);if(o.type==='video'&&typeof drawVideoObject==='function')drawVideoObject(ctx,o,v);else if(o.type==='character')character(ctx,o.character,v,lipExpression(o,time));else prop(ctx,o,v);ctx.restore()");
edit('app.js','function bounds(o,v){',"function bounds(o,v){if(o.type==='video')return{x:v.x-o.width*v.scale/2,y:v.y-o.height*v.scale/2,w:o.width*v.scale,h:o.height*v.scale};");
edit('studio.js','await Promise.all(assets.map(imageReady));',"await Promise.all(assets.map(imageReady));if(typeof prepareVideoExport==='function')await prepareVideoExport();");
edit('studio.js',"try{src?.stop()}catch{}stream?.getTracks()", "if(typeof pauseVideoMedia==='function')pauseVideoMedia();try{src?.stop()}catch{}stream?.getTracks()");
