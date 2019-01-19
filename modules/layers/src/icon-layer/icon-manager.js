/* global document */
import GL from 'luma.gl/constants';
import {Texture2D, loadImages, loadTextures} from 'luma.gl';

const MAX_CANVAS_WIDTH = 1024;
const DEFAULT_BUFFER = 4;

const DEFAULT_TEXTURE_MIN_FILTER = GL.LINEAR_MIPMAP_LINEAR;
// GL.LINEAR is the default value but explicitly set it here
const DEFAULT_TEXTURE_MAG_FILTER = GL.LINEAR;

const noop = () => {};

function nextPowOfTwo(number) {
  return Math.pow(2, Math.ceil(Math.log2(number)));
}

// resize image to given width and height
function resizeImage(ctx, imageData, width, height) {
  const {naturalWidth, naturalHeight} = imageData;
  if (width === naturalWidth && height === naturalHeight) {
    return imageData;
  }

  ctx.canvas.height = height;
  ctx.canvas.width = width;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight
  ctx.drawImage(imageData, 0, 0, naturalWidth, naturalHeight, 0, 0, width, height);

  return ctx.canvas;
}

// traverse icons in a row of icon atlas
// extend each icon with left-top coordinates
function buildRowMapping(mapping, columns, yOffset) {
  for (let i = 0; i < columns.length; i++) {
    const {icon, xOffset} = columns[i];
    mapping[icon.url] = Object.assign({}, icon, {
      x: xOffset,
      y: yOffset
    });
  }
}

/**
 * Generate coordinate mapping to retrieve icon left-top position from an icon atlas
 * @param icons {Array<Object>} list of icons, each icon requires url, width, height
 * @param buffer {Number} add buffer to the right and bottom side of the image
 * @param maxCanvasHeight {Number}
 * @returns {{mapping: {'/icon/1': {url, width, height, ...}},, canvasHeight: {Number}}}
 */
export function buildMapping({icons, buffer, maxCanvasWidth}) {
  // x position till current column
  let xOffset = 0;
  // y position till current row
  let yOffset = 0;
  // height of current row
  let rowHeight = 0;

  let columns = [];
  const mapping = {};

  // Strategy to layout all the icons into a texture:
  // traverse the icons sequentially, layout the icons from left to right, top to bottom
  // when the sum of the icons width is equal or larger than maxCanvasWidth,
  // move to next row starting from total height so far plus max height of the icons in previous row
  // row width is equal to maxCanvasWidth
  // row height is decided by the max height of the icons in that row
  // mapping coordinates of each icon is its left-top position in the texture
  for (let i = 0; i < icons.length; i++) {
    const icon = icons[i];
    if (!mapping[icon.url]) {
      const {height, width} = icon;

      // fill one row
      if (xOffset + width + buffer > maxCanvasWidth) {
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

  const canvasHeight = nextPowOfTwo(rowHeight + yOffset + buffer);

  return {
    mapping,
    canvasHeight
  };
}

// extract unique icons from data
function getIcons(data, getIcon) {
  if (!data || !getIcon) {
    return null;
  }

  const icons = {};
  for (const point of data) {
    const icon = getIcon(point);
    if (!icon) {
      throw new Error('Icon is missing.');
    }

    if (!icon.url) {
      throw new Error('Icon url is missing.');
    }

    if (!icons[icon.url]) {
      icons[icon.url] = icon;
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

    this._getIcon = null;
    this._mapping = {};
    this._texture = null;
    this._autoPacking = false;

    this._canvas = null;
  }

  getTexture() {
    return this._texture;
  }

  getIconMapping(dataPoint) {
    const icon = this._getIcon(dataPoint);
    const name = this._autoPacking ? icon.url : icon;
    return this._mapping[name] || {};
  }

  setProps({autoPacking, iconAtlas, iconMapping, data, getIcon}) {
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

    if (this._autoPacking && (data || getIcon)) {
      this._canvas = this._canvas || document.createElement('canvas');

      this._updateAutoPacking({
        data,
        buffer: DEFAULT_BUFFER,
        maxCanvasWidth: MAX_CANVAS_WIDTH
      });
    }
  }

  _updateIconAtlas(iconAtlas) {
    if (iconAtlas instanceof Texture2D) {
      iconAtlas.setParameters({
        [GL.TEXTURE_MIN_FILTER]: DEFAULT_TEXTURE_MIN_FILTER,
        [GL.TEXTURE_MAG_FILTER]: DEFAULT_TEXTURE_MAG_FILTER
      });

      this._texture = iconAtlas;
      this.onUpdate();
    } else if (typeof iconAtlas === 'string') {
      loadTextures(this.gl, {
        urls: [iconAtlas],
        parameters: {
          [GL.TEXTURE_MIN_FILTER]: DEFAULT_TEXTURE_MIN_FILTER,
          [GL.TEXTURE_MAG_FILTER]: DEFAULT_TEXTURE_MAG_FILTER
        }
      }).then(([texture]) => {
        this._texture = texture;
        this.onUpdate();
      });
    }
  }

  _updateAutoPacking({data, buffer, maxCanvasWidth}) {
    const icons = Object.values(getIcons(data, this._getIcon) || {});
    if (icons.length > 0) {
      // generate icon mapping
      const {mapping, canvasHeight} = buildMapping({
        icons,
        buffer,
        maxCanvasWidth
      });

      this._mapping = mapping;

      // create new texture
      this._texture = new Texture2D(this.gl, {
        width: maxCanvasWidth,
        height: canvasHeight
      });

      this.onUpdate();

      // load images
      this._loadImages(icons);
    }
  }

  _loadImages(icons) {
    const ctx = this._canvas.getContext('2d');
    const canvasHeight = this._texture.height;

    for (const icon of icons) {
      loadImages({urls: [icon.url]}).then(([imageData]) => {
        const iconMapping = this._mapping[icon.url];
        const {x, y, width, height} = iconMapping;

        const data = resizeImage(ctx, imageData, width, height);

        this._texture.setSubImageData({
          data,
          x,
          y: canvasHeight - y - height, // flip Y as texture stored as reversed Y
          width,
          height,
          parameters: {
            [GL.TEXTURE_MIN_FILTER]: DEFAULT_TEXTURE_MIN_FILTER,
            [GL.TEXTURE_MAG_FILTER]: DEFAULT_TEXTURE_MAG_FILTER,
            [GL.UNPACK_FLIP_Y_WEBGL]: true
          }
        });

        // Call to regenerate mipmaps after modifying texture(s)
        this._texture.generateMipmap();

        this.onUpdate();
      });
    }
  }
}
