// src/lib/imageHelper.ts

/**
 * Convert a raw image reference to a proper URL or Data URI for rendering.
 *
 * - If the string already contains a Data URI anywhere (e.g., prefixed by a URL), extract it.
 * - If the string already starts with a Data URI, it is returned unchanged.
 * - If it appears to be a file path or an absolute URL (starts with "gallery/", "/", "http"), it is returned as‑is.
 * - Otherwise the string is assumed to be a raw Base64 payload and is prefixed with a JPEG Data URI.
 */
export function formatImage(src: string): string {
  if (!src) return src;
  const trimmed = src.trim();

  // If the string already contains a Data URI anywhere (e.g., prefixed by a URL), extract it.
  const dataIndex = trimmed.indexOf('data:image');
  if (dataIndex !== -1) {
    return trimmed.substring(dataIndex);
  }

  // Already a Data URI at the start.
  if (trimmed.startsWith('data:image')) {
    return trimmed;
  }

  // Likely a file path or full URL returned by the API.
  if (
    trimmed.startsWith('gallery/') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('http')
  ) {
    return trimmed;
  }

  // Fallback: treat the string as a raw Base64 payload and prepend a JPEG prefix.
  return `data:image/jpeg;base64,${trimmed}`;
}
