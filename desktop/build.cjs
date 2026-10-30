const path=require('node:path'),fs=require('node:fs'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),tools=path.join(root,'desktop-runtime/build-tools');
function option(name,fallback){const index=process.argv.indexOf(name);if(index<0)return fallback;if(!process.argv[index+1]||process.argv[index+1].startsWith('--'))throw Error('Missing value for '+name);return process.argv[index+1]}
const output=path.resolve(root,option('--output','release')),appDir=path.resolve(root,option('--app-dir',path.join(output,'win-unpacked')));
const args=process.argv.includes('--dir')?['--win','dir','--x64']:process.argv.includes('--from-packaged')?['--prepackaged',appDir,'--win','nsis','--x64']:['--win','nsis','--x64'];
args.push('--config.directories.output='+output);
const system7zip=path.join(process.env.ProgramFiles||'C:\\Program Files','7-Zip','7z.exe');
const sevenZip=process.env.ELECTRON_BUILDER_7ZIP_PATH||(fs.existsSync(system7zip)?system7zip:path.join(root,'node_modules/electron-winstaller/vendor/7z-x64.exe'));
const child=spawn(process.execPath,[path.join(root,'node_modules/electron-builder/cli.js'),...args],{cwd:root,stdio:'inherit',windowsHide:true,env:{...process.env,CSC_IDENTITY_AUTO_DISCOVERY:'false',ELECTRON_BUILDER_7ZIP_PATH:sevenZip,ELECTRON_BUILDER_NSIS_DIR:path.join(tools,'nsis'),ELECTRON_BUILDER_NSIS_RESOURCES_DIR:path.join(tools,'nsis-resources'),ELECTRON_BUILDER_RCEDIT_PATH:path.join(tools,'rcedit')}});child.on('error',e=>{console.error(e);process.exitCode=1});child.on('exit',code=>process.exitCode=code||0);
