import {LayerExtension} from '@deck.gl/core';
import type {Layer} from '@deck.gl/core';
/** @deprecated Adds the legacy 64-bit precision to geospatial layers. */
export default class Fp64Extension extends LayerExtension {
  static extensionName: string;
  getShaders(this: Layer): any;
}
// # sourceMappingURL=fp64.d.ts.map
