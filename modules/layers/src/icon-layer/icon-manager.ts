/* global document */
import GL from '@luma.gl/constants';
import {Texture2D, copyToTexture} from '@luma.gl/core';
import {load} from '@loaders.gl/core';
import {createIterable} from '@deck.gl/core';

import type {AccessorFunction} from '@deck.gl/core';

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

type IconDef = {
  /** Width of the icon */
  width: number;
  /** Height of the icon */
  height: number;
  /** Horizontal position of icon anchor. Default: half width. */
  anchorX?: number;
  /** Vertical position of icon anchor. Default: half height. */
  anchorY?: number;
  /**
   * Whether the icon is treated as a transparency mask.
   * If `true`, color defined by `getColor` is applied.
   * If `false`, pixel color from the icon image is applied.
   * @default false
   */
  mask?: boolean;
};

export type UnpackedIcon = {
  /** Url to fetch the icon */
  url: string;
  /** Unique identifier of the icon. Icons of the same id are only fetched once. Fallback to `url` if not specified. */
  id?: string;
} & IconDef;

type PrepackedIcon = {
  /** Left position of the icon on the atlas */
  x: number;
  /** Top position of the icon on the atlas */
  y: number;
} & IconDef;

export type IconMapping = Record<string, PrepackedIcon>;

export type LoadIconErrorContext = {
  error: Error;
  /** The URL that was trying to fetch */
  url: string;
  /** The original data object that requested this icon */
  source: any;
  /** The index of the original data object that requested this icon */
  sourceIndex: number;
  /** The load options used for the fetch */
  loadOptions: any;
};

function nextPowOfTwo(number: number): number {
  return Math.pow(2, Math.ceil(Math.log2(number)));
}

// update comment to create a new texture and copy original data.
function resizeImage(
  ctx: CanvasRenderingContext2D,
  imageData: HTMLImageElement | ImageBitmap,
  maxWidth: number,
  maxHeight: number
): {
  data: HTMLImageElement | HTMLCanvasElement | ImageBitmap;
  width: number;
  height: number;
} {
  const resizeRatio = Math.min(maxWidth / imageData.width, maxHeight / imageData.height);
  const width = Math.floor(imageData.width * resizeRatio);
  const height = Math.floor(imageData.height * resizeRatio);

  if (resizeRatio === 1) {
    // No resizing required
    return {data: imageData, width, height};
  }

  ctx.canvas.height = height;
  ctx.canvas.width = width;

  ctx.clearRect(0, 0, width, height);

  // image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight
  ctx.drawImage(imageData, 0, 0, imageData.width, imageData.height, 0, 0, width, height);
  return {data: ctx.canvas, width, height};
}

function getIconId(icon: UnpackedIcon): string {
  return icon && (icon.id || icon.url);
}

// resize texture without losing original data
function resizeTexture(
  texture: Texture2D,
  width: number,
  height: number,
  parameters: any
): Texture2D {
  const oldWidth = texture.width;
  const oldHeight = texture.height;

  const newTexture = new Texture2D(texture.gl, {width, height, parameters});
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
function buildRowMapping(
  mapping: IconMapping,
  columns: {
    icon: UnpackedIcon;
    xOffset: number;
  }[],
  yOffset: number
): void {
  for (let i = 0; i < columns.length; i++) {
    const {icon, xOffset} = columns[i];
    const id = getIconId(icon);
    mapping[id] = {
      ...icon,
      x: xOffset,
      y: yOffset
    };
  }
}

/**
 * Generate coordinate mapping to retrieve icon left-top position from an icon atlas
 */
export function buildMapping({
  icons,
  buffer,
  mapping = {},
  xOffset = 0,
  yOffset = 0,
  rowHeight = 0,
  canvasWidth
}: {
  /** list of icon definitions */
  icons: UnpackedIcon[];
  /** add bleeding buffer to the right and bottom side of the image */
  buffer: number;
  /** right position of last icon in old mapping */
  xOffset: number;
  /** top position in last icon in old mapping */
  yOffset: number;
  /** height of the last icon's row */
  rowHeight: number;
  /** max width of canvas */
  canvasWidth: number;
  mapping: IconMapping;
}): {
  mapping: IconMapping;
  rowHeight: number;
  xOffset: number;
  yOffset: number;
  canvasWidth: number;
  canvasHeight: number;
} {
  let columns: {
    icon: UnpackedIcon;
    xOffset: number;
  }[] = [];
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
export function getDiffIcons(
  data: any,
  getIcon: AccessorFunction<any, UnpackedIcon> | null,
  cachedIcons: Record<string, PrepackedIcon & {url?: string}>
): Record<
  string,
  UnpackedIcon & {
    source: any;
    sourceIndex: number;
  }
> | null {
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
      icons[id] = {...icon, source: object, sourceIndex: objectInfo.index};
    }
  }
  return icons;
}

