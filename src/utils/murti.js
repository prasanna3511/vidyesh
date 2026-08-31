import { API_BASE_URL, API_ORIGIN } from "../lib/api.js";

const FALLBACK_IMAGE =
  "https://images.pexels.com/photos/8636095/pexels-photo-8636095.jpeg?auto=compress&cs=tinysrgb&w=500";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const AWS_S3_HOST_PATTERN = /(^|\.)amazonaws\.com$|(^|\.)cloudfront\.net$/i;

const buildBackendImageUrl = (value) =>
  `${API_BASE_URL.replace(/\/+$/, "")}/files/by-ref?value=${encodeURIComponent(value)}`;

const isS3Url = (value) => {
  const normalizedValue = String(value || "").trim();
  if (!/^https?:\/\//i.test(normalizedValue)) {
    return false;
  }

  try {
    const url = new URL(normalizedValue);
    return AWS_S3_HOST_PATTERN.test(url.hostname);
  } catch {
    return false;
  }
};

export const getImageUrl = (value) => {
  const normalizedValue = String(value || "").trim();

  if (!normalizedValue) {
    return FALLBACK_IMAGE;
  }

  if (normalizedValue.startsWith("data:image/")) {
    return normalizedValue;
  }

  if (normalizedValue.startsWith("/uploads/")) {
    return `${API_ORIGIN}${normalizedValue}`;
  }

  if (
    normalizedValue.startsWith(`${API_ORIGIN}/uploads/`) ||
    normalizedValue.startsWith(`${API_BASE_URL.replace(/\/api\/?$/, "")}/uploads/`)
  ) {
    return normalizedValue;
  }

  if (UUID_PATTERN.test(normalizedValue) || isS3Url(normalizedValue)) {
    return buildBackendImageUrl(normalizedValue);
  }

  return normalizedValue;
};

export const normalizeImageRecord = (image, index = 0) => ({
  id: image.id,
  image_id: image.image_id || image.image_ref,
  image_ref: image.image_ref || image.image_id,
  murti_id: image.murti_id || image.murti_history_id,
  murti_history_id: image.murti_history_id || image.murti_id,
  sort_order: image.sort_order ?? index,
});

export const normalizeMurti = (record) => ({
  ...record,
  name: record.murti_id,
  price: record.final_price,
  fullName: record.customer_name,
  phoneNumber: record.customer_phone,
  booked: record.booking_status === "booked",
  image: getImageUrl(record.image),
  images: Array.isArray(record.images) ? record.images.map(normalizeImageRecord) : [],
});

export { FALLBACK_IMAGE };
