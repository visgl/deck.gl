// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {execFileSync} from 'node:child_process';
import {mkdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const OUTPUT_DIRECTORY = path.resolve('examples/website/path-style-alpine-railway/data');

const SCENES = [
  {
    id: 'albula-landwasser',
    label: 'Albula / Landwasser',
    description:
      'The Albula line sweeps across the Landwasser Viaduct and directly into a source-mapped tunnel.',
    sourceObjectIds: [
      '{61192120-C6F4-4BE4-B264-BFEE83C93600}',
      '{5716ADA1-5D06-41A1-9048-08010D4DB448}',
      '{9681FA77-1ADA-4368-A916-FC5F141D9C30}',
      '{25F6BB09-E81F-4AD9-914B-6D609B7BB2E2}',
      '{A662ED86-105D-4D6E-91BC-EDFCB8E0B001}',
      '{3D3381EF-547C-4CC8-AA91-41C9920D2406}',
      '{5F17FB42-8F8B-4D38-877E-D6C4F77C3F3F}',
      '{704C0C19-C2EE-4087-A923-48C89F48210F}',
      '{DBDFB80A-837C-41B4-8E27-871C4C2CCC64}',
      '{A36C1760-2515-43D6-825A-B2E27E499C7D}',
      '{4F607941-D04B-459D-9E42-F4DDE6680849}'
    ],
    initialViewState: {
      longitude: 9.67525,
      latitude: 46.68055,
      position: [0, 0, 1053],
      zoom: 18.15,
      pitch: 50,
      bearing: 42,
      minZoom: 14,
      maxZoom: 21,
      maxPitch: 78
    },
    bounds: [9.65669, 46.6736053, 9.6792523, 46.6825821],
    terrain: {
      id: 'albula-landwasser',
      bounds: [9.65669, 46.6736053, 9.6792523, 46.6825821],
      elevationRangeMeters: [962.39, 1362.65]
    }
  },
  {
    id: 'bernina-pass',
    label: 'Bernina Pass / Lago Bianco',
    description:
      'A long high-alpine alignment follows Lago Bianco through open track, a bridge, and a protective gallery.',
    sourceObjectIds: [
      '{1B57E58E-8677-4B53-A5E7-9A3096952CE0}',
      '{702F3C38-39D9-4C3B-93E7-500B8BB80027}',
      '{4E9D2854-9FAB-4EF2-AC8D-123EE9320351}',
      '{9D2A98CA-D319-47C1-9441-8BEA3041FD50}',
      '{0D13633A-91C4-4322-A3FE-6E37A7A5420D}',
      '{819ECFBB-38AC-45C4-8573-3561D27AC1D9}',
      '{A45EADCA-4AF3-4732-ADF4-C93D5C0B614F}',
      '{99DE6FEF-E398-4F9E-BD53-27840057BFE3}',
      '{8793DD2C-64AE-4324-AA15-1E0D745D9806}'
    ],
    initialViewState: {
      longitude: 10.0284,
      latitude: 46.4023,
      position: [0, 0, 2242],
      zoom: 17,
      pitch: 42,
      bearing: 4,
      minZoom: 13.5,
      maxZoom: 21,
      maxPitch: 78
    },
    bounds: [10.0000926, 46.3879247, 10.0366802, 46.4201911],
    terrain: {
      id: 'bernina-pass',
      bounds: [10.0000926, 46.3879247, 10.0366802, 46.4201911],
      elevationRangeMeters: [2046.76, 3031.53]
    }
  },
  {
    id: 'brusio-spiral',
    label: 'Brusio Spiral',
    description:
      'The Bernina line curls through the Brusio spiral and crosses its own alignment on the source-classified viaduct.',
    sourceObjectIds: [
      '{99058F3D-C885-4085-A8AF-842D1A3BEC72}',
      '{96BD39A0-5CE4-4A15-A87E-B6E9DD998879}',
      '{9F2D61B0-B2A1-4C07-AEC1-D276822672E1}',
      '{3CACC011-EABF-4B70-AE56-2016C02421C5}',
      '{FB5248A1-ECA1-4A70-9768-25F338B70950}',
      '{9E941768-A16E-416B-8ED0-16ED6D408822}'
    ],
    initialViewState: {
      longitude: 10.128,
      latitude: 46.25345,
      position: [0, 0, 725],
      zoom: 17.45,
      pitch: 62,
      bearing: 8,
      minZoom: 14,
      maxZoom: 21,
      maxPitch: 78
    },
    bounds: [10.1203531, 46.2425176, 10.1342907, 46.2626048],
    terrain: {
      id: 'brusio-spiral',
      bounds: [10.1203531, 46.2425176, 10.1342907, 46.2626048],
      elevationRangeMeters: [603.48, 1275]
    }
  }
];

const STRUCTURE_TYPES = {
  Keine: 'open',
  Bruecke: 'bridge',
  Tunnel: 'tunnel',
  Galerie: 'covered',
  Gedeckte_Bruecke: 'covered'
};

function roundCoordinate(value, precision) {
  const scale = 10 ** precision;
  return Math.round(value * scale) / scale;
}

function normalizePath(coordinates) {
  const path = [];
  let previousSourceCoordinate = null;
  for (const coordinate of coordinates) {
    if (
      previousSourceCoordinate &&
      coordinate.every((value, index) => value === previousSourceCoordinate[index])
    ) {
      continue;
    }
    previousSourceCoordinate = coordinate;
    const position = [
      roundCoordinate(coordinate[0], 7),
      roundCoordinate(coordinate[1], 7),
      roundCoordinate(coordinate[2], 2)
    ];
    path.push(position);
  }
  return path;
}

function readSourceFeatures(sourcePath, sourceObjectIds) {
  const whereClause = `UUID IN (${sourceObjectIds.map(id => `'${id}'`).join(',')})`;
  const output = execFileSync(
    'ogr2ogr',
    [
      '-f',
      'GeoJSON',
      '/vsistdout/',
      sourcePath,
      '-where',
      whereClause,
      '-select',
      'UUID,DATUM_AEND,OBJEKTART,KUNSTBAUTE,ANZAHL_SPU,ACHSE_DKM,NAME',
      '-s_srs',
      'EPSG:2056',
      '-t_srs',
      'EPSG:4326'
    ],
    {encoding: 'utf8', maxBuffer: 20 * 1024 * 1024}
  );
  return JSON.parse(output).features;
}

function createTrack(feature, sceneId, index) {
  const {properties, geometry} = feature;
  if (geometry.type !== 'LineString') {
    throw new Error(`Expected LineString for ${properties.UUID}, received ${geometry.type}`);
  }
  const path = normalizePath(geometry.coordinates);
  if (path.length < 2) {
    throw new Error(`Source object ${properties.UUID} has fewer than two unique positions`);
  }
  const structure = STRUCTURE_TYPES[properties.KUNSTBAUTE] || 'unknown';
  return {
    id: `${sceneId}-${String(index + 1).padStart(2, '0')}`,
    label: properties.NAME || `${structure[0].toUpperCase()}${structure.slice(1)} segment ${index + 1}`,
    path,
    gaugeMeters: null,
    structure,
    sourceObjectIds: [properties.UUID],
    sourceClass: properties.OBJEKTART || null,
    sourceUpdatedAt: properties.DATUM_AEND || null,
    sourceTrackCount: Number(properties.ANZAHL_SPU) || null,
    representativeAxis: properties.ACHSE_DKM === 'Wahr'
  };
}

function extractScene(scene, sourcePath) {
  const features = readSourceFeatures(sourcePath, scene.sourceObjectIds);
  const featuresById = new Map(features.map(feature => [feature.properties.UUID, feature]));
  const missingIds = scene.sourceObjectIds.filter(id => !featuresById.has(id));
  if (missingIds.length) {
    throw new Error(`${scene.id} is missing source objects: ${missingIds.join(', ')}`);
  }
  const tracks = scene.sourceObjectIds.map((id, index) =>
    createTrack(featuresById.get(id), scene.id, index)
  );
  return {
    id: scene.id,
    label: scene.label,
    description: scene.description,
    initialViewState: scene.initialViewState,
    bounds: scene.bounds,
    terrain: scene.terrain,
    tracks
  };
}

const sourcePath = process.argv[2];
const outputDirectory = path.resolve(process.argv[3] || OUTPUT_DIRECTORY);
if (!sourcePath) {
  throw new Error('Usage: node extract-scenes.mjs /path/to/swissTLM3D_TLM_EISENBAHN.shp [output-directory]');
}

mkdirSync(outputDirectory, {recursive: true});
for (const scene of SCENES) {
  const extractedScene = extractScene(scene, path.resolve(sourcePath));
  const outputPath = path.join(outputDirectory, `${scene.id}.json`);
  writeFileSync(outputPath, `${JSON.stringify(extractedScene)}\n`);
  const coordinateCount = extractedScene.tracks.reduce((sum, track) => sum + track.path.length, 0);
  console.log(`${scene.id}: ${extractedScene.tracks.length} tracks, ${coordinateCount} coordinates`);
}
