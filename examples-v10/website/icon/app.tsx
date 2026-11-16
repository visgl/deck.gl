// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useState, useCallback} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import {DeckGL} from '@deck.gl/react';
import {MapView} from '@deck.gl/core';
import {IconLayer} from '@deck.gl/layers';
import {tableFromArrays} from 'apache-arrow';
import {JSONTableLoader} from '@loaders.gl/tables/json';

import IconClusterLayer from './icon-cluster-layer';
import type {IconClusterLayerPickingInfo} from './icon-cluster-layer';
import type {LayerData, PickingInfo, MapViewState} from '@deck.gl/core';
import type {IconLayerProps} from '@deck.gl/layers';
import {Device} from '@luma.gl/core';

// Source data JSON
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

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/dark';

type Meteorite = {
  coordinates: [longitude: number, latitude: number];
  name: string;
  class: string;
  mass: number;
  year: number;
};

function renderTooltip(info: IconClusterLayerPickingInfo<Meteorite>) {
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
  device,
  data = DATA_URL,
  iconMapping = 'data/location-icon-mapping.json',
  iconAtlas = 'data/location-icon-atlas.png',
  showCluster = true,
  mapStyle = MAP_STYLE
}: {
  device?: Device;
  showCluster?: boolean;
  data?: string | Meteorite[];
  iconMapping?: string;
  iconAtlas?: string;
  mapStyle?: string;
}) {
  const [hoverInfo, setHoverInfo] = useState<IconClusterLayerPickingInfo<Meteorite> | null>(null);

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

  const layerProps: IconLayerProps<Meteorite> = {
    id: 'icon',
    // Sample row: {coordinates: [28.96, 13.66033], name: "Al Zarnkh", class: "LL5", mass: "700", year: 2001}
    data,
    pickable: true,
    getPosition: d => d.coordinates,
    iconAtlas,
    iconMapping
  };

  if (hoverInfo === null || !hoverInfo.objects) {
    layerProps.onHover = setHoverInfo;
  }

  const layer = showCluster
    ? new IconClusterLayer({...layerProps, id: 'icon-cluster', sizeScale: 40})
    : new IconLayer({
        ...layerProps,
        id: 'icon',
        loaders: [JSONTableLoader],
        dataTransform: <LayerDataT = LayerData<unknown>>(source: unknown): LayerDataT => {
          if (!Array.isArray(source)) {
            return source as LayerDataT;
          }
          return tableFromArrays({
            coordinates: source.map(meteorite => meteorite.coordinates),
            name: source.map(meteorite => meteorite.name),
            class: source.map(meteorite => meteorite.class),
            mass: source.map(meteorite => meteorite.mass),
            year: source.map(meteorite => meteorite.year)
          }) as LayerDataT;
        },
        getPosition: {sql: 'FLOAT64x2(LIST_EXTRACT(coordinates, 1), LIST_EXTRACT(coordinates, 2))'},
        getIcon: () => 'marker',
        sizeUnits: 'meters',
        sizeScale: 2000,
        sizeMinPixels: 6
      });
  return (
    <DeckGL
      device={device}
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
