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

/**
 * Base Layer prop types
 */
export type LayerProps = {
  /**
   * Unique identifier of the layer.
   */
  id: string;
  /**
   * The data to visualize.
   */
  data?: LayerData | string | AsyncIterable<any> | Promise<LayerData>;
  /**
   * Callback to determine if two data values are equal.
   */
  dataComparator?: (newData: LayerData, oldData?: LayerData) => boolean;
  /**
   * Callback to determine the difference between two data values, in order to perform a partial update.
   */
  _dataDiff?: (newData: LayerData, oldData?: LayerData) => {startRow: number; endRow?: number}[];
  /**
   * Callback to manipulate remote data when it's fetched and parsed.
   */
  dataTransform?: (data: LayerData, previousData?: LayerData) => LayerData;
  /**
   * Custom implementation to fetch and parse content from URLs.
   */
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
  /**
   * The dependencies used to trigger re-evaluation of functional accessors (get*).
   */
  updateTriggers?: Record<string, any>;

  /**
   * If the layer should be rendered. Default true.
   */
  visible?: boolean;
  /**
   * If the layer can be picked on pointer events. Default false.
   */
  pickable?: boolean;
  /**
   * Opacity of the layer, between 0 and 1. Default 1.
   */
  opacity?: number;
  /**
   * The coordinate system of the data. Default to COORDINATE_SYSTEM.LNGLAT in a geospatial view or COORDINATE_SYSTEM.CARTESIAN in a non-geospatial view.
   */
  coordinateSystem?: typeof COORDINATE_SYSTEM[keyof typeof COORDINATE_SYSTEM];
  /**
   * The coordinate origin of the data.
   */
  coordinateOrigin?: [number, number, number];
  /**
   * A 4x4 matrix to transform local coordianates to the world space.
   */
  modelMatrix?: number[];
  /**
   * (Geospatial only) normalize geometries that cross the 180th meridian. Default false.
   */
  wrapLongitude?: boolean;
  /**
   * The format of positions, default 'XYZ'.
   */
  positionFormat?: 'XYZ' | 'XY';
  /**
   * The format of colors, default 'RGBA'.
   */
  colorFormat?: 'RGBA' | 'RGB';
  /**
   * Override the WebGL parameters used to draw this layer. See https://luma.gl/modules/gltools/docs/api-reference/parameter-setting#parameters
   */
  parameters?: any;
  /**
   * Create smooth transitions when prop values update.
   */
  transitions?: Record<string, any>;
  /**
   * Add additional functionalities to this layer.
   */
  extensions?: any[];
  /**
   * Add support for additional data formats.
   */
  loaders?: any[];
  /**
   * Callback to calculate the polygonOffset WebGL parameter.
   */
  getPolygonOffset?: (params: {layerIndex: number}) => [number, number] | null;

  /**
   * Enable GPU-based object highlighting. Default false.
   */
  autoHighlight?: boolean;
  /**
   * The index of the data object to highlight. If unspecified, the currently hoverred object is highlighted.
   */
  highlightedObjectIndex?: number;
  /**
   * The color of the highlight.
   */
  highlightColor?: number[] | ((pickingInfo: PickingInfo) => number[]);

  /**
   * Called when remote data is fetched and parsed.
   */
  onDataLoad?: (data: LayerData, context: {propName: string; layer: Layer}) => void;
  /**
   * Called when the layer encounters an error.
   */
  onError?: (error: Error) => boolean | void;
  /**
   * Called when the mouse enters/leaves an object of this layer.
   */
  onHover?: (pickingInfo: PickingInfo, event: MjolnirEvent) => boolean | void;
  /**
   * Called when the mouse clicks over an object of this layer.
   */
  onClick?: (pickingInfo: PickingInfo, event: MjolnirEvent) => boolean | void;
  /**
   * Called when the mouse starts dragging an object of this layer.
   */
  onDragStart?: (pickingInfo: PickingInfo, event: MjolnirEvent) => boolean | void;
  /**
   * Called when the mouse drags an object of this layer.
   */
  onDrag?: (pickingInfo: PickingInfo, event: MjolnirEvent) => boolean | void;
  /**
   * Called when the mouse releases an object of this layer.
   */
  onDragEnd?: (pickingInfo: PickingInfo, event: MjolnirEvent) => boolean | void;
};
