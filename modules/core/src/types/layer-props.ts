import type {CoordinateSystem} from '../lib/constants';
import type Layer from '../lib/layer';

import type {NumericArray} from './types';
import type {PickingInfo} from '../lib/picking/pick-info';
import type {MjolnirEvent} from 'mjolnir.js';

import type {Buffer} from '@luma.gl/webgl';

export type LayerData<T> =
  | Iterable<T>
  | {
      length: number;
      attributes?: Record<string, BinaryAttribute>;
    };

export type AccessorContext<T> = {
  /** The index of the current iteration */
  index: number;
  /** The value of the `data` prop */
  data: LayerData<T>;
  /** A pre-allocated array. The accessor function can optionally fill data into this array and return it,
   * instead of creating a new array for every object. In some browsers this improves performance significantly
   * by reducing garbage collection. */
  target: number[];
};

/** Either a uniform value for all objects, or a function that returns a value for each object. */
export type Accessor<In, Out> =
  | Out
  | ((
      /** The current element in the data stream.
       * If `data` is an array or an iterable, the element of the current iteration is used.
       * If `data` is a non-iterable object, this argument is always `null`. */
      object: In,
      /** Contextual information of the current element. */
      objectInfo: AccessorContext<In>
    ) => Out);

/** A position in the format of `[lng, lat, alt?]` or `[x, y, z?]` depending on the coordinate system.
 * See https://deck.gl/docs/developer-guide/coordinate-systems#positions
 */
export type Position = [number, number] | [number, number, number] | Float32Array | Float64Array;

/** A color in the format of `[r, g, b, a?]` */
export type Color =
  | [number, number, number]
  | [number, number, number, number]
  | Uint8Array
  | Uint8ClampedArray;

/** The unit of dimensions.
 * See https://deck.gl/docs/developer-guide/coordinate-systems#dimensions
 */
export type Unit = 'meters' | 'common' | 'pixels';

/** Supply binary buffers directly to the layer */
type BinaryAttribute =
  | Buffer
  | {
      buffer?: Buffer;
      value?: NumericArray;
      /** A WebGL data type, see [vertexAttribPointer](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer#parameters). */
      type?: number;
      /** The number of elements per vertex attribute. */
      size?: number;
      /** Offset of the first vertex attribute into the buffer, in bytes. */
      offset?: number;
      /** The offset between the beginning of consecutive vertex attributes, in bytes. */
      stride?: number;
      /** Whether data values should be normalized. Note that all color attributes in deck.gl layers are normalized by default. */
      normalized?: boolean;
    };

/**
 * Base Layer prop types
 */
export type LayerProps<DataType = any> = {
  /**
   * Unique identifier of the layer.
   */
  id: string;
  /**
   * The data to visualize.
   */
  data?: LayerData<DataType> | string | AsyncIterable<DataType> | Promise<LayerData<DataType>>;
  /**
   * Callback to determine if two data values are equal.
   */
  dataComparator?: (newData: LayerData<DataType>, oldData?: LayerData<DataType>) => boolean;
  /**
   * Callback to determine the difference between two data values, in order to perform a partial update.
   */
  _dataDiff?: (
    newData: LayerData<DataType>,
    oldData?: LayerData<DataType>
  ) => {startRow: number; endRow?: number}[];
  /**
   * Callback to manipulate remote data when it's fetched and parsed.
   */
  dataTransform?: (
    data: LayerData<DataType>,
    previousData?: LayerData<DataType>
  ) => LayerData<DataType>;
  /**
   * Custom implementation to fetch and parse content from URLs.
   */
  fetch: (
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
   * The purpose of the layer
   */
  operation: 'draw' | 'mask';
  /**
   * If the layer should be rendered. Default true.
   */
  visible: boolean;
  /**
   * If the layer can be picked on pointer events. Default false.
   */
  pickable: boolean;
  /**
   * Opacity of the layer, between 0 and 1. Default 1.
   */
  opacity: number;
  /**
   * The coordinate system of the data. Default to COORDINATE_SYSTEM.LNGLAT in a geospatial view or COORDINATE_SYSTEM.CARTESIAN in a non-geospatial view.
   */
  coordinateSystem: CoordinateSystem;
  /**
   * The coordinate origin of the data.
   */
  coordinateOrigin: [number, number, number];
  /**
   * A 4x4 matrix to transform local coordianates to the world space.
   */
  modelMatrix?: NumericArray;
  /**
   * (Geospatial only) normalize geometries that cross the 180th meridian. Default false.
   */
  wrapLongitude: boolean;
  /**
   * The format of positions, default 'XYZ'.
   */
  positionFormat: 'XYZ' | 'XY';
  /**
   * The format of colors, default 'RGBA'.
   */
  colorFormat: 'RGBA' | 'RGB';
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
  extensions: any[];
  /**
   * Add support for additional data formats.
   */
  loaders?: any[];
  /**
   * Options to customize the behavior of loaders
   */
  loadOptions?: any;
  /**
   * Callback to calculate the polygonOffset WebGL parameter.
   */
  getPolygonOffset?: (params: {layerIndex: number}) => [number, number] | null;

  /**
   * Enable GPU-based object highlighting. Default false.
   */
  autoHighlight: boolean;
  /**
   * The index of the data object to highlight. If unspecified, the currently hoverred object is highlighted.
   */
  highlightedObjectIndex: number | null;
  /**
   * The color of the highlight.
   */
  highlightColor: number[] | ((pickingInfo: PickingInfo) => number[]);

  /**
   * Called when remote data is fetched and parsed.
   */
  onDataLoad?: (data: LayerData<DataType>, context: {propName: string; layer: Layer}) => void;
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

  /** (Advanced) supply attribute size externally */
  numInstances?: number;

  /** (Advanced) supply variable-width attribute size externally */
  startIndices?: NumericArray;
};

/**
 * Base CompositeLayer prop types
 */
export type CompositeLayerProps<DataType = any> = LayerProps<DataType> & {
  _subLayerProps: {
    [subLayerId: string]: {
      type?: typeof Layer;
      [propName: string]: any;
    };
  };
};
