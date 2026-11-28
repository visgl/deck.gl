// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck, FlyToInterpolator, MapView, WebMercatorViewport} from '@deck.gl/core';
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

/** Frame each data encoding around the areas it emphasizes. */
const viewCameras = {
  trails: initialViewState,
  connections: {focus: [-73.989, 40.722], zoom: 12.15, pitch: 47, bearing: -29},
  pickups: {focus: [-73.986, 40.727], zoom: 13.05, pitch: 58, bearing: -48}
};

/** Trip timestamp units advanced per second of playback. */
const playbackSpeed = 60;
/** Point in the trip loop used for the paused captures. */
const previewStartTime = 840;
const yellowTripColor = [255, 210, 122];
const greenTripColor = [145, 255, 230];
const yellowHeadColor = [255, 244, 204];
const greenHeadColor = [198, 255, 245];
const yellowHeadStroke = [206, 131, 56];
const greenHeadStroke = [41, 166, 156];

/** Gives each trail the color of its taxi vendor. */
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
  // A contrasting rim keeps the head distinct from the trail and its halo in the captures.
  const headLayer = new ScatterplotLayer({
    id: 'taxi-map-trip-heads',
    billboard: true,
    radiusUnits: 'pixels',
    getRadius: 4.6,
    stroked: true,
    lineWidthUnits: 'pixels',
    getLineWidth: 1.15,
    getFillColor: ({vendor}) => (vendor === 0 ? yellowHeadColor : greenHeadColor),
    getLineColor: ({vendor}) => (vendor === 0 ? yellowHeadStroke : greenHeadStroke),
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
  let activeView = 'trails';
  let overlays;
  let viewRequest = 0;

  /** Updates the animated layers and reuses head data on pointer-only redraws. */
  function getLayers() {
    if (activeView !== 'trails') {
      return [buildingLayer, routeLayer, ...overlays[activeView]];
    }
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
    if (playing && activeView === 'trails' && ready && inView && !document.hidden) {
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

  /** Matches the recorded cover crop or frames a data overlay beside the headline. */
  function getStartingViewProps() {
    const {width: captureWidth, height: captureHeight} = getCaptureSize();
    const width = canvas.clientWidth || captureWidth;
    const height = canvas.clientHeight || captureHeight;
    const scale = Math.max(width / captureWidth, height / captureHeight);
    const {focus, ...camera} = viewCameras[activeView];
    const captureZoom = camera.zoom + Math.min(0, Math.log2(captureWidth / 650));
    const altitude = (1.5 * scale * captureHeight) / height;
    const viewState = {...initialViewState, ...camera, zoom: captureZoom + Math.log2(scale)};
    if (focus) {
      const viewport = new WebMercatorViewport({...viewState, width, height, altitude});
      const compact = captureWidth < 650;
      // Offset the featured data into the open map area at either screen size.
      const focalPoint = [width * (compact ? 0.52 : 0.66), height * (compact ? 0.69 : 0.59)];
      Object.assign(viewState, viewport.panByPosition(focus, focalPoint));
    }
    return {
      views: new MapView({altitude}),
      viewState
    };
  }

  /** Loads the analytical layers on demand and applies only the latest view request. */
  async function setView(view) {
    const request = ++viewRequest;
    if (view !== 'trails' && !overlays) {
      const {createTaxiOverlays} = await import(
        /* webpackChunkName: "home-taxi-overlays" */ './taxi-overlays'
      );
      if (signal.aborted || request !== viewRequest) {
        return false;
      }
      overlays = createTaxiOverlays(routes);
    }
    if (signal.aborted) {
      return false;
    }
    if (view !== activeView) {
      activeView = view;
      const {views, viewState} = getStartingViewProps();
      deck.setProps({
        views,
        layers: getLayers(),
        viewState: {
          ...viewState,
          transitionDuration: reducedMotion.matches ? 0 : 820,
          transitionInterpolator: new FlyToInterpolator()
        }
      });
      scheduleAnimation();
    }
    return true;
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
    setView,
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
