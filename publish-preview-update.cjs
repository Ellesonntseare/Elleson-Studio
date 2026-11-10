const fs=require('node:fs'),path=require('node:path');
const done=[
'Professional dark workspace and multitrack editing',
'113 downloaded CC0 effects with search, preview and favorites',
'Draggable audio fades, trimming, splitting and mixed export',
'1 · Character loops, blinking, head/hand actions and timed expressions',
'2 · Real local speech captions, word timing and phonetic mouth animation',
'3 · Ease-in/out, bounce, hold and draggable custom animation curves',
'4 · Typewriter, animated titles and spoken-word caption highlighting',
'6 · Saved scene/project sequences with their media and audio',
'7 · Speed-adjusted footage/audio, reversal, freeze frames, crop and masks',
'8 · Recovery history, interrupted-session notice and media health controls',
'Regression, persistence and real-time video export tests passed'
];
const checklist=done.map(text=>({done:true,text}));checklist.push({done:false,text:'Windows application build, speech-runtime packaging and desktop testing — deferred by user'});checklist.push({done:false,text:'Future: automatic image rigging, advanced effect automation and cross-device sync'});
fs.writeFileSync(path.join(__dirname,'dist/checklist.json'),JSON.stringify(checklist,null,2));
fs.writeFileSync(path.join(__dirname,'dist/revision.json'),JSON.stringify({revision:Date.now(),features:'animation-speech-curves-text-sequences-editing-recovery'}));
console.log('Live preview revision and checklist updated. No application build was run.');
