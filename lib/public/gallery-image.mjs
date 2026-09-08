export function galleryImageLoader({ src, width }) {
  const variant = width <= 480 ? 480 : width <= 960 ? 960 : 1920
  return src.replace(/-1920\.webp$/, `-${variant}.webp`)
}
