import {deviation, extent, groupSort, median, variance} from 'd3-array';
import {rgb} from 'd3-color';
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
import {format as d3Format} from 'd3-format';
import moment from 'moment-timezone';

import {Accessor, Layer, _ConstructorOf as ConstructorOf} from '@deck.gl/core';
import {CPUGridLayer, HeatmapLayer, HexagonLayer} from '@deck.gl/aggregation-layers';
import {GeoJsonLayer} from '@deck.gl/layers';
import {H3HexagonLayer, MVTLayer} from '@deck.gl/geo-layers';

import CartoTileLayer from '../layers/carto-tile-layer';
import H3TileLayer from '../layers/h3-tile-layer';
import QuadbinTileLayer from '../layers/quadbin-tile-layer';
import RasterTileLayer from '../layers/raster-tile-layer';
import {MapType, TILE_FORMATS, TileFormat} from './maps-api-common';
import {assert, createBinaryProxy} from '../utils';
import {
  CustomMarkersRange,
  MapDataset,
  MapTextSubLayerConfig,
  VisConfig,
  VisualChannelField,
  VisualChannels
} from './types';

const SCALE_FUNCS = {
  linear: scaleLinear,
  ordinal: scaleOrdinal,
  log: scaleLog,
  point: scalePoint,
  quantile: scaleQuantile,
  quantize: scaleQuantize,
  sqrt: scaleSqrt,
  custom: scaleThreshold
};
export type SCALE_TYPE = keyof typeof SCALE_FUNCS;

function identity<T>(v: T): T {
  return v;
}

const UNKNOWN_COLOR = '#868d91';

export const AGGREGATION = {
  average: 'MEAN',
  maximum: 'MAX',
  minimum: 'MIN',
  sum: 'SUM'
};

export const OPACITY_MAP = {
  getFillColor: 'opacity',
  getLineColor: 'strokeOpacity',
  getTextColor: 'opacity'
};

const AGGREGATION_FUNC = {
  'count unique': (values, accessor) => groupSort(values, v => v.length, accessor).length,
  median,
  // Unfortunately mode() is only available in d3-array@3+ which is ESM only
  mode: (values, accessor) => groupSort(values, v => v.length, accessor).pop(),
  stddev: deviation,
  variance
};

const hexToRGBA = c => {
  const {r, g, b, opacity} = rgb(c);
  return [r, g, b, 255 * opacity];
};

// Kepler prop value -> Deck.gl prop value
// Supports nested definitions, and function transforms:
//   {keplerProp: 'deckProp'} is equivalent to:
//   {keplerProp: x => ({deckProp: x})}
const sharedPropMap = {
  // Apply the value of Kepler `color` prop to the deck `getFillColor` prop
  color: 'getFillColor',
  isVisible: 'visible',
  label: 'cartoLabel',
  textLabel: {
    alignment: 'getTextAlignmentBaseline',
    anchor: 'getTextAnchor',
    // Apply the value of Kepler `textLabel.color` prop to the deck `getTextColor` prop
    color: 'getTextColor',
    size: 'getTextSize'
  },
  visConfig: {
    enable3d: 'extruded',
    elevationScale: 'elevationScale',
    filled: 'filled',
    strokeColor: 'getLineColor',
    stroked: 'stroked',
    thickness: 'getLineWidth',
    radius: 'getPointRadius',
    wireframe: 'wireframe'
  }
};

const customMarkersPropsMap = {
  color: 'getIconColor',
  visConfig: {
    radius: 'getIconSize'
  }
};

const aggregationVisConfig = {
  colorAggregation: x => ({colorAggregation: AGGREGATION[x] || AGGREGATION.sum}),
  colorRange: x => ({colorRange: x.colors.map(hexToRGBA)}),
  coverage: 'coverage',
  elevationPercentile: ['elevationLowerPercentile', 'elevationUpperPercentile'],
  percentile: ['lowerPercentile', 'upperPercentile']
};

const defaultProps = {
  lineMiterLimit: 2,
  lineWidthUnits: 'pixels',
  pointRadiusUnits: 'pixels',
  rounded: true,
  wrapLongitude: false
};

function mergePropMaps(a: Record<string, any> = {}, b: Record<string, any> = {}) {
  return {...a, ...b, visConfig: {...a.visConfig, ...b.visConfig}};
}

