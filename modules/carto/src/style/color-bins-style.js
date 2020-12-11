import {scaleThreshold} from 'd3-scale';
import getPalette, {NULL_COLOR} from './palette';
import {getAttrValue} from './utils';

export default function colorBins({attr, domain, colors, nullColor = NULL_COLOR}) {
  if (Array.isArray(domain)) {
    const palette = typeof colors === 'string' ? getPalette(colors, domain.length) : colors;

    const color = scaleThreshold()
      .domain(domain)
      .range(palette);

    return d => {
      const value = getAttrValue(attr, d);
      return Number.isFinite(value) ? color(value) : nullColor;
    };
  }

  return () => NULL_COLOR;
}
