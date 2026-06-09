// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global fetch, DOMParser, setTimeout */
import React, {useState, useEffect} from 'react';
import {createRoot} from 'react-dom/client';

import {DeckGL} from '@deck.gl/react';
import {OrthographicView} from '@deck.gl/core';
import {TileLayer} from '@deck.gl/geo-layers';
import {BitmapLayer} from '@deck.gl/layers';
import {load} from '@loaders.gl/core';
import {clamp} from '@math.gl/core';

import type {OrthographicViewState} from '@deck.gl/core';
import type {TileLayerPickingInfo} from '@deck.gl/geo-layers';
import type {BitmapLayerPickingInfo} from '@deck.gl/layers';

const INITIAL_VIEW_STATE: OrthographicViewState = {
  target: [13000, 13000, 0],
  zoom: -7
};

const ROOT_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/image-tiles/moon.image';
const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;charset=utf-8,' +
  '%3Csvg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8"%3E' +
  '%3Crect width="8" height="8" fill="%23242a2e"/%3E' +
  '%3Cpath d="M0 8 8 0" stroke="%23404a50" stroke-width="1"/%3E%3C/svg%3E';

function getTooltip({tile, bitmap}: TileLayerPickingInfo<ImageBitmap, BitmapLayerPickingInfo>) {
  if (tile && bitmap) {
    const {x, y, z} = tile.index;
    return `\
    tile: x: ${x}, y: ${y}, z: ${z}
    (${bitmap.pixel[0]},${bitmap.pixel[1]}) in ${bitmap.size.width}x${bitmap.size.height}`;
  }
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default function App({
  autoHighlight = true,
  showPlaceholders = true,
  loadDelay = 0,
  onTilesLoad
}: {
  autoHighlight?: boolean;
  showPlaceholders?: boolean;
  loadDelay?: number;
  onTilesLoad?: () => void;
}) {
  const [dimensions, setDimensions] = useState<{width: number; height: number; tileSize: number}>();

  useEffect(() => {
    const getMetaData = async () => {
      const dziSource = `${ROOT_URL}/moon.image.dzi`;
      const response = await fetch(dziSource);
      const xmlText = await response.text();
      const dziXML = new DOMParser().parseFromString(xmlText, 'text/xml');

      if (
        Number(
          dziXML.getElementsByTagName('Image')[0].attributes.getNamedItem('Overlap')?.value
        ) !== 0
      ) {
        // eslint-disable-next-line no-undef, no-console
        console.warn('Overlap parameter is nonzero and should be 0');
      }
      setDimensions({
        height: Number(
          dziXML.getElementsByTagName('Size')[0].attributes.getNamedItem('Height')?.value
        ),
        width: Number(
          dziXML.getElementsByTagName('Size')[0].attributes.getNamedItem('Width')?.value
        ),
        tileSize: Number(
          dziXML.getElementsByTagName('Image')[0].attributes.getNamedItem('TileSize')?.value
        )
      });
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getMetaData();
  }, []);

  const tileLayer =
    dimensions &&
    new TileLayer<ImageBitmap>({
      pickable: autoHighlight,
      tileSize: dimensions.tileSize,
      autoHighlight,
      highlightColor: [60, 60, 60, 100],
      minZoom: -7,
      maxZoom: 0,
      extent: [0, 0, dimensions.width, dimensions.height],
      getTileData: async ({index}) => {
        const {x, y, z} = index;
        if (loadDelay > 0) {
          await sleep(loadDelay);
        }
        return load(
          `${ROOT_URL}/moon.image_files/${15 + z}/${x}_${y}.jpeg`
        ) as Promise<ImageBitmap>;
      },
      onViewportLoad: onTilesLoad,

      renderPlaceholder: showPlaceholders
        ? props => {
            const {width, height} = dimensions;
            const {bounds} = props;
            const otherProps = {...props} as Partial<typeof props>;
            delete otherProps.data;
            delete otherProps.bounds;
            return new BitmapLayer(otherProps, {
              image: PLACEHOLDER_IMAGE,
              bounds: [
                clamp(bounds[0], 0, width),
                clamp(bounds[1], 0, height),
                clamp(bounds[2], 0, width),
                clamp(bounds[3], 0, height)
              ],
              pickable: false,
              opacity: 0.5
            });
          }
        : undefined,
      renderSubLayers: props => {
        const [[left, bottom], [right, top]] = props.tile.boundingBox;
        const {width, height} = dimensions;
        const {data, ...otherProps} = props;
        return new BitmapLayer(otherProps, {
          image: data,
          bounds: [
            clamp(left, 0, width),
            clamp(top, 0, height),
            clamp(right, 0, width),
            clamp(bottom, 0, height)
          ]
        });
      }
    });

  return (
    <DeckGL
      views={[new OrthographicView({id: 'ortho'})]}
      layers={[tileLayer]}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      getTooltip={getTooltip}
    />
  );
}

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
