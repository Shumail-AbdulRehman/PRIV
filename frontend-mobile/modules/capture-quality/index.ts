import { requireOptionalNativeModule } from 'expo-modules-core';
export type ClockAnchor = { bootId: string; elapsedMs: number };
export type StillQuality = { luminance: number; laplacianVariance: number; clipping: number; width: number; height: number };
const native = requireOptionalNativeModule<{ clock(): ClockAnchor; inspect(uri: string): Promise<StillQuality>; categoryTensor(uri: string): Promise<string>; categoryModelPath(): Promise<string> }>('CaptureQuality');
export const captureClock = (): ClockAnchor => {
  if (!native) throw new Error('Photo verification requires the Hygene Ops native development or production build.');
  return native.clock();
};
export const inspectStill = (uri: string): Promise<StillQuality> => {
  if (!native) throw new Error('Photo verification requires the Hygene Ops native build.');
  return native.inspect(uri);
};
export const prepareCategoryTensor = async (uri: string): Promise<Float32Array> => {
  if (!native?.categoryTensor) throw new Error('A new Hygene Ops native build is required for local photo checking.');
  const encoded = await native.categoryTensor(uri);
  const decoded = atob(encoded);
  const bytes = Uint8Array.from(decoded, character => character.charCodeAt(0));
  if (bytes.byteLength !== 3 * 224 * 224 * 4) throw new Error('Invalid category image tensor.');
  // Native writers emit IEEE754 little-endian floats. All supported mobile CPUs are little-endian.
  return new Float32Array(bytes.buffer);
};
export const bundledCategoryModelPath = async (): Promise<string> => {
  if (!native?.categoryModelPath) throw new Error('A new Hygene Ops native build is required for local photo checking.');
  return native.categoryModelPath();
};
