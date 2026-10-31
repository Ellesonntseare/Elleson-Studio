'use strict';
// Explicit, resumable local setup. Large payloads stay outside Git and app.asar.
const fs=require('node:fs/promises'),path=require('node:path'),{spawn}=require('node:child_process'),fetchFile=require('./fetch-file.cjs');
const root=path.resolve(__dirname,'..'),runtime=path.join(root,'.dependencies/director-runtime'),home=path.join(process.env.LOCALAPPDATA,'Elleson Studio/AI');
function run(exe,args){return new Promise((resolve,reject)=>{const p=spawn(exe,args,{windowsHide:true,stdio:'inherit'});p.on('error',reject);p.on('exit',code=>code===0?resolve():reject(Error(path.basename(exe)+' failed: '+code)))})}
async function copyFirst(names,to){for(const file of names)try{await fs.copyFile(file,to);return}catch{}throw Error('Missing Microsoft runtime dependency: '+path.basename(to))}
(async()=>{
 const archive=path.join(root,'downloads/director/llama-b12020-win-cpu-x64.zip');
 await fetchFile('https://github.com/ggml-org/llama.cpp/releases/download/b12020/llama-b12020-bin-win-cpu-x64.zip',archive,'07e81782f5a16c7ffef42403183808e02f271c9ece3aa2d64040b2620ae8d519',{concurrency:8});
 await fs.mkdir(runtime,{recursive:true});
 const quote=value=>"'"+value.replaceAll("'","''")+"'";
 await run('powershell.exe',['-NoProfile','-Command','Expand-Archive -LiteralPath '+quote(archive)+' -DestinationPath '+quote(runtime)+' -Force']);
 const installed=path.join(process.env.LOCALAPPDATA,'Programs/Elleson Studio/resources/speech');
 for(const name of ['MSVCP140.dll','vcruntime140.dll','vcruntime140_1.dll'])await copyFirst([path.join(root,'speech/native',name),path.join(root,'speech/python',name),path.join(root,'desktop-runtime/speech/python',name),path.join(installed,'native',name),path.join(installed,'python',name)],path.join(runtime,name));
 try{await run(process.execPath,[path.join(__dirname,'download-director-model.cjs')])}catch(error){console.log('Checking and repairing saved model ranges before setup can continue.');await run(process.execPath,[path.join(__dirname,'repair-director-model.cjs')])}
 await fs.mkdir(home,{recursive:true});await fs.cp(runtime,path.join(home,'runtime'),{recursive:true});await fs.copyFile(path.join(root,'downloads/director/Qwen3-4B-Q4_K_M.gguf'),path.join(home,'Qwen3-4B-Q4_K_M.gguf'));
 const model=path.join(home,'Qwen3-4B-Q4_K_M.gguf'),stat=await fs.stat(model);await fs.writeFile(model+'.verified.json',JSON.stringify({sha256:'7485fe6f11af29433bc51cab58009521f205840f5b4ae3a32fa7f92e8534fdf5',bytes:stat.size,mtimeMs:stat.mtimeMs}));
 for(const [name,url]of [['LLAMA-LICENSE.txt','https://raw.githubusercontent.com/ggml-org/llama.cpp/b12020/LICENSE'],['QWEN-LICENSE.txt','https://huggingface.co/Qwen/Qwen3-4B-GGUF/raw/main/LICENSE']]){const response=await fetch(url);if(!response.ok)throw Error('Cannot read AI license: '+url);await fs.writeFile(path.join(home,name),await response.text())}
 await fs.writeFile(path.join(home,'SOURCES.json'),JSON.stringify({runtime:{project:'https://github.com/ggml-org/llama.cpp',release:'b12020',archiveSHA256:'07e81782f5a16c7ffef42403183808e02f271c9ece3aa2d64040b2620ae8d519',license:'MIT'},model:{project:'https://huggingface.co/Qwen/Qwen3-4B-GGUF',file:'Qwen3-4B-Q4_K_M.gguf',bytes:2497280256,sha256:'7485fe6f11af29433bc51cab58009521f205840f5b4ae3a32fa7f92e8534fdf5',license:'Apache-2.0'},installedAt:new Date().toISOString()},null,2));
 console.log('Local Director runtime and model installed in '+home);
})().catch(e=>{console.error(e);process.exitCode=1});
