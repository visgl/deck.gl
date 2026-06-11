// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global fetch */
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';

import {MapView} from '@deck.gl/core';
import {
  _SharedTile2DLayer as SharedTile2DLayer,
  _SharedTileset2D as SharedTileset2D,
  sharedTile2DDeckAdapter
} from '@deck.gl/geo-layers';
import {BitmapLayer} from '@deck.gl/layers';
import {DeckGL} from '@deck.gl/react';

import type {MapViewState, ViewStateChangeParameters} from '@deck.gl/core';
import type {SharedTile2DLayerPickingInfo} from '@deck.gl/geo-layers';

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
    zoom: 7
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

function getTooltip({tile}: SharedTile2DLayerPickingInfo<ImageBitmap>) {
  if (!tile) {
    return null;
  }
  const {x, y, z} = tile.index;
  return `tile: x: ${x}, y: ${y}, z: ${z}`;
}

export default function App({onTilesLoad}: {onTilesLoad?: (tileCount: number) => void}) {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const tileset = useMemo(
    () =>
      new SharedTileset2D<ImageBitmap>({
        adapter: sharedTile2DDeckAdapter,
        tileSize: 256,
        minZoom: 0,
        maxZoom: 19,
        maxRequests: 20,
        getTileData: async ({index, signal}) => {
          const response = await fetch(getTileUrl(index), {signal});
          if (!response.ok) {
            throw new Error(`Tile request failed: ${response.status}`);
          }
          return createImageBitmap(await response.blob());
        }
      }),
    []
  );

  useEffect(() => () => tileset.finalize(), [tileset]);

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

  const tileLayer = useMemo(
    () =>
      new SharedTile2DLayer<ImageBitmap>({
        id: 'shared-raster-tiles',
        data: tileset,
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
      }),
    [onTilesLoad, tileset]
  );

  return (
    <DeckGL
      layers={[tileLayer]}
      views={[mainView, minimapView]}
      viewState={viewState}
      onViewStateChange={onViewStateChange}
      getTooltip={getTooltip}
    >
      <div style={MINIMAP_FRAME_STYLE} />
      <div style={LABEL_STYLE}>one shared tileset</div>
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
