// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global fetch */
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';

import {MapView} from '@deck.gl/core';
import {Tile2DLayer, Tileset2D, tile2DDeckAdapter} from '@deck.gl/geo-layers';
import {BitmapLayer} from '@deck.gl/layers';
import {DeckGL} from '@deck.gl/react';

import type {MapViewState, ViewStateChangeParameters} from '@deck.gl/core';
import type {Tile2DLayerPickingInfo} from '@deck.gl/geo-layers';

const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const mainView = new MapView({id: 'main', controller: true, repeat: true});
const minimapView = new MapView({
  id: 'minimap',
  x: 16,
  y: 16,
  width: 280,
  height: 180,
  clear: true
});

const INITIAL_VIEW_STATE: {main: MapViewState; minimap: MapViewState} = {
  main: {
    longitude: -122.42,
    latitude: 37.78,
    zoom: 11,
    minZoom: 0,
    maxZoom: 19
  },
  minimap: {
    longitude: -122.42,
    latitude: 37.78,
    zoom: 11
  }
};

const MINIMAP_FRAME_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: 16,
  top: 16,
  width: 280,
  height: 180,
  pointerEvents: 'none',
  border: '1px solid rgba(255,255,255,0.9)',
  boxShadow: '0 8px 28px rgba(0,0,0,0.35)'
};

const LABEL_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: 28,
  top: 28,
  pointerEvents: 'none',
  color: '#fff',
  background: 'rgba(0,0,0,0.66)',
  padding: '6px 8px',
  font: '12px/1.2 Helvetica Neue,Arial,sans-serif'
};

const COPYRIGHT_LICENSE_STYLE: React.CSSProperties = {
  position: 'absolute',
  right: 0,
  bottom: 0,
  backgroundColor: 'hsla(0,0%,100%,.75)',
  padding: '0 5px',
  font: '12px/20px Helvetica Neue,Arial,Helvetica,sans-serif'
};

const LINK_STYLE: React.CSSProperties = {
  textDecoration: 'none',
  color: 'rgba(0,0,0,.75)'
};

function getTileUrl({x, y, z}: {x: number; y: number; z: number}): string {
  return TILE_URL.replace('{z}', String(z)).replace('{x}', String(x)).replace('{y}', String(y));
}

function getTooltip({tile}: Tile2DLayerPickingInfo<ImageBitmap>) {
  if (!tile) {
    return null;
  }
  const {x, y, z} = tile.index;
  return `tile: x: ${x}, y: ${y}, z: ${z}`;
}

export default function App({onTilesLoad}: {onTilesLoad?: (tileCount: number) => void}) {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [shared, setShared] = useState(true);
  const [stats, setStats] = useState({requests: 0, cached: 0});
  const pool = useMemo(() => {
    const result = {requests: 0, tilesets: [] as Tileset2D<ImageBitmap>[]};
    const create = () =>
      new Tileset2D<ImageBitmap>({
        adapter: tile2DDeckAdapter,
        tileSize: 256,
        minZoom: 0,
        maxZoom: 19,
        maxRequests: 20,
        getTileData: async ({index, signal}) => {
          result.requests++;
          const response = await fetch(getTileUrl(index), {signal});
          if (!response.ok) throw new Error(`Tile request failed: ${response.status}`);
          return createImageBitmap(await response.blob());
        }
      });
    result.tilesets = shared ? [create()] : [create(), create()];
    return result;
  }, [shared]);

  useEffect(() => {
    const update = () =>
      setStats({
        requests: pool.requests,
        cached: pool.tilesets.reduce((sum, tileset) => sum + tileset.tiles.length, 0)
      });
    update();
    const timer = setInterval(update, 250);
    return () => {
      clearInterval(timer);
      pool.tilesets.forEach(tileset => tileset.finalize());
    };
  }, [pool]);

  const onViewStateChange = useCallback(
    ({viewId, viewState: nextViewState}: ViewStateChangeParameters<MapViewState>) => {
      if (viewId !== 'main') {
        return;
      }
      setViewState(currentViewState => ({
        main: nextViewState,
        minimap: {
          ...currentViewState.minimap,
          longitude: nextViewState.longitude,
          latitude: nextViewState.latitude
        }
      }));
    },
    []
  );

  const tileLayers = useMemo(
    () =>
      ['main', 'minimap'].map(
        (viewId, index) =>
          new Tile2DLayer<ImageBitmap>({
            id: `raster-${viewId}`,
            data: pool.tilesets[shared ? 0 : index],
            pickable: true,
            onViewportLoad: tiles => onTilesLoad?.(tiles.length),
            renderSubLayers: props => {
              const [[west, south], [east, north]] = props.tile.boundingBox;
              const {data, ...otherProps} = props;
              return new BitmapLayer(otherProps, {
                data: null,
                image: data,
                bounds: [west, south, east, north]
              });
            }
          })
      ),
    [onTilesLoad, pool, shared]
  );

  return (
    <DeckGL
      layers={tileLayers}
      layerFilter={({layer, viewport}) => layer.id === `raster-${viewport.id}`}
      views={[mainView, minimapView]}
      viewState={viewState}
      onViewStateChange={onViewStateChange}
      getTooltip={getTooltip}
    >
      <div style={MINIMAP_FRAME_STYLE} />
      <div style={{...LABEL_STYLE, pointerEvents: 'auto'}}>
        <label>
          <input
            type="checkbox"
            checked={shared}
            onChange={event => setShared(event.target.checked)}
          />{' '}
          Share tile cache
        </label>
        <div>
          {stats.requests} requests · {stats.cached} cached tiles
        </div>
        <div>
          {shared ? 'One cache for two consumers' : 'Independent caches'}; counts reset on toggle
        </div>
      </div>
      <div style={COPYRIGHT_LICENSE_STYLE}>
        {'© '}
        <a style={LINK_STYLE} href="https://www.openstreetmap.org/copyright" target="blank">
          OpenStreetMap contributors
        </a>
      </div>
    </DeckGL>
  );
}

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
