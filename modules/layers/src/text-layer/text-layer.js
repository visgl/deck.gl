// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import {CompositeLayer, createIterable} from '@deck.gl/core';
import MultiIconLayer from './multi-icon-layer/multi-icon-layer';
import FontAtlasManager, {
  DEFAULT_CHAR_SET,
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_WEIGHT,
  DEFAULT_FONT_SIZE,
  DEFAULT_BUFFER,
  DEFAULT_RADIUS,
  DEFAULT_CUTOFF
} from './font-atlas-manager';
import {transformParagraph, getTextFromBuffer} from './utils';

import TextBackgroundLayer from './text-background-layer/text-background-layer';

const DEFAULT_FONT_SETTINGS = {
  fontSize: DEFAULT_FONT_SIZE,
  buffer: DEFAULT_BUFFER,
  sdf: false,
  radius: DEFAULT_RADIUS,
  cutoff: DEFAULT_CUTOFF,
  smoothing: 0.1
};

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

const FONT_SETTINGS_PROPS = ['fontSize', 'buffer', 'sdf', 'radius', 'cutoff'];

const defaultProps = {
  billboard: true,
  sizeScale: 1,
  sizeUnits: 'pixels',
  sizeMinPixels: 0,
  sizeMaxPixels: Number.MAX_SAFE_INTEGER,

  background: false,
  getBackgroundColor: {type: 'accessor', value: [255, 255, 255, 255]},
  getBorderColor: {type: 'accessor', value: DEFAULT_COLOR},
  getBorderWidth: {type: 'accessor', value: 0},
  backgroundPadding: {type: 'array', value: [0, 0, 0, 0]},

  characterSet: {type: 'object', value: DEFAULT_CHAR_SET},
  fontFamily: DEFAULT_FONT_FAMILY,
  fontWeight: DEFAULT_FONT_WEIGHT,
  lineHeight: DEFAULT_LINE_HEIGHT,
  outlineWidth: {type: 'number', value: 0, min: 0},
  outlineColor: {type: 'color', value: DEFAULT_COLOR},
  fontSettings: {},

  // auto wrapping options
  wordBreak: 'break-word',
  maxWidth: {type: 'number', value: -1},

  getText: {type: 'accessor', value: x => x.text},
  getPosition: {type: 'accessor', value: x => x.position},
  getColor: {type: 'accessor', value: DEFAULT_COLOR},
  getSize: {type: 'accessor', value: 32},
  getAngle: {type: 'accessor', value: 0},
  getTextAnchor: {type: 'accessor', value: 'middle'},
  getAlignmentBaseline: {type: 'accessor', value: 'center'},
  getPixelOffset: {type: 'accessor', value: [0, 0]},

  // deprecated
  backgroundColor: {deprecatedFor: ['background', 'getBackgroundColor']}
};

