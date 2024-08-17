import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import DeckGL, {GeoJsonLayer, ArcLayer} from 'deck.gl';
import {
  CompassWidget,
  ZoomWidget,
  FullscreenWidget,
  DarkGlassTheme,
  LightGlassTheme
} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';
import {createPortal} from 'react-dom';

/* global window */
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
const widgetTheme = prefersDarkScheme.matches ? DarkGlassTheme : LightGlassTheme;

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
  const [widgetContainer, setWidgetContainer] = useState();

  class ReactWidget {
    constructor(props) {
      this.id = props.id || 'react';
      this.placement = props.placement || 'top-left';
      this.viewId = props.viewId;
      this.props = props;
    }

    onAdd() {
      const el = document.createElement('div');
      setWidgetContainer(el);
      return el;
    }

    onRemove() {
      setWidgetContainer(undefined);
    }

    setProps(props) {
      this.props = props;
    }
  }

  const reactWidget = new ReactWidget({});

  const onClick = () => {
    // eslint-disable-next-line
    alert('React widget!');
  };

  const widget = (
    <div className="deck-widget" style={widgetTheme}>
      <div className="deck-widget-button">
        <button className="deck-widget-icon-button" onClick={onClick}>
          <div style={{color: 'var(--button-icon-idle)'}}>i</div>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {widgetContainer && createPortal(widget, widgetContainer)}
      <DeckGL
        controller={true}
        initialViewState={INITIAL_VIEW_STATE}
        widgets={[
          new ZoomWidget({style: widgetTheme}),
          new CompassWidget({style: widgetTheme}),
          new FullscreenWidget({style: widgetTheme}),
          reactWidget
        ]}
        layers={[
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
            getFillColor: [200, 0, 80, 180]
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
        ]}
      />
    </>
  );
}

/* global document */
const container = document.body.appendChild(document.createElement('div'));
createRoot(container).render(<Root />);
