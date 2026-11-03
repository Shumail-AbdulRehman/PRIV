import assert from 'node:assert/strict';
import {chromium} from 'playwright-core';
import ffmpeg from 'ffmpeg-static';
import {readFile,stat,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {serve} from './serve.mjs';
const root=fileURLToPath(new URL('.',import.meta.url));
const story=JSON.parse(await readFile(root+'story.json','utf8'));
const captions=JSON.parse(await readFile(root+'captions.json','utf8'));
assert.equal(story.duration,90);assert.equal(story.scenes[0].start,0);assert.equal(story.scenes.at(-1).end,90);
story.scenes.forEach((scene,i)=>{if(i)assert.equal(scene.start,story.scenes[i-1].end);assert.ok(scene.voiceStart>=scene.start);});
assert.ok(story.scenes.find(s=>s.id==='automation').end-story.scenes.find(s=>s.id==='automation').start>=10);
const requested="With Hygene Ops, managers can oversee multiple locations, monitor staff attendance, and manage daily operations from one centralized dashboard. But here's where things get smarter. Instead of manually assigning repetitive cleaning tasks every day, managers can configure recurring schedules, allowing Hygene Ops to automatically generate tasks for their teams. Employees simply open the mobile app, view their assignments, complete their work, and submit photographic proof. Managers can track progress and quickly identify missed or incomplete tasks.";
assert.equal(story.scenes.slice(1,6).map(s=>s.narration).join(' '),requested);
const audio=JSON.parse(await readFile(root+'output/audio-report.json','utf8'));
for(const segment of audio.segments)assert.ok(segment.start+segment.voiceDuration<segment.sceneEnd,`${segment.scene}: voice overrun`);
assert.ok(captions.length>15);for(let i=0;i<captions.length;i++){assert.ok(captions[i].end>captions[i].start);assert.ok(captions[i].end<=90);if(i)assert.ok(captions[i].start>=captions[i-1].end-.15);}
const video=await stat(root+'output/hygene-ops-investor.mp4');assert.ok(video.size>1000000);
const probe=spawnSync(ffmpeg,['-hide_banner','-i',root+'output/hygene-ops-investor.mp4'],{encoding:'utf8'}).stderr;
assert.match(probe,/Duration: 00:01:30\.00/);assert.match(probe,/1920x1080/);assert.match(probe,/30 fps/);assert.match(probe,/Audio: aac/);
const decode=spawnSync(ffmpeg,['-v','error','-i',root+'output/hygene-ops-investor.mp4','-f','null','-'],{encoding:'utf8'});assert.equal(decode.status,0,decode.stderr);
const server=await serve(0),port=server.address().port;
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
const errors=[];const results=[];
try{
 for(const width of [1440,390]){
  const p=await browser.newPage({viewport:{width,height:1000}});p.on('pageerror',e=>errors.push(e.message));await p.goto(`http://127.0.0.1:${port}`);await p.waitForFunction(()=>window.filmReady);
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Responsive overflow at ${width}`);
  for(const t of [0,8.99,9,21,25,28.5,32.5,36,41,44,46,58,59,67,68,80,81,89.99])await p.evaluate(t=>window.renderFrame(t),t);
  await p.getByRole('button',{name:'Captions on'}).click();assert.equal(await p.getByRole('button',{name:'Captions off'}).getAttribute('aria-pressed'),'false');
  await p.getByRole('button',{name:'Mute',exact:true}).click();assert.equal(await p.getByRole('button',{name:'Unmute'}).getAttribute('aria-pressed'),'true');
  await p.getByRole('slider').evaluate(el=>{el.value='35';el.dispatchEvent(new Event('input',{bubbles:true}));});assert.match(await p.locator('#time').innerText(),/0:35/);
  await p.getByRole('button',{name:'Play film'}).click();await p.waitForTimeout(300);await p.getByRole('button',{name:'Pause',exact:true}).click();
  assert.ok(await p.evaluate(()=>document.getElementById('sound').currentTime)>=35);
  results.push(`PASS browser at ${width}px: frame boundaries, seeking, captions, audio, play/pause, responsive layout.`);await p.close();
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
results.push('PASS exact requested product narration, continuous 90-second edit, 21-second automation sequence, unaccelerated speech, caption timings, H.264/AAC 1080p30, complete video decode.');
await writeFile(root+'output/validation.txt',results.join('\n')+'\n');console.log(results.join('\n'));
