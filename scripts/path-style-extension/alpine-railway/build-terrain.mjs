// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {TERRAIN_SOURCES} from './terrain-sources.mjs';

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_DIRECTORY = path.resolve(SCRIPT_DIRECTORY, '../../..');
const DATA_DIRECTORY = path.join(
  REPOSITORY_DIRECTORY,
  'examples/website/path-style-alpine-railway/data'
);
const TERRAIN_DIRECTORY = path.join(DATA_DIRECTORY, 'terrain');
const ELEVATION_IMAGE_SIZE = 257;
const TEXTURE_IMAGE_SIZE = 512;

function getSha256(data) {
  return createHash('sha256').update(data).digest('hex');
}

function run(command, args) {
  execFileSync(command, args, {stdio: 'inherit'});
}

async function downloadTerrainTile(tile, outputDirectory) {
  const response = await fetch(tile.url);
  if (!response.ok) {
    throw new Error(`Could not download ${tile.url}: HTTP ${response.status}`);
  }
  const data = Buffer.from(await response.arrayBuffer());
  const actualSha256 = getSha256(data);
  if (actualSha256 !== tile.sourceSha256) {
    throw new Error(
      `Checksum mismatch for ${tile.id}: expected ${tile.sourceSha256}, received ${actualSha256}`
    );
  }
  const outputPath = path.join(outputDirectory, tile.id);
  writeFileSync(outputPath, data);
  return outputPath;
}

function readSceneBounds(sceneId) {
  const scenePath = path.join(DATA_DIRECTORY, `${sceneId}.json`);
  const scene = JSON.parse(readFileSync(scenePath, 'utf8'));
  return scene.terrain.bounds.map(String);
}

function warpTerrain(mosaicPath, outputPath, bounds, imageSize) {
  run('gdalwarp', [
    '-overwrite',
    '-t_srs',
    'EPSG:4326',
    '-te',
    ...bounds,
    '-te_srs',
    'EPSG:4326',
    '-ts',
    String(imageSize),
    String(imageSize),
    '-r',
    'cubic',
    '-ot',
    'Float32',
    '-dstnodata',
    '-9999',
    '-co',
    'COMPRESS=DEFLATE',
    mosaicPath,
    outputPath
  ]);
}

function fillNoData(inputPath, outputPath) {
  run('gdal_fillnodata.py', [
    '-md',
    '100',
    '-si',
    '1',
    '-of',
    'GTiff',
    inputPath,
    outputPath
  ]);
}

function encodeTerrainRgb(inputPath, outputPath, workingDirectory) {
  const encodedTiffPath = path.join(workingDirectory, 'elevation-rgb.tif');
  const encodedValue = 'clip(rint((A+10000.0)*10.0),0,16777215)';
  run('gdal_calc.py', [
    '-A',
    inputPath,
    '--calc',
    `floor(${encodedValue}/65536.0)`,
    '--calc',
    `floor(mod(${encodedValue},65536.0)/256.0)`,
    '--calc',
    `mod(${encodedValue},256.0)`,
    '--outfile',
    encodedTiffPath,
    '--type',
    'Byte',
    '--NoDataValue',
    'none',
    '--co',
    'COMPRESS=DEFLATE',
    '--overwrite',
    '--quiet'
  ]);
  run('gdal_translate', [
    '-of',
    'PNG',
    '-co',
    'ZLEVEL=9',
    encodedTiffPath,
    outputPath
  ]);
}

function buildTexture(inputPath, outputPath, workingDirectory) {
  const hillshadePath = path.join(workingDirectory, 'hillshade.tif');
  run('gdaldem', [
    'hillshade',
    inputPath,
    hillshadePath,
    '-az',
    '315',
    '-alt',
    '42',
    '-s',
    '90000',
    '-compute_edges',
    '-co',
    'COMPRESS=DEFLATE'
  ]);
  run('gdal_translate', [
    '-of',
    'PNG',
    '-ot',
    'Byte',
    '-scale',
    '0',
    '255',
    '30',
    '210',
    '-co',
    'ZLEVEL=9',
    hillshadePath,
    outputPath
  ]);
}

async function buildSceneTerrain(sceneId) {
  const source = TERRAIN_SOURCES[sceneId];
  const temporaryDirectory = mkdtempSync(path.join(tmpdir(), `deckgl-${sceneId}-`));
  try {
    console.log(`${sceneId}: downloading and verifying ${source.tiles.length} source tiles`);
    const tilePaths = await Promise.all(
      source.tiles.map(tile => downloadTerrainTile(tile, temporaryDirectory))
    );
    const mosaicPath = path.join(temporaryDirectory, 'mosaic.vrt');
    run('gdalbuildvrt', [mosaicPath, ...tilePaths]);

    const bounds = readSceneBounds(sceneId);
    const elevationWarpPath = path.join(temporaryDirectory, 'elevation-warp.tif');
    const elevationFilledPath = path.join(temporaryDirectory, 'elevation-filled.tif');
    warpTerrain(mosaicPath, elevationWarpPath, bounds, ELEVATION_IMAGE_SIZE);
    fillNoData(elevationWarpPath, elevationFilledPath);
    const elevationPngPath = path.join(temporaryDirectory, `${sceneId}-elevation.png`);
    encodeTerrainRgb(elevationFilledPath, elevationPngPath, temporaryDirectory);

    const textureWarpPath = path.join(temporaryDirectory, 'texture-warp.tif');
    const textureFilledPath = path.join(temporaryDirectory, 'texture-filled.tif');
    warpTerrain(mosaicPath, textureWarpPath, bounds, TEXTURE_IMAGE_SIZE);
    fillNoData(textureWarpPath, textureFilledPath);
    const texturePngPath = path.join(temporaryDirectory, `${sceneId}-texture.png`);
    buildTexture(textureFilledPath, texturePngPath, temporaryDirectory);

    mkdirSync(TERRAIN_DIRECTORY, {recursive: true});
    copyFileSync(elevationPngPath, path.join(TERRAIN_DIRECTORY, `${sceneId}-elevation.png`));
    copyFileSync(texturePngPath, path.join(TERRAIN_DIRECTORY, `${sceneId}-texture.png`));
    console.log(`${sceneId}: wrote Terrain-RGB elevation and hillshade texture assets`);
  } finally {
    rmSync(temporaryDirectory, {recursive: true, force: true});
  }
}

const requestedSceneIds = process.argv.slice(2);
const sceneIds = requestedSceneIds.length ? requestedSceneIds : Object.keys(TERRAIN_SOURCES);
const unknownSceneIds = sceneIds.filter(sceneId => !TERRAIN_SOURCES[sceneId]);
if (unknownSceneIds.length) {
  throw new Error(`Unknown scene ID: ${unknownSceneIds.join(', ')}`);
}

for (const sceneId of sceneIds) {
  await buildSceneTerrain(sceneId);
}
