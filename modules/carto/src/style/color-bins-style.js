import {scaleThreshold} from 'd3-scale';
import {getPalette, isNumberValid, NULL_COLOR} from './utils';

export default function colorBins({domain, colors, nullColor = NULL_COLOR}) {
  if (Array.isArray(domain)) {
    const palette = typeof colors === 'string' ? getPalette(colors, domain.length) : colors;

    const color = scaleThreshold()
      .domain(domain)
      .range(palette);

    return d => (isNumberValid(d) ? color(d) : nullColor);
  }

  return () => NULL_COLOR;
}
