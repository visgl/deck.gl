// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable no-unused-vars */
import React, {useState, useEffect, useCallback, useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {DeckGL} from '@deck.gl/react';
import {OrbitView, LinearInterpolator} from '@deck.gl/core';
import {sqlParser} from '@deck.gl/core/sql';
import {PointCloudLayer} from '@deck.gl/layers';

import type {Table} from 'apache-arrow';
import {LASLoader} from '@loaders.gl/pointclouds/las';
import type {OrbitViewState, Widget} from '@deck.gl/core';
import {Device} from '@luma.gl/core';

// Data source: kaarta.com
const LAZ_SAMPLE =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/point-cloud-laz/indoor.0.1.laz';

const INITIAL_VIEW_STATE: OrbitViewState = {
  target: [0, 0, 0],
  rotationX: 0,
  rotationOrbit: 0,
  minZoom: 0,
  maxZoom: 10,
  zoom: 3.5
};

const transitionInterpolator = new LinearInterpolator(['rotationOrbit']);

export default function App({
  onLoad,
  device,
  widgets
}: {
  onLoad?: (data: {count: number; progress: number}) => void;
  device?: Device;
  widgets?: Widget[];
}) {
  const [viewState, updateViewState] = useState<OrbitViewState>(INITIAL_VIEW_STATE);
  const [boundingBox, setBoundingBox] = useState<[number[], number[]] | null>(null);

  /** Tracks whether the first available bounds have framed the camera. */
  const framed = useRef(false);

  useEffect(() => {
    if (!boundingBox) {
      return;
    }
    const rotateCamera = () => {
      updateViewState(v => ({
        ...v,
        rotationOrbit: v.rotationOrbit! + 120,
        transitionDuration: 2400,
        transitionInterpolator,
        onTransitionEnd: rotateCamera
      }));
    };
    rotateCamera();
  }, [boundingBox]);

  /** Frames the camera once and reports the accumulated points after each batch. */
  const onDataProgress = useCallback(
    (data: unknown) => {
      const table = data as Table;
      const min = table.schema.metadata.get('las_mins');
      const max = table.schema.metadata.get('las_maxs');
      if (!framed.current && min && max) {
        const bounds: [number[], number[]] = [JSON.parse(min), JSON.parse(max)];
        const [minimum, maximum] = bounds;
        framed.current = true;
        updateViewState({
          ...INITIAL_VIEW_STATE,
          target: [
            (minimum[0] + maximum[0]) / 2,
            (minimum[1] + maximum[1]) / 2,
            (minimum[2] + maximum[2]) / 2
          ]
        });
        setBoundingBox(bounds);
      }
      const count = table.numRows;
      const total = Number(table.schema.metadata.get('las_pointsCount')) || count;
      onLoad?.({count, progress: count / total});
    },
    [onLoad]
  );

  const layers = [
    new PointCloudLayer({
      id: 'laz-point-cloud-layer',
      data: LAZ_SAMPLE,
      _dataLoadOptions: 'batched',
      loadOptions: {
        core: {worker: false, batchSize: 25000, batchDebounceMs: 180},
        las: {shape: 'arrow-table', fp64: true, columns: ['POSITION']}
      },
      // First LAZ row: {POSITION: [-0.25, 4.5, -5.76]}
      getPosition: {sql: 'POSITION'},
      onDataProgress,
      getNormal: [0, 1, 0],
      getColor: [255, 255, 255],
      opacity: 0.5,
      pointSize: 0.5,
      // Additional format support can be added here
      loaders: [LASLoader],
      // TODO (kaapp) currently webgpu requirement to ensure instanceColors are supplied
      pickable: true
    })
  ];

  return (
    <DeckGL
      device={device}
      sqlParser={sqlParser}
      views={new OrbitView({orbitAxis: 'Y', fovy: 50})}
      initialViewState={viewState}
      controller={{
        maxBounds: boundingBox
      }}
      layers={layers}
      widgets={widgets}
    />
  );
}

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
