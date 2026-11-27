// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck, MapView} from '@deck.gl/core';
import {TripsLayer} from '@deck.gl/geo-layers';
import {PathLayer, PolygonLayer, ScatterplotLayer} from '@deck.gl/layers';
import {luma} from '@luma.gl/core';
import {webgl2Adapter} from '@luma.gl/core/webgl';
import {tripLoopLength, tripTrailLength} from './taxi-data';
import TaxiSpotlightExtension from './taxi-spotlight';

/** Camera shared by the desktop capture and the live scene. */
const initialViewState = {
  longitude: -73.986,
  latitude: 40.726,
  zoom: 13.3,
  pitch: 34,
  bearing: -68,
  minZoom: 11,
  maxZoom: 17,
  maxPitch: 60
};

/** Trip timestamp units advanced per second of playback. */
const playbackSpeed = 60;
/** Point in the trip loop used for the paused captures. */
const previewStartTime = 840;
const yellowTripColor = [255, 210, 122];
const greenTripColor = [145, 255, 230];

/** Gives each trip and its head the color of its taxi vendor. */
function getTripColor({vendor}) {
  return vendor === 0 ? yellowTripColor : greenTripColor;
}

/** Locates each active trip head by interpolating between its adjacent timed positions. */
function getTripHeads(trips, time) {
  const heads = [];
  for (const {path, timestamps, vendor} of trips) {
    let start = 0;
    let end = timestamps.length - 1;
    if (time < timestamps[start] || time > timestamps[end]) {
      continue;
    }
    while (end - start > 1) {
      const middle = (start + end) >> 1;
      if (timestamps[middle] <= time) {
        start = middle;
      } else {
        end = middle;
      }
    }
    const duration = timestamps[end] - timestamps[start];
    const fraction = duration > 0 ? (time - timestamps[start]) / duration : 1;
    const from = path[start];
    const to = path[end];
    heads.push({
      position: [
        from[0] + (to[0] - from[0]) * fraction,
        from[1] + (to[1] - from[1]) * fraction,
        from[2] + (to[2] - from[2]) * fraction
      ],
      vendor
    });
  }
  return heads;
}

/** Checks that a decoded trip has timed positions inside the scene bounds. */
function isNewYorkTrip({path, timestamps}) {
  return (
    path.length > 1 &&
    path.length === timestamps.length &&
    timestamps.every(Number.isFinite) &&
    path.every(
      ([longitude, latitude]) =>
        longitude >= -74.35 && longitude <= -73.55 && latitude >= 40.45 && latitude <= 41
    )
  );
}

