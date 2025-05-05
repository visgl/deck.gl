// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck, MapView, MapViewProps, PickingInfo} from '@deck.gl/core';
import {GeoJsonLayer, ArcLayer} from '@deck.gl/layers';
import {
  CompassWidget,
  ZoomWidget,
  FullscreenWidget,
  ScreenshotWidget,
  ResetViewWidget,
  _GeolocateWidget,
  _ScaleWidget,
  _LoadingWidget,
  _ThemeWidget,
  _InfoWidget,
  _InfoWidget,
  _SplitterWidget,
  _TimelineWidget,
  _ViewSelectorWidget
} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

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

function getViewsForSplit(percentage: number) {
  const x1 = '0%';
  const width1 = `${percentage}%`;
  const x2 = width1;
  const width2 = `${100 - percentage}%`;

  return [
    new MapView({id: 'left-map', x: x1, width: width1, controller: true}),
    new MapView({id: 'right-map', x: x2, width: width2, controller: true})
  ];
}

const deck = new Deck({
  initialViewState: {
    'left-map': INITIAL_VIEW_STATE,
    'right-map': INITIAL_VIEW_STATE
  },
  // controller: true,
  views: getViewsForSplit(50),
  layers: [
    new GeoJsonLayer({
      id: 'base-map',
      data: COUNTRIES,
      // Styles
      stroked: true,
      filled: true,
      lineWidthMinPixels: 2,
      opacity: 0.4,
      getLineColor: [60, 60, 60],
      getFillColor: [200, 200, 200]
    }),
    new GeoJsonLayer({
      id: 'airports',
      data: AIR_PORTS,
      // Styles
      filled: true,
      pointRadiusMinPixels: 2,
      pointRadiusScale: 2000,
      getPointRadius: f => 11 - f.properties.scalerank,
      getFillColor: [200, 0, 80, 180],
      // Interactive props
      pickable: true,
      autoHighlight: true
    }),
    new ArcLayer({
      id: 'arcs',
      data: AIR_PORTS,
      dataTransform: d => d.features.filter(f => f.properties.scalerank < 4),
      // Styles
      getSourcePosition: f => [-0.4531566, 51.4709959], // London
      getTargetPosition: f => f.geometry.coordinates,
      getSourceColor: [0, 128, 200],
      getTargetColor: [200, 0, 80],
      getWidth: 1
    })
  ],
  widgets: [
    new ZoomWidget(),
    new CompassWidget(),
    new FullscreenWidget(),
    new ScreenshotWidget(),
    new ResetViewWidget(),
    new _LoadingWidget(),
    new _ScaleWidget({placement: 'bottom-right'}),
    new _GeolocateWidget(),
    new _ThemeWidget(),
    new _InfoWidget({mode: 'hover', getTooltip}),
    new _InfoWidget({mode: 'click', getTooltip}),
    // new _InfoWidget({mode: 'static', getTooltip})
    new _TimelineWidget({
      placement: 'bottom-left',
      domain: [0, 24],
      step: 1,
      value: 0,
      playInterval: 1000,
      // eslint-disable-next-line no-console, no-undef
      onTimeChange: time => console.log('Time:', time)
    }),
    new _ViewSelectorWidget(),
    new _SplitterWidget({
      viewId1: 'left-map',
      viewId2: 'right-map',
      orientation: 'vertical',
      onChange: ratio => deck.setProps({views: getViewsForSplit(ratio * 100)})
    })
  ]
});

function getTooltip(info: PickingInfo, widget: _InfoWidget) {
  if (!info.object || info.layer?.id !== 'airports') {
    return null;
  }

  let text: string;
  switch (widget.props.mode) {
    case 'hover':
      text = `${info.object.properties.name} (${info.object.properties.abbrev})`;
      break;
    case 'click':
    case 'static':
      text = `\
${info.object.properties.name} (${info.object.properties.abbrev})
${info.object.properties.type}
${info.object.properties.featureclass} (${info.object.properties.location})
`;
      break;
  }

  return {
    position: info.object.geometry.coordinates,
    text,
    style: {width: 200, boxShadow: 'rgba(0, 0, 0, 0.5) 2px 2px 5px'}
  };
}
