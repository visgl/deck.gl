// Use stackgl modules for DOM-less reading and writing of images
// NOTE: These are not dependencies of luma.gl.
// They need to be imported by the app.

/**
 * Returns data bytes representing a compressed image in PNG or JPG format,
 * This data can be saved using file system (f) methods or
 * used in a request.
 * @param {Image} image to save
 * @param {String} type='png' - png, jpg or image/png, image/jpg are valid
 * @param {String} opt.dataURI= - Whether to include a data URI header
 * @return {*} bytes
 */
export function compressImage(image, type = 'png') {
  const savePixels = module.require('save-pixels');
  const ndarray = module.require('ndarray');
  if (!savePixels || !ndarray) {
    throw new Error('compressImage: save-pixels or ndarray not installed');
  }

  const pixels = ndarray(image.data, [image.width, image.height, 4], [4, image.width * 4, 1], 0);

  // TODO - does this return stream?
  return savePixels(pixels, type.replace('image/', ''));
}
