import {
  scaleLinear,
  scaleOrdinal,
  scaleLog,
  scalePoint,
  scaleQuantile,
  scaleQuantize,
  scaleSqrt,
  scaleThreshold
} from 'd3-scale';
import {Accessor, Layer, _ConstructorOf as ConstructorOf} from '@deck.gl/core';
import {MVTLayer} from '@deck.gl/geo-layers';
import CartoTileLayer from '../layers/carto-tile-layer';
import H3TileLayer from '../layers/h3-tile-layer';
import QuadbinTileLayer from '../layers/quadbin-tile-layer';
import {
  CustomMarkersRange,
  MapDataset,
  MapTextSubLayerConfig,
  TextLabel,
  VisConfig,
  VisualChannelField,
  VisualChannels
} from './types';
declare const SCALE_FUNCS: {
  linear: typeof scaleLinear;
  ordinal: typeof scaleOrdinal;
  log: typeof scaleLog;
  point: typeof scalePoint;
  quantile: typeof scaleQuantile;
  quantize: typeof scaleQuantize;
  sqrt: typeof scaleSqrt;
  custom: typeof scaleThreshold;
};
export declare type SCALE_TYPE = keyof typeof SCALE_FUNCS;
export declare const AGGREGATION: {
  average: string;
  maximum: string;
  minimum: string;
  sum: string;
};
export declare const OPACITY_MAP: {
  getFillColor: string;
  getLineColor: string;
  getTextColor: string;
};
export declare function getLayer(
  type: string,
  config: MapTextSubLayerConfig,
  dataset: MapDataset
): {
  Layer: ConstructorOf<Layer>;
  propMap: any;
  defaultProps: any;
};
export declare function layerFromTileDataset(
  formatTiles: string | null,
  scheme: string
): typeof CartoTileLayer | typeof H3TileLayer | typeof MVTLayer | typeof QuadbinTileLayer;
declare function domainFromValues(values: any, scaleType: SCALE_TYPE): any;
export declare function opacityToAlpha(opacity?: number): number;
export declare function getColorValueAccessor(
  {
    name
  }: {
    name: any;
  },
  colorAggregation: any,
  data: any
): any;
export declare function getColorAccessor(
  {
    name
  }: {
    name: any;
  },
  scaleType: SCALE_TYPE,
  {
    aggregation,
    range: {colors, colorMap}
  }: {
    aggregation: any;
    range: {
      colors: any;
      colorMap: any;
    };
  },
  opacity: number | undefined,
  data: any
): any;
export declare function getIconUrlAccessor(
  field: VisualChannelField | null | undefined,
  range: CustomMarkersRange | null | undefined,
  {
    fallbackUrl,
    maxIconSize,
    useMaskedIcons
  }: {
    fallbackUrl: any;
    maxIconSize: any;
    useMaskedIcons: any;
  },
  data: any
): any;
export declare function getMaxMarkerSize(
  visConfig: VisConfig,
  visualChannels: VisualChannels
): number;
export declare function negateAccessor<T>(accessor: Accessor<T, number>): Accessor<T, number>;
export declare function getSizeAccessor(
  {
    name
  }: {
    name: any;
  },
  scaleType: SCALE_TYPE | undefined,
  aggregation: any,
  range: Iterable<Range> | undefined,
  data: any
): any;
export declare function getTextAccessor({name, type}: VisualChannelField, data: any): any;
export declare function getTextPixelOffsetAccessor(
  {alignment, anchor, size}: TextLabel,
  radius: any
): Accessor<unknown, [number, number]>;
export {domainFromValues as _domainFromValues};
// # sourceMappingURL=layer-map.d.ts.map
