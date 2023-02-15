import {ScatterplotLayer} from '@deck.gl/layers';
import {CollideExtension, MaskExtension} from '@deck.gl/extensions';
import {points} from 'deck.gl-test/data';

const getYear = d => d.YR_INSTALLED || 1997;

export default [
  {
    name: 'simple',
    props: {}
  },
  {
    name: '2x-radius',
    props: {collideTestProps: {radiusScale: 2}}
  },
  {
    name: 'disabled',
    props: {collideEnabled: false}
  },
  {
    name: 'ascending',
    props: {getCollidePriority: d => getYear(d) - 2000}
  },
  {
    name: 'descending',
    props: {getCollidePriority: d => 2000 - getYear(d)}
  }
].map(({name, props}) => ({
  name: `collide-effect-${name}`,
  viewState: {
    latitude: 37.751537058389985,
    longitude: -122.42694203247012,
    zoom: 11.5,
    pitch: 0,
    bearing: 0
  },
  layers: [
    new ScatterplotLayer({
      id: name,
      data: points,
      extensions: [new CollideExtension()],
      getPosition: d => d.COORDINATES,
      getRadius: 10,
      getFillColor: d => {
        const value = (255 * (2014 - getYear(d))) / 21; // range 1997-2014
        return [value, 0, 255 - value];
      },
      radiusUnits: 'pixels',
      ...props
    })
  ],
  imageDiffOptions: {
    threshold: 0.985
  },
  goldenImage: `./test/render/golden-images/collide-effect-${name}.png`
}));
