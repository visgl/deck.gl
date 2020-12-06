import {scaleThreshold} from 'd3-scale';
import {range} from 'd3-array';
import {getPalette, NULL_COLOR} from './utils';

const N_BINS = 5;

export default function ColorBins({breaks, colors, nullColor = NULL_COLOR}) {
  let domain;
  if (Array.isArray(breaks)) {
    domain = breaks;
  } else {
    const {stats, method, bins = N_BINS} = breaks;

    if (method === 'quantiles') {
      const minQuantile = parseInt(Object.keys(stats.quantiles[0]), 10);
      const maxQuantile = parseInt(Object.keys(stats.quantiles[stats.quantiles.length - 1]), 10);
      if (bins < minQuantile || bins > maxQuantile) {
        throw new Error(`Invalid bins value. Should be between ${minQuantile} and ${maxQuantile}`);
      }
      const quantiles = stats.quantiles.find(d => d.hasOwnProperty(bins));
      domain = quantiles[bins];
    } else {
      const {min, max} = stats;
      const step = (max - min) / bins;
      domain = range(min + step, max, step);
    }
  }

  const palette = typeof colors === 'string' ? getPalette(colors, domain.length + 1) : colors;

  const color = scaleThreshold()
    .domain(domain)
    .range(palette);

  return d => {
    return d === (undefined || null) ? nullColor : color(d);
  };
}
