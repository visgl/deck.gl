// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global fetch */
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {MapView} from '@deck.gl/core';
import {Tile2DLayer, Tileset2D} from '@deck.gl/geo-layers';
import {BitmapLayer} from '@deck.gl/layers';
import {DeckGL} from '@deck.gl/react';
import type {MapViewState, ViewStateChangeParameters} from '@deck.gl/core';
import type {Tile2DLayerPickingInfo} from '@deck.gl/geo-layers';
import './style.css';

/** Live aggregate counters for the caches in the current comparison mode. */
export type TileDemoStats = {
  /** Tile fetches started since switching modes. */
  requests: number;
  /** Number of independently owned caches. */
  caches: number;
  /** Unique entries retained per cache, including unfinished requests. */
  cached: number;
  /** Entries selected or used as fallbacks across views, counted once per cache. */
  visible: number;
  /** Currently running tile loads. */
  loading: number;
  /** Layer/view consumers registered with the caches. */
  consumers: number;
};

/** Configuration shared by the standalone example, website route, and inline demo. */
export type TileDemoProps = {
  /** Receives counters after tileset stats change. */
  onStatsChange?: (stats: TileDemoStats) => void;
  /** Displays local counters; disable when a website infobox displays them. */
  showStats?: boolean;
};

const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const CAMERA: MapViewState = {
  longitude: -122.42,
  latitude: 37.78,
  zoom: 11,
  minZoom: 0,
  maxZoom: 19
};
const INITIAL_VIEW_STATE = {
  left: CAMERA,
  right: CAMERA,
  minimap: {...CAMERA, zoom: CAMERA.zoom - 2}
};
const VIEWS = [
  new MapView({id: 'left', width: '50%', controller: true}),
  new MapView({id: 'right', x: '50%', width: '50%', controller: true}),
  new MapView({
    id: 'minimap',
    x: '70%',
    y: '70%',
    width: '28%',
    height: '27%',
    clear: true,
    clearColor: [24, 40, 56, 255]
  })
];
const EMPTY_STATS: TileDemoStats = {
  requests: 0,
  caches: 1,
  cached: 0,
  visible: 0,
  loading: 0,
  consumers: 0
};

/** Resolves a standard XYZ source URL. */
function getTileUrl({x, y, z}: {x: number; y: number; z: number}): string {
  return TILE_URL.replace('{z}', String(z)).replace('{x}', String(x)).replace('{y}', String(y));
}

/** Displays the source tile selected by either styled consumer. */
function getTooltip({tile}: Tile2DLayerPickingInfo<ImageBitmap>) {
  return tile && 'Tile ' + tile.index.z + '/' + tile.index.x + '/' + tile.index.y;
}

/** Demonstrates shared content with two styles, three views, and an independent-cache comparison. */
export default function App({onStatsChange, showStats = true}: TileDemoProps = {}) {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [shared, setShared] = useState(true);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [error, setError] = useState<string | null>(null);
  const pool = useMemo(() => {
    const result = {requests: 0, tilesets: [] as Tileset2D<ImageBitmap>[]};
    const create = () =>
      new Tileset2D<ImageBitmap>({
        tileSize: 256,
        minZoom: 0,
        maxZoom: 19,
        maxRequests: 6,
        maxCacheSize: 100,
        onTileUnload: tile => tile.content?.close(),
        getTileData: async ({index, signal}) => {
          result.requests++;
          const response = await fetch(getTileUrl(index), {signal});
          if (!response.ok) throw new Error('Tile request failed: ' + response.status);
          const image = await createImageBitmap(await response.blob());
          if (signal?.aborted) {
            image.close();
            return null;
          }
          return image;
        }
      });
    result.tilesets = shared ? [create()] : [create(), create()];
    return result;
  }, [shared]);

  useEffect(() => {
    const update = () => {
      const sum = (name: string) =>
        pool.tilesets.reduce((total, tileset) => total + tileset.stats.get(name).count, 0);
      const next = {
        requests: pool.requests,
        caches: pool.tilesets.length,
        cached: sum('Tiles In Cache'),
        visible: sum('Visible Tiles'),
        loading: sum('Loading Tiles'),
        consumers: sum('Consumers')
      };
      setStats(next);
      onStatsChange?.(next);
    };
    const unsubscribers = pool.tilesets.map(tileset =>
      tileset.subscribe({
        onStatsChange: update,
        onTileError: failure => setError(String(failure))
      })
    );
    update();
    return () => unsubscribers.forEach(unsubscribe => unsubscribe());
  }, [pool, onStatsChange]);

  useEffect(
    () => () =>
      pool.tilesets.forEach(tileset => {
        const images = tileset.tiles.map(tile => tile.content);
        tileset.finalize();
        images.forEach(image => image?.close());
      }),
    [pool]
  );

  const onViewStateChange = useCallback(
    ({viewId, viewState: next}: ViewStateChangeParameters<MapViewState>) => {
      if (viewId === 'minimap') return;
      setViewState({
        left: next,
        right: next,
        minimap: {...next, pitch: 0, bearing: 0, zoom: Math.max(0, next.zoom - 2)}
      });
    },
    []
  );

  const layers = ['left', 'right'].map(
    (viewId, index) =>
      new Tile2DLayer<ImageBitmap>({
        id: 'raster-' + viewId,
        data: pool.tilesets[shared ? 0 : index],
        viewIds: index === 0 ? ['left'] : ['right', 'minimap'],
        pickable: true,
        renderSubLayers: props => {
          const [[west, south], [east, north]] = props.tile.boundingBox;
          return new BitmapLayer(props, {
            data: null,
            image: props.data,
            bounds: [west, south, east, north],
            tintColor: index === 0 ? [255, 255, 255] : [160, 215, 245]
          });
        }
      })
  );

  return (
    <div
      className={showStats ? 'shared-tiles-demo' : 'shared-tiles-demo shared-tiles-demo--website'}
      aria-label="Shared tileset comparison"
    >
      <DeckGL
        views={VIEWS}
        layers={layers}
        viewState={viewState}
        onViewStateChange={onViewStateChange}
        getTooltip={getTooltip}
      />
      <div className="shared-tiles-demo__controls">
        <label>
          <input
            type="checkbox"
            checked={shared}
            onChange={event => {
              setError(null);
              setShared(event.target.checked);
            }}
          />{' '}
          Share tile cache
        </label>
        {showStats && <p>{shared ? 'One tileset' : 'Two tilesets'} / two layers / three views</p>}
        {showStats && (
          <dl aria-label="Tile cache statistics">
            <dt>Requests started</dt>
            <dd>{stats.requests}</dd>
            <dt>Visible entries</dt>
            <dd>{stats.visible}</dd>
            <dt>Cached entries</dt>
            <dd>{stats.cached}</dd>
            <dt>Loading</dt>
            <dd>{stats.loading}</dd>
          </dl>
        )}
        {error && <p role="alert">{error}</p>}
      </div>
      <div className="shared-tiles-demo__style-label" style={{left: '25%'}}>
        Original
      </div>
      <div className="shared-tiles-demo__style-label" style={{left: '60%'}}>
        Cool tint
      </div>
      <div className="shared-tiles-demo__divider" />
      <div className="shared-tiles-demo__minimap-frame" />
      <div className="shared-tiles-demo__attribution">
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
          © OpenStreetMap contributors
        </a>
      </div>
    </div>
  );
}

/** Mounts the standalone app in a parent whose height is defined. */
export function renderToDOM(container: HTMLDivElement): void {
  createRoot(container).render(<App />);
}
