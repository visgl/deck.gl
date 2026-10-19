// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
import {Device, Texture, SamplerProps} from '@luma.gl/core';
import {AsyncTexture} from '@luma.gl/engine';
import {load} from '@loaders.gl/core';
import {createIterable} from '@deck.gl/core';

import type {AccessorFunction} from '@deck.gl/core';

const DEFAULT_CANVAS_WIDTH = 1024;
const DEFAULT_BUFFER = 4;

const noop = () => {};

const DEFAULT_SAMPLER_PARAMETERS: SamplerProps = {
  minFilter: 'linear',
  mipmapFilter: 'linear',
  // LINEAR is the default value but explicitly set it here
  magFilter: 'linear',
  // minimize texture boundary artifacts
  addressModeU: 'clamp-to-edge',
  addressModeV: 'clamp-to-edge'
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

const MISSING_ICON: PrepackedIcon = {
  x: 0,
  y: 0,
  width: 0,
  height: 0
};

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
  image: HTMLImageElement | HTMLCanvasElement | ImageBitmap;
  width: number;
  height: number;
} {
  const resizeRatio = Math.min(maxWidth / imageData.width, maxHeight / imageData.height);
  const width = Math.floor(imageData.width * resizeRatio);
  const height = Math.floor(imageData.height * resizeRatio);

  if (resizeRatio === 1) {
    // No resizing required
    return {image: imageData, width, height};
  }

  ctx.canvas.height = height;
  ctx.canvas.width = width;

  ctx.clearRect(0, 0, width, height);

  // image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight
  ctx.drawImage(imageData, 0, 0, imageData.width, imageData.height, 0, 0, width, height);
  return {image: ctx.canvas, width, height};
}

function getIconId(icon: UnpackedIcon): string {
  return icon && (icon.id || icon.url);
}

function regenerateMipmaps(texture: Texture) {
  const {device} = texture;
  if (device.type === 'webgl') {
    texture.generateMipmapsWebGL();
  } else if (device.type === 'webgpu') {
    device.generateMipmapsWebGPU(texture);
  }
}

