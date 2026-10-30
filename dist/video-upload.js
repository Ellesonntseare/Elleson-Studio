'use strict';
const uploadButton=document.createElement('button');uploadButton.id='uploadVideo';uploadButton.textContent='Upload video';uploadButton.title='Upload MP4, WebM or supported video footage';uploadButton.onclick=()=>{if(recording)return;tab('media');$('videoFile').click()};$('addText').before(uploadButton);
const videoDropArea=document.querySelector('.paperstage');
videoDropArea.addEventListener('dragover',e=>{if(recording||!Array.from(e.dataTransfer?.types||[]).includes('Files'))return;e.preventDefault();e.dataTransfer.dropEffect='copy';videoDropArea.classList.add('video-drop-active')});
videoDropArea.addEventListener('dragleave',e=>{if(!videoDropArea.contains(e.relatedTarget))videoDropArea.classList.remove('video-drop-active')});
videoDropArea.addEventListener('drop',e=>{videoDropArea.classList.remove('video-drop-active');if(!e.dataTransfer?.files.length)return;e.preventDefault();if(recording)return;const files=Array.from(e.dataTransfer.files).filter(f=>f.type.startsWith('video/')||/\.(mp4|webm|mov|m4v|ogv)$/i.test(f.name));if(!files.length)return toast('Drop a video file, or use Upload video to choose one.');tab('media');importVideoFiles(files)});
