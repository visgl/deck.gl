// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
/* eslint-disable no-console */
import React, {useState, useCallback} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import {HeatmapTileLayer, ClusterTileLayer, colorBins, colorContinuous} from '@deck.gl/carto';

import {getColorRange} from './palette-utils';
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

function normalize(value, min, max) {
  return (value - min) / Math.max(1, max - min);
}

const cartoColorPalettes = ['OrYel', 'SunsetDark', 'Purp', 'Peach', 'BrwnYl', 'Earth', 'Temps'];

function App() {
  const [selectedDataset, setSelectedDataset] = useState('H3 Table (Population)');
  const [selectedPalette, setSelectedPalette] = useState('OrYel');
  const [visualizationType, setVisualizationType] = useState<'heatmap' | 'cluster'>('cluster');
  const [radiusPixels, setRadiusPixels] = useState(30);
  const [intensity, setIntensity] = useState(2);
  const [colorDomain, setColorDomain] = useState<[number, number]>([0, 1]);
  const [clusterLevel, setClusterLevel] = useState(5);

  const dataset = datasets[selectedDataset];

  // Create tile JSON source
  // @ts-ignore
  const tilejson = dataset.source({
    ...globalOptions,
    tableName: dataset.tableName,
    ...(dataset.aggregationExp && {aggregationExp: dataset.aggregationExp})
  });

  const layer = visualizationType === 'heatmap' 
    ? new HeatmapTileLayer({
        id: 'heatmap',
        data: tilejson,
        getWeight: dataset.getWeight,
        radiusPixels,
        intensity,
        colorDomain,
        colorRange: getColorRange(selectedPalette)
      })
    : new ClusterTileLayer({
        id: 'cluster',
        data: tilejson,
        getWeight: dataset.getWeight,
        clusterLevel,
        stroked: false,
        pointRadiusUnits: 'pixels',
        getFillColor: colorContinuous({
          attr: (d: any, info: any) => {
            const value = d.properties.population_sum;
            const { min, max } = info.data.attributes.stats?.population_sum || { min: 1, max: 1000 };
            return normalize(value, min, max);
          },
          domain: [0, 1],
          colors: selectedPalette
        }),
        getPointRadius: (d: any, info: any) => {
          const value = d.properties.population_sum;
          const stats = info.data.attributes.stats?.population_sum;
          const radiusMin = 10;
          const radiusMax = 80;
          const radiusDelta = radiusMax - radiusMin;
          const normalized = normalize(value, stats.min, stats.max);
          return radiusMin + radiusDelta * Math.sqrt(normalized);
        },
        updateTriggers: {
          getFillColor: [selectedPalette]
        }
      });

  const handleDatasetChange = useCallback(event => setSelectedDataset(event.target.value), []);
  const handleRadiusChange = useCallback(event => setRadiusPixels(Number(event.target.value)), []);
  const handleIntensityChange = useCallback(event => setIntensity(Number(event.target.value)), []);
  const handleMinDomainChange = useCallback(
    event => setColorDomain([Number(event.target.value), colorDomain[1]]),
    [colorDomain]
  );
  const handleMaxDomainChange = useCallback(
    event => setColorDomain([colorDomain[0], Number(event.target.value)]),
    [colorDomain]
  );
  const handlePaletteChange = useCallback(event => setSelectedPalette(event.target.value), []);
  const handleVisualizationTypeChange = useCallback(event => setVisualizationType(event.target.value), []);
  const handleClusterLevelChange = useCallback(event => setClusterLevel(Number(event.target.value)), []);

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
        <h3>CARTO Visualization Test</h3>

        <label>Visualization Type:</label>
        <select value={visualizationType} onChange={handleVisualizationTypeChange}>
          <option value="heatmap">Heatmap</option>
          <option value="cluster">Clusters</option>
        </select>

        <label>Dataset:</label>
        <select value={selectedDataset} onChange={handleDatasetChange}>
          {Object.keys(datasets).map(name => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <div className="description">{dataset.description}</div>

        <label>Color Palette:</label>
        <select value={selectedPalette} onChange={handlePaletteChange}>
          {cartoColorPalettes.map(name => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <div className="color-preview">
          {getColorRange(selectedPalette).map((color, index) => (
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

        {visualizationType === 'heatmap' ? (
          <>
            <label>Radius (pixels):</label>
            <input type="range" min="0" max="100" value={radiusPixels} onChange={handleRadiusChange} />
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
          </>
        ) : (
          <>
            <label>Cluster Level:</label>
            <input type="range" min="3" max="8" value={clusterLevel} onChange={handleClusterLevelChange} />
            <div className="range-label">
              <span>3</span>
              <span>{clusterLevel}</span>
              <span>8</span>
            </div>
          </>
        )}

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
