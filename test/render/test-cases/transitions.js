/* eslint-disable callback-return */
import {OrthographicView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';

const POLYGONS1 = [
  {polygon: [[-20, -20], [-10, -20], [-20, -10]], color: [255, 0, 0]},
  {polygon: [[20, 20], [10, 20], [20, 10]], color: [204, 255, 0]},
  {polygon: [[-20, 20], [-10, 20], [-20, 10]], color: [0, 255, 102]},
  {polygon: [[20, -20], [10, -20], [20, -10]], color: [0, 102, 255]},
  {polygon: [[-10, -10], [10, -10], [10, 10], [-10, 10]], color: [204, 0, 255]}
];

const POLYGONS2 = [
  {polygon: [[-25, 0], [-15, 0], [-15, 10], [-25, 10]], color: [255, 153, 0]},
  {polygon: [[25, 0], [15, 0], [15, -10], [25, -10]], color: [51, 255, 0]},
  {polygon: [[0, 25], [10, 25], [10, 15], [0, 15]], color: [0, 255, 255]},
  {polygon: [[0, -25], [-10, -25], [-10, -15], [0, -15]], color: [51, 0, 255]},
  {polygon: [[0, -10], [10, 0], [0, 10], [-10, 0]], color: [255, 0, 153]}
];

const scatterplotLayer1 = new ScatterplotLayer({
  id: 'scatterplot-transition',
  data: POLYGONS1.flatMap(d => d.polygon.map(p => ({position: p, color: d.color}))),
  getPotision: d => d.position,
  getRadius: 2,
  getLineWidth: 1,
  getFillColor: [255, 255, 255],
  getLineColor: d => d.color,
  stroked: true,
  transitions: {
    getPosition: 1000,
    getLineWidth: 1000,
    getFillColor: 1000,
    getLineColor: 1000
  }
});

const scatterplotLayer2 = new ScatterplotLayer({
  id: 'scatterplot-transition',
  data: POLYGONS2.flatMap(d => d.polygon.map(p => ({position: p, color: d.color}))),
  getPotision: d => d.position,
  getRadius: 2,
  getLineWidth: 0,
  getFillColor: d => d.color,
  getLineColor: [255, 255, 0],
  stroked: true,
  transitions: {
    getPosition: 1000,
    getLineWidth: 1000,
    getFillColor: 1000,
    getLineColor: 1000
  }
});

export default [
  {
    name: 'scatterplot-transition-1',
    views: new OrthographicView(),
    viewState: {
      target: [0, 0, 0],
      zoom: 3
    },
    layers: [scatterplotLayer1],
    onAfterRender: ({deck, layers, done}) => {
      const {timeline} = layers[0].context;
      timeline.pause();
      timeline.setTime(0);
      done();
    },
    goldenImage: './test/render/golden-images/transition-scatterplot-1.png'
  },
  {
    name: 'scatterplot-transition-2',
    views: new OrthographicView(),
    viewState: {
      target: [0, 0, 0],
      zoom: 3
    },
    layers: [scatterplotLayer2],
    onAfterRender: ({deck, layers, done}) => {
      const {timeline} = layers[0].context;
      if (timeline.getTime() === 0) {
        timeline.setTime(100);
      } else {
        done();
      }
    },
    goldenImage: './test/render/golden-images/transition-scatterplot-2.png'
  },
  {
    name: 'scatterplot-transition-3',
    views: new OrthographicView(),
    viewState: {
      target: [0, 0, 0],
      zoom: 3
    },
    layers: [scatterplotLayer2],
    onAfterRender: ({deck, layers, done}) => {
      const {timeline} = layers[0].context;
      if (timeline.getTime() !== 500) {
        timeline.setTime(500);
      } else {
        done();
      }
    },
    goldenImage: './test/render/golden-images/transition-scatterplot-3.png'
  },
  {
    name: 'scatterplot-transition-4',
    views: new OrthographicView(),
    viewState: {
      target: [0, 0, 0],
      zoom: 3
    },
    layers: [scatterplotLayer2],
    onAfterRender: ({deck, layers, done}) => {
      const {timeline} = layers[0].context;
      if (timeline.getTime() !== 1000) {
        timeline.setTime(1000);
      } else {
        done();
      }
    },
    goldenImage: './test/render/golden-images/transition-scatterplot-4.png'
  }
];
