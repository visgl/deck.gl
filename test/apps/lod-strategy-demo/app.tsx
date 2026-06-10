// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {DeckGL} from '@deck.gl/react';
import {TileLayer} from '@deck.gl/geo-layers';
import {BitmapLayer, PathLayer, TextLayer} from '@deck.gl/layers';
import {FlyToInterpolator, _GlobeView as GlobeView} from '@deck.gl/core';

type DemoMode = 'before' | 'after';

type TileRecord = {
  id: string;
  order: number;
  status: 'loading' | 'loaded' | 'aborted';
};

type DemoTile = {
  id: string;
  order: number;
  image: ImageBitmap;
};

type ViewState = {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
  maxZoom: number;
};

const BASEMAP_TILE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

const MIAMI_VIEW_STATE: ViewState = {
  longitude: -80.1918,
  latitude: 25.7617,
  zoom: 12,
  pitch: 32,
  bearing: -14,
  maxZoom: 20
};

const MID_ROUTE_VIEW_STATE: ViewState = {
  longitude: -77.04,
  latitude: 35.32,
  zoom: 8.8,
  pitch: 78,
  bearing: 34,
  maxZoom: 20
};

const NEW_YORK_VIEW_STATE: ViewState = {
  longitude: -73.9851,
  latitude: 40.7589,
  zoom: 14.2,
  pitch: 72,
  bearing: 28,
  maxZoom: 20
};

const START_HOLD_MS = 5000;
const MID_ROUTE_DURATION_MS = 10000;
const NEW_YORK_DURATION_MS = 9000;
const FLY_DURATION_MS = MID_ROUTE_DURATION_MS + NEW_YORK_DURATION_MS;
const HOLD_DURATION_MS = 20000;
const MAX_REQUESTS = 6;

const styles: Record<string, React.CSSProperties> = {
  stage: {
    position: 'fixed',
    inset: 0,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    background: '#07090b',
    overflow: 'hidden'
  },
  pane: {
    position: 'relative',
    minWidth: 0,
    overflow: 'hidden'
  },
  divider: {
    position: 'fixed',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    background: 'linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.52), transparent)',
    zIndex: 20
  },
  paneLabel: {
    position: 'absolute',
    top: 18,
    left: 18,
    zIndex: 10,
    display: 'grid',
    gap: 6,
    minWidth: 188,
    padding: '11px 12px',
    border: '1px solid rgba(210, 228, 245, 0.18)',
    borderRadius: 8,
    background: 'linear-gradient(180deg, rgba(14, 20, 24, 0.8), rgba(7, 10, 13, 0.88))',
    backdropFilter: 'blur(14px) saturate(135%)',
    boxShadow: '0 18px 44px rgba(0, 0, 0, 0.34)',
    color: '#f8fafc'
  },
  labelTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    fontWeight: 850
  },
  labelDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flex: '0 0 auto'
  },
  labelSubtitle: {
    color: '#a9b7c4',
    fontSize: 11,
    fontWeight: 650
  },
  labelStats: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 6,
    marginTop: 2,
    fontVariantNumeric: 'tabular-nums'
  },
  stat: {
    border: '1px solid rgba(210, 228, 245, 0.13)',
    borderRadius: 6,
    padding: '6px 7px',
    background: 'rgba(255, 255, 255, 0.05)'
  },
  statLabel: {
    color: '#96a5b3',
    fontSize: 9,
    fontWeight: 800
  },
  statValue: {
    color: '#fff6b8',
    fontSize: 16,
    fontWeight: 850
  },
  routeBadge: {
    position: 'fixed',
    left: '50%',
    top: 18,
    transform: 'translateX(-50%)',
    zIndex: 30,
    padding: '9px 14px',
    border: '1px solid rgba(210, 228, 245, 0.2)',
    borderRadius: 999,
    background: 'rgba(7, 10, 13, 0.78)',
    backdropFilter: 'blur(14px) saturate(135%)',
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: 800,
    boxShadow: '0 14px 36px rgba(0, 0, 0, 0.36)',
    fontVariantNumeric: 'tabular-nums'
  },
  progressTrack: {
    position: 'fixed',
    left: '50%',
    bottom: 18,
    transform: 'translateX(-50%)',
    zIndex: 30,
    width: 360,
    height: 5,
    borderRadius: 999,
    background: 'rgba(255, 255, 255, 0.16)',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    background: 'linear-gradient(90deg, #fff06a, #67c4ff)'
  },
  crosshair: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    zIndex: 9,
    width: 34,
    height: 34,
    marginLeft: -17,
    marginTop: -17,
    border: '2px solid #fff6b8',
    borderRadius: '50%',
    pointerEvents: 'none'
  },
  crosshairLineH: {
    position: 'absolute',
    left: -18,
    top: 15,
    width: 70,
    height: 2,
    background: '#fff6b8'
  },
  crosshairLineV: {
    position: 'absolute',
    left: 15,
    top: -18,
    width: 2,
    height: 70,
    background: '#fff6b8'
  }
};

