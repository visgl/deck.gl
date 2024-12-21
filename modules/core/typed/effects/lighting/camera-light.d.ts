import {PointLight} from './point-light';
import type Layer from '../../lib/layer';
export default class CameraLight extends PointLight {
  getProjectedLight({layer}: {layer: Layer}): PointLight;
}
// # sourceMappingURL=camera-light.d.ts.map
