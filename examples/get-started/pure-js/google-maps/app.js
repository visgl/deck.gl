/* global document */
import {GeoJsonLayer, ArcLayer} from '@deck.gl/layers';
import {Deck} from '@deck.gl/core';
import {fetchMap} from '@deck.gl/carto';

const cartoMapId = 'ff6ac53f-741a-49fb-b615-d040bc5a96b8';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

function initMapKit() {
  const map = new mapkit.Map('map', {center: new mapkit.Coordinate(37.334883, -122.008977)});
  console.log('load');
}

setTimeout(initMapKit, 1000);

fetchMap({cartoMapId}).then(({initialViewState, mapStyle, layers}) => {
  const deck = new Deck({canvas: 'deck-canvas', controller: true, initialViewState, layers});

  // deck.setProps({
  //   onViewStateChange: ({viewState}) => {
  //     const {longitude, latitude, ...rest} = viewState;
  //     map.jumpTo({center: [longitude, latitude], ...rest});
  //   }
  // });
});
