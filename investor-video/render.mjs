import {chromium} from 'playwright-core';
import ffmpeg from 'ffmpeg-static';
import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {once} from 'node:events';
import {fileURLToPath} from 'node:url';
import {serve} from './serve.mjs';

const root=fileURLToPath(new URL('.',import.meta.url));
const story=JSON.parse(await readFile(new URL('story.json',import.meta.url),'utf8'));
const stills=process.argv.includes('--stills');
const server=await serve(0),port=server.address().port;
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
await mkdir(root+'output/previews',{recursive:true});
const errors=[];
async function page(){const p=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});p.on('pageerror',e=>errors.push(e.message));await p.goto(`http://127.0.0.1:${port}/?render`);await p.waitForFunction(()=>window.filmReady);return p;}
const previewTimes=[4.8,17.5,23.7,27.8,31.7,36.8,40.9,44.1,56.8,64.5,75.3,86.5];
try{
  const p=await page();
  for(const time of previewTimes){await p.evaluate(t=>window.renderFrame(t),time);await p.screenshot({path:root+`output/previews/${String(time).replace('.','-')}.png`});}
  await p.close();
  if(stills){if(errors.length)throw new Error(errors.join('\n'));console.log('Rendered 12 preview frames.');}
  else{
    const start=Date.now();
    let next=0;
    async function worker(){
      const p=await page();
      while(next<story.scenes.length){
        const index=next++,scene=story.scenes[index],frames=Math.round((scene.end-scene.start)*story.fps);
        const encoder=spawn(ffmpeg,['-hide_banner','-loglevel','error','-y','-f','image2pipe','-framerate',String(story.fps),'-vcodec','png','-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-threads','2',root+`output/scene-${index}.mp4`],{stdio:['pipe','ignore','pipe']});
        let stderr='';encoder.stderr.on('data',b=>stderr+=b);const finished=once(encoder,'close');encoder.stdin.on('error',()=>{});
        for(let i=0;i<frames;i++){
          const data=await p.evaluate(t=>{window.renderFrame(t);return document.getElementById('film').toDataURL('image/png').split(',')[1];},scene.start+i/story.fps);
          if(!encoder.stdin.write(Buffer.from(data,'base64')))await once(encoder.stdin,'drain');
          if(i%150===0)console.log(`${scene.id}: ${i}/${frames} frames · ${Math.round((Date.now()-start)/1000)}s elapsed`);
        }
        encoder.stdin.end();const [code]=await finished;if(code!==0)throw new Error(`${scene.id}: ${stderr}`);
        console.log(`Finished ${scene.id}`);
      }
      await p.close();
    }
    await Promise.all([worker(),worker()]);
    if(errors.length)throw new Error(errors.join('\n'));
    await writeFile(root+'output/concat.txt',story.scenes.map((_,i)=>`file 'scene-${i}.mp4'`).join('\n'));
    await new Promise((resolve,reject)=>{const proc=spawn(ffmpeg,['-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',root+'output/concat.txt','-i',root+'assets/soundtrack.wav','-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-t','90','-movflags','+faststart','-metadata','title=Hygene Ops — Cleaning operations, connected','-metadata','comment=Illustrative product demo. AI verification is planned.',root+'output/hygene-ops-investor.mp4'],{stdio:['ignore','ignore','pipe']});let stderr='';proc.stderr.on('data',b=>stderr+=b);proc.on('close',code=>code===0?resolve():reject(new Error(stderr)));});
    console.log(`Rendered 90 seconds at 1920×1080 / 30fps in ${Math.round((Date.now()-start)/1000)}s.`);
  }
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
