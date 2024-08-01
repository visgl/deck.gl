/* global document */
import {GeoJsonLayer, ArcLayer} from '@deck.gl/layers';
import {Deck, WebMercatorViewport} from '@deck.gl/core';
import {fetchMap} from '@deck.gl/carto';

const cartoMapId = 'ff6ac53f-741a-49fb-b615-d040bc5a96b8';

async function init() {
  await setupMapKitJs();

  fetchMap({cartoMapId}).then(({initialViewState, mapStyle, layers}) => {
    initialViewState.maxPitch = 0; // lock tilt
    const deck = new Deck({canvas: 'deck-canvas', controller: true, initialViewState, layers});
    const {region, rotation} = viewPropsFromViewState(initialViewState);
    const map = new mapkit.Map('map', {region, rotation});

    deck.setProps({
      onViewStateChange: ({viewState}) => {
        const {region, rotation} = viewPropsFromViewState(viewState);
        map.setRegionAnimated(region, false);
        map.setRotationAnimated(rotation, false);
      }
    });
  });
}

/**
 * Converts deck.gl viewState into {region, rotation} used for Apple Maps
 */
function viewPropsFromViewState(viewState) {
  const {longitude, latitude, bearing, ...rest} = viewState;
  const viewport = new WebMercatorViewport({...viewState, bearing: 0});
  const bounds = viewport.getBounds();

  const center = new mapkit.Coordinate(latitude, longitude);
  const span = new mapkit.CoordinateSpan(bounds[3] - bounds[1], bounds[2] - bounds[0]);
  const region = new mapkit.CoordinateRegion(center, span);
  const rotation = -bearing;

  return {region, rotation};
}

init();

// Wait for MapKit JS to be ready to use.
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
