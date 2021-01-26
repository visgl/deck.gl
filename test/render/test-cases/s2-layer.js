import {S2Layer} from '@deck.gl/geo-layers';
import {s2cells} from 'deck.gl-test/data';

export default [
  {
    name: 's2-layer',
    viewState: {
      latitude: 37.75,
      longitude: -122.45,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new S2Layer({
        data: s2cells,
        opacity: 0.8,
        filled: true,
        stroked: false,
        getS2Token: f => f.token,
        getFillColor: f => [f.value * 255, (1 - f.value) * 255, (1 - f.value) * 128],
        pickable: true
      })
    ],
    goldenImage: './test/render/golden-images/s2-layer.png'
  },
  {
    name: 's2-layer-l1',
    viewState: {
      latitude: 0,
      longitude: 0,
      zoom: 0,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new S2Layer({
        // prettier-ignore
        data: [
          '04', '0c', '14', '1c', '24', '2c', '34', '3c',
          '44', '4c', '54', '5c', '64', '6c', '74', '7c',
          '84', '8c', '94', '9c', 'a4', 'ac', 'b4', 'bc',
        ],
        opacity: 0.6,
        getS2Token: f => f,
        filled: false,
        stroked: true,
        lineWidthMinPixels: 4,
        pickable: true
      })
    ],
    goldenImage: './test/render/golden-images/s2-layer-l1.png'
  },
  {
    name: 's2-layer-l2',
    viewState: {
      latitude: 40,
      longitude: -100,
      zoom: 1.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new S2Layer({
        data: ['4b', '4d', '53', '55', '81', '87', '89', '8b'],
        opacity: 0.6,
        getS2Token: f => f,
        filled: false,
        stroked: true,
        lineWidthMinPixels: 4,
        pickable: true
      })
    ],
    goldenImage: './test/render/golden-images/s2-layer-l2.png'
  }
];
