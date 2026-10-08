import { bundledCategoryModelPath, prepareCategoryTensor } from '../../modules/capture-quality';
import vectors from '../../assets/models/clip-text-vectors.json';
import { classifyCategoryScores, FIXTURE_CATEGORIES, scoreCategoryEmbedding, uncertainCategory } from './localCategoryPolicy';
import type { FixtureCategory, LocalCategoryResult } from './localCategoryPolicy';
import type { InferenceSession } from 'onnxruntime-react-native';
export type { LocalCategoryResult } from './localCategoryPolicy';
const MAX_CHECK_MS = 25_000;
let session: Promise<InferenceSession> | null = null;
let active: Promise<LocalCategoryResult> | null = null;

async function infer(uri: string, expected: string, started: number): Promise<LocalCategoryResult> {
  try {
    // No network API, upload, asset download or remote AI is used here.
    const ort = await import('onnxruntime-react-native');
    if (!session) {
      session = bundledCategoryModelPath().then(path => ort.InferenceSession.create(path, {
        executionProviders: ['cpu'], intraOpNumThreads: 2, interOpNumThreads: 1,
        graphOptimizationLevel: 'all', executionMode: 'sequential',
      }));
      session.catch(() => { session = null; });
    }
    const engine = await session;
    const pixels = await prepareCategoryTensor(uri);
    const tensor = new ort.Tensor('float32', pixels, [1, 3, 224, 224]);
    try {
      const results = await engine.run({ pixel_values: tensor });
      try {
        const output = results.image_embeds;
        if (!output || output.type !== 'float32' || output.data.length !== 512) throw new Error('Invalid category model output');
        return classifyCategoryScores(expected, scoreCategoryEmbedding(output.data as Float32Array, vectors.prompts), Date.now() - started);
      } finally { for (const output of Object.values(results)) output.dispose(); }
    } finally { tensor.dispose(); }
  } catch {
    return uncertainCategory(expected, 'LOCAL_CHECK_UNAVAILABLE', Date.now() - started);
  }
}

/** A serial, bounded on-device category hint. Backend verification remains authoritative. */
export async function inspectLocalCategory(uri: string, expected: string): Promise<LocalCategoryResult> {
  if (!FIXTURE_CATEGORIES.includes(expected.toUpperCase() as FixtureCategory)) return uncertainCategory(expected, 'UNSUPPORTED_CATEGORY');
  if (!uri.startsWith('file:///')) return uncertainCategory(expected, 'INVALID_LOCAL_IMAGE');
  if (active) return uncertainCategory(expected, 'LOCAL_CHECK_BUSY');
  const started = Date.now();
  const work = infer(uri, expected, started);
  active = work;
  void work.finally(() => { if (active === work) active = null; });
  // ORT's RN binding does not support cancellation. Retain the busy guard until it settles,
  // even when the UI timeout expires, so retries cannot spawn uncontrolled inference.
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([work, new Promise<LocalCategoryResult>(resolve => {
      timeout = setTimeout(() => resolve(uncertainCategory(expected, 'LOCAL_CHECK_TIMEOUT', Date.now() - started)), MAX_CHECK_MS);
    })]);
  } finally { if (timeout) clearTimeout(timeout); }
}
