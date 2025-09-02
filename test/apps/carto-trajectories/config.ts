import {trajectoryQuerySource, trajectoryTableSource} from '@carto/api-client';

// CARTO API configuration
const API_CONFIG = {
  apiBaseUrl: 'https://gcp-us-east1-19.dev.api.carto.com',
  accessToken: 'XXX', // Replace with your CARTO access token
  connectionName: 'carto_dw'
};

export const DATASETS = {
  'NYC Taxi Trips (Query)': {
    name: 'NYC Taxi Trips (Query)',
    dataSource: trajectoryQuerySource({
      ...API_CONFIG,
      sqlQuery:
        'SELECT geometry as geom, timestamp as ts, ride_id as trajectoryId FROM `cartodb-on-gcp-frontend-team.felix.taxi-trips`',
      trajectoryIdColumn: 'trajectoryId',
      timestampColumn: 'ts'
    }),
    viewState: {
      latitude: 40.7128,
      longitude: -74.006,
      zoom: 10,
      bearing: 0,
      pitch: 0
    },
    layerType: 'Trips 2D',
    lineWidth: 2,
    mapStyle: 'dark-v11',
    palette: 'Sunset'
  },
  'NYC Taxi Trips (Table)': {
    name: 'NYC Taxi Trips (Table)',
    dataSource: trajectoryTableSource({
      ...API_CONFIG,
      tableName: 'cartodb-on-gcp-frontend-team.felix.taxi-trips',
      spatialDataColumn: 'geometry',
      trajectoryIdColumn: 'ride_id',
      timestampColumn: 'timestamp'
    }),
    viewState: {
      latitude: 40.7128,
      longitude: -74.006,
      zoom: 10,
      bearing: 0,
      pitch: 0
    },
    layerType: 'Trips 2D',
    lineWidth: 2,
    mapStyle: 'outdoors-v12',
    palette: 'ArmyRose'
  },
  'Atlanta Vehicle Trajectories': {
    name: 'Atlanta Vehicle Trajectories',
    dataSource: trajectoryQuerySource({
      ...API_CONFIG,
      sqlQuery:
        'SELECT * FROM `carto-demo-data.demo_tables.citytrek_14k_vehicle_trajectories` WHERE timestamp >= "2017-11-01" AND timestamp < "2017-11-05"',
      trajectoryIdColumn: 'trip_id',
      timestampColumn: 'timestamp'
    }),
    viewState: {
      latitude: 33.749,
      longitude: -84.388,
      zoom: 10,
      bearing: 0,
      pitch: 0
    },
    layerType: 'Trips 2D',
    lineWidth: 1.5,
    mapStyle: 'dark-v11',
    palette: 'Vivid'
  },
  'Memphis Vehicle Trajectories (Query)': {
    name: 'Memphis Vehicle Trajectories (Query)',
    dataSource: trajectoryQuerySource({
      ...API_CONFIG,
      sqlQuery:
        'SELECT * FROM `carto-demo-data.demo_tables.citytrek_14k_vehicle_trajectories` LIMIT 100000',
      trajectoryIdColumn: 'trip_id',
      timestampColumn: 'timestamp'
    }),
    viewState: {
      latitude: 35.1495,
      longitude: -90.049,
      zoom: 10,
      bearing: 0,
      pitch: 0
    },
    layerType: 'Trips 2D',
    lineWidth: 1.5,
    mapStyle: 'satellite-streets-v12',
    palette: 'Temps'
  }
};

// Available layer rendering modes
export const LAYER = {
  Path: 'Path 2D',
  Trips: 'Trips 2D',
  Points: 'Point 2D'
};

export const PALETTES = {
  ArmyRose: 'ArmyRose',
  DarkMint: 'DarkMint',
  Emrld: 'Emrld',
  OrYel: 'OrYel',
  Peach: 'Peach',
  Prism: 'Prism',
  Sunset: 'Sunset',
  Temps: 'Temps',
  Tropic: 'Tropic',
  Vivid: 'Vivid'
};

export const MAP_STYLES = {
  dark: 'dark-v11',
  outdoors: 'outdoors-v12',
  satellite: 'satellite-streets-v12',
  navigationNight: 'navigation-night-v1'
};
export const DATASET_NAMES = Object.keys(DATASETS);