export function getLayer(
  type: string,
  config: MapTextSubLayerConfig,
  dataset: MapDataset
): {Layer: ConstructorOf<Layer>; propMap: any; defaultProps: any} {
  let basePropMap: any = sharedPropMap;

  if (config.visConfig?.customMarkers) {
    basePropMap = mergePropMaps(sharedPropMap, customMarkersPropsMap);
  }
  if (type === 'mvt' || type === 'tileset' || type === 'h3' || type === 'quadbin') {
    return getTileLayer(dataset, basePropMap);
  }

  const geoColumn = dataset?.geoColumn;
  const getPosition = d => d[geoColumn].coordinates;

  const hexagonId = config.columns?.hex_id;

  const layerTypeDefs: Record<
    string,
    {Layer: ConstructorOf<Layer>; propMap?: any; defaultProps?: any}
  > = {
    point: {
      Layer: GeoJsonLayer,
      propMap: {
        columns: {
          altitude: x => ({parameters: {depthTest: Boolean(x)}})
        },
        visConfig: {outline: 'stroked'}
      }
    },
    geojson: {
      Layer: GeoJsonLayer
    },
    grid: {
      Layer: CPUGridLayer,
      propMap: {visConfig: {...aggregationVisConfig, worldUnitSize: x => ({cellSize: 1000 * x})}},
      defaultProps: {getPosition}
    },
    heatmap: {
      Layer: HeatmapLayer,
      propMap: {visConfig: {...aggregationVisConfig, radius: 'radiusPixels'}},
      defaultProps: {getPosition}
    },
    hexagon: {
      Layer: HexagonLayer,
      propMap: {visConfig: {...aggregationVisConfig, worldUnitSize: x => ({radius: 1000 * x})}},
      defaultProps: {getPosition}
    },
    hexagonId: {
      Layer: H3HexagonLayer,
      propMap: {visConfig: {coverage: 'coverage'}},
      defaultProps: {getHexagon: d => d[hexagonId], stroked: false}
    }
  };

  const layer = layerTypeDefs[type];

  assert(layer, `Unsupported layer type: ${type}`);
  return {
    ...layer,
    propMap: mergePropMaps(basePropMap, layer.propMap),
    defaultProps: {...defaultProps, ...layer.defaultProps}
  };
}

export function layerFromTileDataset(
  formatTiles: TileFormat | null = TILE_FORMATS.MVT,
  scheme: string,
  type?: MapType
): typeof CartoTileLayer | typeof H3TileLayer | typeof MVTLayer | typeof QuadbinTileLayer {
  if (type === 'raster') {
    return RasterTileLayer;
  }
  if (scheme === 'h3') {
    return H3TileLayer;
  }
  if (scheme === 'quadbin') {
    return QuadbinTileLayer;
  }
  if (formatTiles === 'mvt') {
    return MVTLayer;
  }

  // formatTiles === BINARY|JSON|GEOJSON
  return CartoTileLayer;
}

function getTileLayer(dataset: MapDataset, basePropMap) {
  const {
    aggregationExp,
    aggregationResLevel,
    data: {
      scheme,
      tiles: [tileUrl]
    }
  } = dataset;
  /* global URL */
  const formatTiles = new URL(tileUrl).searchParams.get('formatTiles') as TileFormat;

  return {
    Layer: layerFromTileDataset(formatTiles, scheme),
    propMap: basePropMap,
    defaultProps: {
      ...defaultProps,
      ...(aggregationExp && {aggregationExp}),
      ...(aggregationResLevel && {aggregationResLevel}),
      formatTiles,
      uniqueIdProperty: 'geoid'
    }
  };
}

function domainFromAttribute(attribute, scaleType: SCALE_TYPE, scaleLength: number) {
  if (scaleType === 'ordinal' || scaleType === 'point') {
    return attribute.categories.map(c => c.category).filter(c => c !== undefined && c !== null);
  }

  if (scaleType === 'quantile' && attribute.quantiles) {
    return attribute.quantiles[scaleLength];
  }

  let {min} = attribute;
  if (scaleType === 'log' && min === 0) {
    min = 1e-5;
  }
  return [min, attribute.max];
}

function domainFromValues(values, scaleType: SCALE_TYPE) {
  if (scaleType === 'ordinal' || scaleType === 'point') {
    return groupSort(
      values,
      g => -g.length,
      d => d
    );
  } else if (scaleType === 'quantile') {
    return values.sort((a, b) => a - b);
  } else if (scaleType === 'log') {
    const [d0, d1] = extent(values as number[]);
    return [d0 === 0 ? 1e-5 : d0, d1];
  }
  return extent(values);
}

function calculateDomain(data, name, scaleType, scaleLength?) {
  if (data.tilestats) {
    // Tileset data type
    const {attributes} = data.tilestats.layers[0];
    const attribute = attributes.find(a => a.attribute === name);
    return domainFromAttribute(attribute, scaleType, scaleLength);
  } else if (data.features) {
    // GeoJSON data type
    const values = data.features.map(({properties}) => properties[name]);
    return domainFromValues(values, scaleType);
  } else if (Array.isArray(data) && data[0][name] !== undefined) {
    // JSON data type
    const values = data.map(properties => properties[name]);
    return domainFromValues(values, scaleType);
  }

  return [0, 1];
}

function normalizeAccessor(accessor, data) {
  if (data.features || data.tilestats) {
    return (object, info) => {
      if (object) {
        return accessor(object.properties || object.__source.object.properties);
      }

      const {data, index} = info;
      const proxy = createBinaryProxy(data, index);
      return accessor(proxy);
    };
  }
  return accessor;
}

export function opacityToAlpha(opacity?: number) {
  return opacity !== undefined ? Math.round(255 * Math.pow(opacity, 1 / 2.2)) : 255;
}

