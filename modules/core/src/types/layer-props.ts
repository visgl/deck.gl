import type {CoordinateSystem} from '../lib/constants';
import type Layer from '../lib/layer';
import type LayerExtension from '../lib/layer-extension';
import type {BinaryAttribute} from '../lib/attribute/attribute';
import type {ConstructorOf, NumericArray, TypedArray} from './types';
import type {PickingInfo} from '../lib/picking/pick-info';
import type {MjolnirEvent} from 'mjolnir.js';

import type {Buffer, Texture2D, Texture2DProps} from '@luma.gl/webgl';
import type {Loader} from '@loaders.gl/loader-utils';
import type {LightingModuleSettings} from '../shaderlib';

export type LayerData<T> =
  | Iterable<T>
  | {
      length: number;
      attributes?: Record<string, TypedArray | Buffer | BinaryAttribute>;
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

/** Function that returns a value for each object. */
export type AccessorFunction<In, Out> = (
  /**
   * The current element in the data stream.
   *
   * If `data` is an array or an iterable, the element of the current iteration is used.
   * If `data` is a non-iterable object, this argument is always `null`.
   * */
  object: In,
  /** Contextual information of the current element. */
  objectInfo: AccessorContext<In>
) => Out;

/** Either a uniform value for all objects, or a function that returns a value for each object. */
export type Accessor<In, Out> = Out | AccessorFunction<In, Out>;

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

export type Material = LightingModuleSettings['material'];

/** The unit of dimensions.
 * See https://deck.gl/docs/developer-guide/coordinate-systems#dimensions
 */
export type Unit = 'meters' | 'common' | 'pixels';

/** Rendering operation of the layer. */
export type Operation = 'draw' | 'mask' | 'terrain';

export type Texture =
  | Texture2D
  | Texture2DProps
  | HTMLImageElement
  | ImageData
  | HTMLCanvasElement
  | HTMLVideoElement
  | ImageBitmap;

/**
 * Typical types that can be supplied to the `data` property. Can be either:
 * * An `Iterable` - a list of objects to visualize.
 * * A non-iterable - an object with a `length` field.
 * * A `Promise` whose resolved value will be used as the value of the `data` prop.
 * * An `AsyncIterable` that yields data in batches. Each batch is expected to be an array of objects.
 * * `string` - a URL to load data from
 */
export type LayerDataSource<DataType> =
  | LayerData<DataType>
  | string
  | AsyncIterable<DataType[]>
  | Promise<LayerData<DataType>>;

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
  data?: unknown;
  /**
   * Callback to determine if two data values are equal.
   */
  dataComparator?:
    | (<LayerDataT = LayerData<unknown>>(newData: LayerDataT, oldData?: LayerDataT) => boolean)
    | null;
  /**
   * Callback to determine the difference between two data values, in order to perform a partial update.
   */
  _dataDiff?:
    | (<LayerDataT = LayerData<unknown>>(
        newData: LayerDataT,
        oldData?: LayerDataT
      ) => {startRow: number; endRow?: number}[])
    | null;
  /**
   * Callback to manipulate remote data when it's fetched and parsed.
   */
  dataTransform?:
    | (<LayerDataT = LayerData<unknown>>(data: unknown, previousData?: LayerDataT) => LayerDataT)
    | null;
  /**
   * Custom implementation to fetch and parse content from URLs.
   */
  fetch?: (
    url: string,
    context: {
      propName: string;
      layer: Layer;
      loaders?: Loader[];
      loadOptions?: any;
      signal?: AbortSignal;
    }
  ) => any;
  /**
   * The dependencies used to trigger re-evaluation of functional accessors (get*).
   */
  updateTriggers?: Record<string, any>;
  /**
   * Rendering operation of the layer. `+` separated list of names.
   */
  operation?: Operation | `${Operation}+${Operation}`;
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
  coordinateSystem?: CoordinateSystem;
  /**
   * The coordinate origin of the data.
   */
  coordinateOrigin?: [number, number, number];
  /**
   * A 4x4 matrix to transform local coordianates to the world space.
   */
  modelMatrix?: NumericArray | null;
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
  transitions?: Record<string, any> | null;
  /**
   * Add additional functionalities to this layer.
   */
  extensions?: LayerExtension[];
  /**
   * Add support for additional data formats.
   */
  loaders?: Loader[];
  /**
   * Options to customize the behavior of loaders
   */
  loadOptions?: any;
  /**
   * Callback to calculate the polygonOffset WebGL parameter.
   */
  getPolygonOffset?: ((params: {layerIndex: number}) => [number, number]) | null;

  /**
   * Enable GPU-based object highlighting. Default false.
   */
  autoHighlight?: boolean;
  /**
   * The index of the data object to highlight. If unspecified, the currently hoverred object is highlighted.
   */
  highlightedObjectIndex?: number | null;
  /**
   * The color of the highlight.
   */
  highlightColor?: number[] | ((pickingInfo: PickingInfo) => number[]);

  /**
   * Called when remote data is fetched and parsed.
   */
  onDataLoad?:
    | (<LayerDataT = LayerData<unknown>>(
        data: LayerDataT,
        context: {propName: string; layer: Layer}
      ) => void)
    | null;
  /**
   * Called when the layer encounters an error.
   */
  onError?: ((error: Error) => boolean | void) | null;
  /**
   * Called when the mouse enters/leaves an object of this layer.
   */
  onHover?: ((pickingInfo: PickingInfo, event: MjolnirEvent) => boolean | void) | null;
  /**
   * Called when the mouse clicks over an object of this layer.
   */
  onClick?: ((pickingInfo: PickingInfo, event: MjolnirEvent) => boolean | void) | null;
  /**
   * Called when the mouse starts dragging an object of this layer.
   */
  onDragStart?: ((pickingInfo: PickingInfo, event: MjolnirEvent) => boolean | void) | null;
  /**
   * Called when the mouse drags an object of this layer.
   */
  onDrag?: ((pickingInfo: PickingInfo, event: MjolnirEvent) => boolean | void) | null;
  /**
   * Called when the mouse releases an object of this layer.
   */
  onDragEnd?: ((pickingInfo: PickingInfo, event: MjolnirEvent) => boolean | void) | null;

  /** (Advanced) supply attribute size externally */
  numInstances?: number | null;

  /** (Advanced) supply variable-width attribute size externally */
  startIndices?: NumericArray | null;
};

export type CompositeLayerProps = LayerProps & {
  /** (Experimental) override sub layer props. Only works on a composite layer. */
  _subLayerProps?: {
    [subLayerId: string]: {
      type?: ConstructorOf<Layer>;
      [propName: string]: any;
    };
  } | null;
};
