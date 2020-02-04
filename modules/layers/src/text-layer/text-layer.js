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

const DEFAULT_FONT_SETTINGS = {
  fontSize: DEFAULT_FONT_SIZE,
  buffer: DEFAULT_BUFFER,
  sdf: false,
  radius: DEFAULT_RADIUS,
  cutoff: DEFAULT_CUTOFF
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
  backgroundColor: {type: 'color', value: null, optional: true},

  characterSet: DEFAULT_CHAR_SET,
  fontFamily: DEFAULT_FONT_FAMILY,
  fontWeight: DEFAULT_FONT_WEIGHT,
  lineHeight: DEFAULT_LINE_HEIGHT,
  fontSettings: {},

  // auto wrapping options
  wordBreak: 'word-break',
  maxWidth: {type: 'number', value: -1},

  getText: {type: 'accessor', value: x => x.text},
  getPosition: {type: 'accessor', value: x => x.position},
  getColor: {type: 'accessor', value: DEFAULT_COLOR},
  getSize: {type: 'accessor', value: 32},
  getAngle: {type: 'accessor', value: 0},
  getTextAnchor: {type: 'accessor', value: 'middle'},
  getAlignmentBaseline: {type: 'accessor', value: 'center'},
  getPixelOffset: {type: 'accessor', value: [0, 0]}
};

export default class TextLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      styleVersion: 0,
      fontAtlasManager: new FontAtlasManager(this.context.gl)
    };
  }

  // eslint-disable-next-line complexity
  updateState({props, oldProps, changeFlags}) {
    const fontChanged = this._fontChanged(oldProps, props);

    if (fontChanged) {
      this._updateFontAtlas(oldProps, props);
    }

    const styleChanged =
      fontChanged ||
      props.lineHeight !== oldProps.lineHeight ||
      props.wordBreak !== oldProps.wordBreak ||
      props.maxWidth !== oldProps.maxWidth;

    const textChanged =
      changeFlags.dataChanged ||
      (changeFlags.updateTriggersChanged &&
        (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getText));

    if (textChanged) {
      this._updateText();
    }
    if (styleChanged) {
      this.setState({
        styleVersion: this.state.styleVersion + 1
      });
    }
  }

  finalizeState() {
    super.finalizeState();
    // Release resources held by the font atlas manager
    this.state.fontAtlasManager.finalize();
  }

  getPickingInfo({info}) {
    // because `TextLayer` assign the same pickingInfoIndex for one text label,
    // here info.index refers the index of text label in props.data
    return Object.assign(info, {
      // override object with original data
      object: info.index >= 0 ? this.props.data[info.index] : null
    });
  }

  _updateFontAtlas(oldProps, props) {
    const {characterSet, fontSettings, fontFamily, fontWeight} = props;

    // generate test characterSet
    const {fontAtlasManager} = this.state;
    fontAtlasManager.setProps(
      Object.assign({}, DEFAULT_FONT_SETTINGS, fontSettings, {
        characterSet,
        fontFamily,
        fontWeight
      })
    );

    this.setNeedsRedraw(true);
  }

  _fontChanged(oldProps, props) {
    if (
      oldProps.fontFamily !== props.fontFamily ||
      oldProps.characterSet !== props.characterSet ||
      oldProps.fontWeight !== props.fontWeight
    ) {
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
  // Returns the index at the start of each string (every character is rendered by one instance)
  _updateText() {
    const {data} = this.props;
    const textBuffer = data.attributes && data.attributes.getText;
    let {getText} = this.props;
    let {startIndices} = data;
    let numInstances;

    if (textBuffer && startIndices) {
      const {texts, characterCount} = getTextFromBuffer({
        ...(ArrayBuffer.isView(textBuffer) ? {value: textBuffer} : textBuffer),
        length: data.length,
        startIndices
      });
      numInstances = characterCount;
      getText = (_, {index}) => texts[index];
    } else {
      const {iterable, objectInfo} = createIterable(data);
      startIndices = [0];
      numInstances = 0;

      for (const object of iterable) {
        objectInfo.index++;
        const text = getText(object, objectInfo) || '';
        numInstances += text.length;
        startIndices.push(numInstances);
      }
    }

    this.setState({getText, startIndices, numInstances});
  }

  // Returns the x, y offsets of each character in a text string
  getIconOffsets(object, objectInfo) {
    const iconMapping = this.state.fontAtlasManager.mapping;
    const {getText} = this.state;
    const {wordBreak, maxWidth, lineHeight, getTextAnchor, getAlignmentBaseline} = this.props;

    const paragraph = getText(object, objectInfo) || '';
    const {
      characters,
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

    const offsets = new Array(paragraph.length * 2);
    let index = 0;

    for (const {rowWidth, x, y} of characters) {
      // For a multi-line object, offset in x-direction needs consider
      // the row offset in the paragraph and the object offset in the row
      const rowOffset = ((1 - anchorX) * (width - rowWidth)) / 2;
      offsets[index++] = ((anchorX - 1) * width) / 2 + rowOffset + x;
      offsets[index++] = ((anchorY - 1) * height) / 2 + y;
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
      backgroundColor,
      getPosition,
      getColor,
      getSize,
      getAngle,
      getPixelOffset,
      billboard,
      sdf,
      sizeScale,
      sizeUnits,
      sizeMinPixels,
      sizeMaxPixels,
      transitions,
      updateTriggers
    } = this.props;

    const getIconOffsets = this.getIconOffsets.bind(this);

    const SubLayerClass = this.getSubLayerClass('characters', MultiIconLayer);

    return new SubLayerClass(
      {
        sdf,
        iconAtlas: texture,
        iconMapping: mapping,
        backgroundColor,

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
          getPixelOffset: updateTriggers.getPixelOffset
        }
      },
      this.getSubLayerProps({
        id: 'characters',
        updateTriggers: {
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
        getIconOffsets,
        getIcon: getText
      }
    );
  }
}

TextLayer.layerName = 'TextLayer';
TextLayer.defaultProps = defaultProps;
