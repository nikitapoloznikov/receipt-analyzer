const MAX_SIDE = 1920;
const QUALITY = 0.9;
const MAX_BYTES = 5 * 1024 * 1024;
const FALLBACK_SIDE = 1280;
const FALLBACK_QUALITY = 0.7;

export async function fileToCompressedBlob(file) {
  const bitmap = await createImageBitmap(file);
  return drawAndEncode(bitmap, MAX_SIDE, QUALITY).then(async blob => {
    if (blob.size <= MAX_BYTES) return blob;
    return drawAndEncode(bitmap, FALLBACK_SIDE, FALLBACK_QUALITY);
  });
}

export async function canvasToCompressedBlob(canvas) {
  const blob = await canvasBlob(canvas, QUALITY);
  if (blob.size <= MAX_BYTES) return blob;
  const bitmap = await createImageBitmap(blob);
  return drawAndEncode(bitmap, FALLBACK_SIDE, FALLBACK_QUALITY);
}

async function drawAndEncode(bitmap, maxSide, quality) {
  const { width, height } = bitmap;
  const scale = Math.min(1, maxSide / Math.max(width, height));
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, w, h);
  return canvasBlob(canvas, quality);
}

function canvasBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/jpeg', quality);
  });
}

export function blobUrl(blob) {
  return URL.createObjectURL(blob);
}
