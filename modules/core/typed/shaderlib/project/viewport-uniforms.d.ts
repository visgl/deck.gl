import type Viewport from '../../viewports/viewport';
import type {CoordinateSystem} from '../../lib/constants';
import type {NumericArray} from '../../types/types';
declare type Vec3 = [number, number, number];
declare type Vec4 = [number, number, number, number];
export declare function getOffsetOrigin(
  viewport: Viewport,
  coordinateSystem: CoordinateSystem,
  coordinateOrigin?: Vec3
): {
  geospatialOrigin: Vec3 | null;
  shaderCoordinateOrigin: Vec3;
  offsetMode: boolean;
};
export declare type ProjectUniforms = {
  project_uCoordinateSystem: number;
  project_uProjectionMode: number;
  project_uCoordinateOrigin: Vec3;
  project_uCommonOrigin: Vec3;
  project_uCenter: Vec4;
  project_uPseudoMeters: boolean;
  project_uViewportSize: [number, number];
  project_uDevicePixelRatio: number;
  project_uFocalDistance: number;
  project_uCommonUnitsPerMeter: Vec3;
  project_uCommonUnitsPerWorldUnit: Vec3;
  project_uCommonUnitsPerWorldUnit2: Vec3;
  /** 2^zoom */
  project_uScale: number;
  project_uWrapLongitude: boolean;
  project_uViewProjectionMatrix: NumericArray;
  project_uModelMatrix: NumericArray;
  project_uCameraPosition: Vec3;
};
export declare type ProjectModuleSettings = {
  viewport: Viewport;
  devicePixelRatio?: number;
  modelMatrix?: NumericArray | null;
  coordinateSystem?: CoordinateSystem;
  coordinateOrigin?: Vec3;
  autoWrapLongitude?: boolean;
};
/**
 * Returns uniforms for shaders based on current projection
 * includes: projection matrix suitable for shaders
 *
 * TODO - Ensure this works with any viewport, not just WebMercatorViewports
 *
 * @param {WebMercatorViewport} viewport -
 * @return {Float32Array} - 4x4 projection matrix that can be used in shaders
 */
export declare function getUniformsFromViewport({
  viewport,
  devicePixelRatio,
  modelMatrix,
  coordinateSystem,
  coordinateOrigin,
  autoWrapLongitude
}: ProjectModuleSettings): ProjectUniforms;
export {};
// # sourceMappingURL=viewport-uniforms.d.ts.map
