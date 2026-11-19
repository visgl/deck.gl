// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useState, useCallback} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import {DeckGL} from '@deck.gl/react/legacy';
import {MapView} from '@deck.gl/core';
import {IconLayer} from '@deck.gl/layers';
import type {Table} from 'apache-arrow';
import {ParquetLoader} from '@loaders.gl/tables/parquet';
import parquetWorkerUrl from '@loaders.gl/tables/parquet/parquet-worker.js?url';
import {isArrowTable} from '@math.gl/core/arrow';

import IconClusterLayer from './icon-cluster-layer';
import type {IconClusterLayerPickingInfo} from './icon-cluster-layer';
import type {PickingInfo, MapViewState} from '@deck.gl/core';
import type {IconLayerProps} from '@deck.gl/layers';
import {Device} from '@luma.gl/core';

// Full meteorite landings table
const DATA_URL =
  'https://media.githubusercontent.com/media/visgl/deck.gl-data/479ec6c4c9788b2e80df9a1fe3e42443208523e2/examples/icon/meteorites.parquet';

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
  onDataLoad,
  iconMapping = new URL('./data/location-icon-mapping.json', import.meta.url).href,
  iconAtlas = new URL('./data/location-icon-atlas.png', import.meta.url).href,
  showCluster = true,
  mapStyle = MAP_STYLE
}: {
  device?: Device;
  showCluster?: boolean;
  data?: string | Meteorite[] | Table;
  /** Called after data loads with the total row count, before visibility or filtering. */
  onDataLoad?: (count: number) => void;
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
    // Sample row: {coordinates: [-5.86666, 30.23322], name: "Northwest Africa 724", class: "LL3", mass: 1200, year: 0}
    data,
    loaders: [ParquetLoader],
    loadOptions: {parquet: {workerUrl: parquetWorkerUrl}},
    onDataLoad: table => {
      if (isArrowTable(table)) {
        onDataLoad?.(table.numRows);
      } else if (Array.isArray(table)) {
        onDataLoad?.(table.length);
      }
    },
    pickable: true,
    getPosition: d => Array.from(d.coordinates) as [number, number],
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
        getPosition: Array.isArray(data)
          ? layerProps.getPosition
          : {sql: 'ARRAY_FLOAT64(coordinates[1], coordinates[2])'},
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

/** Mounts the standalone example. */
export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
