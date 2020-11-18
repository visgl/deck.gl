/* global document, google */
import {GoogleMapsOverlay as DeckOverlay} from '@deck.gl/google-maps';
import {ScatterplotLayer} from '@deck.gl/layers';
import {scaleLog} from 'd3-scale';
import GL from '@luma.gl/constants';

import mapStyle from './map-style';

const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/election/votes-by-county.json';

// Set your Google Maps API key here or via environment variable
const GOOGLE_MAPS_API_KEY = process.env.GoogleMapsAPIKey; // eslint-disable-line

function loadScript(url) {
  if (typeof google !== 'undefined') {
    return Promise.resolve();
  }
  return new Promise(resolve => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = resolve;
    document.head.appendChild(script);
  });
}

// Map delta percentage points to color
const repColorScale = scaleLog()
  .domain([1, 100])
  .range([[255, 255, 191], [215, 25, 28]]);
const demColorScale = scaleLog()
  .domain([1, 100])
  .range([[255, 255, 191], [43, 131, 186]]);

export async function renderToDOM(container, options = {}) {
  await loadScript(
    `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=visualization&v=3.42`
  );

  const map = new google.maps.Map(container, {
    center: {lat: 40, lng: -100},
    zoom: 5,
    styles: mapStyle,
    mapTypeId: 'terrain',
    mapTypeControlOptions: {
      mapTypeIds: ['roadmap', 'terrain']
    },
    streetViewControl: false
  });

  const overlay = new DeckOverlay({
    parameters: {
      // Additive blending
      blendFunc: [GL.SRC_ALPHA, GL.ONE, GL.ONE, GL.ONE_MINUS_SRC_ALPHA]
    },
    layers: renderLayers(options),
    getTooltip
  });

  overlay.setMap(map);

  return {
    update: newOptions => {
      overlay.setProps({
        layers: renderLayers(newOptions)
      });
    },
    remove: () => {
      overlay.finalize();
    }
  };
}

function getTooltip({object, layer}) {
  if (!object) {
    return null;
  }
  const {year} = layer.props;
  const votes = object[year];
  return {
    html: `\
    <p><b>${object.name}</b></p>
    <div>
      Total: ${votes.total}
      <br/>Democrat: ${((votes.dem / votes.total) * 100).toFixed(1)}%
      <br/>Republican: ${((votes.rep / votes.total) * 100).toFixed(1)}%
    </div>`
  };
}

function renderLayers({data = DATA_URL, year = 2016}) {
  return [
    new ScatterplotLayer({
      data,
      opacity: 0.7,
      getPosition: d => [d.longitude, d.latitude],
      getRadius: d => {
        const votes = d[year];
        return votes ? Math.sqrt(votes.total) : 0;
      },
      getFillColor: d => {
        const votes = d[year];
        const demPercent = (votes.dem / votes.total) * 100;
        const repPercent = (votes.rep / votes.total) * 100;
        return demPercent >= repPercent
          ? demColorScale(demPercent - repPercent + 1)
          : repColorScale(repPercent - demPercent + 1);
      },
      radiusUnits: 'pixels',
      radiusScale: 0.02,
      radiusMinPixels: 2,

      pickable: true,
      autoHighlight: true,
      highlightColor: [255, 200, 0, 200],

      updateTriggers: {
        getRadius: year,
        getFillColor: year
      },
      transitions: {
        getRadius: 1000,
        getFillColor: 1000
      },

      // This is not a standard ScatterplotLayer prop
      // We attach it to the layer to access it in getTooltip
      year
    })
  ];
}
