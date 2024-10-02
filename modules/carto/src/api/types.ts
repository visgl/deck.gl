import {SCALE_TYPE} from './layer-map';

export type Format = 'json' | 'geojson' | 'tilejson';
export type MapType = 'boundary' | 'query' | 'table' | 'tileset' | 'raster';
export type RequestType =
  | 'Map data'
  | 'Map instantiation'
  | 'Public map'
  | 'Tile stats'
  | 'SQL'
  | 'Basemap style';

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
  [FilterTypes.In]?: number[];
  [FilterTypes.Between]?: number[][];
  [FilterTypes.ClosedOpen]?: number[][];
  [FilterTypes.Time]?: number[][];
  [FilterTypes.StringSearch]?: string[];
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

  weightField?: VisualChannelField;
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

  weightAggregation?: any;
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

export interface CustomStyle {
  url?: string;
  style?: any;
  customAttribution?: string;
}

export type KeplerMapConfig = {
  mapState: any;
  mapStyle: {
    styleType: string;
    visibleLayerGroups: Record<string, boolean>;
  };
  visState: {
    layers: MapConfigLayer[];
  };
  layerBlending: any;
  interactionConfig: any;
  customBaseMaps?: {
    customStyle?: CustomStyle;
  };
};

export type BasemapType = 'maplibre' | 'google-maps';

export type Basemap = MapLibreBasemap | GoogleBasemap;

export type BasemapCommon = {
  /**
   * Type of basemap.
   */
  type: BasemapType;

  /**
   * Custom attribution for style data if not provided by style definition.
   */
  attribution?: string;

  /**
   * Properties of the basemap. These properties are specific to the basemap type.
   */
  props: Record<string, any>;
};

export type MapLibreBasemap = BasemapCommon & {
  type: 'maplibre';

  /**
   * MapLibre map properties.
   *
   * Meant to be passed to directly to `maplibregl.Map` object.
   */
  props: MapLibreBasemapProps;

  /**
   * Layer groups to be displayed in the basemap.
   */
  visibleLayerGroups?: Record<string, boolean>;

  /**
   * If `style` has been filtered by `visibleLayerGroups` then this property contains original style object, so user
   * can use `applyLayerGroupFilters` again with new settings.
   */
  rawStyle?: string | Record<string, any>;
};

// Cherry-pick of maplibregl Map API props that are supported/provided by fetchMap interface
export type MapLibreBasemapProps = {
  style: string | Record<string, any>;
  center: [number, number];
  zoom: number;
  pitch?: number;
  bearing?: number;
};

export type GoogleBasemap = BasemapCommon & {
  type: 'google-maps';

  /**
   * Google map properties.
   *
   * Meant to be passed to directly to `google.maps.Map` object.
   */
  props: GoogleBasemapProps;
};

// Cherry-pick of Google Map API props that are supported/provided by fetchMap interface
export type GoogleBasemapProps = {
  mapTypeId: string;
  mapId?: string;
  center?: {lat: number; lng: number};
  zoom?: number;
  tilt?: number;
  heading?: number;
};
