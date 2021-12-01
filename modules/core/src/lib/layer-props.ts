import {COORDINATE_SYSTEM} from './constants';
import type Layer from './layer';

interface NonIterableData {
  length: number;
  attributes?: Record<string, BinaryAttribute>;
}
type LayerData = Iterable<any> | NonIterableData;

// TODO
type PickingInfo = any;
type MjolnirEvent = any;
type BinaryAttribute = any;

export interface LayerProps {
  id: string;

  /* Data */
  data?: LayerData | string | AsyncIterable<any> | Promise<LayerData>;
  dataComparator?: (newData: LayerData, oldData?: LayerData) => boolean;
  _dataDiff?: (newData: LayerData, oldData?: LayerData) => {startRow: number; endRow?: number}[];
  dataTransform?: (data: LayerData, previousData?: LayerData) => LayerData;
  fetch?: (
    url: string,
    context: {
      propName: string;
      layer: Layer;
      loaders?: any[];
      loadOptions?: any;
      signal?: AbortSignal;
    }
  ) => any;
  updateTriggers?: Record<string, any>;

  /* Config */
  visible?: boolean;
  pickable?: boolean;
  opacity?: number;
  coordinateSystem?: typeof COORDINATE_SYSTEM[keyof typeof COORDINATE_SYSTEM];
  coordinateOrigin?: [number, number, number];
  modelMatrix?: number[];
  wrapLongitude?: boolean;
  positionFormat?: 'XYZ' | 'XY';
  colorFormat?: 'RGBA' | 'RGB';
  parameters?: any;
  transitions?: Record<string, any>;
  extensions?: any[];
  loaders?: any[];
  getPolygonOffset?: (params: {layerIndex: number}) => [number, number] | null;

  /* Highlighting */
  highlightedObjectIndex?: number;
  autoHighlight?: boolean;
  highlightColor?: number[] | ((pickingInfo: PickingInfo) => number[]);

  /* Callbacks */
  onDataLoad?: (data: LayerData, context: {propName: string; layer: Layer}) => void;
  onError?: (error: Error) => void;
  onHover?: (pickingInfo: PickingInfo, event: MjolnirEvent) => boolean | void;
  onClick?: (pickingInfo: PickingInfo, event: MjolnirEvent) => boolean | void;
  onDragStart?: (pickingInfo: PickingInfo, event: MjolnirEvent) => boolean | void;
  onDrag?: (pickingInfo: PickingInfo, event: MjolnirEvent) => boolean | void;
  onDragEnd?: (pickingInfo: PickingInfo, event: MjolnirEvent) => boolean | void;
}
