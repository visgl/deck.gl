import {Device} from '@luma.gl/api';
import {GL} from '@luma.gl/webgl-legacy';
export declare function getBounds(points: number[][]): number[];
export declare function boundsContain(currentBounds: number[], targetBounds: number[]): boolean;
export declare function packVertices(points: number[][], dimensions?: number): Float32Array;
export declare function scaleToAspectRatio(
  boundingBox: number[],
  width: number,
  height: number
): number[];
export declare function getTextureCoordinates(point: number[], bounds: number[]): number[];
export declare function getTextureParams({
  device,
  floatTargetSupport
}: {
  device: Device;
  floatTargetSupport?: boolean;
}): {
  format: GL;
  type: GL;
};
// # sourceMappingURL=heatmap-layer-utils.d.ts.map
