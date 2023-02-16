/* global fetch */
import React, {useCallback, useState, useMemo} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import {COORDINATE_SYSTEM, OPERATION} from '@deck.gl/core';
import {GeoJsonLayer, ScatterplotLayer, SolidPolygonLayer, TextLayer} from '@deck.gl/layers';
import {CollisionFilterExtension, MaskExtension} from '@deck.gl/extensions';
import {parse} from '@loaders.gl/core';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-nolabels-gl-style/style.json';
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';
const PLACES =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_populated_places_simple.geojson';

const ANCHORS = {start: 'start', middle: 'middle', end: 'end'};
const BASELINES = {top: 'top', center: 'center', bottom: 'bottom'};
const [LEFT, TOP, RIGHT, BOTTOM] = [0, 1, 2, 3];

// Enhance the TextLayer to add anchor points and to optimize rendering
// by limiting when layers are drawn
class EnhancedTextLayer extends TextLayer {
  filterSubLayer({layer, renderPass}) {
    const background = layer.id.includes('background');
    if (renderPass === 'collision') {
      return background; // Only draw background layer in collision pass
    } else {
      return !background || this.props.getBorderWidth; // Do not draw background layer in other passes
    }
  }

  renderLayers() {
    const PointLayerClass = this.getSubLayerClass('point', ScatterplotLayer);
    const {data, getFillColor, getLineColor, getPosition, stroked, transitions} = this.props;

    // Create one layer for small points that display all the time and another
    // (highlight) for larger points that only show with label
    return [
      this.props.anchor &&
        [false, true].map(
          highlight =>
            new PointLayerClass(
              {
                data,
                stroked,
                getFillColor,
                getLineColor,
                getPosition,

                getRadius: highlight ? 5 : 2,
                radiusUnits: 'pixels',
                lineWidthMinPixels: 1,
                billboard: true,
                transitions: transitions && {
                  getFillColor: transitions.getFillColor,
                  getLineColor: transitions.getLineColor,
                  getPosition: transitions.getPosition
                }
              },
              this.getSubLayerProps({
                id: highlight ? 'highlight-point' : 'point'
              }),
              !highlight ? {collisionEnabled: false} : {}
            )
        ),
      ...super.renderLayers()
    ];
  }
}

/* eslint-disable react/no-deprecated */
export default function App() {
  const [collisionEnabled, setCollisionEnabled] = useState(true);
  const [borderEnabled, setBorderEnabled] = useState(false);
  const [showAnchor, setShowAnchor] = useState(true);
  const [anchor, setAnchor] = useState('start');
  const [baseline, setBaseline] = useState('center');

  const viewState = {longitude: -122, latitude: 37, zoom: 7};

  const fontSize = 16;
  const data = PLACES;
  const getPosition = f => f.geometry.coordinates;
  const getText = f => f.properties.name;
  const dataTransform = d => d.features;

  // Use heuristic to estimate typical size of text label
  const paddingX = 1.5 * fontSize;
  const paddingY = 8 * fontSize;
  const backgroundPadding = [0, 0, 0, 0];
  if (baseline === 'top') {
    backgroundPadding[TOP] = paddingX;
  } else if (baseline === 'bottom') {
    backgroundPadding[BOTTOM] = paddingX;
  } else {
    backgroundPadding[TOP] = 0.5 * paddingX;
    backgroundPadding[BOTTOM] = 0.5 * paddingX;
  }
  if (anchor === 'start') {
    backgroundPadding[LEFT] = paddingY;
  } else if (anchor === 'end') {
    backgroundPadding[RIGHT] = paddingY;
  } else {
    backgroundPadding[LEFT] = 0.5 * paddingY;
    backgroundPadding[RIGHT] = 0.5 * paddingY;
  }

  const pointProps = {
    data,
    dataTransform,
    getPosition,
    radiusUnits: 'pixels',
    stroked: true,
    lineWidthMinPixels: 1,
    billboard: true,
    getFillColor: [0, 0, 255],
    getLineColor: [255, 255, 255]
  };

  const layers = [
    new EnhancedTextLayer({
      id: 'labels',
      data,
      dataTransform,

      anchor: showAnchor,

      getFillColor: [0, 0, 255],
      getLineColor: [255, 255, 255],
      stroked: true,

      getColor: [44, 48, 50],
      getSize: fontSize,
      getPosition,
      getText,

      // FONT
      // fontFamily: 'Inter, sans',
      fontSettings: {sdf: true},
      outlineColor: [255, 255, 255],
      outlineWidth: 4,

      getTextAnchor: anchor,
      getAlignmentBaseline: baseline,
      getPixelOffset: [0, 0],

      getBorderColor: [255, 0, 0, 80],
      getBorderWidth: borderEnabled ? 1 : 0,
      getBackgroundColor: [0, 255, 0, 0],
      background: true,
      backgroundPadding,

      parameters: {depthTest: false},
      extensions: [new CollisionFilterExtension()],
      collisionEnabled,
      collisionGroup: 'labels',

      updateTriggers: {
        getAlignmentBaseline: [baseline]
      }
    })
  ];

  return (
    <>
      <DeckGL layers={layers} initialViewState={viewState} controller={true}>
        <StaticMap reuseMaps mapStyle={MAP_STYLE} preventStyleDiffing={true} />
      </DeckGL>
      <div style={{left: 200, position: 'absolute', background: 'white', padding: 10}}>
        <label>
          <input
            type="checkbox"
            checked={collisionEnabled}
            onChange={() => setCollisionEnabled(!collisionEnabled)}
          />
          Collisions
        </label>
        <label>
          <input
            type="checkbox"
            checked={borderEnabled}
            onChange={() => setBorderEnabled(!borderEnabled)}
          />
          Border
        </label>
        <label>
          <input type="checkbox" checked={showAnchor} onChange={() => setShowAnchor(!showAnchor)} />
          Show anchor
        </label>
        <ObjectSelect title="Anchor" obj={ANCHORS} value={anchor} onSelect={setAnchor} />
        <ObjectSelect title="Baseline" obj={BASELINES} value={baseline} onSelect={setBaseline} />
      </div>
    </>
  );
}

function ObjectSelect({title, obj, value, onSelect}) {
  const keys = Object.values(obj).sort();
  return (
    <>
      <select
        onChange={e => onSelect(e.target.value)}
        style={{position: 'relative', padding: 4, margin: 2, width: 130}}
        value={value}
      >
        <option hidden>{title}</option>
        {keys.map(f => (
          <option key={f} value={f}>
            {`${title}: ${f}`}
          </option>
        ))}
      </select>
    </>
  );
}

render(<App />, document.getElementById('app'));
