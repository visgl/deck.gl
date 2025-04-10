// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {DeckGL} from '@deck.gl/react';
import {_WMSLayer as WMSLayer} from '@deck.gl/geo-layers';

import type {MapViewState} from '@deck.gl/core';
import type {BitmapLayerPickingInfo} from '@deck.gl/layers';
import type {ImageSourceMetadata} from '@loaders.gl/loader-utils';

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -122.4,
  latitude: 37.74,
  zoom: 9,
  pitch: 0,
  bearing: 0
};

const CONTROLLER = {
  dragRotate: false,
  touchRotate: false,
  maxPitch: 85,
  minZoom: 1,
  maxZoom: 20
};

const SAMPLE_SERVICE = {
  serviceUrl: 'https://ows.terrestris.de/osm/service',
  layers: ['OSM-WMS']
};

// const SAMPLE_SERVICE = {
//   serviceUrl: 'https://geo.weather.gc.ca/geomet',
//   layers: ['GDPS.ETA_TT'],
// };

export default function App({
  serviceUrl = SAMPLE_SERVICE.serviceUrl,
  layers = SAMPLE_SERVICE.layers,
  initialViewState = INITIAL_VIEW_STATE,
  onMetadataLoad = console.log, // eslint-disable-line
  onMetadataLoadError = console.error // eslint-disable-line
}: {
  serviceUrl?: string;
  layers?: string[];
  initialViewState?: MapViewState;
  onMetadataLoad?: (metadata: ImageSourceMetadata) => void;
  onMetadataLoadError?: (error: Error) => void;
}) {
  const [selection, setSelection] = useState<{
    x: number;
    y: number;
    featureInfo: string;
  } | null>(null);

  const layer = new WMSLayer({
    data: serviceUrl,
    serviceType: 'wms',
    layers,
    pickable: true,

    onMetadataLoad,
    onMetadataLoadError,

    onClick: ({bitmap}: BitmapLayerPickingInfo) => {
      if (bitmap) {
        const x = bitmap.pixel[0];
        const y = bitmap.pixel[1];
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        layer.getFeatureInfoText(x, y).then(featureInfo => {
          setSelection({x, y, featureInfo});
        });
      }
    }
  });

  return (
    <>
      <DeckGL layers={[layer]} initialViewState={initialViewState} controller={CONTROLLER} />
      {selection && (
        <div
          className="selected-feature-info"
          style={{left: selection.x, top: selection.y}}
          onPointerLeave={() => setSelection(null)}
        >
          {selection.featureInfo}
        </div>
      )}
    </>
  );
}

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
