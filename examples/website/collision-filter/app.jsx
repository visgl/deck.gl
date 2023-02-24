/* eslint-disable max-statements */
import React, { useEffect, useState } from 'react';
import {createRoot} from 'react-dom/client';
import DeckGL from '@deck.gl/react';
import {OrthographicView} from '@deck.gl/core';

import { LineLayer, IconLayer, TextLayer } from '@deck.gl/layers';

import { CollisionFilterExtension } from '@deck.gl/extensions';

const ICON_MISSING = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iLTQtNCA4IDgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSByPSI0IiBmaWxsPSIjY2NjIi8+PHRleHQgeT0iLjUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgYWxpZ25tZW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiNmZmYiPj88L3RleHQ+PC9zdmc+';

const INITIAL_VIEW_STATE = {
  target: [1000, 1000, 0],
  zoom: 0
};


export default function App({
  initialViewState = INITIAL_VIEW_STATE
}) {
  const [data, setData] = useState(() => ({}))

  useEffect(() => {
    const fn = async () => {
      const resp = await fetch('https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/got-graph.json');
      const {nodes, links} = await resp.json();
      for (const link of links) {
        const source = nodes[link[0]];
        source.links = (source.links || 0) + 1;
        const target = nodes[link[1]];
        target.links = (target.links || 0) + 1;
      }

      setData({nodes, links});
    }
    fn();
  }, []);

  const {nodes = {}, links = []} = data;

  const layer = [
    new LineLayer({
      id: 'links',
      data: links,
      getSourcePosition: link => {
        const source = nodes[link[0]];
        return [source.x, source.y];
      },
      getTargetPosition: link => {
        const target = nodes[link[1]];
        return [target.x, target.y];
      },
      getColor: [100, 100, 100],
      getWidth: 1,
      widthUnits: 'common',
      widthMaxPixels: 1
    }),
    new IconLayer({
      id: 'nodes',
      data: Object.values(nodes),
      getPosition: node => [node.x, node.y],
      getIcon: node => ({
        url: node.thumbnail || ICON_MISSING,
        width: 100,
        height: 100
      }),
      getSize: getIconSize,
      getCollidePriority: node => node.links,
      collideTestProps: {
        sizeScale: 2
      },
      extensions: [new CollisionFilterExtension()]
    }),
    new TextLayer({
      id: 'labels',
      data: Object.values(nodes),
      getPosition: node => [node.x, node.y],
      getText: node => node.name,
      getSize: 12,
      getAlignmentBaseline: 'top',
      getPixelOffset: node => [0, getIconSize(node) / 2],
      background: true,
      extensions: [new CollisionFilterExtension()]
    })
  ];

  return <DeckGL initialViewState={initialViewState} controller={true} layers={[layer]} views={new OrthographicView()} />;
}

export function renderToDOM(container) {
  createRoot(container).render(<App />);
}

function getIconSize(node) {
  return Math.sqrt(node.links) * 10 + 20;
}