'use strict';
if(window.studioDesktop){
 document.title='Elleson Studio · Desktop';
 $('videoFormat').querySelector('[value="mp4"]').textContent='MP4 · H.264 / AAC';$('videoFormat').value='mp4';
 const browserDownload=download;
 download=async function(blob,name){try{const result=await window.studioDesktop.saveFile(await blob.arrayBuffer(),name);if(!result.canceled)toast('Saved: '+result.path);return result}catch(e){toast('Could not save: '+e.message);throw e}};
 $('download').textContent='Save project';
 document.querySelector('.library-bottom p').textContent='Your workspace autosaves locally, including imported audio. Save a project file for a portable backup.';
 document.querySelector('#projectDialog p').textContent='Saved on this device. Project backups include images and audio.';
 const onOpen=$('open').onchange;$('open').onchange=async e=>{await onOpen(e);toast('Project opened. Saved media restores automatically.')};
}
