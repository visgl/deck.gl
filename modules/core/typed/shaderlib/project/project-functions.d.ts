import type {CoordinateSystem} from '../../lib/constants';
import type Viewport from '../../viewports/viewport';
import type {NumericArray} from '../../types/types';
/** Get the common space position from world coordinates in the given coordinate system */
export declare function getWorldPosition(
  position: number[],
  {
    viewport,
    modelMatrix,
    coordinateSystem,
    coordinateOrigin,
    offsetMode
  }: {
    viewport: Viewport;
    modelMatrix?: NumericArray | null;
    coordinateSystem: CoordinateSystem;
    coordinateOrigin: [number, number, number];
    offsetMode?: boolean;
  }
): [number, number, number];
/**
 * Equivalent to project_position in project.glsl
 * projects a user supplied position to world position directly with or without
 * a reference coordinate system
 */
export declare function projectPosition(
  position: number[],
  params: {
    /** The current viewport */
    viewport: Viewport;
    /** The reference coordinate system used to align world position */
    coordinateSystem: CoordinateSystem;
    /** The reference coordinate origin used to align world position */
    coordinateOrigin: [number, number, number];
    /** The model matrix of the supplied position */
    modelMatrix?: NumericArray | null;
    /** The coordinate system that the supplied position is in. Default to the same as `coordinateSystem`. */
    fromCoordinateSystem?: CoordinateSystem;
    /** The coordinate origin that the supplied position is in. Default to the same as `coordinateOrigin`. */
    fromCoordinateOrigin?: [number, number, number];
  }
): [number, number, number];
// # sourceMappingURL=project-functions.d.ts.map