export default class IconManager {
  gl: WebGLRenderingContext;

  private onUpdate: () => void;
  private onError: (context: LoadIconErrorContext) => void;
  private _loadOptions: any = null;
  private _texture: Texture2D | null = null;
  private _externalTexture: Texture2D | null = null;
  private _mapping: IconMapping = {};
  private _textureParameters: Record<number, number> | null = null;

  /** count of pending requests to fetch icons */
  private _pendingCount: number = 0;

  private _autoPacking: boolean = false;

  // / internal state used for autoPacking

  private _xOffset: number = 0;
  private _yOffset: number = 0;
  private _rowHeight: number = 0;
  private _buffer: number = DEFAULT_BUFFER;
  private _canvasWidth: number = DEFAULT_CANVAS_WIDTH;
  private _canvasHeight: number = 0;
  private _canvas: HTMLCanvasElement | null = null;

  constructor(
    gl: WebGLRenderingContext,
    {
      onUpdate = noop,
      onError = noop
    }: {
      /** Callback when the texture updates */
      onUpdate: () => void;
      /** Callback when an error is encountered */
      onError: (context: LoadIconErrorContext) => void;
    }
  ) {
    this.gl = gl;
    this.onUpdate = onUpdate;
    this.onError = onError;
  }

  finalize(): void {
    this._texture?.delete();
  }

  getTexture(): Texture2D | null {
    return this._texture || this._externalTexture;
  }

  getIconMapping(icon: string | UnpackedIcon): PrepackedIcon {
    const id = this._autoPacking ? getIconId(icon as UnpackedIcon) : (icon as string);
    return this._mapping[id] || {};
  }

  setProps({
    loadOptions,
    autoPacking,
    iconAtlas,
    iconMapping,
    textureParameters
  }: {
    loadOptions?: any;
    autoPacking?: boolean;
    iconAtlas?: Texture2D | null;
    iconMapping?: IconMapping | null;
    textureParameters?: Record<number, number> | null;
  }) {
    if (loadOptions) {
      this._loadOptions = loadOptions;
    }

    if (autoPacking !== undefined) {
      this._autoPacking = autoPacking;
    }

    if (iconMapping) {
      this._mapping = iconMapping;
    }

    if (iconAtlas) {
      this._texture?.delete();
      this._texture = null;
      this._externalTexture = iconAtlas;
    }

    if (textureParameters) {
      this._textureParameters = textureParameters;
    }
  }

  get isLoaded(): boolean {
    return this._pendingCount === 0;
  }

  packIcons(data: any, getIcon: AccessorFunction<any, UnpackedIcon>): void {
    if (!this._autoPacking || typeof document === 'undefined') {
      return;
    }

    const icons = Object.values(getDiffIcons(data, getIcon, this._mapping) || {});

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
          parameters: this._textureParameters || DEFAULT_TEXTURE_PARAMETERS
        });
      }

      if (this._texture.height !== this._canvasHeight) {
        this._texture = resizeTexture(
          this._texture,
          this._canvasWidth,
          this._canvasHeight,
          this._textureParameters || DEFAULT_TEXTURE_PARAMETERS
        );
      }

      this.onUpdate();

      // load images
      this._canvas = this._canvas || document.createElement('canvas');
      this._loadIcons(icons);
    }
  }

  private _loadIcons(
    icons: (UnpackedIcon & {
      source: any;
      sourceIndex: number;
    })[]
  ): void {
    // This method is only called in the auto packing case, where _canvas is defined
    const ctx = this._canvas!.getContext('2d', {
      willReadFrequently: true
    }) as CanvasRenderingContext2D;

    for (const icon of icons) {
      this._pendingCount++;
      load(icon.url, this._loadOptions)
        .then(imageData => {
          const id = getIconId(icon);

          const iconDef = this._mapping[id];
          const {x, y, width: maxWidth, height: maxHeight} = iconDef;

          const {data, width, height} = resizeImage(ctx, imageData, maxWidth, maxHeight);

          this._texture.setSubImageData({
            data,
            x: x + (maxWidth - width) / 2,
            y: y + (maxHeight - height) / 2,
            width,
            height
          });
          iconDef.width = width;
          iconDef.height = height;

          // Call to regenerate mipmaps after modifying texture(s)
          this._texture.generateMipmap();

          this.onUpdate();
        })
        .catch(error => {
          this.onError({
            url: icon.url,
            source: icon.source,
            sourceIndex: icon.sourceIndex,
            loadOptions: this._loadOptions,
            error
          });
        })
        .finally(() => {
          this._pendingCount--;
        });
    }
  }
}
