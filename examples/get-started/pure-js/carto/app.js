import maplibregl from 'maplibre-gl';
import {Deck} from '@deck.gl/core';
import {fetchMap} from '@deck.gl/carto';

const cartoMapId = 'ff6ac53f-741a-49fb-b615-d040bc5a96b8';

// Get map info from CARTO and update deck
fetchMap({cartoMapId}).then(({initialViewState, mapStyle, layers}) => {
  const deck = new Deck({canvas: 'deck-canvas', controller: true, initialViewState, layers});

  // Add Mapbox GL for the basemap. It's not a requirement if you don't need a basemap.
  const MAP_STYLE = `https://basemaps.cartocdn.com/gl/${mapStyle.styleType}-gl-style/style.json`;
  const map = new maplibregl.Map({container: 'map', style: MAP_STYLE, interactive: false});
  deck.setProps({
    onViewStateChange: ({viewState}) => {
      const {longitude, latitude, ...rest} = viewState;
      map.jumpTo({center: [longitude, latitude], ...rest});
    }
  });
});
