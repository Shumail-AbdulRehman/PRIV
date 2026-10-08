"""Reproducibly download the pinned encoders and generate genuine CLIP text vectors.

Build tooling only; never runs on a staff phone. Dependencies in requirements.txt.
"""
import hashlib
import json
import pathlib
import tempfile
import urllib.request

import numpy as np
import onnxruntime as ort
from tokenizers import Tokenizer

ROOT = pathlib.Path(__file__).resolve().parents[2]
ASSETS = ROOT / 'assets/models'
REVISION = 'd15189d7028b43f1d3e65039190477f6af591c2a'
BASE = f'https://huggingface.co/Xenova/clip-vit-base-patch32/resolve/{REVISION}'
VISION_SHA = '583fd1110a514667812fee7d684952aaf82a99b959760c8d7dca7e0ab9839299'
TEXT_SHA = '73baab855d406190da9faa498cfedf65f15cf309f4cc7385b7b032e6d08e5c3a'
TOKENIZER_SHA = 'f7f3b7af117d467b58374797691a6438d3e6b9e9cef800dfd5dced7f697a90cd'
PREPROCESSOR_SHA = '6f638fb9401a6d6296feff533ee7efe657b787c49f954f82f5906b36ef2a1b1f'
PROMPTS = {
    'TOILET': ['a photo of a toilet bowl and seat', 'a photo of a bathroom toilet', 'a close up photo of a toilet fixture'],
    'SINK': ['a photo of a bathroom sink basin and faucet', 'a photo of a washbasin and tap', 'a close up photo of a sink fixture'],
    'MIRROR': ['a photo of a bathroom mirror', 'a photo of a wall mirror above a washbasin', 'a close up photo of a mirror surface'],
    'BIN': ['a photo of a rubbish bin', 'a photo of a bathroom trash can', 'a close up photo of a waste bin'],
    'FLOOR': ['a photo of a bathroom floor', 'a photo of floor tiles', 'a close up photo of a floor surface'],
    'OTHER': ['a photo of a room entrance and door', 'a photo of an empty bathroom room', 'a blurry dark photo with no visible fixture', 'a photo of a wall', 'a photo of a person'],
}


def download(relative, destination, sha=None):
    if destination.exists() and (not sha or hashlib.sha256(destination.read_bytes()).hexdigest() == sha):
        return
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = destination.with_suffix(destination.suffix + '.partial')
    urllib.request.urlretrieve(f'{BASE}/{relative}', temporary)
    if sha and hashlib.sha256(temporary.read_bytes()).hexdigest() != sha:
        raise RuntimeError(f'Hash mismatch: {relative}')
    temporary.replace(destination)


def main():
    download('onnx/vision_model_quantized.onnx', ASSETS / 'clip-vision-int8.onnx', VISION_SHA)
    cache = pathlib.Path(tempfile.gettempdir()) / 'hygeneops-local-category-source'
    download('onnx/text_model_quantized.onnx', cache / 'text.onnx', TEXT_SHA)
    download('tokenizer.json', cache / 'tokenizer.json', TOKENIZER_SHA)
    download('preprocessor_config.json', ASSETS / 'preprocessor_config.json', PREPROCESSOR_SHA)
    tokenizer = Tokenizer.from_file(str(cache / 'tokenizer.json'))
    tokenizer.enable_padding(pad_id=49407, pad_token='<|endoftext|>', length=77)
    tokenizer.enable_truncation(max_length=77)
    entries = [(category, prompt) for category, prompts in PROMPTS.items() for prompt in prompts]
    encoded = tokenizer.encode_batch([prompt for _, prompt in entries])
    options = ort.SessionOptions()
    options.intra_op_num_threads = 2
    session = ort.InferenceSession(str(cache / 'text.onnx'), options, providers=['CPUExecutionProvider'])
    available = {'input_ids': np.asarray([entry.ids for entry in encoded], dtype=np.int64),
                 'attention_mask': np.asarray([entry.attention_mask for entry in encoded], dtype=np.int64)}
    outputs = session.run(None, {input.name: available[input.name] for input in session.get_inputs()})
    names = [output.name for output in session.get_outputs()]
    embeddings = outputs[names.index('text_embeds')]
    embeddings = embeddings / np.linalg.norm(embeddings, axis=1, keepdims=True)
    payload = {'model': 'Xenova/clip-vit-base-patch32', 'revision': REVISION,
               'visionSha256': VISION_SHA, 'textSha256': TEXT_SHA,
               'dimension': 512, 'prompts': [
                   {'category': category, 'text': prompt, 'embedding': vector.tolist()}
                   for (category, prompt), vector in zip(entries, embeddings)]}
    (ASSETS / 'clip-text-vectors.json').write_text(json.dumps(payload, separators=(',', ':')) + '\n')
    print(json.dumps({'visionBytes': (ASSETS / 'clip-vision-int8.onnx').stat().st_size,
                      'prompts': len(entries), 'dimension': int(embeddings.shape[1]),
                      'vectorsSha256': hashlib.sha256((ASSETS / 'clip-text-vectors.json').read_bytes()).hexdigest()}))


if __name__ == '__main__':
    main()
