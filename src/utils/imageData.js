import { getImageUrl } from './murti.js';

const JPEG_QUALITY = 0.95;

const drawToJpegDataUrl = (source, width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);
  const ctx = canvas.getContext('2d');
  // JPEG has no alpha channel, so transparent PNGs would turn black without this.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
};

const urlToDataUrl = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';

    image.onload = () => {
      try {
        resolve(drawToJpegDataUrl(image, image.naturalWidth || image.width, image.naturalHeight || image.height));
      } catch (error) {
        reject(error);
      }
    };

    image.onerror = () => reject(new Error('Image element failed to load.'));
    image.src = src;
  });

export const blobToDataUrl = async (blob) => {
  try {
    let bitmap;
    try {
      bitmap = await createImageBitmap(blob, { imageOrientation: 'from-image' });
    } catch {
      bitmap = await createImageBitmap(blob);
    }

    const dataUrl = drawToJpegDataUrl(bitmap, bitmap.width, bitmap.height);
    bitmap.close?.();
    return dataUrl;
  } catch {
    const objectUrl = URL.createObjectURL(blob);
    try {
      return await urlToDataUrl(objectUrl);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }
};

const fetchToDataUrl = async (url) => {
  const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
  if (!response.ok) {
    throw new Error(`Image fetch failed with status ${response.status}`);
  }

  const blob = await response.blob();
  // A missing route on a static host answers with index.html and status 200,
  // which would otherwise be handed to the canvas as if it were an image.
  if (!blob.type.startsWith('image/')) {
    throw new Error(`Expected an image but received "${blob.type || 'unknown'}"`);
  }

  return blobToDataUrl(blob);
};

export const getFirstImageFileId = (bappa) =>
  bappa?.images?.[0]?.image_ref || bappa?.images?.[0]?.image_id || '';

const attempt = async (label, loader) => {
  try {
    const dataUrl = await loader();
    if (dataUrl) return dataUrl;
    throw new Error('Empty result');
  } catch (error) {
    console.warn(`PDF image: ${label} failed —`, error?.message || error);
    return '';
  }
};

export const loadPdfImageDataUrl = async ({ fileId, url } = {}) => {
  if (typeof url === 'string' && url.startsWith('data:image/')) {
    return url;
  }

  if (fileId) {
    const viaFileId = await attempt('stored image reference', () => fetchToDataUrl(getImageUrl(fileId)));
    if (viaFileId) return viaFileId;
  }

  if (url) {
    const viaUrl = await attempt('caller URL', () =>
      fetchToDataUrl(getImageUrl(url))
    );
    if (viaUrl) return viaUrl;

    const viaElement = await attempt('image element', () => urlToDataUrl(getImageUrl(url)));
    if (viaElement) return viaElement;
  }

  return '';
};
