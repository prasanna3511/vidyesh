import { NhostClient } from '@nhost/nhost-js';

const nhost = new NhostClient({
  subdomain: 'oxsetgbfcrtlfjmvwkmk',
  region: 'ap-south-1' // e.g., 'eu-central-1'
});

export const STORAGE_PROXY_PREFIX = '/nhost-storage';

/** Direct Nhost storage URL. Cross-origin, so CORS applies — see getSafeStorageUrl. */
export const getDirectStorageUrl = (fileId, options = {}) => {
  if (!fileId) {
    return '';
  }

  return nhost.storage.getPublicUrl({ fileId, ...options }) || '';
};

/**
 * Same-origin URL for a stored file, proxied to Nhost by the Vite dev server
 * (vite.config.ts) and by Netlify (netlify.toml).
 *
 * Nhost storage sits behind Cloudflare and returns `access-control-allow-origin`
 * only when the request carries an `Origin` header — but the response is cached
 * WITHOUT `Vary: Origin`. So a plain <img> load (no Origin) can populate the CDN
 * cache with a header-less copy that later fetch()/crossOrigin requests receive,
 * which is why direct-URL reads fail intermittently. Requesting the file from our
 * own origin removes CORS from the picture entirely and keeps the canvas untainted.
 */
export const getSafeStorageUrl = (fileId, options = {}) => {
  const directUrl = getDirectStorageUrl(fileId, options);

  if (!directUrl || typeof window === 'undefined') {
    return directUrl;
  }

  try {
    const url = new URL(directUrl);
    return `${window.location.origin}${STORAGE_PROXY_PREFIX}${url.pathname.replace(/^\/v1/, '')}${url.search}`;
  } catch {
    return directUrl;
  }
};

export default nhost;
