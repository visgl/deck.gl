import createViewport from './create-viewport';
import {geoMercatorRaw, geoStereographicRaw} from 'd3-geo';

export const MercatorViewport = createViewport(geoMercatorRaw);
export const StereographicViewport = createViewport(geoStereographicRaw);

StereographicViewport.glsl = `
  float cy = cos(y);
  float k = 1.0 + cos(x) * cy;
  return vec2(cy * sin(x) / k, sin(y) / k);
`;

export default StereographicViewport;
