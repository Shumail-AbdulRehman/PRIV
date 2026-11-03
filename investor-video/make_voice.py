"""Generate deliberately paced, sentence-aligned English narration.

Run with: python -m pip install -r requirements-voice.txt
          python make_voice.py
          python3 make_audio.py
No application secrets or customer data are used.
"""
import asyncio
import json
from pathlib import Path
import edge_tts

ROOT = Path(__file__).resolve().parent

async def main():
    story = json.loads((ROOT / 'story.json').read_text())
    for scene in story['scenes']:
        target = ROOT / 'assets' / f"voice-{scene['id']}.mp3"
        metadata = target.with_suffix('.json')
        if target.exists() and metadata.exists() and json.loads(metadata.read_text()).get('text') == scene['narration']:
            print(f"Reusing {scene['id']}", flush=True)
            continue
        # Keep the requested product demonstration wording verbatim.
        voice = edge_tts.Communicate(scene['narration'], story['voice'], rate='-5%', boundary='WordBoundary')
        words = []
        with target.open('wb') as audio:
            async for chunk in voice.stream():
                if chunk['type'] == 'audio':
                    audio.write(chunk['data'])
                elif chunk['type'] == 'WordBoundary':
                    words.append({key: chunk[key] for key in ('offset', 'duration', 'text')})
        metadata.write_text(json.dumps({'text': scene['narration'], 'voice': story['voice'], 'rate': '-5%', 'words': words}, indent=2))
        print(f"Generated {scene['id']}: {len(words)} words", flush=True)

asyncio.run(main())
