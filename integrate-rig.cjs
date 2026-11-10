const fs=require('node:fs');const p=__dirname+'/dist/app.js';let s=fs.readFileSync(p,'utf8');
const replace=(a,b)=>{if(!s.includes(a))throw Error('Missing rig target '+a.slice(0,50));s=s.replace(a,b)};
replace("rect(c,-12,-207,24,30,ch.skin,8);if(ch.hairStyle", "rect(c,-12,-207,24,30,ch.skin,8);c.save();c.translate((v.headTurn||0)*12,-207);c.rotate((v.headTilt||0)*Math.PI/180);c.scale(1-Math.abs(v.headTurn||0)*.15,1);c.translate(0,207);if(ch.hairStyle");
replace("circle(c,-17,-244,10,'#fff4dc');", "if(typeof drawRigEyes==='function')drawRigEyes(c,ch,v);else{circle(c,-17,-244,10,'#fff4dc');");
replace("circle(c,1,-230,4,'#9b552f');", "circle(c,1,-230,4,'#9b552f')};");
replace("if(expression==='surprised')circle", "if(typeof drawRigMouth==='function')drawRigMouth(c,ch,v,expression);else if(expression==='surprised')circle");
replace("if(ch.accessory==='tie')", "c.restore();if(ch.accessory==='tie')");
replace("line(c,7*side,39,12*side,43,ch.skin,7);c.restore()", "line(c,7*side,39,12*side,43,ch.skin,7);if(v.handOpen>.3)for(let i=0;i<4;i++)line(c,-8+i*5,49,-13+i*8,62+(i%2)*3,ch.skin,4);c.restore()");
fs.writeFileSync(p,s);let html=fs.readFileSync(__dirname+'/dist/index.html','utf8');html=html.replace('<script src="sounds.js"></script>','<script src="animation.js"></script><script src="sounds.js"></script>');fs.writeFileSync(__dirname+'/dist/index.html',html);
