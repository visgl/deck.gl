import {SCALE_TYPE} from './layer-map';
export declare type VisualChannelField = {
  name: string;
  type: string;
};
export declare type VisualChannels = {
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
export declare type ColorRange = {
  category: string;
  colors: string[];
  colorMap: string[][] | undefined;
  name: string;
  type: string;
};
export declare type CustomMarkersRange = {
  markerMap: {
    value: string;
    markerUrl?: string;
  }[];
  othersMarker?: string;
};
export declare type VisConfig = {
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
export declare type TextLabel = {
  field: VisualChannelField | null | undefined;
  alignment?: 'center' | 'bottom' | 'top';
  anchor?: 'middle' | 'start' | 'end';
  size: number;
  color?: number[];
  offset?: [number, number];
};
export declare type MapLayerConfig = {
  columns?: Record<string, any>;
  color?: number[];
  label?: string;
  dataId: string;
  textLabel: TextLabel[];
  visConfig: VisConfig;
};
export declare type MapTextSubLayerConfig = Omit<MapLayerConfig, 'textLabel'> & {
  textLabel?: TextLabel;
};
export declare type MapConfigLayer = {
  type: string;
  id: string;
  config: MapLayerConfig;
  visualChannels: VisualChannels;
};
export declare type MapDataset = {
  id: string;
  data: any;
  aggregationExp: string | null;
  aggregationResLevel: number | null;
  geoColumn: string;
};
// # sourceMappingURL=types.d.ts.map