function getOrderColor(mode: DemoMode, order: number): [number, number, number, number] {
  if (mode === 'before') {
    return order <= 4 ? [255, 143, 82, 230] : [130, 171, 202, 205];
  }
  if (order <= 4) {
    return [255, 240, 106, 235];
  }
  if (order <= 8) {
    return [103, 196, 255, 220];
  }
  return [149, 223, 185, 205];
}

function getTileCenter({
  bbox
}: {
  bbox: {west: number; south: number; east: number; north: number};
}): [number, number] {
  return [(bbox.west + bbox.east) / 2, (bbox.south + bbox.north) / 2];
}

function getTilePath({
  bbox
}: {
  bbox: {west: number; south: number; east: number; north: number};
}): number[][] {
  const {west, south, east, north} = bbox;
  return [
    [west, south],
    [east, south],
    [east, north],
    [west, north],
    [west, south]
  ];
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timeout);
        reject(new Error('Tile request aborted'));
      },
      {once: true}
    );
  });
}

function interpolateFlyToViewState(start: ViewState, end: ViewState, t: number): ViewState {
  const interpolator = new FlyToInterpolator({curve: 1.15, speed: 0.65});
  const width = Math.max(1, window.innerWidth / 2);
  const height = Math.max(1, window.innerHeight);
  const easedT = easeInOutCubic(t);
  const viewport = interpolator.interpolateProps(
    {...start, width, height},
    {...end, width, height},
    easedT
  ) as ViewState;

  return {
    longitude: viewport.longitude,
    latitude: viewport.latitude,
    zoom: viewport.zoom,
    pitch: viewport.pitch,
    bearing: viewport.bearing,
    maxZoom: end.maxZoom
  };
}

function easeInOutCubic(t: number): number {
  const clampedT = Math.max(0, Math.min(t, 1));
  return clampedT < 0.5 ? 4 * clampedT ** 3 : 1 - (-2 * clampedT + 2) ** 3 / 2;
}

