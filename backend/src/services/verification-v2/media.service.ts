import cloudinary, { uploadBufferToCloudinary } from '../../utils/cloudinary.js';
import { ApiError } from '../../utils/ApiError.js';
import { IMAGE_LIMIT_BYTES } from './quality.service.js';

/** Existing storage account, authenticated assets only; never publish delivery URLs. */
export async function storePrivateImage(bytes: Buffer, publicId: string, boundHash: string) {
  try {
    const existing = await cloudinary.api.resource(publicId, { type: 'authenticated', resource_type: 'image', context: true });
    if (existing.context?.custom?.sha256 !== boundHash) throw new ApiError(409, 'Stored evidence does not match this capture');
    return existing;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const status = (error as { error?: { http_code?: number }; http_code?: number }).error?.http_code ?? (error as { http_code?: number }).http_code;
    if (status !== 404) throw new ApiError(503, 'Photo storage is temporarily unavailable');
  }
  try {
    return await uploadBufferToCloudinary(bytes, { public_id: publicId, type: 'authenticated', resource_type: 'image', overwrite: false,
      context: { sha256: boundHash } });
  } catch { throw new ApiError(503, 'Photo upload could not be confirmed. Retry this same capture.'); }
}

export async function privateImageBytes(publicId: string, format: string): Promise<Buffer> {
  if (!/^verification\/[\w\/-]+$/.test(publicId) || !['jpeg', 'jpg', 'png', 'webp'].includes(format)) throw new ApiError(404, 'Evidence unavailable');
  const url = cloudinary.utils.private_download_url(publicId, format, { type: 'authenticated', resource_type: 'image', expires_at: Math.floor(Date.now() / 1000) + 60 });
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000), redirect: 'error' });
  if (!response.ok) throw new ApiError(503, 'Evidence storage is temporarily unavailable');
  const reader = response.body?.getReader();
  if (!reader) throw new ApiError(503, 'Evidence storage returned no image');
  const chunks: Buffer[] = []; let size = 0;
  for (;;) { const part = await reader.read(); if (part.done) break; size += part.value.byteLength;
    if (size > IMAGE_LIMIT_BYTES) { await reader.cancel(); throw new ApiError(503, 'Stored image exceeds the allowed size'); } chunks.push(Buffer.from(part.value)); }
  return Buffer.concat(chunks);
}
