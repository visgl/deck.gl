import {scaleLinear} from 'd3-scale';
import {gePalette, NULL_COLOR} from './utils';

export default function ColorsContinuous({breaks, colors, nulltColor = NULL_COLOR}) {
  let domain;
  if (Array.isArray(breaks)) {
    domain = breaks;
  } else {
    const {stats} = breaks;
    domain = [stats.min, stats.max];
  }

  const palette = typeof colors === 'string' ? gePalette(colors) : colors;

  const color = scaleLinear()
    .domain(domain)
    .range(palette);

  return d => {
    return d === (undefined || null) ? nulltColor : color(d);
  };
}
