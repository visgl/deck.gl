// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
import TinySDF from '@mapbox/tiny-sdf';

import {log} from '@deck.gl/core';

import {buildMapping, CharacterMapping} from './utils';
import LRUCache from './lru-cache';

// import type {Texture} from '@deck.gl/core';

function getDefaultCharacterSet() {
  const charSet: string[] = [];
  for (let i = 32; i < 128; i++) {
    charSet.push(String.fromCharCode(i));
  }
  return charSet;
}

export interface FontRenderer {
  /**
   * Measure the dimensions of a given character. If no parameter is passed, returns the bounding metrics of the font.
   *
   * Returned metrics:
   * - `advance`: horizontal distance to move the cursor before placing the next glyph, in pixels.
   * - `width`: width of the visible glyph bounds, in pixels.
   * - `ascent`: distance from the baseline to the top of the glyph, in pixels.
   * - `descent`: distance from the baseline to the bottom of the glyph, in pixels.
   */
  measure(char?: string): {
    advance: number;
    width: number;
    ascent: number;
    descent: number;
  };
  /**
   * Render the given character to an image.
   *
   * Returned image data:
   * - `data`: rasterized glyph pixels.
   * - `left`: x offset from the glyph origin to the left edge of `data`, in pixels. Default `0`.
   * - `top`: y offset from the glyph origin to the top edge of `data`, in pixels. Default `0`.
   */
  draw(char: string): {
    data: ImageData;
    left?: number;
    top?: number;
  };
}

export type FontSettings = {
  /** CSS font family
   * @default 'Monaco, monospace'
   */
  fontFamily?: string;
  /** CSS font weight
   * @default 'normal'
   */
  fontWeight?: string | number;
  /** Specifies a list of characters to include in the font.
   * @default (ASCII characters 32-128)
   */
  characterSet?: Set<string> | string[] | string;
  /** Font size in pixels. This option is only applied for generating `fontAtlas`, it does not impact the size of displayed text labels. Larger `fontSize` will give you a sharper look when rendering text labels with very large font sizes. But larger `fontSize` requires more time and space to generate the `fontAtlas`.
   * @default 64
   */
  fontSize?: number;
  /** Whitespace buffer around each side of the character. In general, bigger `fontSize` requires bigger `buffer`. Increase `buffer` will add more space between each character when layout `characterSet` in `fontAtlas`. This option could be tuned to provide sufficient space for drawing each character and avoiding overlapping of neighboring characters.
   * @default 4
   */
  buffer?: number;
  /** Flag to enable / disable `sdf`. [`sdf` (Signed Distance Fields)](http://cs.brown.edu/people/pfelzens/papers/dt-final.pdf) will provide a sharper look when rendering with very large or small font sizes. `TextLayer` integrates with [`TinySDF`](https://github.com/mapbox/tiny-sdf) which implements the `sdf` algorithm.
   * @default false
   */
  sdf?: boolean;
  /** How much of the radius (relative) is used for the inside part the glyph. Bigger `cutoff` makes character thinner. Smaller `cutoff` makes character look thicker. Only applies when `sdf: true`.
   * @default 0.25
   */
  cutoff?: number;
  /** How many pixels around the glyph shape to use for encoding distance. Bigger radius yields higher quality outcome. Only applies when `sdf: true`.
   * @default 12
   */
  radius?: number;
  /** How much smoothing to apply to the text edges. Only applies when `sdf: true`.
   * @default 0.1
   */
  smoothing?: number;
};

export const DEFAULT_FONT_SETTINGS: Required<FontSettings> = {
  fontFamily: 'Monaco, monospace',
  fontWeight: 'normal',
  characterSet: getDefaultCharacterSet(),
  fontSize: 64,
  buffer: 4,
  sdf: false,
  cutoff: 0.25,
  radius: 12,
  smoothing: 0.1
};

const MAX_CANVAS_WIDTH = 1024;

const DEFAULT_ASCENT = 0.9;
const DEFAULT_DESCENT = 0.3;

// only preserve latest three fontAtlas
const CACHE_LIMIT = 3;

type FontAtlas = {
  baselineOffset: number;
  /** x position of last character in mapping */
  xOffset: number;
  /** y position of last character in mapping */
  yOffsetMin: number;
  /** bottom position of any character in mapping */
  yOffsetMax: number;
  /** bounding box of each character in the texture */
  mapping: CharacterMapping;
  /** packed texture */
  data: HTMLCanvasElement;
  /** texture width */
  width: number;
  /** texture height */
  height: number;
};

