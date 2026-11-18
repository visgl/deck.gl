// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {addMetersToLngLat} from '@math.gl/geospatial/web-mercator';

/** One aircraft state tuple from the OpenSky API. */
// https://openskynetwork.github.io/opensky-api/rest.html#response
export type Aircraft = [
  uniqueId: string,
  callSign: string,
  originCountry: string,
  timePosition: number,
  lastContact: number,
  longitude: number | null,
  latitude: number | null,
  baroAltitude: number | null,
  onGround: boolean,
  velocity: number | null,
  trueAttack: number | null,
  verticalRate: number | null,
  sensors: number[],
  geoAltitude: number | null,
  positionSource: number[],
  category: number
];

/** A timestamped set of aircraft positions. */
export type FlightSnapshot = {
  /** Unix timestamp in seconds. */
  time: number;
  /** Aircraft states in OpenSky tuple order. */
  states: Aircraft[];
};

/** Makes three illustrative frames; extrapolated positions are not recorded observations. */
export function createFallbackFlightFrames(source: FlightSnapshot): FlightSnapshot[] {
  return [0, 60, 120].map(seconds => ({
    time: source.time + seconds,
    states: source.states.map(aircraft => {
      if (!seconds) return aircraft;
      const result = [...aircraft] as Aircraft;
      result[4] += seconds;
      if (result[3] != null) result[3] += seconds;
      const [longitude, latitude] = aircraft.slice(5, 7);
      const speed = aircraft[9];
      const heading = aircraft[10];
      if (
        !aircraft[8] &&
        typeof longitude === 'number' &&
        typeof latitude === 'number' &&
        speed !== null &&
        heading !== null
      ) {
        const angle = (heading * Math.PI) / 180;
        const [lng, lat] = addMetersToLngLat(
          [longitude, latitude],
          [Math.sin(angle) * speed * seconds, Math.cos(angle) * speed * seconds]
        );
        result[5] = lng;
        result[6] = lat;
        if (aircraft[13] !== null) result[13] = aircraft[13] + (aircraft[11] || 0) * seconds;
      }
      return result;
    })
  }));
}

/** Polls live data serially and replays fallback frames while the service is unavailable. */
export function watchFlightData(
  fallback: FlightSnapshot,
  fetchSnapshot: (signal: AbortSignal) => Promise<FlightSnapshot>,
  onSnapshot: (snapshot: FlightSnapshot, source: 'live' | 'replay') => void
): () => void {
  /** Cancels the active live request when polling stops. */
  const controller = new AbortController();
  /** Fallback snapshots shown while live data is unavailable. */
  const frames = createFallbackFlightFrames(fallback);
  let frame = 0;
  let replayTimer: ReturnType<typeof setInterval> | undefined;
  let pollTimer: ReturnType<typeof setTimeout> | undefined;
  /** Starts replay if it is not already running. */
  const startReplay = () => {
    if (replayTimer !== undefined) return;
    frame = 0;
    onSnapshot(frames[frame], 'replay');
    replayTimer = setInterval(() => {
      frame = (frame + 1) % frames.length;
      onSnapshot(frames[frame], 'replay');
    }, 5000);
  };
  /** Fetches the next live snapshot and schedules the next poll. */
  const poll = async () => {
    try {
      const snapshot = await fetchSnapshot(controller.signal);
      if (controller.signal.aborted) return;
      clearInterval(replayTimer);
      replayTimer = undefined;
      onSnapshot(snapshot, 'live');
    } catch {
      if (controller.signal.aborted) return;
      startReplay();
    }
    pollTimer = setTimeout(poll, 60000);
  };
  startReplay();
  void poll();
  return () => {
    controller.abort();
    clearInterval(replayTimer);
    clearTimeout(pollTimer);
  };
}
