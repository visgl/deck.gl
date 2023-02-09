import {ScatterplotLayer} from '@deck.gl/layers';
import {CollideExtension, MaskExtension} from '@deck.gl/extensions';
import {points} from 'deck.gl-test/data';

export default [
  {
    name: 'collide-effect-simple',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new ScatterplotLayer({
        id: 'bike-parking',
        data: points,
        extensions: [new CollideExtension()],
        getPosition: d => d.COORDINATES,
        getRadius: 10,
        getFillColor: d => {
          const value = (255 * (2014 - (d.YR_INSTALLED || 1997))) / 21; // range 1997-2014
          return [value, 0, 255 - value];
        },
        radiusUnits: 'pixels'
      })
    ],
    imageDiffOptions: {
      threshold: 0.985
    },
    goldenImage: './test/render/golden-images/collide-effect-simple.png'
  }
];
