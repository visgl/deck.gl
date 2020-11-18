import mapboxgl from 'mapbox-gl';
import {Deck} from '@deck.gl/core';
import {
  ColorsBins,
  ColorsCategories,
  ColorsContinuous,
  CartoDOLayer,
  setDefaultCredentials,
  BASEMAP
} from '@deck.gl/carto';

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

const TOTAL_POP_VARIABLE = 'total_pop';
const CATEGORY_NAME_VARIABLE = 'category_name';

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

const colorBinsManual = ColorsBins({
  breaks: [100, 200, 300],
  colors: [[225, 83, 131], [241, 109, 122], [250, 138, 118], [255, 166, 121]]
});

let colorBinsByStats;

const colorCategoriesManual = ColorsCategories({
  categories: ['Consumer Services', 'Commercial Services', 'Attorney'],
  colors: 'Antique',
  nulltColor: [255, 255, 255]
});

let colorCategoriesByStats;

const colorContinuousManual = ColorsContinuous({
  range: [0, 500],
  colors: 'BrwnYl'
});

let colorContinuousByStats;

render();

// Function to render the layers. Will be invoked any time visibility changes.
function render() {
  const layers = [
    new CartoDOLayer({
      id: 'do-layer-manual',
      data:
        'carto-do-public-data.usa_acs.demographics_sociodemographics_usa_blockgroup_2015_5yrs_20132017',
      visible: visibleLayer === 'color_bins_manual',
      getFillColor: d => colorBinsManual(d.properties[TOTAL_POP_VARIABLE]),
      getLineColor: [0, 0, 0, 100],
      lineWidthMinPixels: 0.5,
      pickable: true,
      sample: true
    }),
    new CartoDOLayer({
      id: 'do-layer-stats',
      data:
        'carto-do-public-data.usa_acs.demographics_sociodemographics_usa_blockgroup_2015_5yrs_20132017',
      visible: visibleLayer === 'color_bins_stats',
      ...(colorBinsByStats && {
        getFillColor: d => colorBinsByStats(d.properties[TOTAL_POP_VARIABLE])
      }),
      getLineColor: [0, 0, 0, 100],
      lineWidthMinPixels: 0.5,
      pickable: true,
      sample: true,
      onDataLoad: tileJSON => {
        const {tilestats} = tileJSON;
        const stats = tilestats.layers[0].attributes.find(d => d.attribute === TOTAL_POP_VARIABLE);
        colorBinsByStats = ColorsBins({
          breaks: {
            stats,
            method: 'quantiles',
            bins: 5
          },
          colors: 'OrYel'
        });

        render();
      }
    }),
    new CartoDOLayer({
      id: 'do-layer-category-manual',
      data: 'carto-do.here.pointsofinterest_pointsofinterest_usa_latlon_v1_quarterly_v1',
      visible: visibleLayer === 'color_categories_manual',
      getFillColor: d => colorCategoriesManual(d.properties[CATEGORY_NAME_VARIABLE]),
      filled: true,
      pointRadiusMinPixels: 3,
      pickable: true,
      sample: true
    }),
    new CartoDOLayer({
      id: 'do-layer-category-stats',
      data: 'carto-do.here.pointsofinterest_pointsofinterest_usa_latlon_v1_quarterly_v1',
      visible: visibleLayer === 'color_categories_stats',
      ...(colorCategoriesByStats && {
        getFillColor: d => colorCategoriesByStats(d.properties[CATEGORY_NAME_VARIABLE])
      }),
      filled: true,
      pointRadiusMinPixels: 3,
      pickable: true,
      sample: true,
      onDataLoad: tileJSON => {
        const {tilestats} = tileJSON;
        const stats = tilestats.layers[0].attributes.find(
          d => d.attribute === CATEGORY_NAME_VARIABLE
        );
        colorCategoriesByStats = ColorsCategories({
          categories: {
            stats,
            top: 7
          },
          colors: [
            [0, 155, 158],
            [66, 183, 185],
            [167, 211, 212],
            [241, 241, 241],
            [228, 193, 217],
            [214, 145, 193],
            [199, 93, 171]
          ]
        });
        render();
      }
    }),
    new CartoDOLayer({
      id: 'do-layer-continuous-manual',
      data:
        'carto-do-public-data.usa_acs.demographics_sociodemographics_usa_blockgroup_2015_5yrs_20132017',
      visible: visibleLayer === 'color_continuous_manual',
      getFillColor: d => colorContinuousManual(d.properties[TOTAL_POP_VARIABLE]),
      getLineColor: [0, 0, 0, 100],
      lineWidthMinPixels: 0.5,
      pickable: true,
      sample: true
    }),
    new CartoDOLayer({
      id: 'do-layer-continuous-by-stats',
      data:
        'carto-do-public-data.usa_acs.demographics_sociodemographics_usa_blockgroup_2015_5yrs_20132017',
      visible: visibleLayer === 'color_continuous_stats',
      ...(colorContinuousByStats && {
        getFillColor: d => colorContinuousByStats(d.properties[TOTAL_POP_VARIABLE])
      }),
      getLineColor: [0, 0, 0, 100],
      lineWidthMinPixels: 0.5,
      pickable: true,
      sample: true,
      onDataLoad: tileJSON => {
        const {tilestats} = tileJSON;
        const stats = tilestats.layers[0].attributes.find(d => d.attribute === TOTAL_POP_VARIABLE);
        colorContinuousByStats = ColorsContinuous({
          range: {
            stats
          },
          // colors: [
          //   [0, 155, 158],
          //   [199, 93, 171]
          // ]
          colors: 'BrwnYl'
        });

        render();
      }
    })
  ];
  // update layers in deck.gl.
  deck.setProps({layers});
}
