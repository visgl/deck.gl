// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global setTimeout */
import React, {useState, useCallback} from 'react';
import {createRoot} from 'react-dom/client';

import {DeckGL} from '@deck.gl/react';
import {COORDINATE_SYSTEM, MapView, _GlobeView as GlobeView} from '@deck.gl/core';
import {TileLayer} from '@deck.gl/geo-layers';
import {BitmapLayer, PathLayer} from '@deck.gl/layers';
import {load} from '@loaders.gl/core';
import ZoomRangeWidget from './zoom-range-widget';

import type {GlobeViewState, Position, MapViewState, TextureSource} from '@deck.gl/core';
import type {TileLayerPickingInfo} from '@deck.gl/geo-layers';

const INITIAL_VIEW_STATE: MapViewState = {
  latitude: 47.65,
  longitude: 7,
  zoom: 4.5,
  maxZoom: 20,
  maxPitch: 89,
  bearing: 0
};

const INITIAL_GLOBE_VIEW_STATE: GlobeViewState = {
  latitude: 47.65,
  longitude: 7,
  zoom: 2.25,
  maxZoom: 20
};

// Approximate bounding box of France [west, south, east, north]
const FRANCE_EXTENT = [-5.14, 41.33, 9.56, 51.09];
const PLACEHOLDER_GRID_CELLS = 16;
const PLACEHOLDER_GRID_SEGMENTS = 24;
const PLACEHOLDER_BACKGROUND_IMAGE: TextureSource = {
  width: 1,
  height: 1,
  data: new Uint8Array([238, 241, 239, 255])
};

const COPYRIGHT_LICENSE_STYLE: React.CSSProperties = {
  position: 'absolute',
  right: 0,
  bottom: 0,
  backgroundColor: 'hsla(0,0%,100%,.5)',
  padding: '0 5px',
  font: '12px/20px Helvetica Neue,Arial,Helvetica,sans-serif'
};

const LINK_STYLE: React.CSSProperties = {
  textDecoration: 'none',
  color: 'rgba(0,0,0,.75)',
  cursor: 'grab'
};

