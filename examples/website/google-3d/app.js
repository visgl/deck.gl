/* global document, google, fetch, requestAnimationFrame, cancelAnimationFrame */
import {GoogleMapsOverlay as DeckOverlay} from '@deck.gl/google-maps';
import {ScenegraphLayer} from '@deck.gl/mesh-layers';
import {PathLayer} from '@deck.gl/layers';
import {Loader} from "@googlemaps/js-api-loader";

import TripBuilder from './trip-builder';

// Set your Google Maps API key here or via environment variable
const GOOGLE_MAPS_API_KEY = process.env.GoogleMapsAPIKey; // eslint-disable-line
const GOOGLE_MAP_ID = process.env.GoogleMapsMapId; // eslint-disable-line

const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/google-3d/trips.json'; // eslint-disable-line
const MODEL_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/google-3d/truck.gltf'; // eslint-disable-line

export async function renderToDOM(
  container,
  options = {
    tracking: true,
    showPaths: true
  }
) {
  const loader = new Loader({apiKey: GOOGLE_MAPS_API_KEY});
  const googlemaps = await loader.importLibrary('maps');

  const resp = await fetch(DATA_URL);
  const data = await resp.json();

  const map = new googlemaps.Map(container, {
    center: {lng: -95.36403, lat: 29.756433},
    zoom: 19,
    heading: 0,
    tilt: 45,
    isFractionalZoomEnabled: true,
    mapId: GOOGLE_MAP_ID,
    mapTypeControlOptions: {
      mapTypeIds: ['roadmap', 'terrain']
    },
    streetViewControl: false
  });

  const overlay = new DeckOverlay({});
  overlay.setMap(map);

  const stopAnimation = startAnimation(map, overlay, data, options);

  return {
    update: newOpts => Object.assign(options, newOpts),
    remove: () => {
      stopAnimation();
      overlay.finalize();
    }
  };
}

function startAnimation(map, overlay, data, options) {
  const trips = data.map(waypoints => new TripBuilder({waypoints, loop: true}));
  let timestamp = 0;
  let animation = null;

  const onAnimationFrame = () => {
    timestamp += 0.02;

    const frame = trips.map(trip => trip.getFrame(timestamp));

    // Set the camera to follow the first truck
    if (options.tracking) {
      map.moveCamera({
        center: {lat: frame[0].point[1], lng: frame[0].point[0]},
        heading: frame[0].heading
      });
    }

    const layers = [
      options.showPaths &&
        new PathLayer({
          id: 'trip-lines',
          data: trips,
          getPath: d => d.keyframes.map(f => f.point),
          getColor: _ => [128 * Math.random(), 255 * Math.random(), 255],
          jointRounded: true,
          opacity: 0.5,
          getWidth: 0.5
        }),
      new ScenegraphLayer({
        id: 'truck',
        data: frame,
        scenegraph: MODEL_URL,
        sizeScale: 2,
        getPosition: d => d.point,
        getTranslation: [0, 0, 1],
        getOrientation: d => [0, 180 - d.heading, 90],
        _lighting: 'pbr'
      })
    ];
    overlay.setProps({layers});

    animation = requestAnimationFrame(onAnimationFrame);
  };
  onAnimationFrame();

  return () => cancelAnimationFrame(animation);
}
