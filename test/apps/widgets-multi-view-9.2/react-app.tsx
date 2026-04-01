// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useState, useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {View} from '@deck.gl/core';
import {DeckGL} from '@deck.gl/react';
import {LightTheme, DarkTheme, _SplitterWidget as SplitterWidget} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

import {INITIAL_VIEW_STATE, LAYERS, VIEW_LAYOUT} from './app';

function App() {
  const [, setVersion] = useState(0);
  const [views, setViews] = useState<View[]>([]);

  // This is used to force a rerender of the DeckGL component
  // to test for conflicting setters of the views prop
  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setVersion(v => v + 1);
  //   }, 1000);

  //   return () => clearInterval(timer);
  // }, [])

  return (
    <DeckGL
      views={views}
      initialViewState={INITIAL_VIEW_STATE}
      layers={LAYERS}
      widgets={[
        new SplitterWidget({
          viewLayout: VIEW_LAYOUT,
          onChange: setViews
        })
      ]}
    />
  );
}

createRoot(document.body.appendChild(document.createElement('div'))).render(<App />);
