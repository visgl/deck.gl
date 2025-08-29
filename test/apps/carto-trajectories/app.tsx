/* global: document */
import React, {useEffect, useState, useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {Map, Source, useControl, useMap} from 'react-map-gl';
import {MapboxOverlay} from '@deck.gl/mapbox';

import {DeckProps} from '@deck.gl/core';
import type {TrajectoryTableSourceResponse, TrajectoryQuerySourceResponse} from '@carto/api-client';
import {TrajectoryTileLayer, VectorTileLayer, colorContinuous} from '@deck.gl/carto';
import {normalizeTimestamp} from '@deck.gl/carto/layers/trajectory-utils';

import RangeInput from './range-input';
import {DATASETS, DATASET_NAMES, LAYER, PALETTES, MAP_STYLES} from './config';

const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

function DeckGLOverlay(props: DeckProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

export default function App() {
  const initialDatasetName = DATASET_NAMES[0];
  const initialDataset = DATASETS[initialDatasetName];
  const [selectedDataset, setSelectedDataset] = useState(initialDatasetName);
  const [layerType, setLayerType] = useState(initialDataset.layerType);
  const [mapStyle, setMapStyle] = useState(initialDataset.mapStyle);
  const [palette, setPalette] = useState(initialDataset.palette);
  const [currentTime, setCurrentTime] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(100);
  const [trailLength, setTrailLength] = useState(1000);
  const [lineWidth, setLineWidth] = useState(initialDataset.lineWidth);
  const [timeRange, setTimeRange] = useState([0, 1000]);
  const [timestampRange, setTimestampRange] = useState(null);

  function setDataset(datasetName: string) {
    const dataset = DATASETS[datasetName];
    setSelectedDataset(datasetName);
    setLayerType(dataset.layerType);
    setLineWidth(dataset.lineWidth);
    setMapStyle(dataset.mapStyle);
    setPalette(dataset.palette);
    // Reset time controls to defaults - they'll be updated when data loads
    setCurrentTime(0);
    setTimeRange([0, 1000]);
    setTimestampRange(null);
  }

  const mapRef = useRef(null);
  const currentDataset = DATASETS[selectedDataset];
  const [dataSource, setDataSource] = useState<
    TrajectoryTableSourceResponse | TrajectoryQuerySourceResponse | null
  >(null);

  // Handle trajectory click to jump to start time
  function handleTrajectoryClick(info) {
    console.log('handleTrajectoryClick', info);
    if (!info.object || !dataSource?.widgetSource) return;

    const trajectoryIdColumn = dataSource.widgetSource.props.trajectoryIdColumn;
    const timestampColumn = dataSource.widgetSource.props.timestampColumn;

    // Get the trajectory ID directly from the object properties
    const trajectoryId = info.object.properties[trajectoryIdColumn];
    if (!trajectoryId) return;

    console.log('Clicked trajectory with ID:', trajectoryId);

    // Use getRange to efficiently get min/max timestamps for this trajectory
    dataSource.widgetSource
      .getRange({
        column: timestampColumn,
        filters: {[trajectoryIdColumn]: {in: {values: [trajectoryId]}}}
      })
      .then(timeRange => {
        if (timeRange && timeRange.min) {
          const startTime = normalizeTimestamp(timeRange.min);

          console.log('Trajectory timespan:', {
            trajectoryId,
            startTime: timeRange.min,
            endTime: timeRange.max
          });
          console.log('Jumping to trajectory start time:', startTime);

          setCurrentTime(startTime);
        }
      })
      .catch(error => {
        console.error('Error fetching trajectory time range:', error);
      });
  }

  useEffect(() => {
    currentDataset.dataSource.then(result => {
      setDataSource(result);
      setTimestampRange(result.timestampRange);

      if (result.timestampRange) {
        // Handle both Unix timestamps (numbers) and ISO strings
        const {min, max} = result.timestampRange;
        const minTime = normalizeTimestamp(min);
        const maxTime = normalizeTimestamp(max);

        const duration = maxTime - minTime;

        console.log('Dataset duration:', duration, 'seconds');
        console.log('Duration in days:', Math.round((duration / 86400) * 100) / 100);

        // Set time range
        setTimeRange([minTime, maxTime]);
        setCurrentTime(minTime);

        // Calculate animation speed for 15-second full animation
        const targetAnimationDuration = 15; // seconds
        const calculatedSpeed = duration / targetAnimationDuration;

        // Cap the animation speed to reasonable bounds
        const maxReasonableSpeed = 50000; // Max speed to prevent UI issues
        const minReasonableSpeed = 10; // Min speed for very short datasets
        const clampedSpeed = Math.max(
          minReasonableSpeed,
          Math.min(maxReasonableSpeed, calculatedSpeed)
        );

        console.log('Dataset duration:', duration, 'seconds');
        console.log('Raw calculated speed:', calculatedSpeed);
        console.log('Clamped animation speed:', clampedSpeed);
        setAnimationSpeed(Math.round(clampedSpeed));

        // Set trail length to 2-5% of full duration for better visibility
        const trailPercentage = 0.03; // 3% default
        const calculatedTrailLength = Math.round(duration * trailPercentage);
        console.log(
          'Calculated trail length:',
          calculatedTrailLength,
          'seconds =',
          formatTrailLength(calculatedTrailLength)
        );
        setTrailLength(calculatedTrailLength);
      }

      if (mapRef.current) {
        const {latitude, longitude, bearing, pitch, zoom} = currentDataset.viewState;
        mapRef.current.flyTo({
          bearing,
          center: [longitude, latitude],
          pitch,
          zoom
        });
      }
    });
  }, [selectedDataset]);

  if (!dataSource) return null;

  const initialViewState = currentDataset.viewState;

  const [layer] = layerType.split(' ');
  const showTrips = layer === 'Trips';
  const showPoints = layer === 'Point';
  const styleName = mapStyle;
  const trajectoryIdColumn = dataSource.widgetSource.props.trajectoryIdColumn;

  const layers = showPoints
    ? [
        new VectorTileLayer({
          id: 'points',
          data: dataSource,
          pointRadiusMinPixels: lineWidth,
          pointRadiusMaxPixels: lineWidth,
          getFillColor: colorContinuous({
            attr: trajectoryIdColumn,
            domain: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
            colors: palette
          }),
          updateTriggers: {getFillColor: [palette]}
        })
      ]
    : [
        new TrajectoryTileLayer({
          id: 'trajectories',
          data: dataSource,
          uniqueIdProperty: 'trajectoryId', // TODO internalize this

          renderMode: showTrips ? 'trips' : 'paths',

          // Color entire line by trajectoryId, will be invoked once per line
          getLineColor: colorContinuous({
            attr: trajectoryIdColumn,
            domain: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
            colors: palette
          }),

          // Color each vertex by speed
          autocomputeSpeed: true, // Will add 'speed' attribute to geometry
          getFillColor: colorContinuous({
            attr: 'speed',
            domain: [0, 5, 10, 15, 20, 25],
            colors: palette
          }),
          updateTriggers: {getLineColor: [palette], getFillColor: [palette]},

          //
          currentTime,
          trailLength,
          getWidth: lineWidth,
          onClick: handleTrajectoryClick,
          onHover: info => {
            info.object && console.log('onHover', info.object.properties);
          },
          pickable: true,
          autoHighlight: true,
          highlightColor: [255, 122, 44, 255]
        })
      ];

  function onAfterRender() {
    const isLoading = layers.every(layer => layer.isLoaded);
    const loadingElement = document.getElementById('loading-indicator');
    if (loadingElement) {
      loadingElement.style.transition = isLoading ? 'opacity 1s' : '';
      loadingElement.style.opacity = `${isLoading ? 0 : 1}`;
    }
  }

  return (
    <>
      <Map
        initialViewState={initialViewState}
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={`mapbox://styles/mapbox/${styleName}`}
        maxPitch={50}
        projection="mercator"
      >
        <DeckGLOverlay onAfterRender={onAfterRender} layers={layers} />
        <Source
          id="mapbox-dem"
          type="raster-dem"
          url={'mapbox://mapbox.mapbox-terrain-dem-v1'}
          tileSize={512}
          maxzoom={14}
        />
      </Map>
      <ObjectSelect
        title="Dataset"
        obj={DATASET_NAMES}
        value={selectedDataset}
        onSelect={setDataset}
        top={0}
      />
      <ObjectSelect title="Layer" obj={LAYER} value={layerType} onSelect={setLayerType} top={30} />
      <ObjectSelect
        title="Map Style"
        obj={MAP_STYLES}
        value={mapStyle}
        onSelect={setMapStyle}
        top={60}
      />
      <ObjectSelect title="Palette" obj={PALETTES} value={palette} onSelect={setPalette} top={90} />
      {showTrips && (
        <RangeInput
          name={'Time'}
          animationSpeed={animationSpeed}
          bottom={150}
          min={timeRange[0]}
          max={timeRange[1]}
          value={currentTime}
          onChange={setCurrentTime}
          formatLabel={(x: number) => formatLabel(x, 'seconds', timestampRange)}
        />
      )}
      {showTrips && (
        <RangeInput
          name={'Animation speed'}
          bottom={100}
          min={1}
          max={Math.min(100000, Math.max(1000, animationSpeed * 3))}
          value={animationSpeed}
          onChange={setAnimationSpeed}
          formatLabel={(x: number) => formatLabel(x, 'speed')}
        />
      )}
      {showTrips && (
        <RangeInput
          name={'Trail Length'}
          bottom={50}
          min={Math.round((timeRange[1] - timeRange[0]) * 0.005)}
          max={Math.round((timeRange[1] - timeRange[0]) * 0.1)}
          value={trailLength}
          onChange={setTrailLength}
          formatLabel={(x: number) => formatLabel(x, 'trail')}
        />
      )}
      <RangeInput
        name={showPoints ? 'Point size' : 'Line width'}
        bottom={0}
        min={1}
        max={10}
        value={lineWidth}
        onChange={setLineWidth}
        formatLabel={(x: number) => formatLabel(x, 'pixels')}
      />
      {showTrips && (
        <div
          style={{
            position: 'absolute',
            left: 10,
            bottom: 10,
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '12px',
            maxWidth: '300px'
          }}
        >
          💡 Click any trajectory to jump to its start time
        </div>
      )}
    </>
  );
}

export function renderToDOM(container: HTMLElement) {
  const root = createRoot(container);
  root.render(<App />);
}

function formatTimestamp(timestamp: number, originalRange: any): string {
  if (!originalRange) return Math.round(timestamp).toString();

  // Check if original timestamps were ISO strings
  if (typeof originalRange.min === 'string') {
    // Convert Unix timestamp back to readable date
    return new Date(timestamp * 1000).toLocaleString();
  } else {
    // Format Unix timestamp as relative time or date
    return new Date(timestamp * 1000).toLocaleString();
  }
}

function formatTrailLength(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  } else if (seconds < 3600) {
    return `${Math.round(seconds / 60)}m`;
  } else if (seconds < 86400) {
    return `${Math.round(seconds / 3600)}h`;
  } else {
    return `${Math.round(seconds / 86400)}d`;
  }
}

function formatAnimationSpeed(speed: number): string {
  if (speed >= 10000) {
    return `${(speed / 1000).toFixed(0)}K`;
  } else if (speed >= 1000) {
    return `${(speed / 1000).toFixed(1)}K`;
  } else {
    return Math.round(speed).toString();
  }
}

function formatLabel(n: number, label: string, timestampRange?: any) {
  if (label === 'seconds' && timestampRange) {
    return formatTimestamp(n, timestampRange);
  }
  if (label === 'trail') {
    return formatTrailLength(n);
  }
  if (label === 'speed') {
    return formatAnimationSpeed(n);
  }
  return `${label ? label + ': ' : ''}` + Math.round(n);
}

function ObjectSelect({title, obj, value, onSelect, top = 0}) {
  const keys = Array.isArray(obj) ? obj : Object.values(obj);
  return (
    <>
      <select
        onChange={e => onSelect(e.target.value)}
        style={{position: 'absolute', padding: 4, margin: 2, width: 200, right: 0, top}}
        value={value}
      >
        <option hidden>{title}</option>
        {keys.map((f: any) => (
          <option key={f} value={f}>
            {`${title}: ${f}`}
          </option>
        ))}
      </select>
      <br></br>
    </>
  );
}
