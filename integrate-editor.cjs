const fs=require('node:fs');const dir=__dirname+'/dist/';
let s=fs.readFileSync(dir+'index.html','utf8');
s=s.replace('<meta name="viewport"','<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\'; style-src \'self\' \'unsafe-inline\'; img-src \'self\' data: blob:; media-src \'self\' data: blob:; connect-src \'self\' data: blob:; font-src \'self\'; object-src \'none\'; base-uri \'none\'; form-action \'none\'"><meta name="viewport"');
s=s.replace('</head>','<link rel="stylesheet" href="editor.css"></head>').replace('</body>','<script src="timeline.js"></script></body>');fs.writeFileSync(dir+'index.html',s);
s=fs.readFileSync(dir+'style.css','utf8').replace(/^@import[^;]+;/,'');fs.writeFileSync(dir+'style.css',s);
s=fs.readFileSync(dir+'app.js','utf8').replace('if(o.hidden)continue;','if(o.hidden||(typeof visibleAt===\'function\'&&!visibleAt(o,time,s)))continue;');
// The timeline owns media mixing when loaded; the extension retains browser compatibility.
fs.writeFileSync(dir+'app.js',s);
s=fs.readFileSync(dir+'studio.js','utf8').replace('if(o.hidden||o.locked)return false;','if(o.hidden||o.locked||(typeof visibleAt===\'function\'&&!visibleAt(o,time)))return false;').replace('if(narrationBuffer||musicBuffer){','if(narrationBuffer||musicBuffer||(typeof tracks===\'function\'&&tracks().length)){');
s=s.replace("if(window.studioDesktop){", "if(window.studioDesktop?.transcribe){");
fs.writeFileSync(dir+'studio.js',s);
fs.writeFileSync(dir+'revision.json',JSON.stringify({revision:Date.now()}));
fs.writeFileSync(dir+'checklist.json',JSON.stringify([{done:true,text:'Source inspected and integration fixes applied'},{done:true,text:'Live preview running'},{done:true,text:'Dark desktop workspace implemented · verification pending'},{done:true,text:'Multitrack timeline and audio editing implemented · verification pending'},{done:false,text:'Windows shell and native file saving'},{done:false,text:'FFmpeg MP4 export'},{done:false,text:'Verify playback, persistence, timeline and exports'},{done:false,text:'Package and launch Windows app'}],null,2));
