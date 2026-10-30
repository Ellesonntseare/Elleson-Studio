'use strict';
const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('studioDesktop',Object.freeze({
 saveFile:(bytes,name)=>ipcRenderer.invoke('studio:save',{bytes:new Uint8Array(bytes),name}),
 exportMp4:bytes=>ipcRenderer.invoke('studio:mp4',new Uint8Array(bytes)),
 chooseExportFolder:()=>ipcRenderer.invoke('studio:queue-folder'),
 saveQueuedExport:(bytes,options)=>ipcRenderer.invoke('studio:queue-save',new Uint8Array(bytes),options),
 beginFrameExport:options=>ipcRenderer.invoke('studio:frames-start',options),
 writeExportFrame:(id,index,bytes)=>ipcRenderer.invoke('studio:frames-write',id,index,new Uint8Array(bytes)),
 finishFrameExport:(id,audio)=>ipcRenderer.invoke('studio:frames-finish',id,audio?new Uint8Array(audio):null),
 cancelFrameExport:id=>ipcRenderer.invoke('studio:frames-cancel',id),
 platform:'windows'
}));
