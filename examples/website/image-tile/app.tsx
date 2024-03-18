/* global fetch, DOMParser */
import React, {useState, useEffect} from 'react';
import {createRoot} from 'react-dom/client';

import DeckGL from '@deck.gl/react';
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

function getTooltip({tile, bitmap}: TileLayerPickingInfo<ImageBitmap, BitmapLayerPickingInfo>) {
  if (tile && bitmap) {
    const {x, y, z} = tile.index;
    return `\
    tile: x: ${x}, y: ${y}, z: ${z}
    (${bitmap.pixel[0]},${bitmap.pixel[1]}) in ${bitmap.size.width}x${bitmap.size.height}`;
  }
  return null;
}

export default function App({autoHighlight = true, onTilesLoad}: {
  autoHighlight?: boolean;
  onTilesLoad?: () => void;
}) {
  const [dimensions, setDimensions] = useState<{width: number; height: number; tileSize: number;}>();

  useEffect(() => {
    const getMetaData = async () => {
      const dziSource = `${ROOT_URL}/moon.image.dzi`;
      const response = await fetch(dziSource);
      const xmlText = await response.text();
      const dziXML = new DOMParser().parseFromString(xmlText, 'text/xml');

      if (Number(dziXML.getElementsByTagName('Image')[0].attributes.getNamedItem('Overlap')?.value) !== 0) {
        // eslint-disable-next-line no-undef, no-console
        console.warn('Overlap parameter is nonzero and should be 0');
      }
      setDimensions({
        height: Number(dziXML.getElementsByTagName('Size')[0].attributes.getNamedItem('Height')?.value),
        width: Number(dziXML.getElementsByTagName('Size')[0].attributes.getNamedItem('Width')?.value),
        tileSize: Number(dziXML.getElementsByTagName('Image')[0].attributes.getNamedItem('TileSize')?.value)
      });
    };
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
      getTileData: ({index}) => {
        const {x, y, z} = index;
        return load(`${ROOT_URL}/moon.image_files/${15 + z}/${x}_${y}.jpeg`) as Promise<ImageBitmap>;
      },
      onViewportLoad: onTilesLoad,

      renderSubLayers: props => {
        const [[left, bottom], [right, top]] = props.tile.boundingBox;
        const {width, height} = dimensions;
        const {data, ...otherProps} = props;
        return new BitmapLayer(otherProps, {
          image: props.data,
          bounds: [
            clamp(left, 0, width),
            clamp(bottom, 0, height),
            clamp(right, 0, width),
            clamp(top, 0, height)
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
