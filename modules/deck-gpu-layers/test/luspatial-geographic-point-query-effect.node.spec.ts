// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {readFileSync} from 'node:fs';
import {
  decodeLuSpatialGeographicPointQueryCounters,
  LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_COUNTER_IDS,
  LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_DIAGNOSTIC_BYTE_OFFSETS,
  LuSpatialGeographicPointQueryEffect,
  makeLuSpatialGeographicPointQueryInspectorCounters
} from '@deck.gl-community/gpu-layers/query';
import type {Device} from '@luma.gl/core';
import {describe, expect, test} from 'vitest';

const TEST_QUERY_PROPS = {
  longitudeLatitudes: new Float32Array([-73.99, 40.73]),
  sourceBounds: [-74, 40.72, -73.94, 40.78] as const,
  projectedBounds: [-1, -1, 1, 1] as const,
  projectionOrigin: [-73.97, 40.75] as const
};

describe('LuSpatialGeographicPointQueryEffect resource safety', () => {
  test('releases every completed effect allocation after a mid-construction failure', () => {
    const destroyedResourceIds: string[] = [];
    let bufferCreateCount = 0;
    const device = {
      type: 'webgpu',
      createBuffer: ({id}: {id?: string}) => {
        bufferCreateCount++;
        if (bufferCreateCount === 3) throw new Error('injected buffer allocation failure');
        const resourceId = id ?? `buffer-${bufferCreateCount}`;
        return {
          destroy: () => destroyedResourceIds.push(resourceId)
        };
      }
    } as unknown as Device;
    expect(() => new LuSpatialGeographicPointQueryEffect(device, TEST_QUERY_PROPS)).toThrow(
      'injected buffer allocation failure'
    );
    expect(destroyedResourceIds).toEqual([
      'luspatial-geographic-point-query-effect-projected-positions',
      'luspatial-geographic-point-query-effect-longitude-latitudes'
    ]);
  });

  test('rejects a negative viewport projection pad before allocating resources', () => {
    expect(
      () =>
        new LuSpatialGeographicPointQueryEffect({type: 'webgpu'} as Device, {
          ...TEST_QUERY_PROPS,
          viewportProjectionPaddingKilometres: -1
        })
    ).toThrow('viewportProjectionPaddingKilometres must be a non-negative finite number');
  });

  test('accepts axis-degenerate projected bounds but rejects reversed bounds', () => {
    const allocationSentinel = 'effect validation reached buffer allocation';
    const device = {
      type: 'webgpu',
      createBuffer: () => {
        throw new Error(allocationSentinel);
      }
    } as unknown as Device;

    for (const projectedBounds of [
      [0, -1, 0, 1],
      [0, 0, 0, 0]
    ] as const) {
      expect(
        () =>
          new LuSpatialGeographicPointQueryEffect(device, {
            ...TEST_QUERY_PROPS,
            projectedBounds
          })
      ).toThrow(allocationSentinel);
    }

    expect(
      () =>
        new LuSpatialGeographicPointQueryEffect({type: 'webgpu'} as Device, {
          ...TEST_QUERY_PROPS,
          projectedBounds: [1, -1, 0, 1]
        })
    ).toThrow('projectedBounds minima must not exceed maxima');
  });
});

describe('luSpatial geographic point query telemetry', () => {
  test('decodes aligned GPU diagnostics and publishes a complete inspector sample', () => {
    expect(Object.values(LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_DIAGNOSTIC_BYTE_OFFSETS)).toEqual([
      0, 256, 512, 768
    ]);
    const drawCommandBytes = new Uint8Array(80).subarray(8, 72);
    const viewportInstanceCountByteOffset = 20;
    const selectionInstanceCountByteOffset = 52;
    const drawCommandView = new DataView(
      drawCommandBytes.buffer,
      drawCommandBytes.byteOffset,
      drawCommandBytes.byteLength
    );
    drawCommandView.setUint32(viewportInstanceCountByteOffset, 41, true);
    drawCommandView.setUint32(selectionInstanceCountByteOffset, 7, true);

    const queryDiagnosticByteLength =
      LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_DIAGNOSTIC_BYTE_OFFSETS.selectionCandidateCount +
      Uint32Array.BYTES_PER_ELEMENT;
    const queryDiagnosticBytes = new Uint8Array(queryDiagnosticByteLength + 12).subarray(
      4,
      4 + queryDiagnosticByteLength
    );
    const queryDiagnosticView = new DataView(
      queryDiagnosticBytes.buffer,
      queryDiagnosticBytes.byteOffset,
      queryDiagnosticBytes.byteLength
    );
    queryDiagnosticView.setUint32(
      LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_DIAGNOSTIC_BYTE_OFFSETS.viewportIntersectedCellCount,
      12,
      true
    );
    queryDiagnosticView.setUint32(
      LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_DIAGNOSTIC_BYTE_OFFSETS.viewportCandidateCount,
      83,
      true
    );
    queryDiagnosticView.setUint32(
      LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_DIAGNOSTIC_BYTE_OFFSETS.selectionIntersectedCellCount,
      3,
      true
    );
    queryDiagnosticView.setUint32(
      LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_DIAGNOSTIC_BYTE_OFFSETS.selectionCandidateCount,
      19,
      true
    );

    const counters = decodeLuSpatialGeographicPointQueryCounters(
      drawCommandBytes,
      queryDiagnosticBytes,
      {
        viewportInstanceCountByteOffset,
        selectionInstanceCountByteOffset
      }
    );
    expect(counters).toEqual({
      viewportIntersectedCellCount: 12,
      viewportCandidateCount: 83,
      visiblePointCount: 41,
      selectionIntersectedCellCount: 3,
      selectionCandidateCount: 19,
      selectedPointCount: 7
    });
    expect(makeLuSpatialGeographicPointQueryInspectorCounters(counters)).toEqual({
      [LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_COUNTER_IDS.viewportIntersectedCells]: 12,
      [LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_COUNTER_IDS.viewportCandidates]: 83,
      [LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_COUNTER_IDS.viewportMatches]: 41,
      [LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_COUNTER_IDS.selectionIntersectedCells]: 3,
      [LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_COUNTER_IDS.selectionCandidates]: 19,
      [LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_COUNTER_IDS.selectionMatches]: 7
    });
  });
});

describe('@deck.gl-community/gpu-layers/query package boundary', () => {
  test('publishes ESM, CJS, and declarations without expanding the root export', () => {
    const packageJson = JSON.parse(
      readFileSync(new URL('../package.json', import.meta.url), 'utf8')
    ) as {
      exports?: Record<string, {types?: string; import?: string; require?: string}>;
    };
    expect(packageJson.exports?.['./query']).toEqual({
      types: './dist/query/index.d.ts',
      import: './dist/query/index.js',
      require: './dist/query/index.cjs'
    });
    expect(readFileSync(new URL('../src/index.ts', import.meta.url), 'utf8')).not.toContain(
      'LuSpatialGeographicPointQueryEffect'
    );
  });

  test('uses the public query graph ID in the Taxi inspector', () => {
    const appUiSource = readFileSync(
      new URL('../../../examples/deck/luspatial-taxi/app-ui.ts', import.meta.url),
      'utf8'
    );
    expect(appUiSource).toContain('LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_GRAPH_IDS.query');
    expect(appUiSource).not.toContain("'luspatial-taxi-query-graph'");
  });
});
