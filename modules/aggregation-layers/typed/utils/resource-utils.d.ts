import {Device} from '@luma.gl/api';
import {GL, Framebuffer, Texture2D} from '@luma.gl/webgl-legacy';
declare type FloatTextureOptions = {
  id: string;
  width?: number;
  height?: number;
  data?: any;
  unpackFlipY?: boolean;
  parameters?: Record<GL, GL>;
};
export declare function getFloatTexture(device: Device, opts: FloatTextureOptions): Texture2D;
export declare function getFramebuffer(device: Device, opts: any): Framebuffer;
export declare function getFloatArray(array: any, size: any, fillValue?: number): any;
export {};
// # sourceMappingURL=resource-utils.d.ts.map
