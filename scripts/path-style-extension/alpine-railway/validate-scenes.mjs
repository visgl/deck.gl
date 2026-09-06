// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {readFileSync} from 'node:fs';
import path from 'node:path';
import {isDeepStrictEqual} from 'node:util';

import {
  DATA_DIRECTORY,
  MANIFEST_PATH,
  PROVENANCE_TIMESTAMP,
  REPOSITORY_DIRECTORY,
  SCENE_IDS,
  createManifest,
  serializeManifest
} from './create-manifest.mjs';
import {TERRAIN_SOURCES} from './terrain-sources.mjs';

const ALLOWED_STRUCTURES = new Set(['open', 'bridge', 'tunnel', 'covered', 'unknown']);
const failures = [];

function expect(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function formatReportSummaryRow(sceneManifest) {
  const {statistics} = sceneManifest;
  return (
    `| \`${sceneManifest.sceneId}\` | ${statistics.trackCount} | ` +
    `${statistics.coordinateCount} | ${statistics.lengthMetersApproximate.toFixed(2)} | ` +
    `${statistics.elevationRangeMeters[0].toFixed(2)}–` +
    `${statistics.elevationRangeMeters[1].toFixed(2)} |`
  );
}

function validateBounds(bounds, label) {
  expect(
    Array.isArray(bounds) && bounds.length === 4 && bounds.every(Number.isFinite),
    `${label} must contain four finite numbers`
  );
  if (Array.isArray(bounds) && bounds.length === 4) {
    expect(bounds[0] < bounds[2], `${label} west must be less than east`);
    expect(bounds[1] < bounds[3], `${label} south must be less than north`);
  }
}

function validateScene(sceneId, manifestScene, allTrackIds, allSourceObjectIds) {
  const scenePath = path.join(DATA_DIRECTORY, `${sceneId}.json`);
  const scene = JSON.parse(readFileSync(scenePath, 'utf8'));
  expect(scene.id === sceneId, `${sceneId}: scene.id does not match its filename`);
  expect(Boolean(scene.label), `${sceneId}: label is required`);
  expect(Boolean(scene.description), `${sceneId}: description is required`);
  validateBounds(scene.bounds, `${sceneId}: bounds`);
  expect(scene.terrain?.id === sceneId, `${sceneId}: terrain.id must match scene.id`);
  expect(
    isDeepStrictEqual(scene.terrain?.bounds, scene.bounds),
    `${sceneId}: terrain bounds must equal scene bounds`
  );
  expect(
    Array.isArray(scene.terrain?.elevationRangeMeters) &&
      scene.terrain.elevationRangeMeters.length === 2 &&
      scene.terrain.elevationRangeMeters.every(Number.isFinite) &&
      scene.terrain.elevationRangeMeters[0] < scene.terrain.elevationRangeMeters[1],
    `${sceneId}: terrain elevation range must contain two increasing finite values`
  );
  expect(Array.isArray(scene.tracks) && scene.tracks.length > 0, `${sceneId}: tracks are required`);

  const selectedSourceObjectIds = [];
  let coordinateCount = 0;
  for (const [trackIndex, track] of scene.tracks.entries()) {
    const trackLabel = `${sceneId}: track ${trackIndex + 1}`;
    const expectedTrackId = `${sceneId}-${String(trackIndex + 1).padStart(2, '0')}`;
    expect(track.id === expectedTrackId, `${trackLabel} must have deterministic ID ${expectedTrackId}`);
    expect(!allTrackIds.has(track.id), `${trackLabel} duplicates track ID ${track.id}`);
    allTrackIds.add(track.id);
    expect(Boolean(track.label), `${trackLabel} label is required`);
    expect(ALLOWED_STRUCTURES.has(track.structure), `${trackLabel} has unknown structure class`);
    expect(
      track.gaugeMeters === null || (Number.isFinite(track.gaugeMeters) && track.gaugeMeters > 0),
      `${trackLabel} gaugeMeters must be null or positive`
    );
    expect(
      Object.hasOwn(track, 'sourceClass') &&
        (track.sourceClass === null || typeof track.sourceClass === 'string'),
      `${trackLabel} must declare sourceClass`
    );
    expect(
      Object.hasOwn(track, 'sourceUpdatedAt') &&
        (track.sourceUpdatedAt === null || /^\d{4}-\d{2}-\d{2}$/.test(track.sourceUpdatedAt)),
      `${trackLabel} must declare a null or ISO sourceUpdatedAt date`
    );
    expect(
      track.sourceTrackCount === null ||
        (Number.isInteger(track.sourceTrackCount) && track.sourceTrackCount > 0),
      `${trackLabel} sourceTrackCount must be null or a positive integer`
    );
    expect(
      typeof track.representativeAxis === 'boolean',
      `${trackLabel} representativeAxis must be boolean`
    );
    expect(
      Array.isArray(track.sourceObjectIds) && track.sourceObjectIds.length > 0,
      `${trackLabel} needs at least one source object ID`
    );
    for (const sourceObjectId of track.sourceObjectIds || []) {
      const normalizedId = String(sourceObjectId);
      expect(normalizedId.length > 0, `${trackLabel} has an empty source object ID`);
      expect(
        !allSourceObjectIds.has(normalizedId),
        `${trackLabel} reuses source object ID ${normalizedId}`
      );
      allSourceObjectIds.add(normalizedId);
      selectedSourceObjectIds.push(normalizedId);
    }
    expect(Array.isArray(track.path) && track.path.length >= 2, `${trackLabel} path is too short`);
    coordinateCount += track.path?.length || 0;
    for (const [positionIndex, position] of (track.path || []).entries()) {
      const positionLabel = `${trackLabel} position ${positionIndex + 1}`;
      expect(
        Array.isArray(position) && position.length === 3 && position.every(Number.isFinite),
        `${positionLabel} must be finite XYZ`
      );
      if (!Array.isArray(position) || position.length !== 3 || !position.every(Number.isFinite)) {
        continue;
      }
      expect(
        position[0] >= -180 && position[0] <= 180,
        `${positionLabel} longitude is outside WGS84`
      );
      expect(
        position[1] >= -90 && position[1] <= 90,
        `${positionLabel} latitude is outside WGS84`
      );
      expect(
        position[0] >= scene.bounds[0] &&
          position[0] <= scene.bounds[2] &&
          position[1] >= scene.bounds[1] &&
          position[1] <= scene.bounds[3],
        `${positionLabel} is outside scene bounds`
      );
      expect(
        position[2] >= scene.terrain.elevationRangeMeters[0] &&
          position[2] <= scene.terrain.elevationRangeMeters[1],
        `${positionLabel} elevation is outside the declared terrain range`
      );
      if (positionIndex > 0) {
        expect(
          !position.every((value, index) => value === track.path[positionIndex - 1][index]),
          `${positionLabel} exactly duplicates its predecessor`
        );
      }
    }
  }

  expect(Boolean(manifestScene), `${sceneId}: missing from manifest`);
  if (!manifestScene) {
    return {trackCount: scene.tracks.length, coordinateCount};
  }
  expect(
    isDeepStrictEqual(manifestScene.sourceSelection.railwayObjectIds, selectedSourceObjectIds),
    `${sceneId}: manifest railway selection does not match runtime track order`
  );
  expect(
    isDeepStrictEqual(
      manifestScene.sourceSelection.terrainBoundsLV95,
      TERRAIN_SOURCES[sceneId].sourceBoundsLV95
    ),
    `${sceneId}: manifest terrain source bounds do not match terrain-sources.mjs`
  );
  expect(
    isDeepStrictEqual(manifestScene.sourceSelection.terrainTiles, TERRAIN_SOURCES[sceneId].tiles),
    `${sceneId}: manifest terrain tiles do not match terrain-sources.mjs`
  );
  expect(
    manifestScene.statistics.trackCount === scene.tracks.length,
    `${sceneId}: manifest track count is stale`
  );
  expect(
    manifestScene.statistics.coordinateCount === coordinateCount,
    `${sceneId}: manifest coordinate count is stale`
  );
  expect(
    manifestScene.derivedAssets.terrainElevation.width === 257 &&
      manifestScene.derivedAssets.terrainElevation.height === 257 &&
      manifestScene.derivedAssets.terrainElevation.bitDepth === 8 &&
      manifestScene.derivedAssets.terrainElevation.colorType === 'rgb' &&
      !manifestScene.derivedAssets.terrainElevation.interlaced,
    `${sceneId}: elevation asset must be a non-interlaced 257 x 257 8-bit RGB PNG`
  );
  expect(
    manifestScene.derivedAssets.terrainTexture.width === 512 &&
      manifestScene.derivedAssets.terrainTexture.height === 512 &&
      manifestScene.derivedAssets.terrainTexture.bitDepth === 8 &&
      manifestScene.derivedAssets.terrainTexture.colorType === 'grayscale' &&
      !manifestScene.derivedAssets.terrainTexture.interlaced,
    `${sceneId}: texture asset must be a non-interlaced 512 x 512 8-bit grayscale PNG`
  );
  for (const tile of manifestScene.sourceSelection.terrainTiles) {
    expect(/^[a-f0-9]{64}$/.test(tile.sourceSha256), `${sceneId}: invalid SHA-256 for ${tile.id}`);
    expect(
      tile.url.startsWith('https://data.geo.admin.ch/ch.swisstopo.swissalti3d/'),
      `${sceneId}: ${tile.id} does not use the official swisstopo asset host`
    );
  }
  return {trackCount: scene.tracks.length, coordinateCount};
}

const checkedManifestText = readFileSync(MANIFEST_PATH, 'utf8');
const checkedManifest = JSON.parse(checkedManifestText);
const generatedManifest = createManifest();
expect(
  checkedManifestText === serializeManifest(generatedManifest),
  'manifest.json is stale; run create-manifest.mjs and review the provenance changes'
);
expect(checkedManifest.schemaVersion === 1, 'manifest schemaVersion must be 1');
expect(checkedManifest.deterministic === true, 'manifest must declare deterministic generation');
expect(
  checkedManifest.generatedAt === PROVENANCE_TIMESTAMP &&
    checkedManifest.sources.railway.retrievedAt === PROVENANCE_TIMESTAMP &&
    checkedManifest.sources.terrain.retrievedAt === PROVENANCE_TIMESTAMP &&
    checkedManifest.scenes.every(scene => scene.generatedAt === PROVENANCE_TIMESTAMP),
  'manifest generation and retrieval timestamps must match the fixed provenance timestamp'
);
expect(
  checkedManifest.attribution === 'Source: Federal Office of Topography swisstopo',
  'manifest is missing the prescribed swisstopo attribution'
);
expect(
  checkedManifest.derivedDataNotice ===
    'Derived from Federal Office of Topography swisstopo data.',
  'manifest is missing the derived-data notice'
);
expect(
  isDeepStrictEqual(
    checkedManifest.scenes.map(scene => scene.sceneId),
    SCENE_IDS
  ),
  'manifest scene order does not match the supported scene order'
);
expect(
  isDeepStrictEqual(Object.keys(TERRAIN_SOURCES), SCENE_IDS),
  'terrain-sources.mjs scene order does not match the supported scene order'
);
expect(
  checkedManifest.sources.railway.sourceAsset.stacChecksumMultihash ===
    `1220${checkedManifest.sources.railway.sourceAsset.sha256.toUpperCase()}`,
  'railway STAC multihash does not encode the declared SHA-256'
);

const extractionScript = readFileSync(
  path.join(
    REPOSITORY_DIRECTORY,
    checkedManifest.pipelineFiles.railwayExtraction.path
  ),
  'utf8'
);
const sourceIdPattern =
  /'({[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12}})'/g;
const declaredSourceObjectIds = [...extractionScript.matchAll(sourceIdPattern)].map(
  match => match[1]
);
const manifestSourceObjectIds = checkedManifest.scenes.flatMap(
  scene => scene.sourceSelection.railwayObjectIds
);
expect(
  isDeepStrictEqual(declaredSourceObjectIds, manifestSourceObjectIds),
  'runtime and manifest railway selections do not match extract-scenes.mjs declaration order'
);

const manifestScenes = new Map(checkedManifest.scenes.map(scene => [scene.sceneId, scene]));
const allTrackIds = new Set();
const allSourceObjectIds = new Set();
let trackCount = 0;
let coordinateCount = 0;
for (const sceneId of SCENE_IDS) {
  const counts = validateScene(
    sceneId,
    manifestScenes.get(sceneId),
    allTrackIds,
    allSourceObjectIds
  );
  trackCount += counts.trackCount;
  coordinateCount += counts.coordinateCount;
}

const reportPath = path.join(DATA_DIRECTORY, 'extraction-report.md');
const report = readFileSync(reportPath, 'utf8');
for (const scene of checkedManifest.scenes) {
  expect(
    report.includes(formatReportSummaryRow(scene)),
    `${scene.sceneId}: extraction report summary is stale`
  );
  for (const asset of Object.values(scene.derivedAssets)) {
    expect(
      report.includes(asset.sha256),
      `${scene.sceneId}: extraction report does not record ${asset.path} SHA-256`
    );
  }
  for (const sourceObjectId of scene.sourceSelection.railwayObjectIds) {
    expect(
      report.includes(sourceObjectId),
      `${scene.sceneId}: extraction report does not record source object ${sourceObjectId}`
    );
  }
}

if (failures.length) {
  console.error(`Alpine railway validation failed with ${failures.length} error(s):`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `Validated ${SCENE_IDS.length} scenes, ${trackCount} tracks, ` +
      `${coordinateCount} coordinates, ${SCENE_IDS.length * 2} PNGs, and provenance report`
  );
}
