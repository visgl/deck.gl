/* global mapkit, window */
import {Deck, WebMercatorViewport} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';

const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/scatterplot/manhattan.json'; // eslint-disable-line

const initialViewState = {
  longitude: -74,
  latitude: 40.7,
  zoom: 11,
  maxZoom: 16,
  pitch: 0,
  bearing: 0,
  maxPitch: 0 // Tilt not supported in Apple Maps
};
const maleColor = [0, 128, 255];
const femaleColor = [255, 0, 128];

async function init() {
  await setupMapKitJs();
  const layers = [
    new ScatterplotLayer({
      id: 'scatter-plot',
      data: DATA_URL,
      radiusScale: 30,
      radiusMinPixels: 0.25,
      getPosition: d => [d[0], d[1], 0],
      getFillColor: d => (d[2] === 1 ? maleColor : femaleColor),
      getRadius: 1,
      updateTriggers: {
        getFillColor: [maleColor, femaleColor]
      }
    })
  ];

  const deck = new Deck({canvas: 'deck-canvas', controller: true, initialViewState, layers});

  // Sync deck view state with Apple Maps
  const map = new mapkit.Map('map', viewPropsFromViewState(initialViewState));
  deck.setProps({
    onViewStateChange: ({viewState}) => {
      const {region, rotation} = viewPropsFromViewState(viewState);
      map.setRegionAnimated(region, false);
      map.setRotationAnimated(rotation, false);
    }
  });
}
init();

/**
 * Converts deck.gl viewState into {region, rotation} used for Apple Maps
 */
function viewPropsFromViewState(viewState) {
  const {longitude, latitude, bearing} = viewState;
  const viewport = new WebMercatorViewport({...viewState, bearing: 0});
  const bounds = viewport.getBounds();

  const center = new mapkit.Coordinate(latitude, longitude);
  const span = new mapkit.CoordinateSpan(bounds[3] - bounds[1], bounds[2] - bounds[0]);
  const region = new mapkit.CoordinateRegion(center, span);
  const rotation = -bearing;

  return {region, rotation};
}

/**
 * Wait for MapKit JS to be ready to use
 */
async function setupMapKitJs() {
  // If MapKit JS is not yet loaded...
  if (!window.mapkit || window.mapkit.loadedLibraries.length === 0) {
    // ...await <script>'s data-callback (window.initMapKit).
    await new Promise(resolve => {
      window.initMapKit = resolve;
    });
    // Clean up.
    delete window.initMapKit;
  }
}
