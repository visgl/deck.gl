// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
/* eslint-disable no-console */
import React, {useState, useCallback} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import {HeatmapTileLayer} from '@deck.gl/carto';

import {colorPalettes} from './palettes';
import {datasets} from './datasets';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';
const INITIAL_VIEW_STATE = {
  longitude: -73.75,
  latitude: 40.73,
  zoom: 9,
  maxZoom: 16,
  pitch: 0,
  bearing: 0
};

// Configure your CARTO credentials
const apiBaseUrl = 'https://gcp-us-east1.api.carto.com';
const connectionName = 'bigquery';
const accessToken = 'XXX'; // Replace with your CARTO access token

const globalOptions = {accessToken, apiBaseUrl, connectionName};

function App() {
  const [selectedDataset, setSelectedDataset] = useState('H3 Table (Population)');
  const [selectedPalette, setSelectedPalette] = useState('YlOrRd (Default)');
  const [radiusPixels, setRadiusPixels] = useState(30);
  const [intensity, setIntensity] = useState(2);
  const [colorDomain, setColorDomain] = useState<[number, number]>([0, 1]);

  const dataset = datasets[selectedDataset];
  
  // Create tile JSON source
  // @ts-ignore
  const tilejson = dataset.source({
    ...globalOptions,
    tableName: dataset.tableName,
    ...(dataset.aggregationExp && {aggregationExp: dataset.aggregationExp})
  });

  const layer = new HeatmapTileLayer({
    id: 'heatmap',
    data: tilejson,
    getWeight: dataset.getWeight,
    radiusPixels,
    intensity,
    colorDomain,
    colorRange: colorPalettes[selectedPalette]
  });

  const handleDatasetChange = useCallback((event) => setSelectedDataset(event.target.value), []);
  const handleRadiusChange = useCallback((event) => setRadiusPixels(Number(event.target.value)), []);
  const handleIntensityChange = useCallback((event) => setIntensity(Number(event.target.value)), []);
  const handleMinDomainChange = useCallback((event) => setColorDomain([Number(event.target.value), colorDomain[1]]), [colorDomain]);
  const handleMaxDomainChange = useCallback((event) => setColorDomain([colorDomain[0], Number(event.target.value)]), [colorDomain]);
  const handlePaletteChange = useCallback((event) => setSelectedPalette(event.target.value), []);

  return (
    <>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={[layer]}
        getTooltip={({object}) => {
          if (!object || !object.properties) return null;
          const props = object.properties;
          return Object.entries(props)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
        }}
      >
        <Map mapStyle={MAP_STYLE} />
      </DeckGL>
      
      <div id="control-panel">
        <h3>CARTO Heatmap Test</h3>
        
        <label>Dataset:</label>
        <select value={selectedDataset} onChange={handleDatasetChange}>
          {Object.keys(datasets).map(name => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        
        <div className="description">
          {dataset.description}
        </div>
        
        <label>Color Palette:</label>
        <select value={selectedPalette} onChange={handlePaletteChange}>
          {Object.keys(colorPalettes).map(name => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        
        <div className="color-preview">
          {colorPalettes[selectedPalette].map((color, index) => (
            <div
              key={index}
              className="color-swatch"
              style={{
                backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
                width: '20px',
                height: '20px',
                display: 'inline-block',
                marginRight: '2px',
                border: '1px solid #ccc'
              }}
            />
          ))}
        </div>
        
        <label>Radius (pixels):</label>
        <input
          type="range"
          min="0"
          max="100"
          value={radiusPixels}
          onChange={handleRadiusChange}
        />
        <div className="range-label">
          <span>0</span>
          <span>{radiusPixels}</span>
          <span>100</span>
        </div>
        
        <label>Intensity:</label>
        <input
          type="range"
          min="0.1"
          max="5"
          step="0.1"
          value={intensity}
          onChange={handleIntensityChange}
        />
        <div className="range-label">
          <span>0.1</span>
          <span>{intensity}</span>
          <span>5.0</span>
        </div>
        
        <label>Color Domain Min:</label>
        <input
          type="number"
          min="0"
          max="10"
          step="0.1"
          value={colorDomain[0]}
          onChange={handleMinDomainChange}
        />
        
        <label>Color Domain Max:</label>
        <input
          type="number"
          min="0.1"
          max="10"
          step="0.1"
          value={colorDomain[1]}
          onChange={handleMaxDomainChange}
        />
      </div>
    </>
  );
}

const container = document.getElementById('app');
const root = createRoot(container!);
root.render(<App />);