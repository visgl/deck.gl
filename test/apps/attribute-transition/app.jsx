/* global document console */
/* eslint-disable no-console */
import React, {useMemo, useState, useCallback} from 'react';
import {createRoot} from 'react-dom/client';
import DeckGL, {OrthographicView, ScatterplotLayer, PolygonLayer} from 'deck.gl';

import DataGenerator from './data-generator';

const initialViewState = {
  target: [0, 0, 0],
  zoom: 0
};

const interpolationSettings = {
  duration: 600
  // onStart: () => console.log('onStart'),
  // onEnd: () => console.log('onEnd'),
  // onInterrupt: () => console.log('onInterrupt')
};

const springSettings = {
  type: 'spring',
  stiffness: 0.01,
  damping: 0.15
  // onStart: () => console.log('onStart'),
  // onEnd: () => console.log('onEnd'),
  // onInterrupt: () => console.log('onInterrupt')
};

const scatterplotTransitionsByType = {
  interpolation: {
    getPosition: {...interpolationSettings, enter: () => [0, 0]},
    getRadius: {...interpolationSettings, enter: () => [0]},
    getFillColor: {...interpolationSettings, enter: ([r, g, b]) => [r, g, b, 0]}
  },
  spring: {
    getPosition: {...springSettings, enter: () => [0, 0]},
    getRadius: {...springSettings, enter: () => [0]},
    getFillColor: {...springSettings, enter: ([r, g, b]) => [r, g, b, 0]}
  }
};

const polygonTransitionsByType = {
  interpolation: {
    getPolygon: 600,
    getLineColor: {...interpolationSettings, enter: ([r, g, b]) => [r, g, b, 0]},
    getFillColor: {...interpolationSettings, enter: ([r, g, b]) => [r, g, b, 0]},
    getLineWidth: 600
  },
  spring: {
    getPolygon: springSettings,
    getLineColor: {...springSettings, enter: ([r, g, b]) => [r, g, b, 0]},
    getFillColor: {...springSettings, enter: ([r, g, b]) => [r, g, b, 0]},
    getLineWidth: springSettings
  }
};

function Root() {
  const dataGenerator = useMemo(() => new DataGenerator());
  const [points, setPoints] = useState(dataGenerator.points);
  const [polygons, setPolygons] = useState(dataGenerator.polygons);
  const [transitionType, setTransitionType] = useState('interpolation');

  const randomize = useCallback(() => {
    dataGenerator.randomize();
    setPoints(dataGenerator.points);
    setPolygons(dataGenerator.polygons);
  }, [dataGenerator]);

  const onChangeTransitionType = useCallback(({currentTarget}) => {
    setTransitionType(currentTarget.value);
  });

  const layers = [
    new ScatterplotLayer({
      data: points,
      getPosition: d => d.position,
      getFillColor: d => d.color,
      getRadius: d => d.radius,
      transitions: scatterplotTransitionsByType[transitionType]
    }),
    new PolygonLayer({
      data: polygons,
      stroked: true,
      filled: true,
      getPolygon: d => d.polygon,
      getLineColor: d => d.color,
      getFillColor: d => [d.color[0], d.color[1], d.color[2], 128],
      getLineWidth: d => d.width,
      transitions: polygonTransitionsByType[transitionType]
    })
  ];

  return (
    <div>
      <DeckGL
        views={new OrthographicView()}
        controller={true}
        initialViewState={initialViewState}
        layers={layers}
      />
      <div id="control-panel">
        <button onClick={randomize}>Randomize</button>
        <select value={transitionType} onChange={onChangeTransitionType}>
          <option value="interpolation">Interpolation Transition</option>
          <option value="spring">Spring Transition</option>
        </select>
      </div>
    </div>
  );
}

const container = document.body.appendChild(document.createElement('div'));
createRoot(container).render(<Root />);
