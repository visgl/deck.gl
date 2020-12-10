import {scaleThreshold} from 'd3-scale';
import {getPalette, NULL_COLOR} from './utils';

export default function colorBins({breaks, colors, nullColor = NULL_COLOR}) {
  if (Array.isArray(breaks)) {
    const palette = typeof colors === 'string' ? getPalette(colors, breaks.length + 1) : colors;

    const color = scaleThreshold()
      .domain(breaks)
      .range(palette);

    return d => {
      return d === (undefined || null) ? nullColor : color(d);
    };
  }

  return () => NULL_COLOR;
}
