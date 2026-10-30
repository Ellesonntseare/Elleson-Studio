'use strict';
// Cache short RMS windows once per decoded buffer for beat and speech analysis.
const audioLevelCache=new WeakMap();
function audioLevels(buffer){
 let cached=audioLevelCache.get(buffer);if(cached)return cached;
 const step=.02,hop=Math.max(1,Math.round(buffer.sampleRate*step)),size=Math.ceil(buffer.length/hop),levels=new Float32Array(size);
 for(let channel=0;channel<buffer.numberOfChannels;channel++){
  const data=buffer.getChannelData(channel);
  for(let i=0;i<size;i++){let sum=0,n=0;for(let j=i*hop;j<Math.min(data.length,(i+1)*hop);j+=4){sum+=data[j]*data[j];n++}levels[i]=Math.max(levels[i],Math.sqrt(sum/Math.max(1,n)))}
 }
 cached={step:hop/buffer.sampleRate,levels};audioLevelCache.set(buffer,cached);return cached;
}
function detectedBeats(buffer,sensitivity=1.55,minSpacing=.22){
 const {levels,step}=audioLevels(buffer),flux=Array.from(levels,(v,i)=>Math.max(0,v-(levels[i-1]||0))),peak=Math.max(0,...levels.subarray(0,Math.min(levels.length,100000)));
 const beats=[];let last=-Infinity;
 for(let i=0;i<levels.length;i++){
  let sum=0,count=0;for(let j=Math.max(0,i-12);j<=Math.min(flux.length-1,i+12);j++){if(Math.abs(j-i)>1){sum+=flux[j];count++}}
  const value=flux[i],at=i*step;
  if(value>Math.max(.008,peak*.045,sum/Math.max(1,count)*sensitivity)&&value>=(flux[i-1]||0)&&value>(flux[i+1]||0)&&at-last>=minSpacing){beats.push(at);last=at;if(beats.length>=5000)break}
 }
 return beats;
}
