const {clickTool}=require('./ui-tools.cjs');
const {chromium}=require('playwright');
const assert=require('node:assert/strict');

(async()=>{
 const browser=await chromium.launch();
 const page=await browser.newPage({viewport:{width:1520,height:960}});
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:4317');
  await page.waitForTimeout(400);
  for(const fade of ['fadeIn','fadeOut']){
   await page.evaluate(fade=>{
    const s=scene('Fade duration safety');
    loadProject({version:1,title:'Fade duration safety',cast:[{id:uid(),...baseChar}],scenes:[s]});
    const o=newObject('coin');o[fade]=4;save();render();
   },fade);
   await page.locator('#duration').fill('2');
   await page.locator('#duration').dispatchEvent('change');
   assert.equal(await page.locator('#duration').inputValue(),'6','unsafe shortening is rejected');
   assert.equal(await page.evaluate(()=>valid(project)),true,'project remains valid after rejected edit');
   await page.waitForTimeout(700);
   await page.reload();
   await page.waitForFunction(()=>project.title==='Fade duration safety');
   assert.equal(await page.evaluate(fade=>current().objects[0][fade],fade),4,'fade survives autosave/reload');
   await page.evaluate(fade=>{selected=current().objects[0].id;object()[fade]=1;save();render()},fade);
   await clickTool(page,'openStoryboard');
   const length=page.locator('.storyboard-card input[type="number"]');
   await length.fill('2');await length.dispatchEvent('change');
   assert.equal(await page.evaluate(()=>current().duration),2,'shortening succeeds after fade is adjusted');
   assert.equal(await page.evaluate(()=>valid(project)),true);
   await page.locator('#closeStoryboard').click();
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: scene shortening protects both visual fade directions, persists after reload, and succeeds after adjusting fades.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
