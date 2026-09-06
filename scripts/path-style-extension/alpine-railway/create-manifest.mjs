// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {createHash} from 'node:crypto';
import {readFileSync, statSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

import {TERRAIN_SOURCES} from './terrain-sources.mjs';

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
export const REPOSITORY_DIRECTORY = path.resolve(SCRIPT_DIRECTORY, '../../..');
export const DATA_DIRECTORY = path.join(
  REPOSITORY_DIRECTORY,
  'examples/website/path-style-alpine-railway/data'
);
export const MANIFEST_PATH = path.join(DATA_DIRECTORY, 'manifest.json');
export const SCENE_IDS = ['albula-landwasser', 'bernina-pass', 'brusio-spiral'];
export const PROVENANCE_TIMESTAMP = '2026-08-27T03:37:55.000Z';

const EARTH_MEAN_RADIUS_METERS = 6371008.8;
const TERRAIN_RGB_DECODER = {
  rScaler: 6553.6,
  gScaler: 25.6,
  bScaler: 0.1,
  offset: -10000
};

function getSha256(data) {
  return createHash('sha256').update(data).digest('hex');
}

function getRepositoryPath(filePath) {
  return path.relative(REPOSITORY_DIRECTORY, filePath).split(path.sep).join('/');
}

function readAsset(filePath, mediaType) {
  const data = readFileSync(filePath);
  return {
    path: getRepositoryPath(filePath),
    mediaType,
    sizeBytes: statSync(filePath).size,
    sha256: getSha256(data)
  };
}

function readPng(filePath) {
  const data = readFileSync(filePath);
  const expectedSignature = '89504e470d0a1a0a';
  if (data.length < 33 || data.subarray(0, 8).toString('hex') !== expectedSignature) {
    throw new Error(`${getRepositoryPath(filePath)} is not a valid PNG`);
  }
  if (data.subarray(12, 16).toString('ascii') !== 'IHDR') {
    throw new Error(`${getRepositoryPath(filePath)} does not start with a PNG IHDR chunk`);
  }
  const colorTypes = {
    0: 'grayscale',
    2: 'rgb',
    3: 'indexed',
    4: 'grayscale-alpha',
    6: 'rgba'
  };
  const colorTypeCode = data[25];
  return {
    ...readAsset(filePath, 'image/png'),
    width: data.readUInt32BE(16),
    height: data.readUInt32BE(20),
    bitDepth: data[24],
    colorType: colorTypes[colorTypeCode] || `unknown-${colorTypeCode}`,
    interlaced: data[28] !== 0
  };
}

function round(value, precision) {
  const scale = 10 ** precision;
  return Math.round(value * scale) / scale;
}

function getSegmentLengthMeters(start, end) {
  const startLatitude = (start[1] * Math.PI) / 180;
  const endLatitude = (end[1] * Math.PI) / 180;
  const latitudeDelta = ((end[1] - start[1]) * Math.PI) / 180;
  const longitudeDelta = ((end[0] - start[0]) * Math.PI) / 180;
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(startLatitude) *
      Math.cos(endLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;
  const horizontalLength =
    2 * EARTH_MEAN_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(haversine)));
  return Math.hypot(horizontalLength, end[2] - start[2]);
}

