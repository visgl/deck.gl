import {Device} from '@luma.gl/api';
import {ProgramManager} from '@luma.gl/webgl-legacy';
import {gouraudLighting, phongLighting} from '@luma.gl/shadertools';
import project from './project/project';
import project32 from './project32/project32';
import shadow from './shadow/shadow';
import picking from './picking/picking';
export declare function createProgramManager(device: Device): ProgramManager;
export {picking, project, project32, gouraudLighting, phongLighting, shadow};
export type {ProjectUniforms} from './project/viewport-uniforms';
export declare type PickingUniforms = {
  picking_uActive: boolean;
  picking_uAttribute: boolean;
  picking_uSelectedColor: [number, number, number];
  picking_uSelectedColorValid: boolean;
  picking_uHighlightColor: [number, number, number, number];
};
export declare type LightingModuleSettings = {
  material:
    | boolean
    | {
        ambient?: number;
        diffuse?: number;
        shininess?: number;
        specularColor?: [number, number, number];
      };
};
// # sourceMappingURL=index.d.ts.map
