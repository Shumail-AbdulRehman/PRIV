"""Assemble voice, original music, interface sounds, and timed captions.

Uses the system Python's NumPy, and the project's pinned FFmpeg binary.
Speech is never accelerated to fit. A voice segment that overruns its
scene raises an error so the edit can be adjusted explicitly.
"""
import json
import math
import subprocess
import wave
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parent
FFMPEG = ROOT / 'node_modules/ffmpeg-static/ffmpeg'
RATE = 48000
story = json.loads((ROOT / 'story.json').read_text())
samples = int(story['duration'] * RATE)
narration = np.zeros(samples, dtype=np.float64)
captions, report = [], []

def stamp(t):
    ms = round(t * 1000)
    return f'{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}'

for scene in story['scenes']:
    source = ROOT / 'assets' / f"voice-{scene['id']}.mp3"
    raw = subprocess.check_output([str(FFMPEG), '-v', 'error', '-i', str(source), '-af',
        'highpass=f=75,loudnorm=I=-18:TP=-2:LRA=7', '-ar', str(RATE), '-ac', '1', '-f', 'f32le', '-'])
    audio = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
    duration = len(audio) / RATE
    if scene['voiceStart'] + duration > scene['end'] - .1:
        raise RuntimeError(f"{scene['id']} needs {duration:.2f}s but only {scene['end']-scene['voiceStart']:.2f}s available. Do not speed up the voice.")
    offset = round(scene['voiceStart'] * RATE)
    narration[offset:offset + len(audio)] += audio
    words = json.loads(source.with_suffix('.json').read_text())['words']
    # Break captions at a natural length; reuse exact punctuation from the script.
    text_words = scene['narration'].split()
    group = []
    for i, word in enumerate(words):
        group.append((i, word))
        label = ' '.join(text_words[j] if j < len(text_words) else w['text'] for j, w in group)
        if len(label) >= 48 or i == len(words)-1 or (len(label) >= 28 and label.endswith(('.', ',', '?'))):
            first, last = group[0][1], group[-1][1]
            captions.append({'start': scene['voiceStart']+first['offset']/1e7,
                'end': min(scene['end']-.1, scene['voiceStart']+(last['offset']+last['duration'])/1e7+.12), 'text': label})
            group=[]
    report.append({'scene': scene['id'], 'start': scene['voiceStart'], 'voiceDuration': round(duration,3),
        'sceneEnd': scene['end'], 'words': len(text_words), 'speechRateWpm': round(len(text_words)/duration*60)})
    print(f"{scene['id']}: {duration:.2f}s; {len(text_words)/duration*60:.0f} words/min", flush=True)

# Original understated instrumental: suspended chords, rounded plucks,
# and a slow pulse. No borrowed recordings or stock music.
music = np.zeros(samples, dtype=np.float64)
t = np.arange(samples) / RATE
chords = [(146.832, 220, 293.665, 369.994), (130.813, 195.998, 261.626, 329.628),
          (164.814, 220, 329.628, 391.995), (146.832, 195.998, 293.665, 440)]
for bar in range(12):
    start=bar*8
    length=min(10,90-start)
    if length<=0: break
    tt=np.arange(round(length*RATE))/RATE
    env=np.minimum(tt/1.7,1)*np.minimum((length-tt)/2,1)
    for j,freq in enumerate(chords[bar%4]):
        pad=np.sin(2*math.pi*freq*tt+j*.7)+.17*np.sin(2*math.pi*freq*2.002*tt)
        i=round(start*RATE)
        music[i:i+len(tt)]+=.0035*pad*env
for beat in range(130):
    start=.4+beat*(60/88)
    if start>89: break
    tt=np.arange(round(.75*RATE))/RATE
    freq=chords[(int(start)//8)%4][beat%4]*2
    pluck=(np.sin(2*math.pi*freq*tt)+.22*np.sin(2*math.pi*freq*3*tt))*np.exp(-tt*9)
    i=round(start*RATE);n=min(len(tt),samples-i)
    music[i:i+n]+=.008*pluck[:n]
for start in [28.1,32.4,35.2,38.5,42.1,53.5,56.5]:
    tt=np.arange(round(.22*RATE))/RATE
    cue=np.sin(2*math.pi*(720*tt+900*tt**2))*np.exp(-tt*23)*.022
    i=round(start*RATE);music[i:i+len(tt)]+=cue
music*=np.minimum(t/2,1)*np.clip((90-t)/3,0,1)
combined=narration+music
peak=np.max(np.abs(combined))
if peak>.95: combined*=.95/peak

def wav(path,data,stereo=False):
    data=np.clip(data,-1,1)
    if stereo: data=np.column_stack((data,data))
    with wave.open(str(path),'wb') as f:
        f.setnchannels(2 if stereo else 1);f.setsampwidth(2);f.setframerate(RATE)
        f.writeframes((data*32767).astype('<i2').tobytes())

wav(ROOT/'assets/narration.wav',narration)
wav(ROOT/'assets/soundtrack.wav',combined,True)
(ROOT/'captions.json').write_text(json.dumps(captions,indent=2))
(ROOT/'output/captions.srt').write_text('\n\n'.join(f"{i+1}\n{stamp(c['start'])} --> {stamp(c['end'])}\n{c['text']}" for i,c in enumerate(captions))+'\n')
(ROOT/'output/audio-report.json').write_text(json.dumps({'duration':90,'voice':story['voice'],'provider':'Microsoft Edge neural TTS','rate':'-5%','music':'Original synthesized composition','segments':report},indent=2))
print('Wrote 90-second stereo soundtrack and timed captions.')
