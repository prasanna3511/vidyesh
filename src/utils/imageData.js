import nhost, { getDirectStorageUrl, getSafeStorageUrl } from '../nhost';

const JPEG_QUALITY = 0.95;

/**
 * Nhost storage is fronted by a Cloudflare cache that stores responses without
 * `Vary: Origin`, so a cached copy created by a plain <img> load carries no
 * `access-control-allow-origin` and blocks every later fetch of that same URL.
 * A unique query string gives the request its own cache key, forcing a MISS,
 * and freshly generated responses always include the CORS header.
 */
const withCacheBuster = (url) => {
  if (!url) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}cors=${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
};

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

export const getFirstImageFileId = (bappa) => bappa?.images?.[0]?.image_id || '';

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

/**
 * Resolves a murti image into a JPEG data URL that jsPDF can embed.
 *
 * Attempts, in order of reliability:
 *  1. the same-origin storage proxy — CORS cannot apply, so this always works
 *     where the proxy is configured (dev server + Netlify);
 *  2. the direct storage URL with a cache buster — no proxy needed, and the
 *     forced cache MISS is what makes the CORS header show up;
 *  3. an authenticated SDK download — covers files that are not publicly readable;
 *  4. whatever URL the caller already had.
 */
export const loadPdfImageDataUrl = async ({ fileId, url } = {}) => {
  if (typeof url === 'string' && url.startsWith('data:image/')) {
    return url;
  }

  if (fileId) {
    const viaProxy = await attempt('same-origin proxy', () => fetchToDataUrl(getSafeStorageUrl(fileId)));
    if (viaProxy) return viaProxy;

    const viaDirect = await attempt('direct storage URL', () =>
      fetchToDataUrl(withCacheBuster(getDirectStorageUrl(fileId)))
    );
    if (viaDirect) return viaDirect;

    const viaSdk = await attempt('authenticated download', async () => {
      const { file, error } = await nhost.storage.download({ fileId });
      if (error) throw error;
      return blobToDataUrl(file);
    });
    if (viaSdk) return viaSdk;
  }

  if (url) {
    const viaUrl = await attempt('caller URL', () =>
      fetchToDataUrl(url.startsWith('blob:') || url.startsWith('/') ? url : withCacheBuster(url))
    );
    if (viaUrl) return viaUrl;

    const viaElement = await attempt('image element', () => urlToDataUrl(url));
    if (viaElement) return viaElement;
  }

  return '';
};
