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
const mobileCapture = {width: 420, height: 656};
const desktopCapture = {width: 1440, height: 648};

export default function HeroMap() {
  const canvasRef = useRef(null);
  const playbackRef = useRef(null);
  const sceneRef = useRef(null);
  const [status, setStatus] = useState('preview');
  const [pausedAtHandoff, setPausedAtHandoff] = useState(false);
  const baseUrl = useBaseUrl('/');
  const artworkUrl = useBaseUrl('/images/home/');
  const demoUrl = useBaseUrl('/examples/trips-layer');
  const desktopPoster = `${artworkUrl}taxi-wide.webp`;
  const mobilePoster = `${artworkUrl}taxi-mobile.webp`;
  const desktopIntro = `${artworkUrl}taxi-intro-wide.avif`;
  const mobileIntro = `${artworkUrl}taxi-intro-mobile.avif`;
  const desktopMotion = `${desktopViewport} and ${motionQuery}`;
  const mobileMotion = `${mobileViewport} and ${motionQuery}`;
  const ready = status === 'ready';

  useEffect(() => {
    const controller = new AbortController();
    const {signal} = controller;
    const canvas = canvasRef.current;
    const playback = playbackRef.current;
    let scene;
    setStatus('loading');

    function dispose() {
      if (scene) {
        if (sceneRef.current === scene) {
          sceneRef.current = null;
        }
        scene.finalize();
        scene = null;
      }
    }

    function reportFailure() {
      if (!signal.aborted) {
        controller.abort();
        setStatus('unavailable');
        // The error may be reported during a deck.gl draw.
        queueMicrotask(dispose);
      }
    }

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

  return (
    <figure
      className={styles.scene}
      data-state={status}
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
        aria-label="Interactive map of New York City taxi routes"
        aria-describedby="hero-map-instructions"
      />
      <figcaption className={styles.caption}>
        <div>
          <strong id="hero-map-title">New York City taxi trips</strong>
          <div id="hero-map-instructions" className={styles.instructions} aria-live="polite">
            {ready && (
              <>
                <span className={styles.pointerHint}>
                  Move to highlight trails. Drag or use arrow keys to pan.
                </span>
                <span className={styles.touchHint}>Swipe sideways to pan. Pinch to zoom.</span>
              </>
            )}
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
          <label className={styles.playbackLabel} htmlFor="hero-map-playback">
            Animate trips
          </label>
          {ready && (
            <button type="button" onClick={() => sceneRef.current?.reset()}>
              Reset view
            </button>
          )}
          <a href={demoUrl}>
            Full map <span aria-hidden="true">↗</span>
          </a>
        </div>
      </figcaption>
    </figure>
  );
}
