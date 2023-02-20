import React, {useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import DeckGL from '@deck.gl/react';
import {_ImageryLayer as ImageryLayer} from '@deck.gl/geo-layers';

export const INITIAL_VIEW_STATE = {
  longitude: -122.4,
  latitude: 37.74,
  zoom: 9,
  minZoom: 1,
  maxZoom: 20,
  pitch: 0,
  bearing: 0
};

const SAMPLE_SERVICE = {
  serviceUrl: `https://ows.terrestris.de/osm/service`,
  serviceType: 'wms',
  layers: ['OSM-WMS']
};

export default function App({
  serviceUrl = SAMPLE_SERVICE.serviceUrl,
  serviceType = SAMPLE_SERVICE.serviceType,
  layers = SAMPLE_SERVICE.layers,
  mapStyle,
  initialViewState = INITIAL_VIEW_STATE,
  onMetadataLoad = console.log
}) {
  const infoBox = useRef();

  const layer = new ImageryLayer({
    data: serviceUrl,
    serviceType,
    layers,
    pickable: true,

    onMetadataLoadComplete: onMetadataLoad,

    onClick: async ({bitmap, layer}) => {
      if (bitmap && infoBox.current) {
        const x = bitmap.pixel[0];
        const y = bitmap.pixel[1];
        const featureInfo = await layer.getFeatureInfoText(x, y);
        infoBox.current.innerText = featureInfo;
      }
    }
  });

  return (
    <>
      <DeckGL
        layers={[layer]}
        initialViewState={initialViewState}
        controller={{maxPitch: 85}}
      >
        {mapStyle && <Map reuseMaps mapLib={maplibregl} mapStyle={mapStyle} />}
      </DeckGL>
      <div className="selected-feature-info" ref={infoBox} />
    </>
  );
}

export function renderToDOM(container) {
  createRoot(container).render(<App />);
}