function getTooltip({tile}: TileLayerPickingInfo) {
  if (tile) {
    const {x, y, z} = tile.index;
    return `tile: x: ${x}, y: ${y}, z: ${z}`;
  }
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getPlaceholderGridPaths(bounds: [number, number, number, number]): Position[][] {
  const [west, south, east, north] = bounds;
  const paths: Position[][] = [];

  for (let index = 0; index <= PLACEHOLDER_GRID_CELLS; index++) {
    const gridPosition = index / PLACEHOLDER_GRID_CELLS;
    const longitude = west + (east - west) * gridPosition;
    const latitude = south + (north - south) * gridPosition;
    const verticalPath: Position[] = [];
    const horizontalPath: Position[] = [];

    for (let segment = 0; segment <= PLACEHOLDER_GRID_SEGMENTS; segment++) {
      const linePosition = segment / PLACEHOLDER_GRID_SEGMENTS;
      verticalPath.push([longitude, south + (north - south) * linePosition]);
      horizontalPath.push([west + (east - west) * linePosition, latitude]);
    }

    paths.push(verticalPath, horizontalPath);
  }

  return paths;
}

export default function App({
  showBorder = false,
  globeView = false,
  showPlaceholders = true,
  loadDelay = 0,
  onTilesLoad,
  onZoomChange,
  minZoom = globeView ? 0 : 4,
  maxZoom = globeView ? 19 : 7,
  visibleMinZoom,
  visibleMaxZoom = globeView ? undefined : 7,
  useExtent = false
}: {
  showBorder?: boolean;
  globeView?: boolean;
  showPlaceholders?: boolean;
  loadDelay?: number;
  onTilesLoad?: () => void;
  onZoomChange?: (zoom: number) => void;
  minZoom?: number;
  maxZoom?: number;
  visibleMinZoom?: number;
  visibleMaxZoom?: number;
  useExtent?: boolean;
}) {
  const [zoom, setZoom] = useState(
    globeView ? INITIAL_GLOBE_VIEW_STATE.zoom : INITIAL_VIEW_STATE.zoom
  );
  const onViewStateChange = useCallback(
    ({viewState}) => {
      setZoom(viewState.zoom);
      onZoomChange?.(viewState.zoom);
    },
    [onZoomChange]
  );

  const tileLayer = new TileLayer<ImageBitmap>({
    // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_servers
    data: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],

    // Since these OSM tiles support HTTP/2, we can make many concurrent requests
    // and we aren't limited by the browser to a certain number per domain.
    maxRequests: 20,
    getTileData:
      loadDelay > 0
        ? async ({url}) => {
            await sleep(loadDelay);
            return load(url as string) as Promise<ImageBitmap>;
          }
        : undefined,

    pickable: true,
    onViewportLoad: onTilesLoad,
    autoHighlight: showBorder,
    highlightColor: [60, 60, 60, 40],
    // https://wiki.openstreetmap.org/wiki/Zoom_levels
    minZoom,
    maxZoom,
    tileSize: 512,
    refinementStrategy: 'no-overlap',
    visibleMinZoom,
    visibleMaxZoom,
    extent: useExtent ? FRANCE_EXTENT : undefined,
    renderPlaceholder: showPlaceholders
      ? props => {
          const {id, bounds} = props;
          const otherProps = {...props} as Partial<typeof props>;
          delete otherProps.data;
          delete otherProps.id;
          delete otherProps.bounds;

          return [
            new BitmapLayer(
              {...otherProps, id: `${id}-fill`},
              {
                image: PLACEHOLDER_BACKGROUND_IMAGE,
                bounds,
                _imageCoordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
                pickable: false,
                opacity: 0.92
              }
            ),
            new PathLayer<Position[]>(
              {...otherProps, id: `${id}-grid`},
              {
                data: getPlaceholderGridPaths(bounds),
                getPath: d => d,
                getColor: [72, 86, 88, 190],
                getWidth: 1,
                widthUnits: 'pixels',
                widthMinPixels: 1,
                widthMaxPixels: 1,
                pickable: false,
                parameters: {
                  depthTest: false
                }
              }
            )
          ];
        }
      : undefined,
    renderSubLayers: props => {
      const [[west, south], [east, north]] = props.tile.boundingBox;
      const {data, ...otherProps} = props;

      return [
        new BitmapLayer(otherProps, {
          image: data,
          _imageCoordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
          bounds: [west, south, east, north]
        }),
        showBorder &&
          new PathLayer<Position[]>({
            id: `${props.id}-border`,
            data: [
              [
                [west, north],
                [west, south],
                [east, south],
                [east, north],
                [west, north]
              ]
            ],
            getPath: d => d,
            getColor: [255, 0, 0],
            widthMinPixels: 4
          })
      ];
    }
  });

  return (
    <DeckGL
      layers={[tileLayer]}
      views={globeView ? new GlobeView() : new MapView({repeat: true})}
      initialViewState={globeView ? INITIAL_GLOBE_VIEW_STATE : INITIAL_VIEW_STATE}
      controller={true}
      getTooltip={getTooltip}
      onViewStateChange={onViewStateChange}
    >
      <ZoomRangeWidget
        zoom={zoom}
        minZoom={minZoom}
        maxZoom={maxZoom}
        visibleMinZoom={visibleMinZoom}
        visibleMaxZoom={visibleMaxZoom}
      />
      <div style={COPYRIGHT_LICENSE_STYLE}>
        {'© '}
        <a style={LINK_STYLE} href="http://www.openstreetmap.org/copyright" target="blank">
          OpenStreetMap contributors
        </a>
      </div>
    </DeckGL>
  );
}

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App globeView={true} loadDelay={750} />);
}