function getAccessorKeys(name: string, aggregation: string | undefined): string[] {
  let keys = [name];
  if (aggregation) {
    // Snowflake will capitalized the keys, need to check lower and upper case version
    keys = keys.concat([aggregation, aggregation.toUpperCase()].map(a => `${name}_${a}`));
  }
  return keys;
}

function findAccessorKey(keys: string[], properties): string[] {
  for (const key of keys) {
    if (key in properties) {
      return [key];
    }
  }

  throw new Error(`Could not find property for any accessor key: ${keys}`);
}

export function getColorValueAccessor({name}, colorAggregation, data: any) {
  const aggregator = AGGREGATION_FUNC[colorAggregation];
  const accessor = values => aggregator(values, p => p[name]);
  return normalizeAccessor(accessor, data);
}

export function getColorAccessor(
  {name},
  scaleType: SCALE_TYPE,
  {aggregation, range: {colors, colorMap}},
  opacity: number | undefined,
  data: any
) {
  const scale = SCALE_FUNCS[scaleType as any]();
  let domain: (string | number)[] = [];
  let scaleColor: string[] = [];

  if (Array.isArray(colorMap)) {
    colorMap.forEach(([value, color]) => {
      domain.push(value);
      scaleColor.push(color);
    });
  } else {
    domain = calculateDomain(data, name, scaleType, colors.length);
    scaleColor = colors;
  }

  if (scaleType === 'ordinal') {
    domain = domain.slice(0, scaleColor.length);
  }

  scale.domain(domain);
  scale.range(scaleColor);
  scale.unknown(UNKNOWN_COLOR);
  const alpha = opacityToAlpha(opacity);

  let accessorKeys = getAccessorKeys(name, aggregation);
  const accessor = properties => {
    if (!(accessorKeys[0] in properties)) {
      accessorKeys = findAccessorKey(accessorKeys, properties);
    }
    const propertyValue = properties[accessorKeys[0]];
    const {r, g, b} = rgb(scale(propertyValue));
    return [r, g, b, propertyValue === null ? 0 : alpha];
  };
  return normalizeAccessor(accessor, data);
}

const FALLBACK_ICON =
  'data:image/svg+xml;charset=utf-8;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCiAgPGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiLz4NCjwvc3ZnPg==';

export function getIconUrlAccessor(
  field: VisualChannelField | null | undefined,
  range: CustomMarkersRange | null | undefined,
  {fallbackUrl, maxIconSize, useMaskedIcons},
  data: any
) {
  const urlToUnpackedIcon = (url: string) => ({
    id: `${url}@@${maxIconSize}`,
    url,
    width: maxIconSize,
    height: maxIconSize,
    mask: useMaskedIcons
  });
  let unknownValue = fallbackUrl || FALLBACK_ICON;

  if (range?.othersMarker) {
    unknownValue = range.othersMarker;
  }

  const unknownIcon = urlToUnpackedIcon(unknownValue);
  if (!range || !field) {
    return () => unknownIcon;
  }

  const mapping: Record<string, any> = {};
  for (const {value, markerUrl} of range.markerMap) {
    if (markerUrl) {
      mapping[value] = urlToUnpackedIcon(markerUrl);
    }
  }

  const accessor = properties => {
    const propertyValue = properties[field.name];
    return mapping[propertyValue] || unknownIcon;
  };
  return normalizeAccessor(accessor, data);
}

export function getMaxMarkerSize(visConfig: VisConfig, visualChannels: VisualChannels): number {
  const {radiusRange, radius} = visConfig;
  const {radiusField, sizeField} = visualChannels;
  const field = radiusField || sizeField;
  return Math.ceil(radiusRange && field ? radiusRange[1] : radius);
}

export function negateAccessor<T>(accessor: Accessor<T, number>): Accessor<T, number> {
  return typeof accessor === 'function' ? (d, i) => -accessor(d, i) : -accessor;
}

export function getSizeAccessor(
  {name},
  scaleType: SCALE_TYPE | undefined,
  aggregation,
  range: Iterable<Range> | undefined,
  data: any
) {
  const scale = scaleType ? SCALE_FUNCS[scaleType as any]() : identity;
  if (scaleType) {
    if (aggregation !== 'count') {
      scale.domain(calculateDomain(data, name, scaleType));
    }
    scale.range(range);
  }

  let accessorKeys = getAccessorKeys(name, aggregation);
  const accessor = properties => {
    if (!(accessorKeys[0] in properties)) {
      accessorKeys = findAccessorKey(accessorKeys, properties);
    }
    const propertyValue = properties[accessorKeys[0]];
    return scale(propertyValue);
  };
  return normalizeAccessor(accessor, data);
}

const FORMATS: Record<string, (value: any) => string> = {
  date: s => moment.utc(s).format('MM/DD/YY HH:mm:ssa'),
  integer: d3Format('i'),
  float: d3Format('.5f'),
  timestamp: s => moment.utc(s).format('X'),
  default: String
};

export function getTextAccessor({name, type}: VisualChannelField, data) {
  const format = FORMATS[type] || FORMATS.default;
  const accessor = properties => {
    return format(properties[name]);
  };
  return normalizeAccessor(accessor, data);
}

export {domainFromValues as _domainFromValues};
