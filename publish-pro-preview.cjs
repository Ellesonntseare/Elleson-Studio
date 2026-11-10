const fs=require('node:fs'),path=require('node:path');
const complete=process.argv.includes('--verified'),file=path.join(__dirname,'dist/checklist.json');
const items=JSON.parse(fs.readFileSync(file,'utf8')).filter(i=>!i.text.startsWith('Editing expansion ·'));
for(const text of ['Ripple trimming and deletion with later clips following within the scene','Audio beat detection, draggable markers and clip snapping','Previous/next onion skin poses with frame and opacity controls','Speech-aware music ducking shared by preview and export','Per-property animation graphs, keyframe editing and custom tangents'])items.push({done:complete,text:'Editing expansion · '+text+(complete?'':' — testing')});
fs.writeFileSync(file,JSON.stringify(items,null,2));
fs.writeFileSync(path.join(__dirname,'dist/revision.json'),JSON.stringify({revision:Date.now(),features:'ripple-beats-onion-ducking-graphs',verified:complete}));
console.log('Live editor preview updated. No EXE build.');
