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

import {CompositeLayer} from '../../core';
import MultiIconLayer from './multi-icon-layer/multi-icon-layer';
import {makeFontAtlas} from './font-atlas';

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

const DEFAULT_FONT_FAMILY = 'Monaco, monospace';
const DEFAULT_COLOR = [0, 0, 0, 255];

const defaultProps = {
  fp64: false,
  sizeScale: 1,
  fontFamily: DEFAULT_FONT_FAMILY,

  getText: x => x.text,
  getPosition: x => x.position,
  getColor: x => x.color || DEFAULT_COLOR,
  getSize: x => x.size || 32,
  getAngle: x => x.angle || 0,
  getTextAnchor: x => x.textAnchor || 'middle',
  getAlignmentBaseline: x => x.alignmentBaseline || 'center',
  getPixelOffset: x => x.offset || x.pixelOffset || [0, 0]
};

export default class TextLayer extends CompositeLayer {
  initializeState() {
    this.state = {};
    this.updateFontAtlas(this.props.fontFamily);
  }

  updateState({props, oldProps, changeFlags}) {
    if (
      changeFlags.dataChanged ||
      oldProps.fontFamily !== props.fontFamily ||
      (changeFlags.updateTriggersChanged &&
        (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getText))
    ) {
      this.transformStringToLetters();
    }

    if (oldProps.fontFamily !== props.fontFamily) {
      this.updateFontAtlas(props.fontFamily);
    }
  }

  updateFontAtlas(fontFamily) {
    const {gl} = this.context;
    const {mapping, texture} = makeFontAtlas(gl, fontFamily);
    this.setState({
      iconAtlas: texture,
      iconMapping: mapping
    });
  }

  getPickingInfo({info}) {
    return Object.assign(info, {
      // override object with original data
      object: info.object && info.object.object
    });
  }

  transformStringToLetters() {
    const {data, getText} = this.props;
    if (!data || data.length === 0) {
      return;
    }
    const transformedData = [];
    data.forEach(val => {
      const text = getText(val);
      if (text) {
        const letters = Array.from(text);
        letters.forEach((letter, i) => {
          const datum = {text: letter, index: i, len: text.length, object: val};
          transformedData.push(datum);
        });
      }
    });

    this.setState({data: transformedData});
  }

  getAnchorXFromTextAnchor(textAnchor) {
    if (!TEXT_ANCHOR.hasOwnProperty(textAnchor)) {
      throw new Error(`Invalid text anchor parameter: ${textAnchor}`);
    }
    return TEXT_ANCHOR[textAnchor];
  }

  getAnchorYFromAlignmentBaseline(alignmentBaseline) {
    if (!ALIGNMENT_BASELINE.hasOwnProperty(alignmentBaseline)) {
      throw new Error(`Invalid alignment baseline parameter: ${alignmentBaseline}`);
    }
    return ALIGNMENT_BASELINE[alignmentBaseline];
  }

  renderLayers() {
    const {data, iconAtlas, iconMapping} = this.state;

    if (!iconMapping || !iconAtlas || !data) {
      return null;
    }

    const {
      getPosition,
      getColor,
      getSize,
      getAngle,
      getTextAnchor,
      getAlignmentBaseline,
      getPixelOffset,
      fp64,
      sizeScale,
      updateTriggers
    } = this.props;

    return [
      new MultiIconLayer(
        this.getSubLayerProps({
          id: 'text-multi-icon-layer',
          data,
          iconAtlas,
          iconMapping,
          getIcon: d => d.text,
          getIndexOfIcon: d => d.index,
          getNumOfIcon: d => d.len,
          getPosition: d => getPosition(d.object),
          getColor: d => getColor(d.object),
          getSize: d => getSize(d.object),
          getAngle: d => getAngle(d.object),
          getAnchorX: d => this.getAnchorXFromTextAnchor(getTextAnchor(d.object)),
          getAnchorY: d => this.getAnchorYFromAlignmentBaseline(getAlignmentBaseline(d.object)),
          getPixelOffset: d => getPixelOffset(d.object),
          fp64,
          sizeScale,
          updateTriggers: {
            getPosition: updateTriggers.getPosition,
            getAngle: updateTriggers.getAngle,
            getColor: updateTriggers.getColor,
            getSize: updateTriggers.getSize,
            getPixelOffset: updateTriggers.getPixelOffset,
            getAnchorX: updateTriggers.getTextAnchor,
            getAnchorY: updateTriggers.getAlignmentBaseline
          }
        })
      )
    ];
  }
}

TextLayer.layerName = 'TextLayer';
TextLayer.defaultProps = defaultProps;
