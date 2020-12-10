import {scaleLinear} from 'd3-scale';
import getPalette, {NULL_COLOR} from './palette';
import {getAttrValue} from './utils';

export default function colorContinuous({attr, range, colors, nullColor = NULL_COLOR}) {
  if (Array.isArray(range)) {
    const palette = typeof colors === 'string' ? getPalette(colors) : colors;

    const color = scaleLinear()
      .domain(range)
      .range(palette);

    return d => {
      const value = getAttrValue(attr, d);
      return Number.isFinite(value) ? color(value) : nullColor;
    };
  }

  return () => NULL_COLOR;
}
