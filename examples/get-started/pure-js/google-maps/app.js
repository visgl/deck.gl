/* global document */
import {GeoJsonLayer, ArcLayer} from '@deck.gl/layers';
import {Deck, WebMercatorViewport} from '@deck.gl/core';
import {fetchMap} from '@deck.gl/carto';

const cartoMapId = 'ff6ac53f-741a-49fb-b615-d040bc5a96b8';

let map;
function initMapKit() {
  map = new mapkit.Map('map', {center: new mapkit.Coordinate(37.334883, -122.008977)});
}

setTimeout(initMapKit, 1000);

fetchMap({cartoMapId}).then(({initialViewState, mapStyle, layers}) => {
  initialViewState.maxPitch = 0; // lock tilt
  const deck = new Deck({canvas: 'deck-canvas', controller: true, initialViewState, layers});

  deck.setProps({
    onViewStateChange: ({viewState}) => {
      if (!map) return;
      const {longitude, latitude, bearing, ...rest} = viewState;
      const viewport = new WebMercatorViewport({...viewState, bearing: 0});
      const bounds = viewport.getBounds();

      const center = new mapkit.Coordinate(latitude, longitude);
      const span = new mapkit.CoordinateSpan(bounds[3] - bounds[1], bounds[2] - bounds[0]);
      const region = new mapkit.CoordinateRegion(center, span);

      map.setRegionAnimated(region, false);
      map.setRotationAnimated(-bearing, false);
    }
  });
});
