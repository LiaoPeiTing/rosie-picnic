const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const uri=new URL(req.url,'http://localhost').pathname;
 const relative=decodeURIComponent(uri==='/'?'index.html':uri.slice(1));
 const file=path.resolve(root,relative);
 if(!file.startsWith(root+path.sep)||relative.startsWith('.')||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.css':'text/css','.wav':'audio/wav'})[path.extname(file)]||'text/plain; charset=utf-8');res.end(fs.readFileSync(file));
});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'msedge',headless:true});const report=[];
for(const mobile of [false,true]){
 const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.url()+':'+r.status());});
 await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('[data-role]').first().waitFor();let played=0;
 for(const role of ['rosie','ghost','princess','pirate','mermaid','vampire_ring']){
  await page.locator('[data-role="'+role+'"]').click();const audios=page.locator('audio');if(await audios.count()!==6)errors.push(role+' missing comparison clips');
  for(let i=0;i<6;i++){const result=await audios.nth(i).evaluate(async a=>{await a.play();const deadline=performance.now()+2500;while(a.currentTime===0&&performance.now()<deadline)await new Promise(r=>setTimeout(r,30));const result={duration:a.duration,time:a.currentTime,ready:a.readyState};a.pause();return result;});if(!(result.duration>.2&&result.time>0))errors.push(role+' bad audio '+i);played++;}
  await audios.nth(0).evaluate(a=>a.play());await audios.nth(1).evaluate(a=>a.play());if(await page.locator('audio').evaluateAll(as=>as.filter(a=>!a.paused).length)!==1)errors.push('Overlapping audio');
  await page.locator('#voice-choice').selectOption({index:1});await page.locator('#confirm').click();
 }
 await page.locator('[data-role="rosie"]').click();if(await page.locator('audio').evaluateAll(as=>as.some(a=>!a.paused)))errors.push('Role switch left audio running');
 const download=page.waitForEvent('download');await page.locator('#export').click();const d=await download;const selections=JSON.parse(fs.readFileSync(await d.path(),'utf8'));if(Object.keys(selections.roles).length!==6||selections.productionApproved!==false)errors.push('Bad selection export');
 await page.reload();await page.locator('#voice-choice').waitFor();if(await page.locator('#voice-choice').inputValue()!=='af_heart')errors.push('Selection not persisted');
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))errors.push('Horizontal overflow');
 await page.screenshot({path:path.join(root,'..','audition-'+(mobile?'mobile':'desktop')+'.png'),fullPage:true});report.push({mobile,played,roles:6,errors,exportedSelections:6,persisted:true,manualListening:'pending'});await page.close();
}
 await browser.close();server.close();fs.writeFileSync(path.join(root,'browser-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));process.exit(report.some(r=>r.errors.length)?1:0);
})().catch(e=>{console.error(e);server.close();process.exit(1)});
