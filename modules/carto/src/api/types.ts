import {SCALE_TYPE} from './layer-map';

export type Format = 'json' | 'geojson' | 'tilejson';
export type MapType = 'boundary' | 'query' | 'table' | 'tileset' | 'raster';
export type RequestType = 'Map data' | 'Map instantiation' | 'Public map' | 'Tile stats' | 'SQL';
export type APIErrorContext = {
  requestType: RequestType;
  mapId?: string;
  connection?: string;
  source?: string;
  type?: MapType;
};

export enum SchemaFieldType {
  Number = 'number',
  Bigint = 'bigint',
  String = 'string',
  Geometry = 'geometry',
  Timestamp = 'timestamp',
  Object = 'object',
  Boolean = 'boolean',
  Variant = 'variant',
  Unknown = 'unknown'
}
export interface SchemaField {
  name: string;
  type: SchemaFieldType; // Field type in the CARTO stack, common for all providers
}

export interface MapInstantiation extends MapInstantiationFormats {
  nrows: number;
  size?: number;
  schema: SchemaField[];
}

type MapInstantiationFormats = Record<
  Format,
  {
    url: string[];
    error?: any;
  }
>;

export type QueryParameterValue = string | number | boolean | Array<QueryParameterValue> | object;

export type NamedQueryParameter = Record<string, QueryParameterValue>;

export type PositionalQueryParameter = QueryParameterValue[];

export type QueryParameters = NamedQueryParameter | PositionalQueryParameter;
export type VisualChannelField = {
  name: string;
  type: string;
  colorColumn?: string;
};

export interface Filters {
  [column: string]: Filter;
}

interface Filter {
  [FilterTypes.In]: number[];
  [FilterTypes.Between]: number[][];
  [FilterTypes.ClosedOpen]: number[][];
  [FilterTypes.Time]: number[][];
  [FilterTypes.StringSearch]: string[];
}

export enum FilterTypes {
  In = 'in',
  Between = 'between', // [a, b] both are included
  ClosedOpen = 'closed_open', // [a, b) a is included, b is not
  Time = 'time',
  StringSearch = 'stringSearch'
}

export type VisualChannels = {
  colorField?: VisualChannelField;
  colorScale?: SCALE_TYPE;

  customMarkersField?: VisualChannelField;
  customMarkersScale?: SCALE_TYPE;

  radiusField?: VisualChannelField;
  radiusScale?: SCALE_TYPE;

  rotationScale?: SCALE_TYPE;
  rotationField?: VisualChannelField;

  sizeField?: VisualChannelField;
  sizeScale?: SCALE_TYPE;

  strokeColorField?: VisualChannelField;
  strokeColorScale?: SCALE_TYPE;

  heightField?: VisualChannelField;
  heightScale?: SCALE_TYPE;
};

export type ColorRange = {
  category: string;
  colors: string[];
  colorMap: string[][] | undefined;
  name: string;
  type: string;
};

export type CustomMarkersRange = {
  markerMap: {
    value: string;
    markerUrl?: string;
  }[];
  othersMarker?: string;
};

export type VisConfig = {
  filled?: boolean;
  opacity?: number;
  enable3d?: boolean;

  colorAggregation?: any;
  colorRange: ColorRange;

  customMarkers?: boolean;
  customMarkersRange?: CustomMarkersRange | null;
  customMarkersUrl?: string | null;

  radius: number;
  radiusRange?: number[];

  sizeAggregation?: any;
  sizeRange?: any;

  strokeColorAggregation?: any;
  strokeOpacity?: number;
  strokeColorRange?: ColorRange;

  heightRange?: any;
  heightAggregation?: any;
};

export type TextLabel = {
  field: VisualChannelField | null | undefined;
  alignment?: 'center' | 'bottom' | 'top';
  anchor?: 'middle' | 'start' | 'end';
  size: number;
  color?: number[];
  offset?: [number, number];
  outlineColor?: number[];
};

export type MapLayerConfig = {
  columns?: Record<string, any>;
  color?: number[];
  label?: string;
  dataId: string;
  textLabel: TextLabel[];
  visConfig: VisConfig;
};

export type MapTextSubLayerConfig = Omit<MapLayerConfig, 'textLabel'> & {
  textLabel?: TextLabel;
};

export type MapConfigLayer = {
  type: string;
  id: string;
  config: MapLayerConfig;
  visualChannels: VisualChannels;
};

export type MapDataset = {
  id: string;
  data: any;
  aggregationExp: string | null;
  aggregationResLevel: number | null;
  geoColumn: string;
};