function countValues(values) {
  const counts = new Map();
  for (const value of values) {
    const key = value === null ? 'null' : String(value);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return Object.fromEntries(
    [...counts.entries()].sort(([left], [right]) => left.localeCompare(right))
  );
}

function getSceneStatistics(scene) {
  const positions = scene.tracks.flatMap(track => track.path);
  let lengthMetersApproximate = 0;
  for (const track of scene.tracks) {
    for (let index = 1; index < track.path.length; index++) {
      lengthMetersApproximate += getSegmentLengthMeters(track.path[index - 1], track.path[index]);
    }
  }
  const sourceUpdatedDates = scene.tracks
    .map(track => track.sourceUpdatedAt)
    .filter(Boolean)
    .sort();
  return {
    trackCount: scene.tracks.length,
    coordinateCount: positions.length,
    uniqueSourceObjectCount: new Set(
      scene.tracks.flatMap(track => track.sourceObjectIds.map(String))
    ).size,
    coordinateBounds: [
      Math.min(...positions.map(position => position[0])),
      Math.min(...positions.map(position => position[1])),
      Math.max(...positions.map(position => position[0])),
      Math.max(...positions.map(position => position[1]))
    ],
    elevationRangeMeters: [
      Math.min(...positions.map(position => position[2])),
      Math.max(...positions.map(position => position[2]))
    ],
    lengthMetersApproximate: round(lengthMetersApproximate, 2),
    lengthMethod:
      'sum of 3D segments using the WGS84-coordinate haversine distance at mean Earth radius 6371008.8 m and source LN02 elevation deltas',
    structureCounts: countValues(scene.tracks.map(track => track.structure)),
    sourceClassCounts: countValues(scene.tracks.map(track => track.sourceClass)),
    sourceTrackCountCounts: countValues(scene.tracks.map(track => track.sourceTrackCount)),
    representativeAxisCount: scene.tracks.filter(track => track.representativeAxis).length,
    sourceUpdatedRange: sourceUpdatedDates.length
      ? [sourceUpdatedDates[0], sourceUpdatedDates.at(-1)]
      : [null, null],
    tracksWithSourcedGauge: scene.tracks.filter(track => track.gaugeMeters !== null).length
  };
}

function readScene(sceneId) {
  const filePath = path.join(DATA_DIRECTORY, `${sceneId}.json`);
  return {
    scene: JSON.parse(readFileSync(filePath, 'utf8')),
    asset: readAsset(filePath, 'application/json')
  };
}

function getPipelineFile(fileName) {
  return readAsset(path.join(SCRIPT_DIRECTORY, fileName), 'text/javascript');
}

function createSceneManifest(sceneId) {
  const {scene, asset} = readScene(sceneId);
  const terrainSource = TERRAIN_SOURCES[sceneId];
  if (!terrainSource) {
    throw new Error(`No terrain source registry entry exists for ${sceneId}`);
  }
  const terrainDirectory = path.join(DATA_DIRECTORY, 'terrain');
  return {
    sceneId,
    generatedAt: PROVENANCE_TIMESTAMP,
    label: scene.label,
    bounds: scene.bounds,
    sourceSelection: {
      railwayObjectIds: scene.tracks.flatMap(track => track.sourceObjectIds.map(String)),
      terrainBoundsLV95: terrainSource.sourceBoundsLV95,
      terrainTiles: terrainSource.tiles.map(tile => ({
        id: tile.id,
        url: tile.url,
        sourceSha256: tile.sourceSha256
      }))
    },
    derivedAssets: {
      scene: asset,
      terrainElevation: readPng(path.join(terrainDirectory, `${sceneId}-elevation.png`)),
      terrainTexture: readPng(path.join(terrainDirectory, `${sceneId}-texture.png`))
    },
    statistics: getSceneStatistics(scene)
  };
}

export function createManifest() {
  const terrainReleaseYears = [
    ...new Set(
      Object.values(TERRAIN_SOURCES).flatMap(source =>
        source.tiles.map(tile => Number(tile.id.match(/^swissalti3d_(\d{4})_/)?.[1]))
      )
    )
  ].sort((left, right) => left - right);
  if (terrainReleaseYears.some(year => !Number.isInteger(year))) {
    throw new Error('A swissALTI3D source tile does not encode its release year in its ID');
  }
  return {
    schemaVersion: 1,
    example: 'path-style-alpine-railway',
    deterministic: true,
    generatedAt: PROVENANCE_TIMESTAMP,
    generatedBy: 'scripts/path-style-extension/alpine-railway/create-manifest.mjs',
    timestampPolicy:
      'The recorded generation and retrieval timestamp is a fixed provenance input, not the manifest generator wall clock.',
    attribution: 'Source: Federal Office of Topography swisstopo',
    derivedDataNotice: 'Derived from Federal Office of Topography swisstopo data.',
    licenseUrl:
      'https://www.swisstopo.admin.ch/en/terms-of-use-free-geodata-and-geoservices',
    sources: {
      railway: {
        provider: 'Federal Office of Topography swisstopo',
        dataset: 'swissTLM3D Railway',
        productVersion: 'swissTLM3D 2.4',
        release: '2026-02',
        sourcePublished: '2026-02-24',
        retrievedAt: PROVENANCE_TIMESTAMP,
        productUrl: 'https://www.swisstopo.admin.ch/en/landscape-model-swisstlm3d',
        stacItemUrl:
          'https://data.geo.admin.ch/api/stac/v1/collections/ch.swisstopo.swisstlm3d/items/swisstlm3d_2026-02',
        featureClass: 'swissTLM3D_TLM_EISENBAHN',
        sourceFeatureCount: 56026,
        geometryType: '3D LineString',
        sourceCrs: {
          compound: 'EPSG:2056 + EPSG:5728',
          horizontal: 'CH1903+ / LV95 (EPSG:2056)',
          vertical: 'LN02 height in metres (EPSG:5728)'
        },
        sourceAsset: {
          url: 'https://data.geo.admin.ch/ch.swisstopo.swisstlm3d/swisstlm3d_2026-02/swisstlm3d_2026-02_2056_5728.shp.zip',
          sizeBytes: 3591345815,
          sha256: '75086b5aa7e721f5ad2ea080e14e9e3f42d5e0afdee31c2e3c162f412fab4114',
          stacChecksumMultihash:
            '122075086B5AA7E721F5AD2EA080E14E9E3F42D5E0AFDEE31C2E3C162F412FAB4114'
        }
      },
      terrain: {
        provider: 'Federal Office of Topography swisstopo',
        dataset: 'swissALTI3D',
        retrievedAt: PROVENANCE_TIMESTAMP,
        releaseYearsEncodedBySourceTiles: terrainReleaseYears,
        productUrl: 'https://www.swisstopo.admin.ch/en/height-model-swissalti3d',
        stacCollectionUrl:
          'https://data.geo.admin.ch/api/stac/v1/collections/ch.swisstopo.swissalti3d',
        sourceResolutionMeters: 2,
        sourceFormat: 'Cloud Optimized GeoTIFF, Float32',
        sourceCrs: {
          compound: 'EPSG:2056 + EPSG:5728',
          horizontal: 'CH1903+ / LV95 (EPSG:2056)',
          vertical: 'LN02 height in metres (EPSG:5728)'
        }
      }
    },
    pipelineFiles: {
      railwayExtraction: getPipelineFile('extract-scenes.mjs'),
      terrainSourceRegistry: getPipelineFile('terrain-sources.mjs'),
      terrainBuild: getPipelineFile('build-terrain.mjs')
    },
    transformations: {
      railway: [
        'Selected complete swissTLM3D_TLM_EISENBAHN features by the UUIDs recorded for each scene, preserving declared selection order; no path was hand traced.',
        'Selected source attributes UUID, DATUM_AEND, OBJEKTART, KUNSTBAUTE, ANZAHL_SPU, ACHSE_DKM, and NAME.',
        'Reprojected horizontal X/Y from EPSG:2056 to WGS84 longitude/latitude with ogr2ogr; retained source LN02 Z values in metres without a vertical transformation.',
        'Removed exact consecutive duplicate source positions before output quantization.',
        'Rounded longitude and latitude to 7 decimal places and elevation to 2 decimal places; performed no simplification, densification, or geometry clipping.',
        'Mapped KUNSTBAUTE values Keine, Bruecke, Tunnel, Galerie, and Gedeckte_Bruecke to runtime structure classes open, bridge, tunnel, covered, and covered.',
        'Assigned deterministic scene-local track IDs and retained source UUID, class, revision date, track count, and representative-axis metadata.'
      ],
      terrain: [
        'Downloaded every 2 m swissALTI3D Cloud Optimized GeoTIFF named per scene and verified its SHA-256 before use.',
        'Built a GDAL VRT mosaic, warped it with cubic resampling to each runtime WGS84 terrain bounds, wrote Float32 with -9999 nodata, and filled nodata with gdal_fillnodata.py using a 100-pixel maximum search distance and one smoothing iteration.',
        'Generated the 257 x 257 elevation raster by rounding (elevation metres + 10000) * 10, clipping to 24-bit range, and packing the value into 8-bit RGB channels.',
        'Generated the 512 x 512 grayscale texture with gdaldem hillshade using azimuth 315, altitude 42, scale 90000, and compute_edges, then linearly scaled source byte values 0..255 to 30..210.',
        'Encoded both derived rasters as PNG with ZLEVEL=9. Exact checked-in PNG hashes are recorded per scene; GDAL-version differences may change derived bytes.'
      ],
      runtime: [
        'The browser reads checked-in scene JSON and PNG files and performs no source download, reprojection, clipping, or terrain generation.',
        'Sleepers and paired rail strokes are runtime cartographic constructions from each source centerline; they are not surveyed source features.',
        'The source class Schmalspur does not supply an exact numeric gauge, so gaugeMeters remains null in data.'
      ],
      terrainRgbDecoder: TERRAIN_RGB_DECODER
    },
    scenes: SCENE_IDS.map(createSceneManifest)
  };
}

export function serializeManifest(manifest) {
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

const isMainModule =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMainModule) {
  const manifest = createManifest();
  writeFileSync(MANIFEST_PATH, serializeManifest(manifest));
  console.log(`Wrote ${getRepositoryPath(MANIFEST_PATH)} for ${manifest.scenes.length} scenes`);
}
