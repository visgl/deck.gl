/* global deck, requestAnimationFrame, setTimeout */
const lng = -3.7082998;
const lat = 40.4205556;

deck.carto.setDefaultCredentials({
  apiBaseUrl: 'https://gcp-us-east1.api.carto.com',
  apiVersion: deck.carto.API_VERSIONS.V3,
  accessToken:
    'eyJhbGciOiJIUzI1NiJ9.eyJhIjoiYWNfN3hoZnd5bWwiLCJqdGkiOiJhMjQyNDM4MSJ9.5bAXb8y7PyIOB__X7i-iQUWCZgLkedtGoqRI25HuQxc'
});

const POLYGON_COLORS = [
  '#fcde9c',
  '#faa476',
  '#f0746e',
  '#e34f6f',
  '#dc3977',
  '#b9257a',
  '#7c1d6f'
].map(hex2rgb);

// Create Deck.GL map
const deckgl = new deck.DeckGL({
  container: 'map',
  mapStyle: deck.carto.BASEMAP.DARK_MATTER,

  initialViewState: {
    latitude: lat,
    longitude: lng,
    zoom: 15,
    pitch: 60
  },
  controller: {
    scrollZoom: false,
    touchZoom: false,
    dragPan: false,
    dragRotate: false,
    keyboard: false,
    doubleClickZoom: false
  }
});

function colorForBuilding(d, alpha) {
  const rgb = deck.carto.colorBins({
    attr: 'grossFloorAreaM2',
    domain: [0, 200, 400, 1000, 2000, 5000],
    colors: POLYGON_COLORS
  })(d);
  return [...rgb, alpha || 255];
}

let rangeMax = 0;
const animationSpeed = 1.8;

function render() {
  rangeMax += animationSpeed;
  const buildingsLayer = new deck.carto.CartoLayer({
    id: 'mrli',
    connection: 'bigquery',
    type: deck.carto.MAP_TYPES.TABLE,
    data: 'cartodb-on-gcp-backend-team.alasarr.madrid_buildings',

    // Fill
    filled: true,
    getFillColor: colorForBuilding,

    // Line
    // wireframe: true,
    getLineColor: [0, 0, 0, 180],
    lineWidthMinPixels: 0,

    // Extrusion
    extruded: true,
    getElevation: d => 15 + 30 * Math.random(), // Random heights

    // Data filter to fade in buildings
    extensions: [
      new deck.DataFilterExtension({
        filterSize: 1
      })
    ],
    getFilterValue: (value, data) => {
      // Extract position of polygon from binary data
      const i = data.index;
      const startIndex = data.data.startIndices[i];
      const [lng0, lat0] = [
        ...data.data.attributes.positions.value.subarray(2 * startIndex, 2 * startIndex + 2)
      ];

      // Calculate distance from center
      const d = 100000 * D(lng0 - lng, lat0 - lat);

      // Add some randmness
      const jitter = 200 * Math.random();
      return d + jitter;
    },
    filterSoftRange: [0, rangeMax],
    filterRange: [0, rangeMax + 40]
  });

  // Logo layer
  const layer = new deck.SimpleMeshLayer({
    id: 'mesh-layer',
    data: [1, 1.3],
    mesh: {
      positions: new Float32Array(makeCircle(32))
    },
    sizeScale: 40,
    getScale: d => [d, d, d],
    getPosition: d => [lng, lat, 100],
    getColor: d => (d === 1 ? [140, 49, 83, 255] : [232, 234, 236, 60]),
    getOrientation: d => [90, 90, 0],

    parameters: {
      depthTest: false
    }
  });

  // update layers in deck.gl.
  deckgl.setProps({
    layers: [buildingsLayer, layer]
  });
}

function animate() {
  render();
  requestAnimationFrame(animate);
}

render();
setTimeout(animate, 2000);

// Rotate camera
let bearing = 0;

function rotate() {
  bearing += 120;
  deckgl.setProps({
    initialViewState: {
      latitude: lat,
      longitude: lng,
      zoom: 15,
      pitch: 40,
      bearing,
      transitionDuration: 30000,
      transitionInterpolator: new deck.LinearInterpolator(['bearing']),
      onTransitionEnd: rotate
    }
  });
}
setTimeout(rotate, 200);

function D(a, b) {
  return Math.sqrt(a * a + b * b);
}

function hex2rgb(hex) {
  const c = `0x${hex.substring(1)}`;
  return [(c >> 16) & 255, (c >> 8) & 255, c & 255];
}

function makeCircle(n) {
  const step = (2 * Math.PI) / n;
  const degrees = [...Array(n).keys()].map(i => i * step);
  return degrees
    .map(a => {
      return [0, 0, 0, Math.sin(a), Math.cos(a), 0, Math.sin(a + step), Math.cos(a + step), 0];
    })
    .flat();
}
