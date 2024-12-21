import {Device} from '@luma.gl/api';
import {GL, Model, Framebuffer} from '@luma.gl/webgl-legacy';
export declare function supportsFloatTarget(device: Device): boolean;
export declare function getFramebuffer(device: Device, useFloatTarget: boolean): Framebuffer;
export declare function getModel(
  device: Device,
  shaderOptions: any,
  useFloatTarget: boolean
): Model;
export declare const parameters: {
  blend: boolean;
  blendFunc: GL[];
  blendEquation: GL[];
  depthTest: boolean;
};
// # sourceMappingURL=aggregator.d.ts.map
