// Appends Cloudinary auto-format/auto-quality/width transforms to an image URL.
// Falls back to the original URL untouched if it's not a Cloudinary URL
// (e.g. a local asset or a URL from another host), so this is always safe to call.
export const getOptimizedImageUrl = (url, width = 400) => {
  if (!url || typeof url !== "string") return url;

  const uploadMarker = "/upload/";
  const markerIndex = url.indexOf(uploadMarker);

  if (!url.includes("res.cloudinary.com") || markerIndex === -1) {
    return url;
  }

  const insertAt = markerIndex + uploadMarker.length;
  return (
    url.slice(0, insertAt) +
    `f_auto,q_auto,w_${width}/` +
    url.slice(insertAt)
  );
};