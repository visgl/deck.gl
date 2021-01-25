import {MVTLayer} from '@deck.gl/geo-layers';

function createMVTLayer(id, {highlight = false, binary = false} = {}) {
  const goldenImage = highlight
    ? './test/render/golden-images/mvt-layer-highlight.png'
    : './test/render/golden-images/mvt-layer.png';
  const highlightProps = highlight
    ? {highlightedFeatureId: 1862, uniqueIdProperty: 'cartodb_id'}
    : {};
  return {
    name: id,
    viewState: {
      longitude: -100,
      latitude: 40,
      zoom: 3,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new MVTLayer({
        id,
        data: ['./test/data/mvt-tiles/{z}/{x}/{y}.mvt'],
        getFillColor: [0, 0, 0, 128],
        getLineColor: [255, 0, 0, 128],
        ...highlightProps,
        onTileError: error => {
          if (error.message.includes('404')) {
            // trying to load tiles in the previous viewport, ignore
          } else {
            throw error;
          }
        },
        lineWidthMinPixels: 1,
        binary,
        loadOptions: {
          mvt: {
            workerUrl: null
          }
        }
      })
    ],
    goldenImage
  };
}

export default [
  createMVTLayer('mvt-layer'),
  createMVTLayer('mvt-layer-highlight', {highlight: true}),
  createMVTLayer('mvt-layer-binary', {binary: true}),
  createMVTLayer('mvt-layer-binary-highlight', {highlight: true, binary: true})
];
