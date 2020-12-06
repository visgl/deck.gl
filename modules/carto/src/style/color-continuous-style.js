import {scaleLinear} from 'd3-scale';
import {getPalette, NULL_COLOR} from './utils';

export default function ColorContinuous({range, colors, nullColor = NULL_COLOR}) {
  let domain;
  if (Array.isArray(range)) {
    domain = range;
  } else {
    const {stats} = range;
    domain = [stats.min, stats.max];
  }

  const palette = typeof colors === 'string' ? getPalette(colors) : colors;

  const color = scaleLinear()
    .domain(domain)
    .range(palette);

  return d => {
    return d === (undefined || null) ? nullColor : color(d);
  };
}
