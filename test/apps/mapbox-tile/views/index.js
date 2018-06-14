import createView from './create-view';
import {geoMercatorRaw, geoStereographicRaw} from 'd3-geo';

export const MercatorView = createView(geoMercatorRaw);
export const StereographicView = createView(geoStereographicRaw);

StereographicView.vs = `
  float cy = cos(y);
  float k = 1.0 + cos(x) * cy;
  return vec2(cy * sin(x) / k, sin(y) / k);
`;

export default StereographicView;
