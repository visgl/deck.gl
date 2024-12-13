// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {createRoot} from 'react-dom/client';
import DeckGL, {GeoJsonLayer, ArcLayer} from 'deck.gl';
import {FullscreenWidget} from '@deck.gl/widgets';
import {CompassWidget, ZoomWidget, useWidget} from '@deck.gl/react';
import '@deck.gl/widgets/stylesheet.css';
import {FlyToInterpolator} from '@deck.gl/core';

class CustomWidget {
  // id = 'custom';
  // placement = 'top-right';
  // props = {
  //   ref: React.RefObject<HTMLDivElement>;
  // };
  // viewports = {};

  constructor(props) {
    this.id = props.id || 'custom';
    this.placement = props.placement || 'top-right';
    this.props = props;
  }

  onAdd({deck}) {
    this.deck = deck;
    return this.props.ref.current;
  }
  onRemove() {}
  setProps(props) {
    Object.assign(this.props, props);
  }

  onViewportChange(viewport) {
    // debugger;
    this.viewports[viewport.id] = viewport;
  }

  handleZoom(viewport, nextZoom) {
    const viewId = viewport?.id || 'default-view';
    const nextViewState = {
      ...viewport,
      zoom: nextZoom,
      transitionDuration: this.props.transitionDuration,
      transitionInterpolator: new FlyToInterpolator()
    };
    // @ts-ignore Using private method temporary until there's a public one
    this.deck._onViewStateChange({viewId, viewState: nextViewState, interactionState: {}});
  }

  handleZoomIn() {
    for (const viewport of Object.values(this.viewports)) {
      this.handleZoom(viewport, viewport.zoom + 1);
    }
  }

  handleZoomOut() {
    this.props.onClick();
    for (const viewport of Object.values(this.viewports)) {
      this.handleZoom(viewport, viewport.zoom - 1);
    }
  }
}

export const CustomReactWidget = props => {
  const ref = React.useRef();
  const widget = useWidget(CustomWidget, {ref, ...props});
  return (
    <div style={{padding: 24, backgroundColor: 'green'}} ref={ref}>
      React Widget!
      <button
        style={{pointerEvents: 'auto', cursor: 'pointer'}}
        onClick={() => widget.handleZoomOut()}
      >
        Zoom Out!
      </button>
    </div>
  );
};

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const COUNTRIES =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson'; //eslint-disable-line
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

const INITIAL_VIEW_STATE = {
  latitude: 51.47,
  longitude: 0.45,
  zoom: 4,
  bearing: 0,
  pitch: 30
};

function Root() {
  const [zoomToggle, setZoomToggle] = React.useState(true);
  const onClick = info => {
    if (info.object) {
      // eslint-disable-next-line
      alert(`${info.object.properties.name} (${info.object.properties.abbrev})`);
    }
  };

  return (
    <DeckGL
      controller={true}
      initialViewState={INITIAL_VIEW_STATE}
      widgets={[new FullscreenWidget({})]}
    >
      <CompassWidget />
      <CustomReactWidget onClick={() => setZoomToggle(!zoomToggle)} />
      {zoomToggle && <ZoomWidget orientation="horizontal" />}
      <GeoJsonLayer
        id="base-map"
        data={COUNTRIES}
        stroked={true}
        filled={true}
        lineWidthMinPixels={2}
        opacity={0.4}
        getLineColor={[60, 60, 60]}
        getFillColor={[200, 200, 200]}
      />
      <GeoJsonLayer
        id="airports"
        data={AIR_PORTS}
        filled={true}
        pointRadiusMinPixels={2}
        pointRadiusScale={2000}
        getPointRadius={f => 11 - f.properties.scalerank}
        getFillColor={[200, 0, 80, 180]}
        pickable={true}
        autoHighlight={true}
        onClick={onClick}
      />
      <ArcLayer
        id="arcs"
        data={AIR_PORTS}
        dataTransform={d => d.features.filter(f => f.properties.scalerank < 4)}
        getSourcePosition={f => [-0.4531566, 51.4709959]}
        getTargetPosition={f => f.geometry.coordinates}
        getSourceColor={[0, 128, 200]}
        getTargetColor={[200, 0, 80]}
        getWidth={1}
      />
    </DeckGL>
  );
}

/* global document */
const container = document.body.appendChild(document.createElement('div'));
createRoot(container).render(<Root />);
