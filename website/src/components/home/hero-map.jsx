// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useEffect, useRef, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {buildingDataPath, loadTaxiData, tripDataPath} from './taxi-data';
import styles from './hero-map.module.css';

const mobileViewport = '(max-width: 760px)';
const desktopViewport = '(width > 760px)';
const motionQuery = '(prefers-reduced-motion: no-preference)';
/** Reference viewport for the narrow capture and its live camera crop. */
const mobileCapture = {width: 420, height: 656};
/** Reference viewport for the wide capture and its live camera crop. */
const desktopCapture = {width: 1440, height: 648};

/** Caption and reference link for each live map view. */
const taxiViews = {
  trails: {
    label: 'Trails',
    title: 'New York City taxi trips',
    link: 'Full map',
    path: '/examples/trips-layer'
  },
  connections: {
    label: 'Connections',
    title: 'Taxi connections',
    description: 'A sample of pickup and drop-off links.',
    link: 'ArcLayer',
    path: '/docs/api-reference/layers/arc-layer'
  },
  pickups: {
    label: 'Pickups',
    title: 'Taxi pickup hotspots',
    description: 'Taller columns mark more pickups.',
    link: 'ColumnLayer',
    path: '/docs/api-reference/layers/column-layer'
  }
};

/** Shows the captured taxi scene until the interactive map draws its first frame. */
export default function HeroMap() {
  const canvasRef = useRef(null);
  const playbackRef = useRef(null);
  const sceneRef = useRef(null);
  const viewRequestRef = useRef(0);
  const [status, setStatus] = useState('preview');
  const [pausedAtHandoff, setPausedAtHandoff] = useState(false);
  const [activeView, setActiveView] = useState('trails');
  const [pendingView, setPendingView] = useState(null);
  const [viewError, setViewError] = useState(false);
  const ready = status === 'ready';
  const baseUrl = useBaseUrl('/');
  const artworkUrl = useBaseUrl('/images/home/');
  const view = taxiViews[ready ? activeView : 'trails'];
  const viewUrl = useBaseUrl(view.path);
  const desktopPoster = `${artworkUrl}taxi-wide.webp`;
  const mobilePoster = `${artworkUrl}taxi-mobile.webp`;
  const desktopIntro = `${artworkUrl}taxi-intro-wide.avif`;
  const mobileIntro = `${artworkUrl}taxi-intro-mobile.avif`;
  const desktopMotion = `${desktopViewport} and ${motionQuery}`;
  const mobileMotion = `${mobileViewport} and ${motionQuery}`;
  useEffect(() => {
    const controller = new AbortController();
    const {signal} = controller;
    const canvas = canvasRef.current;
    const playback = playbackRef.current;
    let scene;
    setStatus('loading');

    /** Releases the live scene if startup completed before cleanup. */
    function dispose() {
      if (scene) {
        if (sceneRef.current === scene) {
          sceneRef.current = null;
        }
        scene.finalize();
        scene = null;
      }
    }

    /** Restores the preview if loading or rendering the map fails. */
    function reportFailure() {
      if (!signal.aborted) {
        controller.abort();
        setStatus('unavailable');
        // The error may be reported during a deck.gl draw.
        queueMicrotask(dispose);
      }
    }

    /** Loads and initializes the live scene without blocking the preview. */
    async function start() {
      try {
        const [{createTaxiScene}, data] = await Promise.all([
          import(/* webpackChunkName: "home-taxi-scene" */ './taxi-scene'),
          loadTaxiData(baseUrl, signal)
        ]);
        signal.throwIfAborted();
        scene = await createTaxiScene({
          canvas,
          data,
          signal,
          getCaptureSize: () =>
            window.matchMedia(mobileViewport).matches ? mobileCapture : desktopCapture,
          isPaused: () => !playback.checked,
          onReady: () => {
            if (!signal.aborted) {
              setPausedAtHandoff(!playback.checked);
              setStatus('ready');
            }
          },
          onPlaybackChange: value => {
            if (!signal.aborted) {
              playback.checked = value;
            }
          },
          onError: reportFailure
        });
        if (signal.aborted) {
          dispose();
        } else {
          sceneRef.current = scene;
        }
      } catch {
        reportFailure();
      }
    }

    start();
    return () => {
      controller.abort();
      dispose();
    };
  }, [baseUrl]);

  /** Reflects a view selection after its layers have loaded. */
  async function selectView(nextView) {
    const scene = sceneRef.current;
    if (!scene) {
      return;
    }
    const request = ++viewRequestRef.current;
    setPendingView(nextView);
    setViewError(false);
    try {
      if ((await scene.setView(nextView)) && request === viewRequestRef.current) {
        setActiveView(nextView);
      }
    } catch {
      if (request === viewRequestRef.current) {
        setViewError(true);
      }
    } finally {
      if (request === viewRequestRef.current) {
        setPendingView(null);
      }
    }
  }

  return (
    <figure
      className={styles.scene}
      data-state={status}
      data-view={ready ? activeView : 'trails'}
      data-preview-paused={ready && pausedAtHandoff ? '' : undefined}
      aria-labelledby="hero-map-title"
      style={{
        '--taxi-still-wide': `url("${desktopPoster}")`,
        '--taxi-still-mobile': `url("${mobilePoster}")`
      }}
    >
      <link
        rel="preload"
        as="image"
        href={desktopIntro}
        media={desktopMotion}
        type="image/avif"
        fetchpriority="high"
      />
      <link
        rel="preload"
        as="image"
        href={mobileIntro}
        media={mobileMotion}
        type="image/avif"
        fetchpriority="high"
      />
      <link
        rel="preload"
        as="fetch"
        href={`${baseUrl}${tripDataPath}`}
        crossOrigin="anonymous"
        fetchpriority="low"
      />
      <link
        rel="preload"
        as="fetch"
        href={`${baseUrl}${buildingDataPath}`}
        crossOrigin="anonymous"
        fetchpriority="low"
      />
      {/* A native control can switch to the responsive still before React hydrates. */}
      <input
        ref={playbackRef}
        id="hero-map-playback"
        className={styles.playbackToggle}
        type="checkbox"
        defaultChecked
        onChange={event => sceneRef.current?.setPlaying(event.currentTarget.checked)}
      />
      <picture className={styles.preview}>
        <source srcSet={mobileIntro} media={mobileMotion} type="image/avif" />
        <source srcSet={desktopIntro} media={desktopMotion} type="image/avif" />
        <source srcSet={mobilePoster} media={mobileViewport} {...mobileCapture} />
        <img alt="" src={desktopPoster} fetchpriority="high" {...desktopCapture} />
      </picture>
      <canvas
        className={styles.canvas}
        ref={canvasRef}
        tabIndex={ready ? 0 : -1}
        aria-label={`${view.title} interactive map`}
        aria-describedby="hero-map-instructions"
      />
      <figcaption className={styles.caption}>
        <div>
          <strong id="hero-map-title">{view.title}</strong>
          <div id="hero-map-instructions" className={styles.instructions} aria-live="polite">
            {ready && viewError && 'That map view could not load. Try again.'}
            {ready && pendingView && `Loading ${taxiViews[pendingView].label.toLowerCase()}…`}
            {ready &&
              !viewError &&
              !pendingView &&
              (view.description || (
                <>
                  <span className={styles.pointerHint}>
                    Move to highlight trails. Drag or use arrow keys to pan.
                  </span>
                  <span className={styles.touchHint}>Swipe sideways to pan. Pinch to zoom.</span>
                </>
              ))}
          </div>
          <div className={styles.attribution}>
            <a href="https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page">NYC TLC</a>
            {' · '}
            <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap</a>
            {' via '}
            <a href="https://mapzen.com/">Mapzen</a>
          </div>
        </div>
        <div className={styles.controls}>
          {ready && (
            <fieldset
              className={styles.views}
              aria-label="Map view"
              aria-busy={Boolean(pendingView)}
            >
              {Object.entries(taxiViews).map(([id, option]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={activeView === id}
                  onClick={() => selectView(id)}
                >
                  {option.label}
                </button>
              ))}
            </fieldset>
          )}
          <div className={styles.actions}>
            <label className={styles.playbackLabel} htmlFor="hero-map-playback">
              Animate trips
            </label>
            {ready && (
              <button type="button" onClick={() => sceneRef.current?.reset()}>
                Reset view
              </button>
            )}
            <a href={viewUrl}>
              {view.link} <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </figcaption>
    </figure>
  );
}
