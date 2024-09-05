import {Deck, OrthographicView} from '@deck.gl/core';
import {HistogramLayer} from './histogram-layer';

new Deck({
  views: new OrthographicView(),
  initialViewState: {
    target: [0, 0, 0],
    zoom: 1
  },
  controller: true,
  layers: [
    new HistogramLayer({
      data: generateData(10000, 0, 100),
      getPosition: d => d,
      gpuAggregation: true,
      binSize: 1,
      heightScale: 1
    })
  ]
});

function generateData(count: number, mean: number, stdev: number) {
  const result: number[] = [];
  for (let i = 0; i < count; i++) {
    // Gaussian random
    const u = 1 - Math.random();
    const v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    result.push(z * stdev + mean);
  }
  return result;
}