// resize texture without losing original data
function resizeTexture(
  texture: Texture,
  width: number,
  height: number,
  sampler: SamplerProps
): Texture {
  const {width: oldWidth, height: oldHeight, device} = texture;

  const newTexture = device.createTexture({
    format: 'rgba8unorm',
    width,
    height,
    sampler,
    mipLevels: device.getMipLevelCount(width, height)
  });

  const commandEncoder = device.createCommandEncoder();
  commandEncoder.copyTextureToTexture({
    sourceTexture: texture,
    destinationTexture: newTexture,
    width: oldWidth,
    height: oldHeight
  });
  const commandBuffer = commandEncoder.finish();
  device.submit(commandBuffer);
  regenerateMipmaps(newTexture);

  texture.destroy();
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
  device: Device;

  private onUpdate: (didFrameChange: boolean) => void;
  private onError: (context: LoadIconErrorContext) => void;
  private _loadOptions: any = null;
  private _texture: Texture | null = null;
  private _externalTexture: Texture | null = null;
  private _mapping: IconMapping = {};
  private _samplerParameters: SamplerProps | null = null;

  /** count of pending requests to fetch icons */
  private _pendingCount: number = 0;

  private _autoPacking: boolean = false;
  private _finalized: boolean = false;
  private _textureGeneration: number = 0;

  // / internal state used for autoPacking

  private _xOffset: number = 0;
  private _yOffset: number = 0;
  private _rowHeight: number = 0;
  private _buffer: number = DEFAULT_BUFFER;
  private _canvasWidth: number = DEFAULT_CANVAS_WIDTH;
  private _canvasHeight: number = 0;
  private _canvas: HTMLCanvasElement | null = null;

  constructor(
    device: Device,
    {
      onUpdate = noop,
      onError = noop
    }: {
      /** Callback when the texture updates */
      onUpdate: (didFrameChange: boolean) => void;
      /** Callback when an error is encountered */
      onError: (context: LoadIconErrorContext) => void;
    }
  ) {
    this.device = device;
    this.onUpdate = onUpdate;
    this.onError = onError;
  }

  finalize(): void {
    if (this._finalized) {
      return;
    }
    this._finalized = true;
    const texture = this._texture;
    this._texture = null;
    this._externalTexture = null;
    this._canvas = null;
    texture?.destroy();
  }

  getTexture(): Texture | null {
    return this._texture || this._externalTexture;
  }

  getIconMapping(icon: string | UnpackedIcon): PrepackedIcon {
    const id = this._autoPacking ? getIconId(icon as UnpackedIcon) : (icon as string);
    return this._mapping[id] || MISSING_ICON;
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
    iconAtlas?: Texture | null;
    iconMapping?: IconMapping | null;
    textureParameters?: SamplerProps | null;
  }) {
    if (this._finalized) {
      return;
    }

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
      this._textureGeneration++;
      const texture = this._texture;
      this._texture = null;
      this._externalTexture = iconAtlas;
      if (texture !== iconAtlas) {
        texture?.destroy();
      }
    }

    if (textureParameters) {
      this._samplerParameters = textureParameters;
    }
  }

  get isLoaded(): boolean {
    return this._pendingCount === 0;
  }

  packIcons(data: any, getIcon: AccessorFunction<any, UnpackedIcon>): void {
    if (this._finalized || !this._autoPacking || typeof document === 'undefined') {
      return;
    }

    const textureGeneration = this._textureGeneration;
    const iconMapping = this._mapping;
    const icons = Object.values(getDiffIcons(data, getIcon, iconMapping) || {});

    // The icon accessor may update or finalize this manager.
    if (
      this._finalized ||
      !this._autoPacking ||
      textureGeneration !== this._textureGeneration ||
      iconMapping !== this._mapping ||
      this._texture?.destroyed
    ) {
      return;
    }

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
        this._texture = this.device.createTexture({
          format: 'rgba8unorm',
          data: null,
          width: this._canvasWidth,
          height: this._canvasHeight,
          sampler: this._samplerParameters || DEFAULT_SAMPLER_PARAMETERS,
          mipLevels: this.device.getMipLevelCount(this._canvasWidth, this._canvasHeight)
        });
      }

      if (this._texture.height !== this._canvasHeight) {
        this._texture = resizeTexture(
          this._texture,
          this._canvasWidth,
          this._canvasHeight,
          this._samplerParameters || DEFAULT_SAMPLER_PARAMETERS
        );
      }

      this.onUpdate(true);

      // The update callback may finalize this manager or replace its atlas or mapping.
      if (
        this._finalized ||
        textureGeneration !== this._textureGeneration ||
        mapping !== this._mapping ||
        !this._texture ||
        this._texture.destroyed
      ) {
        return;
      }

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
    const mapping = this._mapping;
    const textureGeneration = this._textureGeneration;

    // This method is only called in the auto packing case, where _canvas is defined
    const ctx = this._canvas!.getContext('2d', {
      willReadFrequently: true
    }) as CanvasRenderingContext2D;

    for (const icon of icons) {
      const id = getIconId(icon);
      const iconDef = mapping[id];
      const loadOptions = this._loadOptions;
      const getCurrentTexture = (): Texture | null => {
        const texture = this._texture;
        // Atlas growth replaces the texture without invalidating its pending icon loads.
        return !this._finalized &&
          textureGeneration === this._textureGeneration &&
          iconDef &&
          this._mapping[id] === iconDef &&
          texture &&
          !texture.destroyed
          ? texture
          : null;
      };

      if (!getCurrentTexture()) {
        continue;
      }

      this._pendingCount++;
      load(icon.url, loadOptions)
        .then(imageData => {
          const texture = getCurrentTexture();
          if (!texture) {
            return;
          }
          const {x: initialX, y: initialY, width: maxWidth, height: maxHeight} = iconDef;

          const {image, width, height} = resizeImage(
            ctx,
            imageData as ImageBitmap,
            maxWidth,
            maxHeight
          );

          const x = initialX + (maxWidth - width) / 2;
          const y = initialY + (maxHeight - height) / 2;

          texture.copyExternalImage({
            image,
            x,
            y,
            width,
            height
          });
          iconDef.x = x;
          iconDef.y = y;
          iconDef.width = width;
          iconDef.height = height;

          // Call to regenerate mipmaps after modifying texture(s)
          regenerateMipmaps(texture);

          this.onUpdate(width !== maxWidth || height !== maxHeight);
        })
        .catch(error => {
          if (!getCurrentTexture()) {
            return;
          }
          this.onError({
            url: icon.url,
            source: icon.source,
            sourceIndex: icon.sourceIndex,
            loadOptions,
            error
          });
        })
        .finally(() => {
          this._pendingCount--;
        });
    }
  }
}