let cache = new LRUCache<FontAtlas>(CACHE_LIMIT);

/**
 * get all the chars not in cache
 * @returns chars not in cache
 */
function getNewChars(cacheKey: string, characterSet: Set<string> | string[] | string): Set<string> {
  let newCharSet: Set<string>;
  if (typeof characterSet === 'string') {
    newCharSet = new Set(Array.from(characterSet));
  } else {
    newCharSet = new Set(characterSet);
  }

  const cachedFontAtlas = cache.get(cacheKey);
  if (!cachedFontAtlas) {
    return newCharSet;
  }

  for (const char in cachedFontAtlas.mapping) {
    if (newCharSet.has(char)) {
      newCharSet.delete(char);
    }
  }
  return newCharSet;
}

function populateAlphaChannel(
  alphaChannel: Uint8ClampedArray | Uint8Array,
  imageData: ImageData
): void {
  // populate distance value from tinySDF to image alpha channel
  for (let i = 0; i < alphaChannel.length; i++) {
    imageData.data[4 * i + 3] = alphaChannel[i];
  }
}

function setTextStyle(
  ctx: CanvasRenderingContext2D,
  fontFamily: string,
  fontSize: number,
  fontWeight: string | number
): void {
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = '#000';
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
}

function measureText(
  ctx: CanvasRenderingContext2D,
  fontSize: number,
  char: string | undefined
): {advance: number; width: number; ascent: number; descent: number} {
  if (char === undefined) {
    const fontMetrics = ctx.measureText('A');
    if (fontMetrics.fontBoundingBoxAscent) {
      return {
        advance: 0,
        width: 0,
        ascent: Math.ceil(fontMetrics.fontBoundingBoxAscent),
        descent: Math.ceil(fontMetrics.fontBoundingBoxDescent)
      };
    }
    return {
      advance: 0,
      width: 0,
      ascent: fontSize * DEFAULT_ASCENT,
      descent: fontSize * DEFAULT_DESCENT
    };
  }

  const metrics = ctx.measureText(char);
  if (!metrics.actualBoundingBoxAscent) {
    // TextMetrics not fully supported
    return {
      advance: metrics.width,
      width: metrics.width,
      ascent: fontSize * DEFAULT_ASCENT,
      descent: fontSize * DEFAULT_DESCENT
    };
  }
  return {
    advance: metrics.width,
    width: Math.ceil(metrics.actualBoundingBoxRight - metrics.actualBoundingBoxLeft),
    ascent: Math.ceil(metrics.actualBoundingBoxAscent),
    descent: Math.ceil(metrics.actualBoundingBoxDescent)
  };
}

/**
 * Sets the Font Atlas LRU Cache Limit
 * @param {number} limit LRU Cache limit
 */
export function setFontAtlasCacheLimit(limit: number): void {
  log.assert(Number.isFinite(limit) && limit >= CACHE_LIMIT, 'Invalid cache limit');

  cache = new LRUCache(limit);
}

export default class FontAtlasManager {
  /** Font settings */
  props: Required<FontSettings> = {...DEFAULT_FONT_SETTINGS};

  /** Cache key of the current font atlas */
  private _key?: string;
  /** The current font atlas */
  private _atlas?: FontAtlas;

  private _getFontRenderer?: (settings: Required<FontSettings>) => FontRenderer;

  get atlas(): Readonly<FontAtlas> | undefined {
    return this._atlas;
  }

  // TODO - cut during v9 porting as types reveal this is not correct
  // get texture(): Texture | undefined {
  //   return this._atlas;
  // }

  get mapping(): CharacterMapping | undefined {
    return this._atlas && this._atlas.mapping;
  }

  setProps(
    props: FontSettings & {
      _getFontRenderer?: (settings: Required<FontSettings>) => FontRenderer;
    } = {}
  ) {
    Object.assign(this.props, props);
    if (props._getFontRenderer) {
      this._getFontRenderer = props._getFontRenderer;
    }

    // update cache key
    this._key = this._getKey();

    const charSet = getNewChars(this._key, this.props.characterSet);
    const cachedFontAtlas = cache.get(this._key);

    // if a fontAtlas associated with the new settings is cached and
    // there are no new chars
    if (cachedFontAtlas && charSet.size === 0) {
      // update texture with cached fontAtlas
      if (this._atlas !== cachedFontAtlas) {
        this._atlas = cachedFontAtlas;
      }
      return;
    }

    // update fontAtlas with new settings
    const fontAtlas = this._generateFontAtlas(charSet, cachedFontAtlas);
    this._atlas = fontAtlas;

    // update cache
    cache.set(this._key, fontAtlas);
  }