export default class TextLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      styleVersion: 0,
      fontAtlasManager: new FontAtlasManager()
    };
  }

  // eslint-disable-next-line complexity
  updateState({props, oldProps, changeFlags}) {
    const textChanged =
      changeFlags.dataChanged ||
      (changeFlags.updateTriggersChanged &&
        (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getText));
    const oldCharacterSet = this.state.characterSet;

    if (textChanged) {
      this._updateText();
    }

    const fontChanged =
      oldCharacterSet !== this.state.characterSet || this._fontChanged(oldProps, props);

    if (fontChanged) {
      this._updateFontAtlas(oldProps, props);
    }

    const styleChanged =
      fontChanged ||
      props.lineHeight !== oldProps.lineHeight ||
      props.wordBreak !== oldProps.wordBreak ||
      props.maxWidth !== oldProps.maxWidth;

    if (styleChanged) {
      this.setState({
        styleVersion: this.state.styleVersion + 1
      });
    }
  }

  getPickingInfo({info}) {
    // because `TextLayer` assign the same pickingInfoIndex for one text label,
    // here info.index refers the index of text label in props.data
    info.object = info.index >= 0 ? this.props.data[info.index] : null;
    return info;
  }

  _updateFontAtlas(oldProps, props) {
    const {fontSettings, fontFamily, fontWeight} = props;

    // generate test characterSet
    const {fontAtlasManager, characterSet} = this.state;
    fontAtlasManager.setProps({
      ...DEFAULT_FONT_SETTINGS,
      ...fontSettings,
      characterSet,
      fontFamily,
      fontWeight
    });
  }

  _fontChanged(oldProps, props) {
    if (oldProps.fontFamily !== props.fontFamily || oldProps.fontWeight !== props.fontWeight) {
      return true;
    }

    if (oldProps.fontSettings === props.fontSettings) {
      return false;
    }

    const oldFontSettings = oldProps.fontSettings || {};
    const fontSettings = props.fontSettings || {};

    return FONT_SETTINGS_PROPS.some(prop => oldFontSettings[prop] !== fontSettings[prop]);
  }

  // Text strings are variable width objects
  // Count characters and start offsets
  _updateText() {
    const {data, characterSet} = this.props;
    const textBuffer = data.attributes && data.attributes.getText;
    let {getText} = this.props;
    let {startIndices} = data;
    let numInstances;

    const autoCharacterSet = characterSet === 'auto' && new Set();

    if (textBuffer && startIndices) {
      const {texts, characterCount} = getTextFromBuffer({
        ...(ArrayBuffer.isView(textBuffer) ? {value: textBuffer} : textBuffer),
        length: data.length,
        startIndices,
        characterSet: autoCharacterSet
      });
      numInstances = characterCount;
      getText = (_, {index}) => texts[index];
    } else {
      const {iterable, objectInfo} = createIterable(data);
      startIndices = [0];
      numInstances = 0;

      for (const object of iterable) {
        objectInfo.index++;
        // Break into an array of characters
        // When dealing with double-length unicode characters, `str.length` or `str[i]` do not work
        const text = Array.from(getText(object, objectInfo) || '');
        if (autoCharacterSet) {
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

  // Returns the x, y offsets of each character in a text string
  getBoundingRect(object, objectInfo) {
    const iconMapping = this.state.fontAtlasManager.mapping;
    const {getText} = this.state;
    const {wordBreak, maxWidth, lineHeight, getTextAnchor, getAlignmentBaseline} = this.props;

    const paragraph = getText(object, objectInfo) || '';
    const {
      size: [width, height]
    } = transformParagraph(paragraph, lineHeight, wordBreak, maxWidth, iconMapping);
    const anchorX =
      TEXT_ANCHOR[
        typeof getTextAnchor === 'function' ? getTextAnchor(object, objectInfo) : getTextAnchor
      ];
    const anchorY =
      ALIGNMENT_BASELINE[
        typeof getAlignmentBaseline === 'function'
          ? getAlignmentBaseline(object, objectInfo)
          : getAlignmentBaseline
      ];

    return [((anchorX - 1) * width) / 2, ((anchorY - 1) * height) / 2, width, height];
  }

  // Returns the x, y, w, h of each text object
  getIconOffsets(object, objectInfo) {
    const iconMapping = this.state.fontAtlasManager.mapping;
    const {getText} = this.state;
    const {wordBreak, maxWidth, lineHeight, getTextAnchor, getAlignmentBaseline} = this.props;

    const paragraph = getText(object, objectInfo) || '';
    const {
      x,
      y,
      rowWidth,
      size: [width, height]
    } = transformParagraph(paragraph, lineHeight, wordBreak, maxWidth, iconMapping);
    const anchorX =
      TEXT_ANCHOR[
        typeof getTextAnchor === 'function' ? getTextAnchor(object, objectInfo) : getTextAnchor
      ];
    const anchorY =
      ALIGNMENT_BASELINE[
        typeof getAlignmentBaseline === 'function'
          ? getAlignmentBaseline(object, objectInfo)
          : getAlignmentBaseline
      ];

    const numCharacters = x.length;
    const offsets = new Array(numCharacters * 2);
    let index = 0;

    for (let i = 0; i < numCharacters; i++) {
      // For a multi-line object, offset in x-direction needs consider
      // the row offset in the paragraph and the object offset in the row
      const rowOffset = ((1 - anchorX) * (width - rowWidth[i])) / 2;
      offsets[index++] = ((anchorX - 1) * width) / 2 + rowOffset + x[i];
      offsets[index++] = ((anchorY - 1) * height) / 2 + y[i];
    }
    return offsets;
  }

  renderLayers() {
    const {
      startIndices,
      numInstances,
      getText,
      fontAtlasManager: {scale, texture, mapping},
      styleVersion
    } = this.state;

    const {
      data,
      _dataDiff,
      getPosition,
      getColor,
      getSize,
      getAngle,
      getPixelOffset,
      getBackgroundColor,
      getBorderColor,
      getBorderWidth,
      backgroundPadding,
      background,
      billboard,
      fontSettings,
      outlineWidth,
      outlineColor,
      sizeScale,
      sizeUnits,
      sizeMinPixels,
      sizeMaxPixels,
      transitions,
      updateTriggers
    } = this.props;

    const CharactersLayerClass = this.getSubLayerClass('characters', MultiIconLayer);
    const BackgroundLayerClass = this.getSubLayerClass('background', TextBackgroundLayer);

    return [
      background &&
        new BackgroundLayerClass(
          {
            // background props
            getFillColor: getBackgroundColor,
            getLineColor: getBorderColor,
            getLineWidth: getBorderWidth,
            padding: backgroundPadding,

            // props shared with characters layer
            getPosition,
            getSize,
            getAngle,
            getPixelOffset,
            billboard,
            sizeScale: sizeScale / this.state.fontAtlasManager.props.fontSize,
            sizeUnits,
            sizeMinPixels,
            sizeMaxPixels,

            transitions: transitions && {
              getPosition: transitions.getPosition,
              getAngle: transitions.getAngle,
              getSize: transitions.getSize,
              getFillColor: transitions.getBackgroundColor,
              getLineColor: transitions.getBorderColor,
              getLineWidth: transitions.getBorderWidth,
              getPixelOffset: transitions.getPixelOffset
            }
          },
          this.getSubLayerProps({
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
          }),
          {
            data: data.attributes
              ? {length: data.length, attributes: data.attributes.background || {}}
              : data,
            _dataDiff,
            // Maintain the same background behavior as <=8.3. Remove in v9?
            autoHighlight: false,
            getBoundingRect: this.getBoundingRect.bind(this)
          }
        ),
      new CharactersLayerClass(
        {
          sdf: fontSettings.sdf,
          smoothing: Number.isFinite(fontSettings.smoothing)
            ? fontSettings.smoothing
            : DEFAULT_FONT_SETTINGS.smoothing,
          outlineWidth,
          outlineColor,
          iconAtlas: texture,
          iconMapping: mapping,

          getPosition,
          getColor,
          getSize,
          getAngle,
          getPixelOffset,

          billboard,
          sizeScale: sizeScale * scale,
          sizeUnits,
          sizeMinPixels: sizeMinPixels * scale,
          sizeMaxPixels: sizeMaxPixels * scale,

          transitions: transitions && {
            getPosition: transitions.getPosition,
            getAngle: transitions.getAngle,
            getColor: transitions.getColor,
            getSize: transitions.getSize,
            getPixelOffset: transitions.getPixelOffset
          }
        },
        this.getSubLayerProps({
          id: 'characters',
          updateTriggers: {
            getIcon: updateTriggers.getText,
            getPosition: updateTriggers.getPosition,
            getAngle: updateTriggers.getAngle,
            getColor: updateTriggers.getColor,
            getSize: updateTriggers.getSize,
            getPixelOffset: updateTriggers.getPixelOffset,
            getIconOffsets: {
              getText: updateTriggers.getText,
              getTextAnchor: updateTriggers.getTextAnchor,
              getAlignmentBaseline: updateTriggers.getAlignmentBaseline,
              styleVersion
            }
          }
        }),
        {
          data,
          _dataDiff,
          startIndices,
          numInstances,
          getIconOffsets: this.getIconOffsets.bind(this),
          getIcon: getText
        }
      )
    ];
  }
}

TextLayer.layerName = 'TextLayer';
TextLayer.defaultProps = defaultProps;
