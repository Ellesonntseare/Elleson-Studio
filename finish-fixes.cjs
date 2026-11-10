const fs=require('node:fs');
const dir=__dirname+'/dist/';
let s=fs.readFileSync(dir+'studio.js','utf8').replace('e.disabled=!!o?.locked)drawWaveform()', 'e.disabled=!!o?.locked);drawWaveform()');
// Labels are rebuilt each time, including inspector-only refreshes.
s=s.replace("b.textContent=(item.locked?'🔒 ':item.hidden?'◌ ':'')+b.textContent+(item.group?' · '+item.group:'')", "b.textContent=(item.locked?'🔒 ':item.hidden?'◌ ':'')+(item.type==='character'?'◉ ':item.type==='text'?'T ':'◇ ')+item.name+(item.group?' · '+item.group:'')");
fs.writeFileSync(dir+'studio.js',s);
s=fs.readFileSync(dir+'app.js','utf8').replace('function valid(p){','function validCore(p){');
s+=`
// Validate imported and autosaved extension fields before rendering or decoding assets.
function valid(p){
 try {
  const color=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v);
  const image=v=>typeof v==='string'&&v.length<18000000&&/^data:image\\/(png|jpeg|webp|gif);base64,/i.test(v);
  const char=c=>c&&typeof c.name==='string'&&['skin','hair','shirt','pants'].every(k=>color(c[k]))&&['bodyWidth','height'].every(k=>c[k]===undefined||(Number.isFinite(Number(c[k]))&&Number(c[k])>=.5&&Number(c[k])<=2));
  if(!validCore(p)||typeof p.title!=='string'||p.title.length>500||!p.cast.every(char))return false;
  const ids=new Set();
  return p.scenes.every(s=>{
   if(ids.has(s.id))return false;ids.add(s.id);
   if(s.backgroundImage!==undefined&&!image(s.backgroundImage))return false;
   if(s.backgroundFit!==undefined&&!['cover','contain'].includes(s.backgroundFit))return false;
   if(s.camera&&!['start','end'].every(k=>{const c=s.camera[k];return c&&Number.isFinite(c.zoom)&&c.zoom>=1&&c.zoom<=3&&Number.isFinite(c.x)&&c.x>=0&&c.x<=960&&Number.isFinite(c.y)&&c.y>=0&&c.y<=540}))return false;
   if(s.captions!==undefined&&(!Array.isArray(s.captions)||s.captions.length>10000||!s.captions.every(c=>c&&Number.isFinite(c.start)&&Number.isFinite(c.end)&&c.start>=0&&c.end>c.start&&c.end<=s.duration&&typeof c.text==='string'&&c.text.length<=10000)))return false;
   const layers=new Set();return s.objects.every(o=>{
    if(layers.has(o.id))return false;layers.add(o.id);
    return typeof o.name==='string'&&(!o.group||typeof o.group==='string')&&['locked','hidden','lipSync'].every(k=>o[k]===undefined||typeof o[k]==='boolean')&&(o.type!=='character'||char(o.character))&&(o.type!=='image'||image(o.src))&&(o.type!=='text'||typeof o.text==='string')&&o.keys.every(k=>k.t>=0&&k.t<=s.duration&&k.v.scale>0&&k.v.scale<=20&&k.v.opacity>=0&&k.v.opacity<=1);
   });
  });
 }catch{return false}
}
`;
fs.writeFileSync(dir+'app.js',s);
