import type {Device} from '@luma.gl/api';
import {NumericArray} from '../../types/types';
import Attribute from './attribute';
import type {BufferAccessor} from './data-column';
import type {Buffer} from '@luma.gl/webgl-legacy';
export interface TransitionSettings {
  type: string;
  /** Callback to get the value that the entering vertices are transitioning from. */
  enter?: (toValue: NumericArray, chunk?: NumericArray) => NumericArray;
  /** Callback when the transition is started */
  onStart?: () => void;
  /** Callback when the transition is done */
  onEnd?: () => void;
  /** Callback when the transition is interrupted */
  onInterrupt?: () => void;
}
export declare type InterpolationTransitionSettings = TransitionSettings & {
  type?: 'interpolation';
  /** Duration of the transition animation, in milliseconds */
  duration: number;
  /** Easing function that maps a value from [0, 1] to [0, 1], see [http://easings.net/](http://easings.net/) */
  easing?: (t: number) => number;
};
export declare type SpringTransitionSettings = TransitionSettings & {
  type: 'spring';
  /** "Tension" factor for the spring */
  stiffness: number;
  /** "Friction" factor that counteracts the spring's acceleration */
  damping: number;
};
export declare function normalizeTransitionSettings(
  userSettings: number | InterpolationTransitionSettings | SpringTransitionSettings,
  layerSettings?: boolean | Partial<TransitionSettings>
): TransitionSettings | null;
export declare function getSourceBufferAttribute(
  device: Device,
  attribute: Attribute
): [Buffer, BufferAccessor] | NumericArray;
export declare function getAttributeTypeFromSize(size: number): string;
export declare function cycleBuffers(buffers: Buffer[]): void;
export declare function getAttributeBufferLength(
  attribute: Attribute,
  numInstances: number
): number;
export declare function padBuffer({
  buffer,
  numInstances,
  attribute,
  fromLength,
  fromStartIndices,
  getData
}: {
  buffer: Buffer;
  numInstances: number;
  attribute: Attribute;
  fromLength: number;
  fromStartIndices?: NumericArray | null;
  getData?: (toValue: NumericArray, chunk?: NumericArray) => NumericArray;
}): void;
// # sourceMappingURL=attribute-transition-utils.d.ts.map
