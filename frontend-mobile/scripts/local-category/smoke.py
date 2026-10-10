"""Actual CPU ONNX inference on repo image files. Smoke evidence, NOT calibration."""
import argparse
import hashlib
import json
import pathlib
import time
import numpy as np
import onnxruntime as ort
from PIL import Image, ImageOps

ROOT = pathlib.Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser()
parser.add_argument('images', nargs='+')
args = parser.parse_args()
model = ROOT / 'assets/models/clip-vision-int8.onnx'
vectors = json.loads((ROOT / 'assets/models/clip-text-vectors.json').read_text())
assert hashlib.sha256(model.read_bytes()).hexdigest() == vectors['visionSha256']
opts = ort.SessionOptions(); opts.intra_op_num_threads = 2; opts.inter_op_num_threads = 1
load_start = time.perf_counter()
session = ort.InferenceSession(str(model), opts, providers=['CPUExecutionProvider'])
print(json.dumps({'loadMs': round((time.perf_counter() - load_start) * 1000, 1), 'provider': 'desktop CPU, two threads'}))
for file in args.images:
    image = ImageOps.exif_transpose(Image.open(file)).convert('RGB')
    # Mobile center crop with aspect preserved. Android interpolation is bilinear;
    # iOS uses CGContext high interpolation. Validate differences on real devices.
    image = ImageOps.fit(image, (224, 224), method=Image.Resampling.BILINEAR)
    pixels = np.asarray(image, dtype=np.float32) / 255
    pixels = (pixels - np.array([.48145466, .4578275, .40821073], dtype=np.float32)) / np.array([.26862954, .26130258, .27577711], dtype=np.float32)
    pixels = np.ascontiguousarray(pixels.transpose(2, 0, 1)[None])
    start = time.perf_counter()
    embedding = session.run(['image_embeds'], {'pixel_values': pixels})[0][0]
    elapsed = (time.perf_counter() - start) * 1000
    embedding /= np.linalg.norm(embedding)
    categories = {}
    for prompt in vectors['prompts']:
        categories.setdefault(prompt['category'], []).append(float(np.dot(embedding, prompt['embedding'])))
    ranked = sorted([(key, sum(value) / len(value)) for key, value in categories.items()], key=lambda pair: -pair[1])
    print(json.dumps({'image': file, 'inferenceMs': round(elapsed, 1), 'cosineScores': {key:round(value,4) for key,value in ranked}}))
