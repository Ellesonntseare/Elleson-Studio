const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),target=path.join(root,'desktop-runtime'),speech=path.join(target,'speech');
async function copy(from,to){await fs.cp(from,to,{recursive:true,filter:src=>!src.split(path.sep).some(part=>part==='__pycache__'||part.endsWith('.parts'))&&!src.endsWith('.pyc')&&!src.endsWith('.download')})}
(async()=>{
 await fs.mkdir(speech,{recursive:true});
 const zip=path.join(target,'python-3.12.10-embed-amd64.zip'),url='https://www.python.org/ftp/python/3.12.10/python-3.12.10-embed-amd64.zip';
 try{await fs.access(zip)}catch{await require('../speech/fetch-file.cjs')(url,zip)}
 const digest=crypto.createHash('md5').update(await fs.readFile(zip)).digest('hex');if(digest!=='fe8ef205f2e9c3ba44d0cf9954e1abd3')throw Error('Python archive does not match the official release checksum.');
 const python=path.join(speech,'python');await fs.mkdir(python,{recursive:true});execFileSync('powershell.exe',['-NoProfile','-Command',`Expand-Archive -LiteralPath '${zip.replaceAll("'","''")}' -DestinationPath '${python.replaceAll("'","''")}' -Force`],{windowsHide:true});
 await fs.writeFile(path.join(python,'python312._pth'),'python312.zip\n.\n../python-packages\nimport site\n');
 for(const dir of ['python-packages','kokoro-packages','native','models','rhubarb']){console.log('Bundling speech '+dir);await copy(path.join(root,'speech',dir),path.join(speech,dir))}
 await copy(path.join(root,'speech/transcribe.py'),path.join(speech,'transcribe.py'));await copy(path.join(root,'speech/tts.py'),path.join(speech,'tts.py'));await copy(path.join(root,'speech/tts-notices'),path.join(speech,'tts-notices'));await copy(path.join(root,'speech/README.md'),path.join(speech,'README.md'));
 const config=JSON.parse(await fs.readFile(path.join(root,'speech/config.json'),'utf8')),numpyRoot=execFileSync(config.python,['-c','import numpy,pathlib; print(pathlib.Path(numpy.__file__).parent.parent)'],{encoding:'utf8',windowsHide:true}).trim();
 for(const name of await fs.readdir(numpyRoot))if(name==='numpy'||name==='numpy.libs'||/^numpy-.*\.dist-info$/.test(name))await copy(path.join(numpyRoot,name),path.join(speech,'python-packages',name));
 await fs.writeFile(path.join(speech,'config.json'),JSON.stringify({python:'python/python.exe',...(config.tts?{tts:config.tts}:{}),...(config.kokoro?{kokoro:config.kokoro}:{})},null,2));
 await fs.writeFile(path.join(speech,'PYTHON-SOURCE.md'),'Python 3.12.10 Windows embeddable runtime\nSource: '+url+'\nOfficial release: https://www.python.org/downloads/release/python-31210/\nMD5: '+digest+'\nThe Python license is in python/LICENSE.txt. Third-party package notices remain in python-packages.\n');
 console.log('Portable speech runtime prepared at '+speech);
})().catch(e=>{console.error(e);process.exitCode=1});
