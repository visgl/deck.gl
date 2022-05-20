// Copyright (c) 2022 Uber Technologies, Inc.
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
// THE SOFTWARE.import {CompositeLayerProps} from '@deck.gl/core';

import {Accessor, Color, CompositeLayerProps, Unit} from '@deck.gl/core';
import {ScatterplotLayerProps} from '../scatterplot-layer/scatterplot-layer';
import {FillProps, Polygon3DProps, StrokeProps} from '../types';

export type GeoJsonLayerProps<DataT = any> = _GeoJsonLayerProps<DataT> & CompositeLayerProps<DataT>;

export type _GeoJsonLayerProps<DataT = any> = {
  /**
   * How to render Point and MultiPoint features in the data.
   *
   * Supported types are:
   *  * `'circle'`
   *  * `'icon'`
   *  * `'text'`
   *
   * @default 'circle'
   */
  pointType?: string;
} & FillProps<DataT> &
  StrokeProps<DataT> &
  // TODO: lineCapRounded
  // TODO: lineBillboard

  Polygon3DProps<DataT> &
  _GeoJsonLayerPointCircleProps<DataT> &
  _GeojsonLayerIconPointProps<DataT> &
  _GeojsonLayerTextPointProps<DataT>;

/** Properties forwarded to `ScatterPlotLayer` if `pointType` is `'circle'` */
type _GeoJsonLayerPointCircleProps<DataT = any> = {
  /**
   * Equivalent of ScatterPlotLayer.getRadius.
   *
   * @default 1 */
  getPointRadius?: Accessor<DataT, number>;
  getPointRadius2?: ScatterplotLayerProps<DataT>['getRadius'];

  /** @default 'meters */
  pointRadiusUnits?: Unit;

  /** @default 1 */
  pointRadiusScale?: number;

  /** @default 0 */
  pointRadiusMinPixels?: number;

  /** @default Number.MAX_SAFE_INTEGER */
  pointRadiusMaxPixels?: number;

  /** @default true */
  pointAntialiasing?: boolean;

  /** @default false */
  pointBillboard?: boolean;
};

type _GeojsonLayerIconPointProps<DataT = any> = {
  iconAtlas?: any;
  iconMapping?: any;
  getIcon?: Accessor<DataT, any>;
  getIconSize?: Accessor<DataT, number>;
  getIconColor?: Accessor<DataT, Color>;
  getIconAngle?: Accessor<DataT, number>;
  getIconPixelOffset?: Accessor<DataT, number[]>;
  iconSizeUnits?: Unit;
  iconSizeScale?: number;
  iconSizeMinPixels?: number;
  iconSizeMaxPixels?: number;
  iconBillboard?: boolean;
  iconAlphaCutoff?: number;
};

type _GeojsonLayerTextPointProps<DataT = any> = {
  getText?: Accessor<DataT, any>;
  getTextColor?: Accessor<DataT, Color>;
  getTextAngle?: Accessor<DataT, number>;
  getTextSize?: Accessor<DataT, number>;
  getTextAnchor?: Accessor<DataT, string>;
  getTextAlignmentBaseline?: Accessor<DataT, string>;
  getTextPixelOffset?: Accessor<DataT, number[]>;
  getTextBackgroundColor?: Accessor<DataT, Color>;
  getTextBorderColor?: Accessor<DataT, Color>;
  getTextBorderWidth?: Accessor<DataT, number>;
  textSizeUnits?: Unit;
  textSizeScale?: number;
  textSizeMinPixels?: number;
  textSizeMaxPixels?: number;
  textCharacterSet?: any;
  textFontFamily?: string;
  textFontWeight?: number;
  textLineHeight?: number;
  textMaxWidth?: number;
  textWordBreak?: string; // TODO
  textBackground?: boolean;
  textBackgroundPadding?: number[];
  textOutlineColor?: Color;
  textOutlineWidth?: number;
  textBillboard?: boolean;
  textFontSettings?: any;
};