/** Creates the homepage's WebGL scene and returns its playback and cleanup controls. */
export async function createTaxiScene({
  canvas,
  data,
  signal,
  getCaptureSize,
  isPaused,
  onReady,
  onPlaybackChange,
  onError
}) {
  const [trips, buildings] = data;
  signal.throwIfAborted();
  const animatedTrips = trips.filter(isNewYorkTrip);
  // The decoder wraps some trips around the loop for playback. Draw each static route once.
  const routes = animatedTrips.filter(trip => trip.startTime >= 0);
  if (!routes.length) {
    throw new Error('No taxi routes to display');
  }

  // Await device creation so a browser without WebGL can keep showing the poster.
  const device = await luma.createDevice({
    type: 'webgl',
    adapters: [webgl2Adapter],
    createCanvasContext: {canvas}
  });
  if (signal.aborted) {
    device.destroy();
    signal.throwIfAborted();
  }

  const buildingLayer = new PolygonLayer({
    id: 'taxi-map-buildings',
    data: buildings,
    getPolygon: building => building.polygon,
    getElevation: building => building.height,
    getFillColor: [39, 62, 70],
    extruded: true,
    stroked: false
  });
  const routeLayer = new PathLayer({
    id: 'taxi-map-routes',
    data: routes,
    getPath: trip => trip.path,
    getColor: [90, 139, 146, 58],
    widthMinPixels: 1
  });
  const tripsLayer = new TripsLayer({
    id: 'taxi-map-trips',
    data: animatedTrips,
    getPath: trip => trip.path,
    getColor: getTripColor,
    trailLength: tripTrailLength,
    widthMinPixels: 3.3,
    capRounded: true,
    jointRounded: true
  });
  const haloLayer = tripsLayer.clone({
    id: 'taxi-map-trail-halo',
    extensions: [new TaxiSpotlightExtension()],
    brushingEnabled: false,
    opacity: 0.14,
    parameters: {depthWriteEnabled: false},
    widthMinPixels: 7.5
  });
  // TripsLayer clips the moving end within a segment, beyond the reach of capRounded.
  const headLayer = new ScatterplotLayer({
    id: 'taxi-map-trip-heads',
    billboard: true,
    radiusUnits: 'pixels',
    getRadius: 2.35,
    getFillColor: getTripColor,
    parameters: {depthWriteEnabled: false}
  });
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let playing = !reducedMotion.matches && !isPaused();
  let spotlightVisible = false;
  let currentTime = previewStartTime;
  let animationFrame = 0;
  let lastFrameTime;
  let inView = false;
  let ready = false;
  let deck;
  let headTime;
  let timedHeadLayer;

  /** Updates the animated layers and reuses head data on pointer-only redraws. */
  function getLayers() {
    if (headTime !== currentTime) {
      headTime = currentTime;
      timedHeadLayer = headLayer.clone({data: getTripHeads(animatedTrips, currentTime)});
    }
    return [
      buildingLayer,
      routeLayer,
      haloLayer.clone({currentTime, brushingEnabled: spotlightVisible}),
      tripsLayer.clone({currentTime}),
      timedHeadLayer
    ];
  }

  function animate(frameTime) {
    animationFrame = 0;
    if (lastFrameTime !== undefined) {
      const elapsed = (frameTime - lastFrameTime) / 1000;
      currentTime = (currentTime + elapsed * playbackSpeed) % tripLoopLength;
      deck.setProps({layers: getLayers()});
    }
    lastFrameTime = frameTime;
    scheduleAnimation();
  }

  /** Advances trip playback only while the scene is visible. */
  function scheduleAnimation() {
    if (playing && ready && inView && !document.hidden) {
      if (!animationFrame) {
        animationFrame = requestAnimationFrame(animate);
      }
    } else {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      lastFrameTime = undefined;
    }
  }

  function setPlaying(value) {
    playing = value;
    onPlaybackChange(playing);
    scheduleAnimation();
  }

  function handleReducedMotion(event) {
    if (event.matches) {
      setPlaying(false);
    }
  }

  /** Matches the centered cover crop of the recorded camera. */
  function getStartingViewProps() {
    const {width: captureWidth, height: captureHeight} = getCaptureSize();
    const width = canvas.clientWidth || captureWidth;
    const height = canvas.clientHeight || captureHeight;
    const scale = Math.max(width / captureWidth, height / captureHeight);
    const captureZoom = initialViewState.zoom + Math.min(0, Math.log2(captureWidth / 650));
    return {
      views: new MapView({altitude: (1.5 * scale * captureHeight) / height}),
      viewState: {...initialViewState, zoom: captureZoom + Math.log2(scale)}
    };
  }

  try {
    deck = new Deck({
      canvas,
      device,
      width: null,
      height: null,
      controller: {scrollZoom: false, inertia: false},
      touchAction: 'pan-y',
      ...getStartingViewProps(),
      layers: getLayers(),
      getCursor: ({isDragging}) => (isDragging ? 'grabbing' : 'grab'),
      onViewStateChange: ({viewState}) => deck.setProps({viewState}),
      onAfterRender: () => {
        if (!ready) {
          ready = true;
          onPlaybackChange(playing);
          onReady();
          scheduleAnimation();
        }
      },
      onError
    });
  } catch (error) {
    device.destroy();
    throw error;
  }

  function setSpotlight(visible) {
    if (visible !== spotlightVisible) {
      spotlightVisible = visible;
      deck.setProps({layers: getLayers()});
    }
  }

  function updateSpotlight(event) {
    setSpotlight(event.pointerType !== 'touch' && !event.buttons);
  }

  function hideSpotlight() {
    setSpotlight(false);
  }

  canvas.addEventListener('pointermove', updateSpotlight);
  canvas.addEventListener('pointerdown', hideSpotlight);
  canvas.addEventListener('pointerleave', hideSpotlight);
  document.addEventListener('visibilitychange', scheduleAnimation);
  reducedMotion.addEventListener('change', handleReducedMotion);
  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    scheduleAnimation();
  });
  observer.observe(canvas);

  return {
    setPlaying,
    reset() {
      deck.setProps(getStartingViewProps());
    },
    finalize() {
      ready = false;
      canvas.removeEventListener('pointermove', updateSpotlight);
      canvas.removeEventListener('pointerdown', hideSpotlight);
      canvas.removeEventListener('pointerleave', hideSpotlight);
      document.removeEventListener('visibilitychange', scheduleAnimation);
      reducedMotion.removeEventListener('change', handleReducedMotion);
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
      deck.finalize();
      device.destroy();
    }
  };
}
