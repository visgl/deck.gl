import React, {useState, useCallback} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl//maplibre';
import DeckGL from '@deck.gl/react';
import {MapView} from '@deck.gl/core';
import {IconLayer} from '@deck.gl/layers';

import IconClusterLayer from './icon-cluster-layer';
import type {IconClusterLayerPickingInfo} from './icon-cluster-layer';
import type {PickingInfo, MapViewState} from '@deck.gl/core';
import type { IconLayerProps } from '@deck.gl/layers';

// Source data CSV
const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/icon/meteorites.json'; // eslint-disable-line

const MAP_VIEW = new MapView({repeat: true});
const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -35,
  latitude: 36.7,
  zoom: 1.8,
  maxZoom: 20,
  pitch: 0,
  bearing: 0
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

type Meterite = {
  coordinates: [longitude: number, latitude: number];
  name: string;
  class: string;
  mass: number;
  year: number;
};

function renderTooltip(info: IconClusterLayerPickingInfo<Meterite>) {
  const {object, objects, x, y} = info;

  if (objects) {
    return (
      <div className="tooltip interactive" style={{left: x, top: y}}>
        {objects.map(({name, year, mass, class: meteorClass}) => {
          return (
            <div key={name}>
              <h5>{name}</h5>
              <div>Year: {year || 'unknown'}</div>
              <div>Class: {meteorClass}</div>
              <div>Mass: {mass}g</div>
            </div>
          );
        })}
      </div>
    );
  }

  if (!object) {
    return null;
  }

  return 'cluster' in object && object.cluster ? (
    <div className="tooltip" style={{left: x, top: y}}>
      {object.point_count} records
    </div>
  ) : (
    <div className="tooltip" style={{left: x, top: y}}>
      {object.name} {object.year ? `(${object.year})` : ''}
    </div>
  );
}

/* eslint-disable react/no-deprecated */
export default function App({
  data = DATA_URL,
  iconMapping = 'data/location-icon-mapping.json',
  iconAtlas = 'data/location-icon-atlas.png',
  showCluster = true,
  mapStyle = MAP_STYLE
}) {
  const [hoverInfo, setHoverInfo] = useState<IconClusterLayerPickingInfo<Meterite> | null>(null);

  const hideTooltip = useCallback(() => {
    setHoverInfo(null);
  }, []);
  const expandTooltip = useCallback((info: PickingInfo) => {
    if (info.picked && showCluster) {
      setHoverInfo(info);
    } else {
      setHoverInfo(null);
    }
  }, []);

  const layerProps: IconLayerProps<Meterite> = {
    id: 'icon',
    data,
    pickable: true,
    getPosition: d => d.coordinates,
    iconAtlas,
    iconMapping,
  };

  if (hoverInfo === null || !hoverInfo.objects) {
    layerProps.onHover = setHoverInfo;
  }

  const layer = showCluster
    ? new IconClusterLayer({...layerProps, id: 'icon-cluster', sizeScale: 40})
    : new IconLayer({
        ...layerProps,
        id: 'icon',
        getIcon: d => 'marker',
        sizeUnits: 'meters',
        sizeScale: 2000,
        sizeMinPixels: 6
      });
  return (
    <DeckGL
      layers={[layer]}
      views={MAP_VIEW}
      initialViewState={INITIAL_VIEW_STATE}
      controller={{dragRotate: false}}
      onViewStateChange={hideTooltip}
      onClick={expandTooltip}
    >
      <Map reuseMaps mapStyle={mapStyle} />

      {hoverInfo && renderTooltip(hoverInfo)}
    </DeckGL>
  );
}

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
