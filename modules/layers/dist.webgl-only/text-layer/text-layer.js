// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { CompositeLayer, createIterable, log } from '@deck.gl/core';
import MultiIconLayer from "./multi-icon-layer/multi-icon-layer.js";
import FontAtlasManager, { DEFAULT_FONT_SETTINGS, setFontAtlasCacheLimit } from "./font-atlas-manager.js";
import { transformParagraph, getTextFromBuffer } from "./utils.js";
import TextBackgroundLayer from "./text-background-layer/text-background-layer.js";
const TEXT_ANCHOR = {
    start: 1,
    middle: 0,
    end: -1
};
const ALIGNMENT_BASELINE = {
    top: 1,
    center: 0,
    bottom: -1
};
const DEFAULT_COLOR = [0, 0, 0, 255];
const DEFAULT_LINE_HEIGHT = 1.0;
const defaultProps = {
    billboard: true,
    sizeScale: 1,
    sizeUnits: 'pixels',
    sizeMinPixels: 0,
    sizeMaxPixels: Number.MAX_SAFE_INTEGER,
    background: false,
    getBackgroundColor: { type: 'accessor', value: [255, 255, 255, 255] },
    getBorderColor: { type: 'accessor', value: DEFAULT_COLOR },
    getBorderWidth: { type: 'accessor', value: 0 },
    backgroundBorderRadius: { type: 'object', value: 0 },
    backgroundPadding: { type: 'array', value: [0, 0, 0, 0] },
    characterSet: { type: 'object', value: DEFAULT_FONT_SETTINGS.characterSet },
    fontFamily: DEFAULT_FONT_SETTINGS.fontFamily,
    fontWeight: DEFAULT_FONT_SETTINGS.fontWeight,
    lineHeight: DEFAULT_LINE_HEIGHT,
    outlineWidth: { type: 'number', value: 0, min: 0 },
    outlineColor: { type: 'color', value: DEFAULT_COLOR },
    fontSettings: { type: 'object', value: {}, compare: 1 },
    // auto wrapping options
    wordBreak: 'break-word',
    maxWidth: { type: 'number', value: -1 },
    contentCutoffPixels: { type: 'array', value: [0, 0] },
    contentAlignHorizontal: 'none',
    contentAlignVertical: 'none',
    getText: { type: 'accessor', value: (x) => x.text },
    getPosition: { type: 'accessor', value: (x) => x.position },
    getColor: { type: 'accessor', value: DEFAULT_COLOR },
    getSize: { type: 'accessor', value: 32 },
    getAngle: { type: 'accessor', value: 0 },
    getTextAnchor: { type: 'accessor', value: 'middle' },
    getAlignmentBaseline: { type: 'accessor', value: 'center' },
    getPixelOffset: { type: 'accessor', value: [0, 0] },
    getContentBox: { type: 'accessor', value: [0, 0, -1, -1] },
    // deprecated
    backgroundColor: { deprecatedFor: ['background', 'getBackgroundColor'] }
};
/** Render text labels at given coordinates. */
class TextLayer extends CompositeLayer {
    constructor() {
        super(...arguments);
        /** Returns the x, y, width, height of each text string, relative to pixel size.
         * Used to render the background.
         */
        this.getBoundingRect = (object, objectInfo) => {
            const { size: [width, height] } = this.transformParagraph(object, objectInfo);
            const { getTextAnchor, getAlignmentBaseline } = this.props;
            const anchorX = TEXT_ANCHOR[typeof getTextAnchor === 'function' ? getTextAnchor(object, objectInfo) : getTextAnchor];
            const anchorY = ALIGNMENT_BASELINE[typeof getAlignmentBaseline === 'function'
                ? getAlignmentBaseline(object, objectInfo)
                : getAlignmentBaseline];
            return [((anchorX - 1) * width) / 2, ((anchorY - 1) * height) / 2, width, height];
        };
        /** Returns the x, y offsets of each character in a text string, in texture size.
         * Used to layout characters in the vertex shader.
         */
        this.getIconOffsets = (object, objectInfo) => {
            const { getTextAnchor, getAlignmentBaseline } = this.props;
            const { x, y, rowWidth, size: [, height] } = this.transformParagraph(object, objectInfo);
            const anchorX = TEXT_ANCHOR[typeof getTextAnchor === 'function' ? getTextAnchor(object, objectInfo) : getTextAnchor];
            const anchorY = ALIGNMENT_BASELINE[typeof getAlignmentBaseline === 'function'
                ? getAlignmentBaseline(object, objectInfo)
                : getAlignmentBaseline];
            const numCharacters = x.length;
            const offsets = new Array(numCharacters * 2);
            let index = 0;
            for (let i = 0; i < numCharacters; i++) {
                // For a multi-line object, offset in x-direction needs consider
                // the row offset in the paragraph and the object offset in the row
                offsets[index++] = ((anchorX - 1) * rowWidth[i]) / 2 + x[i];
                offsets[index++] = ((anchorY - 1) * height) / 2 + y[i];
            }
            return offsets;
        };
    }
    initializeState() {
        this.state = {
            styleVersion: 0,
            fontAtlasManager: new FontAtlasManager()
        };
        // Breaking change in v8.9
        if (this.props.maxWidth > 0) {
            log.once(1, 'v8.9 breaking change: TextLayer maxWidth is now relative to text size')();
        }
    }
    // eslint-disable-next-line complexity
    updateState(params) {
        const { props, oldProps, changeFlags } = params;
        const textChanged = changeFlags.dataChanged ||
            (changeFlags.updateTriggersChanged &&
                (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getText));
        if (textChanged) {
            this._updateText();
        }
        const fontChanged = this._updateFontAtlas();
        const styleChanged = fontChanged ||
            props.lineHeight !== oldProps.lineHeight ||
            props.wordBreak !== oldProps.wordBreak ||
            props.maxWidth !== oldProps.maxWidth;
        if (styleChanged) {
            this.setState({
                styleVersion: this.state.styleVersion + 1
            });
        }
    }
    getPickingInfo({ info }) {
        // because `TextLayer` assign the same pickingInfoIndex for one text label,
        // here info.index refers the index of text label in props.data
        info.object = info.index >= 0 ? this.props.data[info.index] : null;
        return info;
    }
    /** Returns true if font has changed */
    _updateFontAtlas() {
        const { fontSettings, fontFamily, fontWeight, _getFontRenderer } = this.props;
        const { fontAtlasManager, characterSet } = this.state;
        const fontProps = {
            ...fontSettings,
            characterSet,
            fontFamily,
            fontWeight,
            _getFontRenderer
        };
        if (!fontAtlasManager.mapping) {
            // This is the first update
            fontAtlasManager.setProps(fontProps);
            return true;
        }
        for (const key in fontProps) {
            if (fontProps[key] !== fontAtlasManager.props[key]) {
                fontAtlasManager.setProps(fontProps);
                return true;
            }
        }
        return false;
    }
    // Text strings are variable width objects
    // Count characters and start offsets
    _updateText() {
        const { data, characterSet } = this.props;
        const textBuffer = data.attributes?.getText;
        let { getText } = this.props;
        let startIndices = data.startIndices;
        let numInstances;
        const autoCharacterSet = characterSet === 'auto' && new Set();
        if (textBuffer && startIndices) {
            const { texts, characterCount } = getTextFromBuffer({
                ...(ArrayBuffer.isView(textBuffer) ? { value: textBuffer } : textBuffer),
                // @ts-ignore if data.attribute is defined then length is expected
                length: data.length,
                startIndices,
                characterSet: autoCharacterSet
            });
            numInstances = characterCount;
            getText = (_, { index }) => texts[index];
        }
        else {
            const { iterable, objectInfo } = createIterable(data);
            startIndices = [0];
            numInstances = 0;
            for (const object of iterable) {
                objectInfo.index++;
                // Break into an array of characters
                // When dealing with double-length unicode characters, `str.length` or `str[i]` do not work
                const text = Array.from(getText(object, objectInfo) || '');
                if (autoCharacterSet) {
                    // eslint-disable-next-line @typescript-eslint/unbound-method
                    text.forEach(autoCharacterSet.add, autoCharacterSet);
                }
                numInstances += text.length;
                startIndices.push(numInstances);
            }
        }
        this.setState({
            getText,
            startIndices,
            numInstances,
            characterSet: autoCharacterSet || characterSet
        });
    }
    /** There are two size systems in this layer:
  
      + Pixel size: user-specified text size, via getSize, sizeScale, sizeUnits etc.
        The layer roughly matches the output of the layer to CSS pixels, e.g. getSize: 12, sizeScale: 2
        in layer props is roughly equivalent to font-size: 24px in CSS.
      + Texture size: internally, character positions in a text blob are calculated using the sizes of iconMapping,
        which depends on how large each character is drawn into the font atlas. This is controlled by
        fontSettings.fontSize (default 64) and most users do not set it manually.
        These numbers are intended to be used in the vertex shader and never to be exposed to the end user.
  
      All surfaces exposed to the user should either use the pixel size or a multiplier relative to the pixel size. */
    /** Calculate the size and position of each character in a text string.
     * Values are in texture size */
    transformParagraph(object, objectInfo) {
        const { fontAtlasManager } = this.state;
        const iconMapping = fontAtlasManager.mapping;
        const { baselineOffset } = fontAtlasManager.atlas;
        const { fontSize } = fontAtlasManager.props;
        const getText = this.state.getText;
        const { wordBreak, lineHeight, maxWidth } = this.props;
        const paragraph = getText(object, objectInfo) || '';
        return transformParagraph(paragraph, baselineOffset, lineHeight * fontSize, wordBreak, maxWidth * fontSize, iconMapping);
    }
    renderLayers() {
        const { startIndices, numInstances, getText, fontAtlasManager: { atlas, mapping }, styleVersion } = this.state;
        const { data, _dataDiff, getPosition, getColor, getSize, getAngle, getPixelOffset, getBackgroundColor, getBorderColor, getBorderWidth, getContentBox, backgroundBorderRadius, backgroundPadding, background, billboard, fontSettings, outlineWidth, outlineColor, sizeScale, sizeUnits, sizeMinPixels, sizeMaxPixels, contentCutoffPixels, contentAlignHorizontal, contentAlignVertical, transitions, updateTriggers } = this.props;
        const CharactersLayerClass = this.getSubLayerClass('characters', MultiIconLayer);
        const BackgroundLayerClass = this.getSubLayerClass('background', TextBackgroundLayer);
        const { fontSize } = this.state.fontAtlasManager.props;
        return [
            background &&
                new BackgroundLayerClass({
                    // background props
                    getFillColor: getBackgroundColor,
                    getLineColor: getBorderColor,
                    getLineWidth: getBorderWidth,
                    borderRadius: backgroundBorderRadius,
                    padding: backgroundPadding,
                    // props shared with characters layer
                    getPosition,
                    getSize,
                    getAngle,
                    getPixelOffset,
                    getClipRect: getContentBox,
                    billboard,
                    sizeScale,
                    sizeUnits,
                    sizeMinPixels,
                    sizeMaxPixels,
                    fontSize,
                    transitions: transitions && {
                        getPosition: transitions.getPosition,
                        getAngle: transitions.getAngle,
                        getSize: transitions.getSize,
                        getFillColor: transitions.getBackgroundColor,
                        getLineColor: transitions.getBorderColor,
                        getLineWidth: transitions.getBorderWidth,
                        getPixelOffset: transitions.getPixelOffset
                    }
                }, this.getSubLayerProps({
                    id: 'background',
                    updateTriggers: {
                        getPosition: updateTriggers.getPosition,
                        getAngle: updateTriggers.getAngle,
                        getSize: updateTriggers.getSize,
                        getFillColor: updateTriggers.getBackgroundColor,
                        getLineColor: updateTriggers.getBorderColor,
                        getLineWidth: updateTriggers.getBorderWidth,
                        getPixelOffset: updateTriggers.getPixelOffset,
                        getBoundingRect: {
                            getText: updateTriggers.getText,
                            getTextAnchor: updateTriggers.getTextAnchor,
                            getAlignmentBaseline: updateTriggers.getAlignmentBaseline,
                            styleVersion
                        }
                    }
                }), {
                    data: 
                    // @ts-ignore (2339) attribute is not defined on all data types
                    data.attributes && data.attributes.background
                        ? // @ts-ignore (2339) attribute is not defined on all data types
                            { length: data.length, attributes: data.attributes.background }
                        : data,
                    _dataDiff,
                    // Maintain the same background behavior as <=8.3. Remove in v9?
                    autoHighlight: false,
                    getBoundingRect: this.getBoundingRect
                }),
            new CharactersLayerClass({
                sdf: fontSettings.sdf,
                smoothing: Number.isFinite(fontSettings.smoothing)
                    ? fontSettings.smoothing
                    : DEFAULT_FONT_SETTINGS.smoothing,
                outlineWidth: outlineWidth / (fontSettings.radius || DEFAULT_FONT_SETTINGS.radius),
                outlineColor,
                iconAtlas: atlas,
                iconMapping: mapping,
                getPosition,
                getColor,
                getSize,
                getAngle,
                getPixelOffset,
                getContentBox,
                billboard,
                sizeScale,
                sizeUnits,
                sizeMinPixels,
                sizeMaxPixels,
                fontSize,
                contentCutoffPixels,
                contentAlignHorizontal,
                contentAlignVertical,
                transitions: transitions && {
                    getPosition: transitions.getPosition,
                    getAngle: transitions.getAngle,
                    getColor: transitions.getColor,
                    getSize: transitions.getSize,
                    getPixelOffset: transitions.getPixelOffset,
                    getContentBox: transitions.getContentBox
                }
            }, this.getSubLayerProps({
                id: 'characters',
                updateTriggers: {
                    all: updateTriggers.getText,
                    getPosition: updateTriggers.getPosition,
                    getAngle: updateTriggers.getAngle,
                    getColor: updateTriggers.getColor,
                    getSize: updateTriggers.getSize,
                    getPixelOffset: updateTriggers.getPixelOffset,
                    getContentBox: updateTriggers.getContentBox,
                    getIconOffsets: {
                        getTextAnchor: updateTriggers.getTextAnchor,
                        getAlignmentBaseline: updateTriggers.getAlignmentBaseline,
                        styleVersion
                    }
                }
            }), {
                data,
                _dataDiff,
                startIndices,
                numInstances,
                getIconOffsets: this.getIconOffsets,
                getIcon: getText
            })
        ];
    }
    static set fontAtlasCacheLimit(limit) {
        setFontAtlasCacheLimit(limit);
    }
}
TextLayer.defaultProps = defaultProps;
TextLayer.layerName = 'TextLayer';
export default TextLayer;
//# sourceMappingURL=text-layer.js.map