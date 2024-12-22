import {DirectionalLight} from './directional-light';
import type Layer from '../../lib/layer';
export declare type SunLightOptions = {
  id?: string;
  /** Light color, [r, g, b] in the 0-255 range
   * @default [255, 255, 255]
   */
  color?: number[];
  /** Light intensity, higher number is brighter
   * @default 1.0
   */
  intensity?: number;
  /**
   * The time at which to position the sun. Either a Date object or a timestamp (milliseconds elapsed since unix time 0)
   */
  timestamp: number | Date;
  /** (Experimental) render shadows casted by this light
   * @default false
   */
  _shadow?: boolean;
};
export default class SunLight extends DirectionalLight {
  timestamp: number | Date;
  constructor(opts: SunLightOptions);
  getProjectedLight({layer}: {layer: Layer}): DirectionalLight;
}
// # sourceMappingURL=sun-light.d.ts.map
