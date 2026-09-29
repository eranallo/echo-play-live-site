import galleries from './galleries.json' with { type: 'json' }

export function getBandGallery(slug) {
  if (!Object.hasOwn(galleries, slug)) return null
  const { updated, photos } = galleries[slug]
  // Keep source attribution in the editorial record, outside public page/API data.
  return {
    updated,
    photos: photos.map(({ id, src, width, height, alt, album, position }) => ({
      id, src, width, height, alt, album,
      ...(position ? { position } : {}),
    })),
  }
}

// These three derivatives are prepared once when a photo is published.
// Visiting a gallery never calls Drive, Airtable or the storage listing API.
export function galleryApiPayload(slug) {
  const gallery = getBandGallery(slug)
  if (!gallery) return null
  return {
    images: gallery.photos.map(photo => ({
      ...photo,
      url: photo.src,
      filename: photo.src.split('/').pop(),
    })),
    count: gallery.photos.length,
  }
}
