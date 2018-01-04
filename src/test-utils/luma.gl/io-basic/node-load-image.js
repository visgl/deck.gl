import {promisify} from '../../utils';

export function loadImage(url) {
  const getPixels = module.require('get-pixels');
  if (!getPixels) {
    throw new Error('loadImage: get-pixels not installed');
  }

  return promisify(getPixels)(url);
}
