import {MVTLayer} from '@deck.gl/geo-layers';

export default [
  {
    name: 'mvt-layer',
    viewState: {
      longitude: -100,
      latitude: 40,
      zoom: 3,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new MVTLayer({
        id: 'mvt-layer',
        data: ['./test/data/mvt-tiles/{z}/{x}/{y}.mvt'],
        getFillColor: [0, 0, 0, 128],
        getLineColor: [255, 0, 0, 128],
        onTileError: error => {
          if (error.message.includes('404')) {
            // trying to load tiles in the previous viewport, ignore
          } else {
            throw error;
          }
        },
        lineWidthMinPixels: 1,
        loadOptions: {
          mvt: {
            workerUrl: null
          }
        }
      })
    ],
    goldenImage: './test/render/golden-images/mvt-layer.png'
  }
];
