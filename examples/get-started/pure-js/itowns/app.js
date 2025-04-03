import {Deck} from '@deck.gl/core';
import {GeoJsonLayer, ArcLayer} from '@deck.gl/layers';
import * as itowns from 'itowns';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

const INITIAL_VIEW_STATE = {
  latitude: 51.47,
  longitude: 0.45,
  zoom: 4,
  bearing: 0,
  pitch: 30
};
// # Orthographic viewer

// Define geographic extent: CRS, min/max X, min/max Y
var extent = new itowns.Extent(
    'EPSG:3857',
    -20026376.39, 20026376.39,
    -20048966.10, 20048966.10);

// `viewerDiv` will contain iTowns' rendering area (`<canvas>`)
var viewerDiv = document.getElementById('map');

// Instanciate PlanarView
// By default itowns' tiles geometry have a "skirt" (ie they have a height),
// but in case of orthographic we don't need this feature, so disable it
var view = new itowns.PlanarView(viewerDiv, extent, { disableSkirt: false, maxSubdivisionLevel: 10,
    placement: new itowns.Extent('EPSG:3857', -20000000, 20000000, -8000000, 20000000),
});

// view.controls.addInputListenersToElement(document.getElementById('deckCanvas'));

// Add a TMS imagery source
var ignSource = new itowns.VectorTilesSource({
    style: 'https://wxs.ign.fr/static/vectorTiles/styles/PLAN.IGN/standard.json', 
    zoom: {
        min: 2,
        max: 18,
    },
});


// Add a TMS imagery layer
var colorLayer = new itowns.ColorLayer('OPENSM', {
    updateStrategy: {
        type: itowns.STRATEGY_DICHOTOMY,
    },
    source: ignSource,
    opcaity: 0.5,
});

view.addLayer(colorLayer);


export const deck = new Deck({
  canvas: 'deck-canvas',
  width: '100%',
  height: '100%',
  initialViewState: INITIAL_VIEW_STATE,
  map: false,
  controller: true,
  onViewStateChange: ({viewState}) => {
    const cam3D = view.camera.camera3D;
    const prev = itowns.CameraUtils.getTransformCameraLookingAtTarget(view, cam3D);
    const newPos = prev;
    newPos.coord = new itowns.Coordinates('EPSG:4326', viewState.longitude, viewState.latitude, 0);
    
    // newPos.range = 64118883.098724395 / (2**(viewState.zoom-1));
    newPos.range = 64118883 / (2**(viewState.zoom-1)); // 64118883 is Range at Z=1 
    newPos.heading = viewState.bearing;
    // for some reason I cant access Math.clamp
    newPos.tilt = clamp((90 - viewState.pitch), 0, 90); 

    itowns.CameraUtils.transformCameraToLookAtTarget(view, cam3D, newPos);
    view.notifyChange();
    cam3D.updateMatrixWorld();
    // We can set pitch and bearing to 0 to disable tilting and turning 
    // viewState.pitch = 0;
    // viewState.bearing = 0;

    return viewState;
  },
  layers: [
    new GeoJsonLayer({
      id: 'airports',
      data: AIR_PORTS,
      // Styles
      filled: true,
      pointRadiusMinPixels: 2,
      pointRadiusScale: 2000,
      getPointRadius: f => 11 - f.properties.scalerank,
      getFillColor: [200, 0, 80, 180],
      // Interactive props
      pickable: true,
      autoHighlight: true,
      onClick: info =>
        // eslint-disable-next-line
        info.object && alert(`${info.object.properties.name} (${info.object.properties.abbrev})`)
    }),
    new ArcLayer({
      id: 'arcs',
      data: AIR_PORTS,
      dataTransform: d => d.features.filter(f => f.properties.scalerank < 4),
      // Styles
      getSourcePosition: f => [-0.4531566, 51.4709959], // London
      getTargetPosition: f => f.geometry.coordinates,
      getSourceColor: [0, 128, 200],
      getTargetColor: [200, 0, 80],
      getWidth: 1
    })
  ]
});

view.notifyChange();

function clamp(val, min, max){
  if( val >= max ) val = max;
  else if(val <= min) val = min;
  return val; 
}