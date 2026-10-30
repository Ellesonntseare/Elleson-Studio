const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');

(async()=>{
 const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:1520,height:960}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 const near=(actual,expected,label)=>assert(Math.abs(actual-expected)<.001,`${label}: ${actual} != ${expected}`);
 const field=(name,value)=>page.locator('[data-field="'+name+'"]').evaluate((input,value)=>{input.value=String(value);input.dispatchEvent(new Event('input',{bubbles:true}))},value);
 const route=()=>page.evaluate(()=>structuredClone(object().motionPath));
 const pose=()=>page.evaluate(()=>stateAt(object(),time));
 try{
  await page.addInitScript(()=>localStorage.setItem('elleson-inspector-expanded','true'));await page.goto('http://127.0.0.1:4317');await page.waitForTimeout(400);
  await page.evaluate(()=>{const o=newObject('coin');o.motionPath={enabled:true,points:[{x:200,y:200},{x:600,y:400}],start:0,end:6,curve:'linear',easing:'linear',orient:true};time=3;save();render()});
  await field('x',600);near((await pose()).x,600,'X can equal the raw key coordinate');
  await field('y',290);near((await pose()).y,290,'Y can equal the raw key coordinate');
  await field('x',620);await field('x',640);near((await pose()).x,640,'successive slider changes stay in displayed coordinates');
  await field('rotation',30);near((await pose()).rotation,30,'oriented path rotation is applied once');
  await page.evaluate(()=>renderControls());near(Number(await page.locator('[data-field="rotation"]').inputValue()),30,'inspector displays the resulting rotation');
  const untouched=await route();await field('scale',1.5);await field('opacity',.5);
  assert.deepEqual(await route(),untouched,'size and opacity do not move the route');near((await pose()).rotation,30,'unrelated fields preserve orientation');
  const keyCount=await page.evaluate(()=>object().keys.length);
  await page.evaluate(()=>{time=4;render()});const beforeAdd=await pose();await page.locator('#addKey').click();
  assert.equal(await page.evaluate(()=>object().keys.length),keyCount+1);assert.deepEqual(await route(),untouched,'Add key does not translate the route');near((await pose()).rotation,beforeAdd.rotation,'Add key does not bake path direction');
  await page.locator('#undo').click();await page.evaluate(()=>{selectLayers([current().objects[0].id]);time=3;render()});
  assert.equal(await page.evaluate(()=>object().keys.length),keyCount);assert.deepEqual(await route(),untouched,'Undo restores keys without changing the route');

  await page.evaluate(()=>{object().motionPath.enabled=false;save();render()});const disabled=await route();
  await field('x',350);await field('y',260);await field('rotation',15);
  assert.deepEqual(await route(),disabled,'disabled route stays unchanged');near((await pose()).x,350,'disabled route uses key position');near((await pose()).rotation,15,'disabled route does not subtract a heading');
  await page.evaluate(()=>{object().motionPath.enabled=true;object().motionPath.start=4;time=2;save();render()});const future=await route();
  await field('x',420);await field('rotation',20);assert.deepEqual(await route(),future,'editing before the route starts leaves it unchanged');near((await pose()).x,420,'pre-route key position');near((await pose()).rotation,20,'pre-route rotation');
  await page.evaluate(()=>{object().locked=true;save();render()});const locked=await page.evaluate(()=>JSON.stringify(object()));
  assert(await page.locator('[data-field="x"]').isDisabled());await field('x',500);
  assert.equal(await page.evaluate(()=>JSON.stringify(object())),locked,'locked layer rejects even dispatched edit events');

  await page.evaluate(()=>{current().objects=[];const o=newObject('character',{character:structuredClone(project.cast[0]),expression:'happy'});o.autoBlink=false;o.motionPath={enabled:true,points:[{x:200,y:440},{x:600,y:340}],start:0,end:6,curve:'linear',easing:'linear',orient:true};time=3;save();render()});
  const characterRoute=await route(),characterPose=await pose();await field('headTilt',12);await field('leftArm',45);
  assert.deepEqual(await route(),characterRoute,'joint edits preserve the route');near((await pose()).rotation,characterPose.rotation,'joint edits preserve path direction');
  await page.locator('[data-pose="Wave"]').evaluate(button=>button.click());assert.deepEqual(await route(),characterRoute,'pose presets preserve the route');near((await pose()).rotation,characterPose.rotation,'pose presets do not bake path direction');

  await page.locator('#videoFile').setInputFiles(path.join(__dirname,'../test-output/fixture-video.webm'));
  await page.waitForFunction(()=>!videoImportBusy&&object()?.type==='video');
  await page.evaluate(()=>{const o=object();o.motionPath={enabled:true,points:[{x:200,y:200},{x:600,y:400}],start:3,end:6,curve:'linear',easing:'linear',orient:true};o.crop={x:0,y:0,w:.5,h:1};time=4;save();render()});
  const videoRotation=(await pose()).rotation;await page.locator('#fitVideo').click();const fit=await pose();
  near(fit.x,480,'Fit centers path video X');near(fit.y,270,'Fit centers path video Y');near(fit.rotation,videoRotation,'Fit preserves path direction');near(fit.scale,await page.evaluate(()=>Math.min(960/(object().width*.5),540/object().height)),'Fit respects crop');
  await page.locator('#fillVideo').click();const fill=await pose();near(fill.x,480,'Fill centers video');near(fill.rotation,videoRotation,'Fill preserves path direction');near(fill.scale,await page.evaluate(()=>Math.max(960/(object().width*.5),540/object().height)),'Fill respects crop');
  assert.equal(await page.evaluate(()=>valid(project)),true);assert.deepEqual(errors,[]);
  console.log('PASS: path inspector positions/rotation, raw Add key and undo, unrelated/rig edits, presets, disabled/future paths, locking, and cropped video fit/fill.');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
