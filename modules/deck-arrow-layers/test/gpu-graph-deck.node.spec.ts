// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {existsSync, readFileSync} from 'node:fs';

import {
  GPU_GRAPH_DECK_EDGE_SHADER,
  GPU_GRAPH_DECK_NODE_SHADER,
  GPUGraphDeckEffect,
  GPUGraphEdgeLayer,
  GPUGraphNodeLayer
} from '@deck.gl-community/arrow-layers';
import * as experimentalModule from '@luma.gl/experimental';
import * as gpuGraphModule from '@luma.gl/gpgpu/gpu-graph';
import {describe, expect, test} from 'vitest';

import {createGPUGraphExplorerDeck} from '../../../examples/deck/gpu-graph-explorer/app';
import {
  GRAPH_EXPLORER_LINEAR_LAYOUT_VERTEX_COUNT,
  GRAPH_EXPLORER_MAXIMUM_EXACT_VERTEX_COUNT,
  GRAPH_EXPLORER_MAX_VISIBLE_EDGES,
  GRAPH_EXPLORER_POINT_VERTEX_COUNT,
  GRAPH_EXPLORER_SHOWCASE_DEFAULT_VERTEX_COUNT,
  GRAPH_EXPLORER_VERTEX_COUNTS,
  makeGraphExplorerDataset
} from '../../../examples/experimental/gpu-graph-explorer/graph-data';
import {getExampleSupportDefinition} from '../../../examples/example-support-registry';

describe('optional GPU Graph deck.gl integration package isolation', () => {
  test('keeps deck.gl entirely outside graph production imports and dependencies', () => {
    const packageJson = JSON.parse(
      readFileSync(
        new URL('../../../node_modules/@luma.gl/experimental/package.json', import.meta.url),
        'utf8'
      )
    ) as {
      dependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
      optionalDependencies?: Record<string, string>;
    };

    for (const dependencies of [
      packageJson.dependencies,
      packageJson.peerDependencies,
      packageJson.optionalDependencies
    ]) {
      expect(Object.keys(dependencies ?? {}).some(name => name.startsWith('@deck.gl/'))).toBe(
        false
      );
    }
    expect('GPUGraphDeckEffect' in experimentalModule).toBe(false);
    expect('GPUGraphDeckEffect' in gpuGraphModule).toBe(false);
    expect('GPUGraphNodeLayer' in gpuGraphModule).toBe(false);
    expect('GPUGraphEdgeLayer' in gpuGraphModule).toBe(false);
  });

  test('keeps deck.gl and GPU graph dependencies inside the existing private layers package', () => {
    const packageJson = JSON.parse(
      readFileSync(new URL('../package.json', import.meta.url), 'utf8')
    ) as {
      private?: boolean;
      version?: string;
      dependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
    };

    expect(packageJson.private).toBe(true);
    expect(packageJson.dependencies?.['@deck.gl/core']).toContain('9.4.0');
    expect(packageJson.peerDependencies?.['@luma.gl/experimental']).toContain(packageJson.version!);
    expect(packageJson.dependencies?.['@luma.gl/gpgpu']).toContain('10.0.0-alpha.4');
    expect(packageJson.dependencies?.['@luma.gl/tables']).toBeUndefined();
  });

  test('loads deck.gl graph adapters through the private package boundary', () => {
    const exampleSource = readFileSync(
      new URL('../../../examples/deck/gpu-graph-explorer/app.ts', import.meta.url),
      'utf8'
    );

    expect(exampleSource).toContain("from '@deck.gl-community/arrow-layers'");
    expect(exampleSource).not.toContain('@deck.gl-community/gpu-layers');
    expect(exampleSource).not.toContain('@deck.gl/core');
  });

  test('provides a standalone entry without creating an example workspace', () => {
    expect(
      existsSync(new URL('../../../examples/deck/gpu-graph-explorer/index.html', import.meta.url))
    ).toBe(true);
    expect(typeof createGPUGraphExplorerDeck).toBe('function');
    expect(typeof GPUGraphDeckEffect).toBe('function');
  });
});

