import mapboxgl from 'mapbox-gl';
import {Deck} from '@deck.gl/core';
import {ColorsBins, CartoDOLayer, setDefaultCredentials, BASEMAP} from '@deck.gl/carto';

const INITIAL_VIEW_STATE = {
  latitude: 40.75143535766423,
  longitude: -73.98118621897807,
  zoom: 12
};

setDefaultCredentials({
  username: 'aasuero',
  apiKey: 'default_public',
  mapsUrl: 'https://maps-api-v2.carto-staging.com/user/{user}'
});

const DATASET_ID =
  'carto-do-public-data.usa_acs.demographics_sociodemographics_usa_blockgroup_2015_5yrs_20132017';
const VARIABLE = 'total_pop';

// Add Mapbox GL for the basemap. It's not a requirement if you don't need a basemap.
const map = new mapboxgl.Map({
  container: 'map',
  style: BASEMAP.VOYAGER,
  interactive: false,
  center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
  zoom: INITIAL_VIEW_STATE.zoom
});

// Set the default visible layer
let visibleLayer = 'color_bins_manual';

// Create Deck.GL map
export const deck = new Deck({
  canvas: 'deck-canvas',
  width: '100%',
  height: '100%',
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  onViewStateChange: ({viewState}) => {
    // Synchronize Deck.gl view with Mapbox
    map.jumpTo({
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom,
      bearing: viewState.bearing,
      pitch: viewState.pitch
    });
  }
});

// Add event listener to radio buttons
document.getElementsByName('layer-visibility').forEach(e => {
  e.addEventListener('click', () => {
    visibleLayer = e.value;
    render();
  });
});

const colorManual = ColorsBins({
  breaks: [100, 200, 300],
  colors: [[225, 83, 131], [241, 109, 122], [250, 138, 118], [255, 166, 121], [255, 194, 133]]
});

let colorByStats;

render();

// Function to render the layers. Will be invoked any time visibility changes.
function render() {
  const layers = [
    new CartoDOLayer({
      id: 'do-layer-manual',
      data: DATASET_ID,
      visible: visibleLayer === 'color_bins_manual',
      getFillColor: d => colorManual(d.properties[VARIABLE]),
      getLineColor: [0, 0, 0, 100],
      lineWidthMinPixels: 0.5,
      pickable: true,
      sample: true
    }),
    new CartoDOLayer({
      id: 'do-layer-stats',
      data: DATASET_ID,
      visible: visibleLayer === 'color_bins_stats',
      ...(colorByStats && {getFillColor: d => colorByStats(d.properties[VARIABLE])}),
      getLineColor: [0, 0, 0, 100],
      lineWidthMinPixels: 0.5,
      pickable: true,
      sample: true,
      onDataLoad
    })
  ];
  // update layers in deck.gl.
  deck.setProps({layers});
}

function onDataLoad(tileJSON) {
  const {tilestats} = tileJSON;
  const stats = tilestats.layers[0].attributes.find(d => d.attribute === VARIABLE);
  colorByStats = ColorsBins({
    breaks: {
      stats,
      method: 'quantiles',
      bins: 10
    },
    colors: [[225, 83, 131], [241, 109, 122], [250, 138, 118], [255, 166, 121], [255, 194, 133]]
  });

  render();
}
