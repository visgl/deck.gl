// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck, MapView} from '@deck.gl/core';
import {TripsLayer} from '@deck.gl/geo-layers';
import {PathLayer, PolygonLayer} from '@deck.gl/layers';
import {luma} from '@luma.gl/core';
import {webgl2Adapter} from '@luma.gl/core/webgl';
import {tripLoopLength, tripTrailLength} from './taxi-data';
import TaxiSpotlightExtension from './taxi-spotlight';

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

const playbackSpeed = 60;
// The still used for paused playback was captured at this point in the trip loop.
const previewStartTime = 840;

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
    getColor: trip => (trip.vendor === 0 ? [255, 210, 122] : [145, 255, 230]),
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
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let playing = !reducedMotion.matches && !isPaused();
  let spotlightVisible = false;
  let currentTime = previewStartTime;
  let animationFrame = 0;
  let lastFrameTime;
  let inView = false;
  let ready = false;
  let deck;

  function getLayers() {
    return [
      buildingLayer,
      routeLayer,
      haloLayer.clone({currentTime, brushingEnabled: spotlightVisible}),
      tripsLayer.clone({currentTime})
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

  function getStartingViewProps() {
    const {width: captureWidth, height: captureHeight} = getCaptureSize();
    const width = canvas.clientWidth || captureWidth;
    const height = canvas.clientHeight || captureHeight;
    // Match the centered object-fit cover crop of the recorded camera.
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
