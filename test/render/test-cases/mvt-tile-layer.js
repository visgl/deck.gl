import {MVTTileLayer} from '@deck.gl/geo-layers';

export default [
  {
    name: 'mvt-tile-layer',
    viewState: {
      longitude: -100,
      latitude: 40,
      zoom: 3,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new MVTTileLayer({
        urlTemplates: ['./test/data/mvt-tiles/{z}/{x}/{y}.mvt'],
        getFillColor: [0, 0, 0, 128],
        getLineColor: [255, 0, 0, 128],
        lineWidthMinPixels: 1
      })
    ],
    goldenImage: './test/render/golden-images/mvt-tile-layer.png'
  }
];
