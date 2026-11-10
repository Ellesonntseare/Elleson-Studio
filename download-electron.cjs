// Download the official release with bounded parallel range requests and verify its hash.
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
(async()=>{
 const base='https://github.com/electron/electron/releases/download/v45.1.0/',name='electron-v45.1.0-win32-x64.zip';
 const head=await fetch(base+name,{method:'HEAD'}),size=Number(head.headers.get('content-length'));
 const target=path.join(__dirname,'electron-runtime.zip');let output;try{output=await fs.open(target,'r+')}catch{output=await fs.open(target,'w+')}await output.truncate(size);
 const chunk=128*1024,count=Math.ceil(size/chunk),pending=[];let cursor=0,done=0,last=-1;
 for(let i=0;i<count;i++){const bytes=Buffer.alloc(Math.min(chunk,size-i*chunk));await output.read(bytes,0,bytes.length,i*chunk);if(bytes.some(b=>b!==0))done+=bytes.length;else pending.push(i)}
 console.log('Resuming verified-range download at '+Math.round(done/size*100)+'%; '+pending.length+' ranges remaining');
 await Promise.all(Array.from({length:16},async()=>{while(cursor<pending.length){const i=pending[cursor++],start=i*chunk,end=Math.min(size-1,start+chunk-1);let data;for(let attempt=0;;attempt++){try{const r=await fetch(head.url,{headers:{Range:`bytes=${start}-${end}`},signal:AbortSignal.timeout(120000)});if(r.status!==206)throw Error('Range download unavailable: '+r.status);data=Buffer.from(await r.arrayBuffer());if(data.length!==end-start+1)throw Error('Invalid download size');break}catch(e){if(attempt>=15)throw e}}await output.write(data,0,data.length,start);done+=data.length;const percent=Math.round(done/size*100);if(percent!==last){last=percent;console.log('Electron download '+percent+'%')}}}));
 await output.close();const sums=await(await fetch(base+'SHASUMS256.txt')).text();const expected=sums.split('\n').find(l=>l.trim().endsWith('*'+name)).split(' ')[0];const actual=crypto.createHash('sha256').update(await fs.readFile(target)).digest('hex');if(actual!==expected)throw Error('Electron checksum mismatch');console.log('Verified Electron runtime SHA256 '+actual);
})().catch(e=>{console.error(e);process.exitCode=1});
