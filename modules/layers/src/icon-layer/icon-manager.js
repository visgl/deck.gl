/* global document */
import GL from '@luma.gl/constants';
import {Texture2D, copyToTexture, cloneTextureFrom} from '@luma.gl/core';
import {ImageLoader} from '@loaders.gl/images';
import {load} from '@loaders.gl/core';
import {createIterable, log} from '@deck.gl/core';

const DEFAULT_CANVAS_WIDTH = 1024;
const DEFAULT_BUFFER = 4;

const noop = () => {};

const DEFAULT_TEXTURE_PARAMETERS = {
  [GL.TEXTURE_MIN_FILTER]: GL.LINEAR_MIPMAP_LINEAR,
  // GL.LINEAR is the default value but explicitly set it here
  [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
  // for texture boundary artifact
  [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
  [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
};

function nextPowOfTwo(number) {
  return Math.pow(2, Math.ceil(Math.log2(number)));
}

// update comment to create a new texture and copy original data.
function resizeImage(ctx, imageData, width, height) {
  if (width === imageData.width && height === imageData.height) {
    return imageData;
  }

  ctx.canvas.height = height;
  ctx.canvas.width = width;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight
  ctx.drawImage(imageData, 0, 0, imageData.width, imageData.height, 0, 0, width, height);

  return ctx.canvas;
}

function getIconId(icon) {
  return icon && (icon.id || icon.url);
}

// resize texture without losing original data
function resizeTexture(gl, texture, width, height) {
  const oldWidth = texture.width;
  const oldHeight = texture.height;

  const newTexture = cloneTextureFrom(texture, {width, height});
  copyToTexture(texture, newTexture, {
    targetY: 0,
    width: oldWidth,
    height: oldHeight
  });

  texture.delete();
  return newTexture;
}

// traverse icons in a row of icon atlas
// extend each icon with left-top coordinates
function buildRowMapping(mapping, columns, yOffset) {
  for (let i = 0; i < columns.length; i++) {
    const {icon, xOffset} = columns[i];
    const id = getIconId(icon);
    mapping[id] = Object.assign({}, icon, {
      x: xOffset,
      y: yOffset
    });
  }
}

/**
 * Generate coordinate mapping to retrieve icon left-top position from an icon atlas
 * @param icons {Array<Object>} list of icons, each icon requires url, width, height
 * @param buffer {Number} add buffer to the right and bottom side of the image
 * @param xOffset {Number} right position of last icon in old mapping
 * @param yOffset {Number} top position in last icon in old mapping
 * @param rowHeight {Number} rowHeight of the last icon's row
 * @param canvasWidth {Number} max width of canvas
 * @param mapping {object} old mapping
 * @returns {{mapping: {'/icon/1': {url, width, height, ...}},, canvasHeight: {Number}}}
 */
export function buildMapping({
  icons,
  buffer,
  mapping = {},
  xOffset = 0,
  yOffset = 0,
  rowHeight = 0,
  canvasWidth
}) {
  let columns = [];
  // Strategy to layout all the icons into a texture:
  // traverse the icons sequentially, layout the icons from left to right, top to bottom
  // when the sum of the icons width is equal or larger than canvasWidth,
  // move to next row starting from total height so far plus max height of the icons in previous row
  // row width is equal to canvasWidth
  // row height is decided by the max height of the icons in that row
  // mapping coordinates of each icon is its left-top position in the texture
  for (let i = 0; i < icons.length; i++) {
    const icon = icons[i];
    const id = getIconId(icon);

    if (!mapping[id]) {
      const {height, width} = icon;

      // fill one row
      if (xOffset + width + buffer > canvasWidth) {
        buildRowMapping(mapping, columns, yOffset);

        xOffset = 0;
        yOffset = rowHeight + yOffset + buffer;
        rowHeight = 0;
        columns = [];
      }

      columns.push({
        icon,
        xOffset
      });

      xOffset = xOffset + width + buffer;
      rowHeight = Math.max(rowHeight, height);
    }
  }

  if (columns.length > 0) {
    buildRowMapping(mapping, columns, yOffset);
  }

  return {
    mapping,
    rowHeight,
    xOffset,
    yOffset,
    canvasWidth,
    canvasHeight: nextPowOfTwo(rowHeight + yOffset + buffer)
  };
}

// extract icons from data
// return icons should be unique, and not cached or cached but url changed
export function getDiffIcons(data, getIcon, cachedIcons) {
  if (!data || !getIcon) {
    return null;
  }

  cachedIcons = cachedIcons || {};
  const icons = {};
  const {iterable, objectInfo} = createIterable(data);
  for (const object of iterable) {
    objectInfo.index++;
    const icon = getIcon(object, objectInfo);
    const id = getIconId(icon);

    if (!icon) {
      throw new Error('Icon is missing.');
    }

    if (!icon.url) {
      throw new Error('Icon url is missing.');
    }

    if (!icons[id] && (!cachedIcons[id] || icon.url !== cachedIcons[id].url)) {
      icons[id] = icon;
    }
  }
  return icons;
}

export default class IconManager {
  constructor(
    gl,
    {
      onUpdate = noop // notify IconLayer when icon texture update
    }
  ) {
    this.gl = gl;
    this.onUpdate = onUpdate;

    // load options used for loading images
    this._loadOptions = null;
    this._getIcon = null;

    this._texture = null;
    this._externalTexture = null;
    this._mapping = {};
    // count of pending requests to fetch icons
    this._pendingCount = 0;

    this._autoPacking = false;

    // internal props used when autoPacking applied
    // right position of last icon
    this._xOffset = 0;
    // top position of last icon
    this._yOffset = 0;
    this._rowHeight = 0;
    this._buffer = DEFAULT_BUFFER;
    this._canvasWidth = DEFAULT_CANVAS_WIDTH;
    this._canvasHeight = 0;
    this._canvas = null;
  }

  finalize() {
    if (this._texture) {
      this._texture.delete();
    }
  }

  getTexture() {
    return this._texture || this._externalTexture;
  }

  getIconMapping(icon) {
    const id = this._autoPacking ? getIconId(icon) : icon;
    return this._mapping[id] || {};
  }

  setProps({loadOptions, autoPacking, iconAtlas, iconMapping, data, getIcon}) {
    if (loadOptions) {
      this._loadOptions = loadOptions;
    }

    if (autoPacking !== undefined) {
      this._autoPacking = autoPacking;
    }

    if (getIcon) {
      this._getIcon = getIcon;
    }

    if (iconMapping) {
      this._mapping = iconMapping;
    }

    if (iconAtlas) {
      this._updateIconAtlas(iconAtlas);
    }

    if (this._autoPacking && (data || getIcon) && typeof document !== 'undefined') {
      this._canvas = this._canvas || document.createElement('canvas');

      this._updateAutoPacking(data);
    }
  }

  get isLoaded() {
    return this._pendingCount === 0;
  }

  _updateIconAtlas(iconAtlas) {
    if (this._texture) {
      this._texture.delete();
      this._texture = null;
    }
    if (iconAtlas instanceof Texture2D) {
      iconAtlas.setParameters(DEFAULT_TEXTURE_PARAMETERS);

      this._externalTexture = iconAtlas;
      this.onUpdate();
    } else if (iconAtlas) {
      // Browser object: Image, ImageData, HTMLCanvasElement, ImageBitmap
      this._texture = new Texture2D(this.gl, {
        data: iconAtlas,
        parameters: DEFAULT_TEXTURE_PARAMETERS
      });
      this.onUpdate();
    }
  }

  _updateAutoPacking(data) {
    const icons = Object.values(getDiffIcons(data, this._getIcon, this._mapping) || {});

    if (icons.length > 0) {
      // generate icon mapping
      const {mapping, xOffset, yOffset, rowHeight, canvasHeight} = buildMapping({
        icons,
        buffer: this._buffer,
        canvasWidth: this._canvasWidth,
        mapping: this._mapping,
        rowHeight: this._rowHeight,
        xOffset: this._xOffset,
        yOffset: this._yOffset
      });

      this._rowHeight = rowHeight;
      this._mapping = mapping;
      this._xOffset = xOffset;
      this._yOffset = yOffset;
      this._canvasHeight = canvasHeight;

      // create new texture
      if (!this._texture) {
        this._texture = new Texture2D(this.gl, {
          width: this._canvasWidth,
          height: this._canvasHeight,
          parameters: DEFAULT_TEXTURE_PARAMETERS
        });
      }

      if (this._texture.height !== this._canvasHeight) {
        this._texture = resizeTexture(
          this.gl,
          this._texture,
          this._canvasWidth,
          this._canvasHeight
        );
      }

      this.onUpdate();

      // load images
      this._loadIcons(icons);
    }
  }

  _loadIcons(icons) {
    const ctx = this._canvas.getContext('2d');

    for (const icon of icons) {
      this._pendingCount++;
      load(icon.url, ImageLoader, this._loadOptions)
        .then(imageData => {
          const id = getIconId(icon);
          const {x, y, width, height} = this._mapping[id];

          const data = resizeImage(ctx, imageData, width, height);

          this._texture.setSubImageData({
            data,
            x,
            y,
            width,
            height
          });

          // Call to regenerate mipmaps after modifying texture(s)
          this._texture.generateMipmap();

          this.onUpdate();
        })
        .catch(error => {
          log.error(error)();
        })
        .finally(() => {
          this._pendingCount--;
        });
    }
  }
}
