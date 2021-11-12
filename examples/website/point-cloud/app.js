/* eslint-disable no-unused-vars */
import React, {useState, useEffect} from 'react';
import {render} from 'react-dom';
import DeckGL from '@deck.gl/react';
import {COORDINATE_SYSTEM, OrbitView, LinearInterpolator} from '@deck.gl/core';
import {PointCloudLayer} from '@deck.gl/layers';

import {LASWorkerLoader} from '@loaders.gl/las';

// Data source: kaarta.com
const LAZ_SAMPLE =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/point-cloud-laz/indoor.0.1.laz';

const INITIAL_VIEW_STATE = {
  target: [0, 0, 0],
  rotationX: 0,
  rotationOrbit: 0,
  minZoom: 0,
  maxZoom: 10,
  zoom: 1
};

const transitionInterpolator = new LinearInterpolator(['rotationOrbit']);

export default function App({onLoad}) {
  const [viewState, updateViewState] = useState(INITIAL_VIEW_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(
    () => {
      if (!isLoaded) {
        return;
      }
      const rotateCamera = () => {
        updateViewState(v => ({
          ...v,
          rotationOrbit: v.rotationOrbit + 120,
          transitionDuration: 2400,
          transitionInterpolator,
          onTransitionEnd: rotateCamera
        }));
      };
      rotateCamera();
    },
    [isLoaded]
  );

  const onDataLoad = ({header}) => {
    if (header.boundingBox) {
      const [mins, maxs] = header.boundingBox;
      // File contains bounding box info
      updateViewState({
        ...INITIAL_VIEW_STATE,
        target: [(mins[0] + maxs[0]) / 2, (mins[1] + maxs[1]) / 2, (mins[2] + maxs[2]) / 2],
        /* global window */
        zoom: Math.log2(window.innerWidth / (maxs[0] - mins[0])) - 1
      });
      setIsLoaded(true);
    }

    if (onLoad) {
      onLoad({count: header.vertexCount, progress: 1});
    }
  };

  const layers = [
    new PointCloudLayer({
      id: 'laz-point-cloud-layer',
      data: LAZ_SAMPLE,
      onDataLoad,
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      getNormal: [0, 1, 0],
      getColor: [255, 255, 255],
      opacity: 0.5,
      pointSize: 0.5,
      // Additional format support can be added here
      loaders: [LASWorkerLoader]
    })
  ];

  return (
    <DeckGL
      views={new OrbitView({orbitAxis: 'Y', fov: 50})}
      viewState={viewState}
      controller={true}
      onViewStateChange={v => updateViewState(v.viewState)}
      layers={layers}
      parameters={{
        clearColor: [0.93, 0.86, 0.81, 1]
      }}
    />
  );
}

export function renderToDOM(container) {
  render(<App />, container);
}
