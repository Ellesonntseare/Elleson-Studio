const fs=require('node:fs'),dir=__dirname+'/dist/';
function edits(file,list){const p=dir+file;let s=fs.readFileSync(p,'utf8');for(const [a,b]of list){if(!s.includes(a))throw Error(file+' missing '+a.slice(0,75));s=s.replace(a,b)}fs.writeFileSync(p,s)}
edits('index.html',[['<script src="text-tools.js"></script>','<script src="text-tools.js"></script><script src="editing-tools.js"></script>']]);
edits('media.js',[["o.sourceOffset+((o.out??s.duration)-(o.in??0))<=o.sourceDuration+.05", "o.sourceOffset+((o.out??s.duration)-(o.in??0))*(o.speed||1)<=o.sourceDuration+.05"]]);
edits('timeline.js',[
 ['c.offset+c.duration<=c.sourceDuration+.01','c.offset+c.duration*(c.rate||1)<=c.sourceDuration+.01&&(c.rate===undefined||Number.isFinite(c.rate)&&c.rate>=.25&&c.rate<=4)'],
 ['copy.sourceOffset=o.sourceOffset+time-clipStart(o)', 'copy.sourceOffset=o.sourceOffset+(time-clipStart(o))*(o.speed||1)'],
 ['offset:c.offset+cut,duration:c.duration-cut','offset:c.offset+cut*(c.rate||1),duration:c.duration-cut'],
 ['offset+x/c.width*(end-start)', 'offset+x/c.width*(end-start)*(audioClip?.rate||1)'],
 ['offset+(x+1)/c.width*(end-start)', 'offset+(x+1)/c.width*(end-start)*(audioClip?.rate||1)'],
 ['const source=ac.createBufferSource(),gain=ac.createGain();source.buffer=buffer;gain.gain.value=c.volume;source.connect(gain).connect(ac.destination);const skip=', 'const rate=c.rate||1,source=ac.createBufferSource(),gain=ac.createGain();source.buffer=buffer;source.playbackRate.value=rate;gain.gain.value=c.volume;source.connect(gain).connect(ac.destination);const skip='],
 ['buffer.duration-c.offset-skip,totalDuration()-Math.max(at,c.start)', '(buffer.duration-c.offset-skip*rate)/rate,totalDuration()-Math.max(at,c.start)'],
 ['source.start(when,c.offset+skip,length)', 'source.start(when,c.offset+skip*rate,length*rate)'],
 ['const source=ac.createBufferSource(),gain=ac.createGain();source.buffer=buffer;gain.gain.value=c.volume;source.connect(gain).connect(ac.destination);const length=', 'const rate=c.rate||1,source=ac.createBufferSource(),gain=ac.createGain();source.buffer=buffer;source.playbackRate.value=rate;gain.gain.value=c.volume;source.connect(gain).connect(ac.destination);const length='],
 ['Math.min(c.duration,buffer.duration-c.offset,seconds-c.start)', 'Math.min(c.duration,(buffer.duration-c.offset)/rate,seconds-c.start)'],
 ['source.start(c.start,c.offset,length)', 'source.start(c.start,c.offset,length*rate)'],
 ['(at-c.start+c.offset)*buffer.sampleRate','((at-c.start)*(c.rate||1)+c.offset)*buffer.sampleRate'],
 ['const length=audioBuffers.get(c.id)?.duration??c.sourceDuration;if(mode', 'const rate=c.rate||1,length=audioBuffers.get(c.id)?.duration??c.sourceDuration;if(mode'],
 ['Math.max(-c.start,-c.offset)','Math.max(-c.start,-c.offset/rate)'],
 ['c.offset+=change;c.duration-=change','c.offset+=change*rate;c.duration-=change'],
 ['Math.min(.01,length-c.offset),Math.min(length-c.offset,totalDuration()-c.start)','Math.min(.01,(length-c.offset)/rate),Math.min((length-c.offset)/rate,totalDuration()-c.start)'],
 ['Math.min(c.duration,max-c.offset)','Math.min(c.duration,(max-c.offset)/(c.rate||1))'],
 ['Math.min(.01,c.sourceDuration-c.offset),Math.min(c.sourceDuration-c.offset,totalDuration()-c.start)','Math.min(.01,(c.sourceDuration-c.offset)/(c.rate||1)),Math.min((c.sourceDuration-c.offset)/(c.rate||1),totalDuration()-c.start)']
]);
edits('animation.js',[["const source=at-c.start+c.offset", "const source=(at-c.start)*(c.rate||1)+c.offset"]]);
