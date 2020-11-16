import {scaleThreshold} from 'd3-scale';
import {range} from 'd3-array';

const N_BINS = 5;

export default function ColorsBins({breaks, colors}) {
  let domain;
  if (Array.isArray(breaks)) {
    domain = breaks;
  } else {
    const {stats, method, bins = N_BINS} = breaks;

    if (method === 'quantiles') {
      const minQuantile = parseInt(Object.keys(stats.quantiles[0]), 10);
      const maxQuantile = parseInt(Object.keys(stats.quantiles[stats.quantiles.length - 1]), 10);
      if (bins < minQuantile || bins > maxQuantile) {
        throw new Error(
          `Invalid bins value. It shoud be between ${minQuantile} and ${maxQuantile}`
        );
      }
      const quantiles = stats.quantiles.find(d => d.hasOwnProperty(bins));
      domain = quantiles[bins];
    } else {
      const {min, max} = stats;
      const step = (max - min) / (bins - 1);
      domain = range(min, max, step);
      domain.push(domain[domain.length - 1] + step);
    }
  }

  return scaleThreshold()
    .domain(domain)
    .range(colors);
}