function makeTileId(url: string): string {
  const tilePath = url.match(/\/(\d+)\/(\d+)\/(\d+)(?:\.\w+)?(?:[?#].*)?$/);
  return tilePath ? `${tilePath[1]}-${tilePath[3]}-${tilePath[2]}` : 'tile';
}

function DemoPane({
  mode,
  viewState,
  generation,
  title,
  subtitle
}: {
  mode: DemoMode;
  viewState: ViewState;
  generation: number;
  title: string;
  subtitle: string;
}) {
  const [records, setRecords] = useState<TileRecord[]>([]);
  const requestOrderRef = useRef(0);
  const generationRef = useRef(generation);

  useEffect(() => {
    generationRef.current = generation;
    requestOrderRef.current = 0;
    setRecords([]);
  }, [generation]);

  const fetchTile = useCallback(async (url: string, {signal}: {signal?: AbortSignal}) => {
    const requestGeneration = generationRef.current;
    const id = makeTileId(url);
    const order = ++requestOrderRef.current;

    setRecords(current => [
      {id, order, status: 'loading'},
      ...current.filter(item => item.id !== id)
    ]);

    try {
      const response = await fetch(url, {signal});
      if (!response.ok) {
        throw new Error(`Tile request failed: ${response.status}`);
      }
      const blob = await response.blob();
      const image = await createImageBitmap(blob);
      await wait(250, signal);
      setRecords(current =>
        requestGeneration === generationRef.current
          ? current.map(item => (item.id === id ? {...item, status: 'loaded'} : item))
          : current
      );
      return {id, order, image};
    } catch (error) {
      setRecords(current =>
        requestGeneration === generationRef.current
          ? current.map(item => (item.id === id ? {...item, status: 'aborted'} : item))
          : current
      );
      throw error;
    }
  }, []);

  const layer = useMemo(
    () =>
      new TileLayer<DemoTile>({
        id: `${mode}-tiles`,
        minZoom: 0,
        maxZoom: 20,
        tileSize: 512,
        maxRequests: MAX_REQUESTS,
        refinementStrategy: 'best-available',
        lodStrategy: mode === 'after' ? 'coverage' : 'none',
        data: [BASEMAP_TILE_URL],
        fetch: fetchTile,
        renderSubLayers: props => {
          const {data, tile} = props;
          if (!data) {
            return null;
          }
          const {west, south, east, north} = tile.bbox;
          return [
            new BitmapLayer(props, {
              id: `${props.id}-satellite`,
              image: data.image,
              bounds: [west, south, east, north]
            }),
            new PathLayer(props, {
              id: `${props.id}-lod-border`,
              data: [{bbox: tile.bbox, order: data.order}],
              getPath: getTilePath,
              getColor: d => getOrderColor(mode, d.order),
              widthMinPixels: mode === 'after' ? 3 : 2
            }),
            new TextLayer<DemoTile>(props, {
              id: `${props.id}-label`,
              data: [data],
              getPosition: () => getTileCenter(tile),
              getText: d => `#${d.order}`,
              getSize: 28,
              getColor: d => getOrderColor(mode, d.order),
              getBackgroundColor: [6, 10, 14, 215],
              background: true,
              backgroundPadding: [7, 4],
              getTextAnchor: 'middle',
              getAlignmentBaseline: 'center'
            })
          ];
        }
      }),
    [fetchTile, generation, mode]
  );

  const loadingCount = records.filter(record => record.status === 'loading').length;
  const loadedCount = records.filter(record => record.status === 'loaded').length;
  const dotColor = mode === 'before' ? '#ff8f52' : '#fff06a';

  return (
    <div style={styles.pane}>
      <DeckGL
        views={new GlobeView()}
        viewState={viewState}
        controller={false}
        parameters={{cull: true}}
        layers={[layer]}
      />
      <div style={styles.crosshair}>
        <div style={styles.crosshairLineH} />
        <div style={styles.crosshairLineV} />
      </div>
      <div style={{...styles.paneLabel, ...(mode === 'after' ? {left: 'auto', right: 18} : {})}}>
        <div style={styles.labelTitle}>
          <span
            style={{...styles.labelDot, background: dotColor, boxShadow: `0 0 18px ${dotColor}`}}
          />
          <span>{title}</span>
        </div>
        <div style={styles.labelSubtitle}>{subtitle}</div>
        <div style={styles.labelStats}>
          <div style={styles.stat}>
            <div style={styles.statLabel}>Loading</div>
            <div style={styles.statValue}>{loadingCount}</div>
          </div>
          <div style={styles.stat}>
            <div style={styles.statLabel}>Loaded</div>
            <div style={styles.statValue}>{loadedCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [viewState, setViewState] = useState(MIAMI_VIEW_STATE);
  const [progress, setProgress] = useState(0);
  const [generation, setGeneration] = useState(0);
  const generationRef = useRef(0);
  const loopStartTimeRef = useRef(performance.now());

  const startLoop = useCallback((now = performance.now()) => {
    const nextGeneration = generationRef.current + 1;
    generationRef.current = nextGeneration;
    loopStartTimeRef.current = now;

    setGeneration(nextGeneration);
    setProgress(0);
    setViewState({...MIAMI_VIEW_STATE});
  }, []);

  useEffect(() => {
    let frameId = 0;
    const loopDuration = START_HOLD_MS + FLY_DURATION_MS + HOLD_DURATION_MS;

    const frame = (now: number) => {
      let elapsed = now - loopStartTimeRef.current;
      if (elapsed >= loopDuration) {
        startLoop(now);
        elapsed = 0;
      }

      const flightElapsed = elapsed - START_HOLD_MS;
      const nextProgress = Math.max(0, Math.min(flightElapsed / FLY_DURATION_MS, 1));
      setProgress(nextProgress);

      if (flightElapsed <= 0) {
        setViewState({...MIAMI_VIEW_STATE});
      } else if (flightElapsed < MID_ROUTE_DURATION_MS) {
        setViewState(
          interpolateFlyToViewState(
            MIAMI_VIEW_STATE,
            MID_ROUTE_VIEW_STATE,
            flightElapsed / MID_ROUTE_DURATION_MS
          )
        );
      } else if (flightElapsed < FLY_DURATION_MS) {
        setViewState(
          interpolateFlyToViewState(
            MID_ROUTE_VIEW_STATE,
            NEW_YORK_VIEW_STATE,
            (flightElapsed - MID_ROUTE_DURATION_MS) / NEW_YORK_DURATION_MS
          )
        );
      } else {
        setViewState({...NEW_YORK_VIEW_STATE});
      }

      frameId = requestAnimationFrame(frame);
    };

    startLoop();
    frameId = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [startLoop]);

  return (
    <div style={styles.stage}>
      <DemoPane
        mode="before"
        viewState={viewState}
        generation={generation}
        title="Before"
        subtitle="lodStrategy: none"
      />
      <DemoPane
        mode="after"
        viewState={viewState}
        generation={generation}
        title="After"
        subtitle="lodStrategy: coverage"
      />
      <div style={styles.divider} />
      <div style={styles.routeBadge}>
        Miami to New York | Pitch {Math.round(viewState.pitch)} | Bearing{' '}
        {Math.round(viewState.bearing)}
      </div>
      <div style={styles.progressTrack}>
        <div style={{...styles.progressFill, width: `${progress * 100}%`}} />
      </div>
    </div>
  );
}

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}

const container = document.getElementById('app');

if (container) {
  renderToDOM(container as HTMLDivElement);
}