describe('GPU Graph native deck.gl resident layers', () => {
  test('exposes actual deck.gl node and original-partition edge layer classes', () => {
    expect(GPUGraphNodeLayer.layerName).toBe('GPUGraphNodeLayer');
    expect(GPUGraphEdgeLayer.layerName).toBe('GPUGraphEdgeLayer');

    const dataset = makeGraphExplorerDataset();
    expect(dataset.sourceChunks.map(chunk => chunk.length)).toEqual(
      dataset.targetChunks.map(chunk => chunk.length)
    );
    expect(dataset.sourceChunks).toHaveLength(3);
    expect(dataset.sourceChunks[1]).toHaveLength(0);
    expect(dataset.sourceChunks.filter(chunk => chunk.length > 0)).toHaveLength(2);
  });

  test('fetches actual position vertices, GPU analytics, and stable original picking identifiers', () => {
    expect(GPU_GRAPH_DECK_NODE_SHADER).toContain('@location(0) nodePosition: vec2<f32>');
    expect(GPU_GRAPH_DECK_NODE_SHADER).toContain('importance: array<f32>');
    expect(GPU_GRAPH_DECK_NODE_SHADER).toContain('components: array<u32>');
    expect(GPU_GRAPH_DECK_NODE_SHADER).toContain('communities: array<u32>');
    expect(GPU_GRAPH_DECK_NODE_SHADER).toContain('let label = communities[index]');
    expect(GPU_GRAPH_DECK_NODE_SHADER).toContain('u32(nodeStyle.vertexCount) / 4u');
    expect(GPU_GRAPH_DECK_NODE_SHADER).toContain('min(label / communitySpan, 3u)');
    expect(GPU_GRAPH_DECK_NODE_SHADER).toContain('0.78');
    expect(GPU_GRAPH_DECK_NODE_SHADER).toContain('degrees: array<u32>');
    expect(GPU_GRAPH_DECK_NODE_SHADER).toContain('distances: array<u32>');
    expect(GPU_GRAPH_DECK_NODE_SHADER).toContain('selectionMask: array<u32>');
    expect(GPU_GRAPH_DECK_NODE_SHADER).toContain('vertex + 1u');
    expect(GPU_GRAPH_DECK_NODE_SHADER).toContain('geometry.pickingColor');
    expect(GPU_GRAPH_DECK_NODE_SHADER).not.toMatch(/atomic\s*<\s*f32\s*>/);
  });

  test('shares fourteen genuine graph scales while bounding only work and visible edges', () => {
    expect(GRAPH_EXPLORER_VERTEX_COUNTS).toEqual([
      128, 256, 512, 1024, 2048, 4096, 8192, 16_384, 32_768, 65_536, 131_072, 262_144, 524_288,
      1_048_576
    ]);
    expect(GRAPH_EXPLORER_SHOWCASE_DEFAULT_VERTEX_COUNT).toBe(1024);
    expect(GRAPH_EXPLORER_MAXIMUM_EXACT_VERTEX_COUNT).toBe(512);
    expect(GRAPH_EXPLORER_LINEAR_LAYOUT_VERTEX_COUNT).toBe(16_384);
    expect(GRAPH_EXPLORER_POINT_VERTEX_COUNT).toBe(65_536);
    expect(GRAPH_EXPLORER_MAX_VISIBLE_EDGES).toBe(65_536);

    const effectSource = readFileSync(
      new URL('../src/gpu-graph/gpu-graph-effect.ts', import.meta.url),
      'utf8'
    );
    expect(effectSource).toContain('GPUGraphDegree');
    expect(effectSource).toContain('GPUGraphLabelPropagation');
    expect(effectSource).toContain('GPUGraphSpatialForceLayout');
    expect(effectSource).toContain('addSampledLayoutToGraph');
    expect(effectSource).toContain('this.renderedVertexCount = dataset.vertexCount');
    expect(effectSource).toContain('this.renderedEdgeCount = Math.min');
    expect(effectSource).toMatch(
      /repulsion:\s*this\.activeLayoutMode\s*===\s*'sampled'\s*\?\s*0\.0015\s*:/
    );
    expect(effectSource).toMatch(
      /gravity:\s*this\.activeLayoutMode\s*===\s*'sampled'\s*\?\s*0\.005/
    );
    expect(effectSource).not.toContain('graph-scale-layout');
    expect(effectSource).not.toMatch(/from\s+['"][^'"]*examples\//u);
    expect(effectSource).not.toMatch(/\.readAsync\s*\(/);
  });

  test('creates an actual million-vertex graph without multiplying a representative sample', () => {
    const dataset = makeGraphExplorerDataset(1_048_576);

    expect(dataset.vertexCount).toBe(1_048_576);
    expect(dataset.positions).toHaveLength(2_097_152);
    expect(dataset.velocities).toHaveLength(2_097_152);
    expect(dataset.sourceChunks.map(chunk => chunk.length)).toEqual(
      dataset.targetChunks.map(chunk => chunk.length)
    );
    expect(dataset.sourceChunks[1]).toHaveLength(0);
    expect(dataset.sourceChunks.reduce((count, chunk) => count + chunk.length, 0)).toBe(2_097_343);
  });

  test('rebinds same-ID Deck node and edge models after replacing graph allocations', () => {
    for (const path of [
      '../src/gpu-graph/gpu-graph-node-layer.ts',
      '../src/gpu-graph/gpu-graph-edge-layer.ts'
    ]) {
      const source = readFileSync(new URL(path, import.meta.url), 'utf8');

      expect(source).toMatch(/updateState\s*\(/);
      expect(source).toMatch(/setBindings\s*\(/);
    }
  });

  test('renders accessible graph scale, truthful GPU diagnostics, and real analytic controls', () => {
    const source = [
      '../../../examples/deck/gpu-graph-explorer/app.ts',
      '../../../examples/deck/gpu-graph-explorer/app-ui.ts'
    ]
      .map(path => readFileSync(new URL(path, import.meta.url), 'utf8'))
      .join('\n');

    for (const attribute of [
      'data-gpu-graph-size',
      'data-gpu-graph-size-value',
      'data-gpu-graph-size-decrease',
      'data-gpu-graph-size-increase',
      'data-gpu-graph-layout',
      'data-gpu-graph-color',
      'data-gpu-graph-node-size',
      'data-gpu-graph-edges',
      'data-gpu-graph-depth',
      'data-gpu-graph-pause',
      'data-gpu-graph-legend',
      'data-gpu-graph-fps',
      'data-gpu-graph-encode',
      'data-gpu-graph-memory',
      'data-gpu-graph-index',
      'data-gpu-graph-pipeline'
    ]) {
      expect(source).toContain(attribute);
    }

    for (const mode of ['community', 'component', 'degree', 'pagerank', 'distance']) {
      expect(source).toContain(`value="${mode}"`);
    }

    expect(source).toContain('aria-label="Graph vertex count"');
    expect(source).toContain('role="status"');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain('CPU encode');
    expect(source).toContain('maxVisibleEdges');
    expect(source).toContain('renderedEdgeCount');
    expect(source).toContain('value="sampled"');
    expect(source).not.toContain('@deck.gl/core');
    expect(source).not.toMatch(/GPU\s+(?:frame|execution|duration)\s*[:=]\s*\$\{/i);
  });

  test('disables exact and spatial layout controls at their actual execution boundaries', () => {
    const source = readFileSync(
      new URL('../../../examples/deck/gpu-graph-explorer/app-ui.ts', import.meta.url),
      'utf8'
    );

    expect(source).toContain('option[value="exact"]');
    expect(source).toMatch(
      /exactOption\.disabled\s*=\s*vertexCount\s*>\s*GRAPH_EXPLORER_MAXIMUM_EXACT_VERTEX_COUNT/u
    );
    expect(source).toContain('option[value="spatial"]');
    expect(source).toMatch(
      /spatialOption\.disabled\s*=\s*vertexCount\s*>=\s*GRAPH_EXPLORER_LINEAR_LAYOUT_VERTEX_COUNT/u
    );
  });

  test('reads source and target edge chunks directly without concatenation or CPU staging', () => {
    expect(GPU_GRAPH_DECK_EDGE_SHADER).toContain('sourceVertices: array<u32>');
    expect(GPU_GRAPH_DECK_EDGE_SHADER).toContain('targetVertices: array<u32>');
    expect(GPU_GRAPH_DECK_EDGE_SHADER).toContain('positions: array<vec2<f32>>');

    const effectSource = readFileSync(
      new URL('../src/gpu-graph/gpu-graph-effect.ts', import.meta.url),
      'utf8'
    );
    expect(effectSource).toContain('this.device.commandEncoder');
    expect(effectSource).not.toMatch(/\bdevice\.submit\s*\(/);
    expect(effectSource).not.toMatch(/\.readAsync\s*\(/);
  });
});

describe('GPU Graph standalone example metadata', () => {
  test('declares the WebGPU requirement and documents the standalone entry', () => {
    expect(getExampleSupportDefinition('deck/gpu-graph-explorer')?.requirements?.backends).toEqual([
      'webgpu'
    ]);
    const readme = readFileSync(
      new URL('../../../examples/deck/README.md', import.meta.url),
      'utf8'
    );
    expect(readme).toContain('gpu-graph-explorer');
    expect(readme).toContain('yarn build-private-examples');
  });
});
