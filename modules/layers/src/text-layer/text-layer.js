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
import {replaceInRange} from '../utils';
import {transformParagraph} from './utils';

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

  characterSet: DEFAULT_CHAR_SET,
  fontFamily: DEFAULT_FONT_FAMILY,
  fontWeight: DEFAULT_FONT_WEIGHT,
  lineHeight: DEFAULT_LINE_HEIGHT,
  fontSettings: {},

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
      fontAtlasManager: new FontAtlasManager(this.context.gl)
    };
  }

  updateState({props, oldProps, changeFlags}) {
    const fontChanged = this.fontChanged(oldProps, props);
    if (fontChanged) {
      this.updateFontAtlas({oldProps, props});
    }

    const textChanged =
      changeFlags.dataChanged ||
      fontChanged ||
      props.lineHeight !== oldProps.lineHeight ||
      (changeFlags.updateTriggersChanged &&
        (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getText));

    if (textChanged && Array.isArray(changeFlags.dataChanged)) {
      const data = this.state.data.slice();
      const dataDiff = changeFlags.dataChanged.map(dataRange =>
        replaceInRange({
          data,
          getIndex: p => p.__source.index,
          dataRange,
          replace: this.transformStringToLetters(dataRange)
        })
      );
      this.setState({data, dataDiff});
    } else if (textChanged) {
      this.setState({
        data: this.transformStringToLetters(),
        dataDiff: null
      });
    }
  }

  finalizeState() {
    super.finalizeState();
    // Release resources held by the font atlas manager
    this.state.fontAtlasManager.finalize();
  }

  updateFontAtlas({oldProps, props}) {
    const {characterSet, fontSettings, fontFamily, fontWeight} = props;

    // generate test characterSet
    const fontAtlasManager = this.state.fontAtlasManager;
    fontAtlasManager.setProps(
      Object.assign({}, DEFAULT_FONT_SETTINGS, fontSettings, {
        characterSet,
        fontFamily,
        fontWeight
      })
    );

    const {scale, texture, mapping} = fontAtlasManager;

    this.setState({
      scale,
      iconAtlas: texture,
      iconMapping: mapping
    });

    this.setNeedsRedraw(true);
  }

  fontChanged(oldProps, props) {
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

  getPickingInfo({info}) {
    // because `TextLayer` assign the same pickingInfoIndex for one text label,
    // here info.index refers the index of text label in props.data
    return Object.assign(info, {
      // override object with original data
      object: info.index >= 0 ? this.props.data[info.index] : null
    });
  }

  /* eslint-disable no-loop-func */
  transformStringToLetters(dataRange = {}) {
    const {data, lineHeight, getText} = this.props;
    const {iconMapping} = this.state;
    const {startRow, endRow} = dataRange;
    const {iterable, objectInfo} = createIterable(data, startRow, endRow);

    const transformedData = [];

    for (const object of iterable) {
      const transformCharacter = transformed => {
        return this.getSubLayerRow(transformed, object, objectInfo.index);
      };

      objectInfo.index++;
      const text = getText(object, objectInfo);
      if (text) {
        transformParagraph(text, lineHeight, iconMapping, transformCharacter, transformedData);
      }
    }

    return transformedData;
  }

  getAnchorXFromTextAnchor(getTextAnchor) {
    if (typeof getTextAnchor === 'function') {
      getTextAnchor = this.getSubLayerAccessor(getTextAnchor);
      return x => TEXT_ANCHOR[getTextAnchor(x)] || 0;
    }
    return () => TEXT_ANCHOR[getTextAnchor] || 0;
  }

  getAnchorYFromAlignmentBaseline(getAlignmentBaseline) {
    if (typeof getAlignmentBaseline === 'function') {
      getAlignmentBaseline = this.getSubLayerAccessor(getAlignmentBaseline);
      return x => TEXT_ANCHOR[getAlignmentBaseline(x)] || 0;
    }
    return () => ALIGNMENT_BASELINE[getAlignmentBaseline] || 0;
  }

  renderLayers() {
    const {data, dataDiff, scale, iconAtlas, iconMapping} = this.state;

    const {
      getPosition,
      getColor,
      getSize,
      getAngle,
      getTextAnchor,
      getAlignmentBaseline,
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

    const SubLayerClass = this.getSubLayerClass('characters', MultiIconLayer);

    return new SubLayerClass(
      {
        sdf,
        iconAtlas,
        iconMapping,

        _dataDiff: dataDiff && (() => dataDiff),

        getPosition: this.getSubLayerAccessor(getPosition),
        getColor: this.getSubLayerAccessor(getColor),
        getSize: this.getSubLayerAccessor(getSize),
        getAngle: this.getSubLayerAccessor(getAngle),
        getAnchorX: this.getAnchorXFromTextAnchor(getTextAnchor),
        getAnchorY: this.getAnchorYFromAlignmentBaseline(getAlignmentBaseline),
        getPixelOffset: this.getSubLayerAccessor(getPixelOffset),
        getPickingIndex: obj => obj.__source.index,
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
          getAnchorX: updateTriggers.getTextAnchor,
          getAnchorY: updateTriggers.getAlignmentBaseline
        }
      }),
      {
        data,
        getIcon: d => d.text,
        getRowSize: d => d.rowSize,
        getOffsets: d => [d.offsetLeft, d.offsetTop],
        getParagraphSize: d => d.size
      }
    );
  }
}

TextLayer.layerName = 'TextLayer';
TextLayer.defaultProps = defaultProps;
