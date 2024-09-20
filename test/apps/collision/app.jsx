/* global fetch */
import React, {useCallback, useState} from 'react';
import {render} from 'react-dom';
import {Map} from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import {OPERATION} from '@deck.gl/core';
import {GeoJsonLayer, SolidPolygonLayer, TextLayer} from '@deck.gl/layers';
import {CollisionFilterExtension, MaskExtension} from '@deck.gl/extensions';
import {VectorTileLayer, vectorTableSource} from '@deck.gl/carto';

const accessToken = 'eyJhbGciOiJIUzI1NiJ9.eyJhIjoiYWNfbHFlM3p3Z3UiLCJqdGkiOiJkOTU4OWMyZiJ9.78MdzU2J6y-J6Far71_Mh7IQO9eYIZD9nECUiZJAVL4';
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-nolabels-gl-style/style.json';
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';
const PLACES =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_populated_places_simple.geojson';
const US_STATES =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_1_states_provinces_shp.geojson'; //eslint-disable-line

const cartoData = vectorTableSource({
  accessToken,
  connectionName: 'carto_dw',
  tableName: 'carto-demo-data.demo_tables.populated_places'
});

/* eslint-disable react/no-deprecated */
export default function App() {
  const [collisionEnabled, setCollisionEnabled] = useState(true);
  const [maskEnabled, setMaskEnabled] = useState(false);
  const [showCarto, setShowCarto] = useState(false);
  const [showPoints, setShowPoints] = useState(true);
  const [showLabels, setShowLabels] = useState(false);
  const [selectedCounty, selectCounty] = useState(null);

  const props = {
    pointRadiusUnits: 'pixels',
    getPointRadius: 8,
    getFillColor: d => [25 * d.properties.scalerank, 255 - 25 * d.properties.scalerank, 123],
    onClick: ({object}) => console.log(object.properties)
  };
  const maskProps = {
    maskId: maskEnabled && 'mask'
  };

  const viewState = {
    longitude: -80,
    latitude: 40,
    zoom: 2,
    maxZoom: 20,
    pitch: 0,
    bearing: 0
  };

  const onClickState = useCallback(info => selectCounty(info.object), []);
  const onDataLoad = useCallback(geojson => {
    const california = geojson.features.find(f => f.properties.name === 'California');
    selectCounty(california);
  }, []);

  const layers = [
    new GeoJsonLayer({
      id: 'mask',
      operation: OPERATION.MASK,
      data: selectedCounty || []
    }),
    maskEnabled &&
      new SolidPolygonLayer({
        id: 'masked-layer',
        data: [
          {
            polygon: [
              [-175, 80],
              [-175, 20],
              [-50, 20],
              [-50, 80],
              [-175, 80]
            ]
          }
        ],
        getFillColor: [77, 138, 244, 200],
        extensions: [new MaskExtension()],
        ...maskProps
      }),
    maskEnabled &&
      new GeoJsonLayer({
        id: 'us-states',
        data: US_STATES,
        onDataLoad,
        opacity: 0.3,
        stroked: true,
        filled: true,
        getFillColor: [201, 210, 203, 80],
        lineWidthMinPixels: 2,
        onClick: onClickState,
        pickable: true,
        autoHighlight: true,
        highlightColor: [255, 255, 255, 150]
      }),
    showCarto &&
      new VectorTileLayer({
        id: 'places',
        data: cartoData,

        getFillColor: [200, 0, 80],
        pointType: 'text',
        getText: f => f.properties.name,
        getTextColor: [0, 0, 0],
        getTextSize: 12,
        parameters: {depthTest: false},

        extensions: [new CollisionFilterExtension(), new MaskExtension()],
        collisionEnabled,
        collisionGroup: 'def',
        getCollisionPriority: 0,
        collisionTestProps: {
          sizeScale: 2 // Enlarge text to increase hit area
        },
        ...maskProps
      }),
    showPoints &&
      new GeoJsonLayer({
        id: 'points',
        data: PLACES,

        pointType: 'circle',
        ...props,

        extensions: [new CollisionFilterExtension(), new MaskExtension()],
        collisionEnabled,
        collisionGroup: 'def',
        getCollisionPriority: d => d.properties.scalerank,
        collisionTestProps: {
          pointAntialiasing: false, // Does this matter for collisions?
          radiusScale: 2 // Enlarge point to increase hit area
        },
        ...maskProps
      }),
    showLabels &&
      new TextLayer({
        id: 'labels',
        data: AIR_PORTS,
        dataTransform: d => d.features,

        getText: f => f.properties.name,
        getColor: [0, 155, 0],
        getSize: 24,
        getPosition: f => f.geometry.coordinates,
        ...props,

        extensions: [new CollisionFilterExtension(), new MaskExtension()],
        getCollisionPriority: d => -d.properties.scalerank,
        collisionEnabled,
        collisionGroup: 'labels',
        collisionTestProps: {
          sizeScale: 2 // Enlarge text to increase hit area
        },
        ...maskProps
      })
  ];

  return (
    <>
      <DeckGL layers={layers} initialViewState={viewState} controller={true}>
        <Map mapStyle={MAP_STYLE} />
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
            checked={maskEnabled}
            onChange={() => setMaskEnabled(!maskEnabled)}
          />
          Use mask
        </label>
        <label>
          <input type="checkbox" checked={showCarto} onChange={() => setShowCarto(!showCarto)} />
          Show carto
        </label>
        <label>
          <input type="checkbox" checked={showPoints} onChange={() => setShowPoints(!showPoints)} />
          Show points
        </label>
        <label>
          <input type="checkbox" checked={showLabels} onChange={() => setShowLabels(!showLabels)} />
          Show labels
        </label>
      </div>
    </>
  );
}

render(<App />, document.getElementById('app'));
