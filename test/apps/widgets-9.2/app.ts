// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck, PickingInfo} from '@deck.gl/core';
import {DataFilterExtension} from '@deck.gl/extensions';
import {GeoJsonLayer, ArcLayer} from '@deck.gl/layers';
import {_WMSLayer as WMSLayer} from '@deck.gl/geo-layers';
import {
  CompassWidget,
  ZoomWidget,
  FullscreenWidget,
  ScreenshotWidget,
  ResetViewWidget,
  PopupWidget,
  _GeocoderWidget,
  _ScaleWidget,
  _LoadingWidget,
  _ThemeWidget,
  _FpsWidget,
  _InfoWidget,
  _ContextMenuWidget,
  _TimelineWidget,
  _ViewSelectorWidget,
  _StatsWidget
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

function getLayers(filterRange = [2, 9]) {
  return [
    new WMSLayer({
      data: 'https://ows.terrestris.de/osm/service',
      serviceType: 'wms',
      layers: ['OSM-WMS']
    }),
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
      autoHighlight: true,

      getFilterValue: f => f.properties.scalerank,
      filterRange,
      extensions: [new DataFilterExtension({filterSize: 1})]
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
  ];
}

const deck = new Deck({
  parent: document.getElementById('app'),
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  layers: getLayers(),
  widgets: [
    new _GeocoderWidget({
      geocoder: 'coordinates',
      _geolocation: true
    }),
    new ZoomWidget(),
    new CompassWidget(),
    new FullscreenWidget(),
    new ScreenshotWidget(),
    new ResetViewWidget(),
    new _FpsWidget(),
    new _LoadingWidget(),
    new _ScaleWidget({placement: 'bottom-right'}),
    new _ThemeWidget(),
    new _ContextMenuWidget({
      getMenuItems: (info: PickingInfo) => {
        const name = info.layer?.id === 'airports' && info.object?.properties.name;
        console.log('Context menu:', name);
        return (
          name && [
            {key: 'airport', label: `${name}`},
            {key: 'open', label: 'Open in new tab'},
            {key: 'favorite', label: 'Set as favorite'},
            {key: 'filter', label: 'Exclude from filter'}
          ]
        );
      }
    }),
    new _InfoWidget({mode: 'hover', getTooltip, arrow: 10, offset: 10}),
    new PopupWidget({
      position: [-5, 52],
      marker: {
        element: createPin()
      },
      placement: 'top',
      offset: 20,
      content: `I'm here!`,
      closeOnClickOutside: true
    }),
    new _TimelineWidget({
      placement: 'bottom-left',
      timeRange: [2, 9],
      step: 1,
      initialTime: 0,
      playInterval: 1000,
      // eslint-disable-next-line no-console, no-undef
      onTimeChange: time =>
        deck.setProps({
          layers: getLayers([2, time])
        })
    }),
    new _ViewSelectorWidget(),
    new _StatsWidget({type: 'deck'})
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
    style: {minWidth: '200px'}
  };
}

function createPin() {
  const div = document.createElement('div');
  Object.assign(div.style, {
    width: '32px',
    height: '32px',
    transform: 'translate(-50%,-24px)'
  });
  div.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 -960 960 960" fill="black"><path d="M360-440h80v-110h80v110h80v-190l-120-80-120 80v190Zm120 254q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z"/></svg>';
  return div;
}
