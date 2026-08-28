// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
/* global document */
import TinySDF from '@mapbox/tiny-sdf';
import { log } from '@deck.gl/core';
import { buildMapping } from "./utils.js";
import LRUCache from "./lru-cache.js";
// import type {Texture} from '@deck.gl/core';
function getDefaultCharacterSet() {
    const charSet = [];
    for (let i = 32; i < 128; i++) {
        charSet.push(String.fromCharCode(i));
    }
    return charSet;
}
export const DEFAULT_FONT_SETTINGS = {
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
let cache = new LRUCache(CACHE_LIMIT);
/**
 * get all the chars not in cache
 * @returns chars not in cache
 */
function getNewChars(cacheKey, characterSet) {
    let newCharSet;
    if (typeof characterSet === 'string') {
        newCharSet = new Set(Array.from(characterSet));
    }
    else {
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
function populateAlphaChannel(alphaChannel, imageData) {
    // populate distance value from tinySDF to image alpha channel
    for (let i = 0; i < alphaChannel.length; i++) {
        imageData.data[4 * i + 3] = alphaChannel[i];
    }
}
function setTextStyle(ctx, fontFamily, fontSize, fontWeight) {
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = '#000';
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
}
function measureText(ctx, fontSize, char) {
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
export function setFontAtlasCacheLimit(limit) {
    log.assert(Number.isFinite(limit) && limit >= CACHE_LIMIT, 'Invalid cache limit');
    cache = new LRUCache(limit);
}
export default class FontAtlasManager {
    constructor() {
        /** Font settings */
        this.props = { ...DEFAULT_FONT_SETTINGS };
    }
    get atlas() {
        return this._atlas;
    }
    // TODO - cut during v9 porting as types reveal this is not correct
    // get texture(): Texture | undefined {
    //   return this._atlas;
    // }
    get mapping() {
        return this._atlas && this._atlas.mapping;
    }
    setProps(props = {}) {
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
    _generateFontAtlas(characterSet, cachedFontAtlas) {
        const { fontFamily, fontWeight, fontSize, buffer, sdf, radius, cutoff } = this.props;
        let canvas = cachedFontAtlas && cachedFontAtlas.data;
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.width = MAX_CANVAS_WIDTH;
        }
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        setTextStyle(ctx, fontFamily, fontSize, fontWeight);
        const defaultMeasure = (char) => measureText(ctx, fontSize, char);
        let renderer;
        if (this._getFontRenderer) {
            renderer = this._getFontRenderer(this.props);
        }
        else if (sdf) {
            renderer = {
                measure: defaultMeasure,
                draw: getSdfFontRenderer(this.props)
            };
        }
        // 1. build mapping
        const { mapping, canvasHeight, xOffset, yOffsetMin, yOffsetMax } = buildMapping({
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
            const imageData = canvas.height > 0 ? ctx.getImageData(0, 0, canvas.width, canvas.height) : null;
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
                const measuredWidth = frame.width;
                const { data, left = 0, top = 0 } = renderer.draw(char);
                const x = frame.x - left;
                const y = frame.y - top;
                // snap origin to the nearest pixel
                const x0 = Math.max(0, Math.round(x));
                const y0 = Math.max(0, Math.round(y));
                const w = Math.min(data.width, canvas.width - x0);
                const h = Math.min(data.height, canvas.height - y0);
                ctx.putImageData(data, x0, y0, 0, 0, w, h);
                // The rendered image may extend beyond the measured glyph bounds, e.g. an SDF halo.
                // Use the entire copied image as the icon frame while preserving its layout position.
                frame.x = x0;
                frame.y = y0;
                frame.width = w;
                frame.height = h;
                frame.anchorX += w / 2 - left - measuredWidth / 2;
                frame.anchorY += top;
            }
        }
        else {
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
    _getKey() {
        const { fontFamily, fontWeight, fontSize, buffer, sdf, radius, cutoff } = this.props;
        if (sdf) {
            return `${fontFamily} ${fontWeight} ${fontSize} ${buffer} ${radius} ${cutoff}`;
        }
        return `${fontFamily} ${fontWeight} ${fontSize} ${buffer}`;
    }
}
function getSdfFontRenderer({ fontSize, buffer, radius, cutoff, fontFamily, fontWeight }) {
    const tinySDF = new TinySDF({
        fontSize,
        buffer,
        radius,
        cutoff,
        fontFamily,
        fontWeight: `${fontWeight}`
    });
    return (char) => {
        const { data, width, height } = tinySDF.draw(char);
        const imageData = new ImageData(width, height);
        populateAlphaChannel(data, imageData);
        return { data: imageData, left: buffer, top: buffer };
    };
}
//# sourceMappingURL=font-atlas-manager.js.map