/* global document,window */
import {Deck, OrthographicView} from '@deck.gl/core';
import {HistogramLayer} from './layers/histogram-layer';

const slider = document.createElement('input');
document.getElementById('controls').append(slider);
slider.type = 'range';
slider.min = '1';
slider.max = '100';
slider.step = '1';
slider.value = '10';
slider.oninput = update;

const metricsMessage = document.getElementById('metrics') as HTMLDivElement;
const DATA = generateDataSample(1e6);

const deck = new Deck({
  views: new OrthographicView({
    flipY: true,
    padding: {top: '90%'}
  }),
  // @ts-ignore
  controller: {zoomAxis: 'X', maxZoom: 4, minZoom: -2},
  initialViewState: {
    target: [0, 0, 0],
    zoom: [0, 0]
  },
  getTooltip: info => info.object?.toString(),
  _onMetrics: ({fps}) => (metricsMessage.innerText = `FPS: ${fps.toFixed(1)}`)
});
update();

function update() {
  const binSize = Number(slider.value);
  const layer = new HistogramLayer({
    data: DATA,
    getValue: d => d,
    binSize,
    color: [160, 160, 180],
    gap: 0.1,
    heightScale: {max: window.innerHeight * 0.8},
    pickable: true,
    autoHighlight: true
  });

  deck.setProps({layers: [layer]});
}

function generateDataSample(count: number): number[] {
  const result = new Array(count);
  for (let i = 0; i < count; i++) {
    result[i] = gaussianRandom(0, 150);
  }
  return result;
}

function gaussianRandom(mean: number, stdev: number) {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
}
