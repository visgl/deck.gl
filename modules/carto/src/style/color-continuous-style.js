import {scaleLinear} from 'd3-scale';
import {getPalette, NULL_COLOR} from './utils';

export default function colorContinuous({range, colors, nullColor = NULL_COLOR}) {
  if (Array.isArray(range)) {
    const palette = typeof colors === 'string' ? getPalette(colors) : colors;

    const color = scaleLinear()
      .domain(range)
      .range(palette);

    return d => {
      return d === (undefined || null) ? nullColor : color(d);
    };
  }

  return NULL_COLOR;
}
