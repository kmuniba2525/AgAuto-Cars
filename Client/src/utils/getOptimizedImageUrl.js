// Appends Cloudinary auto-format/auto-quality/width transforms to an image URL.
// Falls back to the original URL untouched if it's not a Cloudinary URL
// (e.g. a local asset or a URL from another host), so this is always safe to call.

const CLOUDINARY_MARKER = "/upload/";

const isCloudinaryUrl = (url) =>
  typeof url === "string" &&
  url.includes("res.cloudinary.com") &&
  url.indexOf(CLOUDINARY_MARKER) !== -1;

export const getOptimizedImageUrl = (url, width = 400) => {
  if (!url || typeof url !== "string") return url;

  const markerIndex = url.indexOf(CLOUDINARY_MARKER);
  if (!isCloudinaryUrl(url)) return url;

  const insertAt = markerIndex + CLOUDINARY_MARKER.length;
  return (
    url.slice(0, insertAt) +
    `f_auto,q_auto,w_${width}/` +
    url.slice(insertAt)
  );
};

// Generates a Cloudinary srcset string across multiple widths, e.g.:
// "https://.../w_200/img.jpg 200w, https://.../w_400/img.jpg 400w, ..."
// Non-Cloudinary URLs return undefined (srcset attribute simply omitted).
export const getSrcSet = (url, widths = [200, 400, 600, 800, 1200]) => {
  if (!isCloudinaryUrl(url)) return undefined;

  return widths
    .map((w) => `${getOptimizedImageUrl(url, w)} ${w}w`)
    .join(", ");
};