  // eslint-disable-next-line max-statements
  private _generateFontAtlas(characterSet: Set<string>, cachedFontAtlas?: FontAtlas): FontAtlas {
    const {fontFamily, fontWeight, fontSize, buffer, sdf, radius, cutoff} = this.props;
    let canvas = cachedFontAtlas && cachedFontAtlas.data;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.width = MAX_CANVAS_WIDTH;
    }
    const ctx = canvas.getContext('2d', {willReadFrequently: true})!;
    setTextStyle(ctx, fontFamily, fontSize, fontWeight);
    const defaultMeasure = (char?: string) => measureText(ctx, fontSize, char);

    let renderer: FontRenderer | undefined;
    if (this._getFontRenderer) {
      renderer = this._getFontRenderer(this.props);
    } else if (sdf) {
      renderer = {
        measure: defaultMeasure,
        draw: getSdfFontRenderer(this.props)
      };
    }

    // 1. build mapping
    const {mapping, canvasHeight, xOffset, yOffsetMin, yOffsetMax} = buildMapping({
      measureText: char => (renderer ? renderer.measure(char) : defaultMeasure(char)),
      buffer,
      characterSet,
      maxCanvasWidth: MAX_CANVAS_WIDTH,
      ...(cachedFontAtlas && {
        mapping: cachedFontAtlas.mapping,
        xOffset: cachedFontAtlas.xOffset,
        yOffsetMin: cachedFontAtlas.yOffsetMin,
        yOffsetMax: cachedFontAtlas.yOffsetMax
      })
    });

    // 2. update canvas
    // copy old canvas data to new canvas only when height changed
    if (canvas.height !== canvasHeight) {
      const imageData =
        canvas.height > 0 ? ctx.getImageData(0, 0, canvas.width, canvas.height) : null;
      canvas.height = canvasHeight;
      if (imageData) {
        ctx.putImageData(imageData, 0, 0);
      }
    }
    setTextStyle(ctx, fontFamily, fontSize, fontWeight);

    // 3. layout characters
    if (renderer) {
      for (const char of characterSet) {
        const frame = mapping[char];
        const {data, left = 0, top = 0} = renderer.draw(char);
        const x = frame.x - left;
        const y = frame.y - top;
        // snap origin to the nearest pixel
        const x0 = Math.max(0, Math.round(x));
        const y0 = Math.max(0, Math.round(y));
        const w = Math.min(data.width, canvas.width - x0);
        const h = Math.min(data.height, canvas.height - y0);
        ctx.putImageData(data, x0, y0, 0, 0, w, h);

        frame.x += x0 - x;
        frame.y += y0 - y;
      }
    } else {
      for (const char of characterSet) {
        const frame = mapping[char];
        ctx.fillText(char, frame.x, frame.y + frame.anchorY);
      }
    }

    const fontMetrics = renderer ? renderer.measure() : defaultMeasure();

    return {
      baselineOffset: (fontMetrics.ascent - fontMetrics.descent) / 2,
      xOffset,
      yOffsetMin,
      yOffsetMax,
      mapping,
      data: canvas,
      width: canvas.width,
      height: canvas.height
    };
  }

  private _getKey(): string {
    const {fontFamily, fontWeight, fontSize, buffer, sdf, radius, cutoff} = this.props;
    if (sdf) {
      return `${fontFamily} ${fontWeight} ${fontSize} ${buffer} ${radius} ${cutoff}`;
    }
    return `${fontFamily} ${fontWeight} ${fontSize} ${buffer}`;
  }
}

function getSdfFontRenderer({
  fontSize,
  buffer,
  radius,
  cutoff,
  fontFamily,
  fontWeight
}: Required<FontSettings>): FontRenderer['draw'] {
  const tinySDF = new TinySDF({
    fontSize,
    buffer,
    radius,
    cutoff,
    fontFamily,
    fontWeight: `${fontWeight}`
  });

  return (char: string) => {
    const {data, width, height} = tinySDF.draw(char);
    const imageData = new ImageData(width, height);
    populateAlphaChannel(data, imageData);
    return {data: imageData, left: buffer, top: buffer};
  };
}
