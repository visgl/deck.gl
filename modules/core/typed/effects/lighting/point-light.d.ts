import type Layer from '../../lib/layer';
export declare type PointLightOptions = {
  id?: string;
  /** Light color, [r, g, b] in the 0-255 range
   * @default [255, 255, 255]
   */
  color?: number[];
  /** Light intensity, higher number is brighter
   * @default 1.0
   */
  intensity?: number;
  /** Light position [x, y, z] in the common space
   * @default [0.0, 0.0, 1.0]
   */
  position?: number[];
  /** Light attenuation
   * @default [0.0, 0.0, 1.0]
   */
  attenuation?: number[];
};
export declare class PointLight {
  id: string;
  color: number[];
  intensity: number;
  type: string;
  position: number[];
  attenuation: number[];
  protected projectedLight: PointLight;
  constructor(props?: PointLightOptions);
  getProjectedLight({layer}: {layer: Layer}): PointLight;
}
// # sourceMappingURL=point-light.d.ts.map
