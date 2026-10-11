// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {EffectContext} from '@deck.gl/core';
import {
  GPUGraphDeckEffect,
  GPUGraphEdgeLayer,
  GPUGraphNodeLayer
} from '@deck.gl-community/arrow-layers';
import {Buffer} from '@luma.gl/core';
import {ShaderAssembler} from '@luma.gl/shadertools';
import type {GPUVector} from '@luma.gl/gpgpu/gpu-data';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import {expect, it} from 'vitest';
import {vi} from 'vitest';
import {userEvent} from 'vitest/browser';

import {createGPUGraphExplorerDeck} from '../../../examples/deck/gpu-graph-explorer/app';
import {
  getGraphExplorerGridSize,
  GRAPH_EXPLORER_VERTEX_COUNTS,
  makeGraphExplorerDataset
} from '../../../examples/experimental/gpu-graph-explorer/graph-data';
import {addGraphExplorerSampledLayoutToGraph} from '../../../examples/experimental/gpu-graph-explorer/graph-scale-layout';

it('GPU Graph deck.gl effect composes actual GPU analytics, zero-copy selection, and pinned layout', async () => {
  const device = await getWebGPUTestDevice();
  if (!device) {
    void 0;
    void 0;
    return;
  }

  let effect: GPUGraphDeckEffect | undefined;
  const submitSpy = vi.spyOn(device, 'submit');
  try {
    const dataset = makeGraphExplorerDataset();
    effect = new GPUGraphDeckEffect(device, dataset);
    expect(submitSpy.mock.calls.length, 'effect construction never submits hidden GPU work').toBe(
      0
    );
    submitSpy.mockRestore();

    expect(
      effect.graph.sourceVertices.data.map(chunk => chunk.length),
      'original nonempty, empty, and nonempty edge source batches remain intact'
    ).toEqual(dataset.sourceChunks.map(chunk => chunk.length));
    expect(
      effect.positions,
      'Deck nodes consume the exact progressive layout allocation without copying'
    ).toBe(effect.layout.positions.data[0].buffer);
    expect(
      effect.positions.usage & (Buffer.STORAGE | Buffer.VERTEX),
      'shared graph coordinates are simultaneously writable storage and vertex attributes'
    ).toBe(Buffer.STORAGE | Buffer.VERTEX);
    expect(effect.importance, 'PageRank stays resident').toBe(
      effect.pageRank.output.data[0].buffer
    );
    expect(
      effect.componentLabels,
      'weak-component colors read the original GPU output allocation'
    ).toBe(effect.components.output.data[0].buffer);
    expect(
      effect.communityLabels,
      'community colors read real GPU label-propagation outputs, not weak-component aliases'
    ).toBe(effect.communities.output.data[0].buffer);
    expect(
      effect.degreeValues,
      'degree colors and node radii read their original caller-owned GPU output'
    ).toBe(effect.degree.output.data[0].buffer);
    expect(
      effect.selectionMask,
      'Deck highlighting reads source-aligned GPU neighborhood masks'
    ).toBe(effect.search.mask!.data[0].buffer);

    effect.setPinnedVertex(7, true);
    effect.setVertexPosition(7, [0.375, -0.25]);
    effect.setNeighborhoodDepth(2);
    const firstEncoder = device.createCommandEncoder({id: 'gpu-graph-deck-effect-real-analysis'});
    effect.analysisGraph.encode(firstEncoder, {parameters: undefined});
    effect.frameGraph.encode(firstEncoder, {parameters: undefined});
    device.submit(firstEncoder.finish());

    const [
      counts,
      reverseCounts,
      componentLabels,
      communityLabels,
      degrees,
      importance,
      distances,
      mask,
      pins,
      positions
    ] = await Promise.all([
      readUint32Vector(effect.topology.forward.count),
      readUint32Vector(effect.topology.reverse!.count),
      readUint32Vector(effect.components.output),
      readUint32Vector(effect.communities.output),
      readUint32Vector(effect.degree.output),
      readFloat32Vector(effect.pageRank.output),
      readUint32Vector(effect.search.distances),
      readUint32Vector(effect.search.mask!),
      readUint32Vector(effect.layout.pinned!),
      readFloat32Coordinates(effect.layout.positions)
    ]);

    expect(counts[0], 'GPU builds every original forward edge').toBe(effect.graph.edgeCount);
    expect(reverseCounts[0], 'GPU builds exact reverse adjacency').toBe(effect.graph.edgeCount);
    expect(componentLabels[0], 'first weak community keeps its stable source ID').toBe(0);
    expect(componentLabels[32], 'the narrow bridge joins both weak-component halves').toBe(0);
    expect(
      communityLabels[32],
      'actual GPU majority-vote coloring keeps the bridged community separate'
    ).toBe(32);
    expect(
      degrees.reduce((sum, degree) => sum + degree, 0),
      'actual resident vertex degrees account for every original directed edge'
    ).toBe(effect.graph.edgeCount);
    expect(componentLabels[64], 'disconnected component retains its minimum source ID').toBe(64);
    expect(
      componentLabels[effect.graph.vertexCount - 1],
      'isolated node remains its own weak component'
    ).toBe(effect.graph.vertexCount - 1);
    expect(
      Boolean(Math.abs(importance.reduce((sum, score) => sum + score, 0) - 1) < 5e-5),
      'actual GPU PageRank sizing remains normalized'
    ).toBe(true);
    expect(distances[0], 'GPU neighborhood root matches the stable selected vertex').toBe(0);
    expect(mask[0], 'source-aligned mask highlights the selected vertex').toBe(1);
    expect(mask[effect.graph.vertexCount - 1], 'disconnected vertices remain unselected').toBe(0);
    expect(pins[7], 'dragging pins the requested resident vertex row').toBe(1);
    expect(
      Boolean(Math.abs(positions[14] - 0.375) < 1e-6),
      'pinned X survives force integration'
    ).toBe(true);
    expect(
      Boolean(Math.abs(positions[15] + 0.25) < 1e-6),
      'pinned Y survives force integration'
    ).toBe(true);

    effect.setSelectedVertex(64);
    effect.setNeighborhoodDepth(1);
    const secondEncoder = device.createCommandEncoder({id: 'gpu-graph-deck-effect-selected-root'});
    effect.frameGraph.encode(secondEncoder, {parameters: undefined});
    device.submit(secondEncoder.finish());
    const [updatedDistances, updatedMask] = await Promise.all([
      readUint32Vector(effect.search.distances),
      readUint32Vector(effect.search.mask!)
    ]);
    expect(updatedDistances[64], 'newly picked stable source ID becomes the GPU root').toBe(0);
    expect(updatedMask[64], 'new root directly updates the Deck highlight buffer').toBe(1);
    expect(updatedMask[0], 'unrelated components stop receiving selection highlights').toBe(0);
  } finally {
    submitSpy.mockRestore();
    effect?.cleanup({} as EffectContext);
  }

  void 0;
});

it('GPU Graph Deck effect executes real spatial indexing and community analytics on a bounded fixture', async () => {
  const device = await getWebGPUTestDevice();
  if (!device) {
    void 0;
    void 0;
    return;
  }

  const dataset = makeGraphExplorerDataset(32);
  let effect: GPUGraphDeckEffect | undefined;
  const submitSpy = vi.spyOn(device, 'submit');
  try {
    effect = new GPUGraphDeckEffect(device, dataset, {
      layoutMode: 'spatial',
      addSampledLayoutToGraph: addGraphExplorerSampledLayoutToGraph
    });
    expect(submitSpy.mock.calls.length, 'spatial graph construction never submits').toBe(0);
    submitSpy.mockRestore();
    expect(effect.activeLayoutMode, 'small fixtures can force real acceleration').toBe('spatial');
    expect(
      Boolean(effect.spatialLayout),
      'the effect owns an actual GPU spatial layout contributor'
    ).toBe(true);
    if (!effect.spatialLayout) throw new Error('The Deck showcase did not create its spatial grid');

    expect(
      effect.spatialLayout.gridSize,
      'grid dimensions use the shared bounded scalable graph policy'
    ).toEqual(getGraphExplorerGridSize(dataset.vertexCount));
    expect(
      effect.spatialLayout.vertexIds.length,
      'the caller-owned vertex index capacity covers every original vertex'
    ).toBe(dataset.vertexCount);
    expect(
      effect.graph.sourceVertices.data.map(chunk => chunk.length === 0),
      'the real spatial workflow never concatenates original GPU edge batches'
    ).toEqual([false, true, false]);

    const positionsReadSpy = vi.spyOn(effect.positions, 'readAsync');
    try {
      const encoder = device.createCommandEncoder({id: 'gpu-graph-deck-real-spatial-showcase'});
      effect.analysisGraph.encode(encoder, {parameters: undefined});
      effect.frameGraph.encode(encoder, {parameters: undefined});
      device.submit(encoder.finish());

      const [indexCount, indexOverflow, offsets, weakComponents, communityLabels, degrees] =
        await Promise.all([
          readUint32Vector(effect.spatialLayout.count),
          readUint32Vector(effect.spatialLayout.overflow),
          readUint32Vector(effect.spatialLayout.cellOffsets),
          readUint32Vector(effect.components.output),
          readUint32Vector(effect.communities.output),
          readUint32Vector(effect.degree.output)
        ]);

      expect(indexCount[0], 'GPU grid accepts every bounded vertex').toBe(dataset.vertexCount);
      expect(indexOverflow[0], 'the explicit GPU grid capacity does not overflow').toBe(0);
      expect(offsets.at(-1), 'real GPU cell scan accounts for every row').toBe(dataset.vertexCount);
      expect(weakComponents[8], 'the weak component crosses the actual source bridge').toBe(0);
      expect(communityLabels[8], 'majority-vote communities remain genuinely distinct').toBe(8);
      expect(
        degrees.reduce((sum, degree) => sum + degree, 0),
        'real graph degrees remain exact in spatial layout mode'
      ).toBe(effect.graph.edgeCount);
      expect(
        positionsReadSpy.mock.calls.length,
        'grid construction and coloring never download render positions'
      ).toBe(0);
    } finally {
      positionsReadSpy.mockRestore();
    }
  } finally {
    submitSpy.mockRestore();
    effect?.cleanup({} as EffectContext);
  }

  void 0;
});

it('GPU Graph Deck preserves every original GPU vertex and edge while sampling only forces and visible edges', async () => {
  const device = await getWebGPUTestDevice();
  if (!device) {
    void 0;
    void 0;
    return;
  }

  const dataset = makeGraphExplorerDataset(32);
  let effect: GPUGraphDeckEffect | undefined;
  try {
    effect = new GPUGraphDeckEffect(device, dataset, {
      layoutMode: 'sampled',
      pointMode: true,
      maxVisibleEdges: 4,
      addSampledLayoutToGraph: addGraphExplorerSampledLayoutToGraph
    });
    expect(effect.activeLayoutMode, 'the actual four-sample force path is selected').toBe(
      'sampled'
    );
    expect(
      effect.layout.repulsion,
      'four-sample GPU repulsion stays population-independent instead of collapsing at scale'
    ).toBe(0.0015);
    expect(
      effect.layout.gravity,
      'bounded sampled gravity preserves visible source communities'
    ).toBe(0.005);
    expect(effect.renderMode, 'full-population point rendering is selectable').toBe('points');
    expect(effect.renderedVertexCount, 'every original graph vertex remains rendered').toBe(32);
    expect(effect.renderedEdgeCount, 'only visible original edge instances are capped').toBe(4);
    expect(
      Boolean(effect.graph.edgeCount > effect.renderedEdgeCount),
      'the complete edge graph stays resident'
    ).toBe(true);
    expect(effect.spatialLayout, 'sampled forces do not pretend to build a flat grid').toBe(
      undefined
    );
    expect(
      Boolean(effect.searchGraph),
      'sampled-layout selection has a separately schedulable real BFS'
    ).toBe(true);
    expect(
      effect.graph.sourceVertices.data.map(chunk => chunk.length === 0),
      'edge-only visual detail preserves every original GPU source partition'
    ).toEqual([false, true, false]);

    const positionsReadSpy = vi.spyOn(effect.positions, 'readAsync');
    try {
      const encoder = device.createCommandEncoder({id: 'gpu-graph-deck-real-sampled-point-layout'});
      effect.analysisGraph.encode(encoder, {parameters: undefined});
      effect.searchGraph!.encode(encoder, {parameters: undefined});
      effect.frameGraph.encode(encoder, {parameters: undefined});
      device.submit(encoder.finish());

      const [forward, reverse, degrees, components, communities, importance, distances] =
        await Promise.all([
          readUint32Vector(effect.topology.forward.count),
          readUint32Vector(effect.topology.reverse!.count),
          readUint32Vector(effect.degree.output),
          readUint32Vector(effect.components.output),
          readUint32Vector(effect.communities.output),
          readFloat32Vector(effect.pageRank.output),
          readUint32Vector(effect.search.distances)
        ]);
      expect(forward[0], 'sampled layout retains every forward edge').toBe(effect.graph.edgeCount);
      expect(reverse[0], 'sampled layout retains every reverse edge').toBe(effect.graph.edgeCount);
      expect(
        degrees.reduce((sum, degree) => sum + degree, 0),
        'complete GPU degree accounting is independent of the edge-only render limit'
      ).toBe(effect.graph.edgeCount);
      expect(components[8], 'full-graph weak components still cross the source bridge').toBe(0);
      expect(communities[8], 'full-graph majority labels retain a distinct community').toBe(8);
      expect(
        Boolean(Math.abs(importance.reduce((sum, score) => sum + score, 0) - 1) < 5e-5),
        'full-graph GPU PageRank remains normalized in sampled force mode'
      ).toBe(true);
      expect(distances[0], 'independently scheduled BFS resolves the actual selection').toBe(0);
      expect(
        positionsReadSpy.mock.calls.length,
        'sampled forces, analytics, and points never read resident positions back'
      ).toBe(0);
    } finally {
      positionsReadSpy.mockRestore();
    }
  } finally {
    effect?.cleanup({} as EffectContext);
  }

  void 0;
});

it('GPU Graph deck.gl renders real source-chunk layers and asynchronously picks stable GPU node IDs', async () => {
  const device = await getWebGPUTestDevice('core');
  if (!device) {
    void 0;
    void 0;
    return;
  }

  const canvasContext = device.getDefaultCanvasContext();
  const canvas = canvasContext.canvas;
  if (!(canvas instanceof HTMLCanvasElement)) {
    expect(false, 'real deck.gl integration requires an HTML canvas presentation surface').toBe(
      true
    );
    void 0;
    return;
  }

  const originalParent = canvas.parentNode;
  const originalNextSibling = canvas.nextSibling;
  const originalWidth = canvas.width;
  const originalHeight = canvas.height;
  const originalStyle = canvas.getAttribute('style');
  const originalDrawingBufferSize = canvasContext.getDrawingBufferSize();
  const container = document.createElement('div');
  Object.assign(container.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    width: '320px',
    height: '240px',
    overflow: 'hidden'
  });
  document.body.appendChild(container);
  container.appendChild(canvas);
  canvas.width = 320;
  canvas.height = 240;
  canvas.style.width = '320px';
  canvas.style.height = '240px';
  canvasContext.setDrawingBufferSize(320, 240);

  const framebuffer = device.createFramebuffer({
    id: 'gpu-graph-deck-presentation-test-framebuffer',
    width: 320,
    height: 240,
    colorAttachments: [device.preferredColorFormat],
    depthStencilAttachment: 'depth24plus'
  });
  // Shared SwiftShader suites can outlive Dawn's external presentation instance. Retain the real
  // Deck render pass, layer pipelines, queue submission, and native GPU picking on an owned target.
  const currentFramebuffer = vi
    .spyOn(canvasContext, 'getCurrentFramebuffer')
    .mockReturnValue(framebuffer);
  let deck: ReturnType<typeof createGPUGraphExplorerDeck> | undefined;
  const originalShaderAssembler = ShaderAssembler.getDefaultShaderAssembler;
  try {
    deck = createGPUGraphExplorerDeck(container, {
      device,
      dataset: makeGraphExplorerDataset(8),
      layoutMode: 'sampled',
      pointMode: true,
      maxVisibleEdges: 4
    });
    deck.setProps({_animate: false});
    await waitForDeckEffect(deck);
    expect(
      ShaderAssembler.getDefaultShaderAssembler,
      'the real application restores luma.gl shader-assembler isolation before Deck is ready'
    ).toBe(originalShaderAssembler);

    const effect = deck.props.effects?.[0];
    expect(
      Boolean(effect instanceof GPUGraphDeckEffect),
      'actual Deck owns a real resident graph effect'
    ).toBe(true);
    if (!(effect instanceof GPUGraphDeckEffect)) {
      throw new Error('Deck did not initialize its GPU Graph WebGPU effect');
    }

    const graphScale = container.querySelector<HTMLInputElement>('[data-gpu-graph-size]');
    const decreaseGraphScale = container.querySelector<HTMLButtonElement>(
      '[data-gpu-graph-size-decrease]'
    );
    const increaseGraphScale = container.querySelector<HTMLButtonElement>(
      '[data-gpu-graph-size-increase]'
    );
    const layoutMode = container.querySelector<HTMLSelectElement>('[data-gpu-graph-layout]');
    const colorMode = container.querySelector<HTMLSelectElement>('[data-gpu-graph-color]');
    const nodeSize = container.querySelector<HTMLSelectElement>('[data-gpu-graph-node-size]');
    const legend = container.querySelector<HTMLElement>('[data-gpu-graph-legend]');
    const status = container.querySelector<HTMLElement>('[role="status"]');
    expect(Boolean(graphScale), 'Deck publishes an accessible graph-size slider').toBe(true);
    expect(
      Boolean(decreaseGraphScale),
      'a real accessible decrease action complements native dragging'
    ).toBe(true);
    expect(
      Boolean(increaseGraphScale),
      'a real accessible increase action complements native dragging'
    ).toBe(true);
    expect(graphScale?.type, 'Deck graph population is keyboard adjustable').toBe('range');
    expect(graphScale?.min, 'the first graph-size step represents 128 vertices').toBe('0');
    expect(graphScale?.max, 'all fourteen actual graph populations remain selectable').toBe(
      String(GRAPH_EXPLORER_VERTEX_COUNTS.length - 1)
    );
    expect(
      GRAPH_EXPLORER_VERTEX_COUNTS.at(-1),
      'the final population is 1,048,576 actual resident vertices'
    ).toBe(1_048_576);
    expect(
      Boolean(layoutMode),
      'actual exact, spatial, and sampled force modes are selectable'
    ).toBe(true);
    expect(Boolean(colorMode), 'actual GPU community and analytics colors are selectable').toBe(
      true
    );
    expect(Boolean(nodeSize), 'actual GPU PageRank and degree node sizes are selectable').toBe(
      true
    );
    expect(
      Boolean(legend),
      'a real visible legend explains GPU community and selection colors'
    ).toBe(true);
    expect(
      Array.from(layoutMode?.options ?? [], option => option.value),
      'Deck layout options correspond to actual exact, flat-grid, and linear-work GPU paths'
    ).toEqual(['auto', 'exact', 'spatial', 'sampled']);
    expect(
      Array.from(colorMode?.options ?? [], option => option.value),
      'Deck color choices bind real resident analytic buffers'
    ).toEqual(['community', 'component', 'degree', 'pagerank', 'distance']);
    expect(
      Array.from(nodeSize?.options ?? [], option => option.value),
      'Deck node radii consume actual GPU PageRank or degree results'
    ).toEqual(['pagerank', 'degree', 'uniform']);
    expect(status?.getAttribute('aria-live'), 'live status is screen-reader safe').toBe('polite');

    const layers = deck.props.layers ?? [];
    const edgeLayers = layers.filter(layer => layer instanceof GPUGraphEdgeLayer);
    const nodeLayer = layers.find(layer => layer instanceof GPUGraphNodeLayer);
    expect(
      edgeLayers.length,
      'Deck creates exactly one layer per original nonempty edge chunk'
    ).toBe(2);
    expect(
      edgeLayers.map(layer => layer.id),
      'the empty source batch is preserved and not rendered or concatenated'
    ).toEqual(['gpu-graph-edges-0', 'gpu-graph-edges-2']);
    expect(
      Boolean(nodeLayer instanceof GPUGraphNodeLayer),
      'Deck instantiates the actual custom node layer'
    ).toBe(true);
    if (!(nodeLayer instanceof GPUGraphNodeLayer)) {
      throw new Error('Deck did not initialize its GPU Graph node layer');
    }
    expect(
      nodeLayer.getNumInstances(),
      'Deck renders every original GPU point despite the empty CPU data array'
    ).toBe(effect.graph.vertexCount);
    expect(effect.activeLayoutMode, 'Deck executes the actual linear force path').toBe('sampled');
    expect(effect.renderMode, 'Deck renders genuine one-vertex GPU point instances').toBe('points');
    expect(effect.renderedVertexCount, 'point mode never samples the graph population').toBe(8);
    expect(effect.renderedEdgeCount, 'only rendered original edge rows are bounded').toBe(4);
    expect(nodeLayer.props.pointMode, 'the actual Deck node layer receives point mode').toBe(true);
    expect(
      edgeLayers.map(layer => layer.getNumInstances()),
      'the truthful edge-only cap preserves both original source chunks without packing'
    ).toEqual([2, 2]);
    expect(nodeLayer.props.positions, 'node attributes share exact GPU layout storage').toBe(
      effect.positions
    );
    expect(
      edgeLayers[0].props.sourceVertices,
      'first edge model binds its original caller-owned source allocation'
    ).toBe(effect.graph.sourceVertices.data[0].buffer);
    expect(
      edgeLayers[1].props.sourceVertices,
      'second edge model binds the untouched third source partition'
    ).toBe(effect.graph.sourceVertices.data[2].buffer);

    await waitForDeckLayerModels([nodeLayer, ...edgeLayers]);
    effect.setPinnedVertex(0, true);
    effect.setVertexPosition(0, [0, 0]);
    const positionsReadSpy = vi.spyOn(effect.positions, 'readAsync');
    const importanceReadSpy = vi.spyOn(effect.importance, 'readAsync');
    const submitSpy = vi.spyOn(device, 'submit');
    try {
      deck.redraw('real WebGPU GPU Graph deck rendering and picking regression');
      expect(
        Boolean(currentFramebuffer.mock.calls.length > 0),
        'real Deck rendering targets an owned WebGPU framebuffer instead of a stale surface'
      ).toBe(true);
      expect(
        Boolean(submitSpy.mock.calls.length > 0),
        'real Deck layer passes submit GPU commands'
      ).toBe(true);
      expect(
        Boolean(nodeLayer.getModels()[0]?.pipeline),
        'actual node WGSL and vertex pipeline compile'
      ).toBe(true);
      expect(
        nodeLayer.getModels()[0]?.topology,
        'the real GPU pipeline renders one actual point for every source vertex'
      ).toBe('point-list');
      expect(
        nodeLayer.getModels()[0]?.vertexCount,
        'point mode emits one vertex per original resident node instance'
      ).toBe(1);
      for (const edgeLayer of edgeLayers) {
        expect(
          Boolean(edgeLayer.getModels()[0]?.pipeline),
          'actual original-chunk edge WGSL pipeline compiles'
        ).toBe(true);
      }

      const projectedOrigin = deck.getViewports()[0].project([0, 0, 0]);
      const pick = await deck.pickObjectAsync({
        x: Math.floor(projectedOrigin[0]),
        y: Math.floor(projectedOrigin[1]),
        radius: 3,
        layerIds: ['gpu-graph-nodes']
      });

      expect(
        Boolean(deck.width > 1 && deck.height > 1),
        'Deck uses a real multi-pixel viewport'
      ).toBe(true);
      expect(
        pick?.index,
        'real asynchronous WebGPU Deck picking recovers stable source ID zero'
      ).toBe(0);
      expect(pick?.layer?.id, 'GPU picking identifies the actual node layer').toBe(
        'gpu-graph-nodes'
      );
      expect(
        positionsReadSpy.mock.calls.length,
        'normal rendering and explicit Deck picking never read graph positions back'
      ).toBe(0);
      expect(
        importanceReadSpy.mock.calls.length,
        'node sizing and picking never download GPU PageRank scores'
      ).toBe(0);

      if (!graphScale) throw new Error('Deck did not mount its accessible graph-size slider');
      const previousPositions = effect.positions;
      graphScale.value = '0';
      graphScale.dispatchEvent(new Event('input', {bubbles: true}));
      expect(
        graphScale.value,
        'dragging the graph-size thumb immediately retains the requested resident graph'
      ).toBe('0');

      // A real Effect publishes diagnostics every tenth frame. Previously its HUD refresh reset
      // the pending thumb to the old graph, so the debounce silently rebuilt nothing.
      for (let frame = 0; frame < 10; frame++) {
        deck.redraw('real GPU diagnostics must not discard a pending graph-size selection');
      }
      expect(
        graphScale.value,
        'real GPU statistics never snap a dragging graph-size thumb back to its old value'
      ).toBe('0');
      expect(
        container.querySelector('[data-gpu-graph-size-value]')?.textContent,
        'the pending graph population remains visible while resident metrics update'
      ).toBe('128');
      graphScale.focus();
      await userEvent.keyboard('{ArrowRight}');
      expect(
        graphScale.value,
        'a genuine trusted keyboard arrow advances the accessible real graph-size slider'
      ).toBe('1');
      await waitForReplacementDeckEffect(deck, effect, 256);
      const resizedEffect = deck.props.effects?.[0];
      if (!(resizedEffect instanceof GPUGraphDeckEffect)) {
        throw new Error('The real Deck graph slider did not replace its GPU effect');
      }
      expect(
        resizedEffect.graph.vertexCount,
        'trusted keyboard input rebuilds the actual GPU graph'
      ).toBe(256);
      expect(resizedEffect.renderedVertexCount, 'all resized GPU vertices remain rendered').toBe(
        256
      );
      expect(
        resizedEffect.renderedEdgeCount,
        'only resized visible edge instances stay capped'
      ).toBe(4);
      expect(resizedEffect.activeLayoutMode, 'the actual selected force survives resize').toBe(
        'sampled'
      );
      expect(resizedEffect.renderMode, 'actual all-vertex point mode survives resize').toBe(
        'points'
      );
      expect(
        resizedEffect.positions,
        'resized Deck models use fresh caller-owned render positions'
      ).not.toBe(previousPositions);
      expect(
        resizedEffect.graph.sourceVertices.data.map(chunk => chunk.length === 0),
        'resizing preserves nonempty, empty, and nonempty original edge chunks'
      ).toEqual([false, true, false]);

      const resizedLayers = deck.props.layers ?? [];
      const resizedNodeLayer = resizedLayers.find(layer => layer instanceof GPUGraphNodeLayer);
      const resizedEdgeLayers = resizedLayers.filter(layer => layer instanceof GPUGraphEdgeLayer);
      if (!(resizedNodeLayer instanceof GPUGraphNodeLayer)) {
        throw new Error('The resized Deck showcase lost its real node layer');
      }
      await waitForDeckLayerModels([resizedNodeLayer, ...resizedEdgeLayers]);
      expect(resizedNodeLayer.id, 'the original node-layer identity stays stable').toBe(
        'gpu-graph-nodes'
      );
      expect(
        resizedNodeLayer.getNumInstances(),
        'same-ID Deck node instances track their rebuilt GPU allocation'
      ).toBe(256);
      expect(
        resizedNodeLayer.props.positions,
        'same-ID Deck node models rebind their new resident vertex attribute'
      ).toBe(resizedEffect.positions);
      expect(
        resizedNodeLayer.props.communities,
        'same-ID Deck models bind genuine resized GPU community labels'
      ).toBe(resizedEffect.communityLabels);
      expect(
        resizedNodeLayer.props.degrees,
        'same-ID Deck models bind genuine resized GPU vertex degrees'
      ).toBe(resizedEffect.degreeValues);
      expect(
        resizedEdgeLayers.map(layer => layer.id),
        'same-ID edge layers preserve every original source partition after resizing'
      ).toEqual(['gpu-graph-edges-0', 'gpu-graph-edges-2']);
      expect(
        resizedEdgeLayers.map(layer => layer.getNumInstances()),
        'both rebuilt source partitions retain only their truthful visible edge allocation'
      ).toEqual([2, 2]);
      for (const [index, edgeLayer] of resizedEdgeLayers.entries()) {
        const chunkIndex = index === 0 ? 0 : 2;
        expect(
          edgeLayer.props.sourceVertices,
          'same-ID edge models rebind their rebuilt original GPU source allocation'
        ).toBe(resizedEffect.graph.sourceVertices.data[chunkIndex].buffer);
      }

      resizedEffect.setPinnedVertex(0, true);
      resizedEffect.setVertexPosition(0, [0, 0]);
      deck.redraw('rebuilt GPU Graph Deck models must render from new physical allocations');
      const [resizedComponents, resizedCommunities, resizedDegrees] = await Promise.all([
        readUint32Vector(resizedEffect.components.output),
        readUint32Vector(resizedEffect.communities.output),
        readUint32Vector(resizedEffect.degree.output)
      ]);
      expect(resizedComponents[64], 'resized weak components retain the source bridge').toBe(0);
      expect(
        resizedCommunities[64],
        'resized real GPU label propagation keeps a separate community'
      ).toBe(64);
      expect(
        resizedDegrees.reduce((sum, degree) => sum + degree, 0),
        'resized node-degree visualizations consume actual GPU results'
      ).toBe(resizedEffect.graph.edgeCount);

      const rebuiltOrigin = deck.getViewports()[0].project([0, 0, 0]);
      const resizedPick = await deck.pickObjectAsync({
        x: Math.floor(rebuiltOrigin[0]),
        y: Math.floor(rebuiltOrigin[1]),
        radius: 3,
        layerIds: ['gpu-graph-nodes']
      });
      expect(
        resizedPick?.index,
        'native asynchronous GPU picking still resolves stable IDs after graph resizing'
      ).toBe(0);
      expect(
        resizedPick?.layer?.id,
        'native picking retains the original node-layer identity after rebuilding'
      ).toBe('gpu-graph-nodes');

      // Exercise a genuine fresh keyboard interaction without synthesizing an `input` event or
      // retaining pending slider state. Deck must never consume native range-control arrow keys.
      expect(graphScale.value, 'the settled actual graph population owns slider step one').toBe(
        '1'
      );
      expect(graphScale.disabled, 'the settled graph slider accepts real user input').toBe(false);
      graphScale.focus();
      await userEvent.keyboard('{ArrowRight}');
      expect(
        graphScale.value,
        'a trusted ArrowRight changes a pristine slider without synthetic pending state'
      ).toBe('2');
      await waitForReplacementDeckEffect(deck, resizedEffect, 512);
      const keyboardEffect = deck.props.effects?.[0];
      if (!(keyboardEffect instanceof GPUGraphDeckEffect)) {
        throw new Error('A genuine keyboard action did not rebuild the actual WebGPU graph');
      }
      expect(
        keyboardEffect.graph.vertexCount,
        'a pristine trusted keyboard action rebuilds all 512 actual GPU graph vertices'
      ).toBe(512);
      expect(
        keyboardEffect.renderedVertexCount,
        'fresh slider interaction preserves full real point population'
      ).toBe(512);
      expect(
        keyboardEffect.renderedEdgeCount,
        'fresh slider interaction still limits only displayed original edge instances'
      ).toBe(4);
      const keyboardNodeLayer = (deck.props.layers ?? []).find(
        layer => layer instanceof GPUGraphNodeLayer
      );
      const keyboardEdgeLayers = (deck.props.layers ?? []).filter(
        layer => layer instanceof GPUGraphEdgeLayer
      );
      if (!(keyboardNodeLayer instanceof GPUGraphNodeLayer)) {
        throw new Error('A real trusted keyboard resize lost the Deck point layer');
      }
      await waitForDeckLayerModels([keyboardNodeLayer, ...keyboardEdgeLayers]);
      expect(
        keyboardNodeLayer.getNumInstances(),
        'the same-ID GPU point layer consumes every freshly resized original vertex'
      ).toBe(512);
      expect(
        keyboardEdgeLayers.map(layer => layer.getNumInstances()),
        'both original source partitions survive genuine keyboard-only graph resizing'
      ).toEqual([2, 2]);

      // Pointer interaction must work from settled state too; use Playwright's trusted native
      // click at the beginning of the range instead of assigning or dispatching DOM values.
      const sliderBounds = graphScale.getBoundingClientRect();
      await userEvent.click(graphScale, {
        position: {x: 1, y: Math.max(1, Math.floor(sliderBounds.height / 2))}
      });
      expect(
        graphScale.value,
        'a genuine trusted pointer click changes a pristine graph-size range control'
      ).toBe('0');
      await waitForReplacementDeckEffect(deck, keyboardEffect, 128);
      const pointerEffect = deck.props.effects?.[0];
      if (!(pointerEffect instanceof GPUGraphDeckEffect)) {
        throw new Error('A genuine pointer click did not rebuild the actual WebGPU graph');
      }
      expect(
        pointerEffect.graph.vertexCount,
        'a trusted native pointer click rebuilds every original resident vertex'
      ).toBe(128);
      expect(pointerEffect.renderedVertexCount, 'pointer resizing never samples vertices').toBe(
        128
      );
      expect(pointerEffect.renderedEdgeCount, 'pointer resizing limits only visible edges').toBe(4);
      const pointerLayers = (deck.props.layers ?? []).filter(
        (layer): layer is GPUGraphNodeLayer | GPUGraphEdgeLayer =>
          layer instanceof GPUGraphNodeLayer || layer instanceof GPUGraphEdgeLayer
      );
      await waitForDeckLayerModels(pointerLayers);
      expect(
        Boolean(!/GPU\s+(?:frame|execution|duration)\s*[:=]\s*\d/i.test(status?.textContent ?? '')),
        'the Deck dashboard never invents GPU timing or convergence samples'
      ).toBe(true);
    } finally {
      positionsReadSpy.mockRestore();
      importanceReadSpy.mockRestore();
      submitSpy.mockRestore();
    }
  } finally {
    deck?.finalize();
    currentFramebuffer.mockRestore();
    framebuffer.destroy();
    canvas.width = originalWidth;
    canvas.height = originalHeight;
    if (originalStyle === null) canvas.removeAttribute('style');
    else canvas.setAttribute('style', originalStyle);
    canvasContext.setDrawingBufferSize(originalDrawingBufferSize[0], originalDrawingBufferSize[1]);
    if (originalParent) {
      originalParent.insertBefore(canvas, originalNextSibling);
    } else {
      canvas.remove();
    }
    container.remove();
  }

  expect(
    ShaderAssembler.getDefaultShaderAssembler,
    'finalizing the real Deck application never leaves a global shader-assembler override'
  ).toBe(originalShaderAssembler);

  void 0;
});

async function waitForDeckEffect(
  deck: ReturnType<typeof createGPUGraphExplorerDeck>
): Promise<void> {
  const deadline = performance.now() + 5_000;
  while (!(deck.props.effects?.[0] instanceof GPUGraphDeckEffect)) {
    if (performance.now() >= deadline) {
      throw new Error('The real WebGPU Deck did not finish initializing its GPU Graph effect');
    }
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
  }
}

async function waitForReplacementDeckEffect(
  deck: ReturnType<typeof createGPUGraphExplorerDeck>,
  previous: GPUGraphDeckEffect,
  expectedVertexCount: number
): Promise<void> {
  const deadline = performance.now() + 5_000;
  while (
    !(deck.props.effects?.[0] instanceof GPUGraphDeckEffect) ||
    deck.props.effects[0] === previous ||
    // An intermediate debounced resize may finish while trusted keyboard input is delivered.
    deck.props.effects[0].graph.vertexCount !== expectedVertexCount
  ) {
    if (performance.now() >= deadline) {
      throw new Error('The real Deck graph-size slider did not replace its resident GPU effect');
    }
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
  }
}

async function waitForDeckLayerModels(
  layers: Array<GPUGraphNodeLayer | GPUGraphEdgeLayer>
): Promise<void> {
  const deadline = performance.now() + 5_000;
  while (layers.some(layer => !getDeckLayerModelState(layer)?.pipeline)) {
    if (performance.now() >= deadline) {
      throw new Error('The real WebGPU Deck did not initialize its graph node and edge models');
    }
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
  }
  while (layers.some(layer => getDeckLayerModelState(layer)?.pipeline?.linkStatus === 'pending')) {
    if (performance.now() >= deadline) {
      throw new Error('The real WebGPU graph node and edge pipelines did not finish linking');
    }
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
  }
  for (const layer of layers) {
    if (getDeckLayerModelState(layer)?.pipeline?.linkStatus !== 'success') {
      throw new Error(`The real WebGPU ${layer.id} graph pipeline failed to link`);
    }
  }
}

function getDeckLayerModelState(
  layer: GPUGraphNodeLayer | GPUGraphEdgeLayer
): {pipeline?: {linkStatus?: string}} | undefined {
  return (layer as unknown as {state?: {model?: {pipeline?: {linkStatus?: string}}}}).state?.model;
}

async function readUint32Vector(vector: GPUVector<'uint32'>): Promise<number[]> {
  const chunk = vector.data[0];
  const bytes = await (chunk.buffer as Buffer).readAsync(chunk.byteOffset, vector.length * 4);
  return Array.from(new Uint32Array(bytes.buffer, bytes.byteOffset, vector.length));
}

async function readFloat32Vector(vector: GPUVector<'float32'>): Promise<number[]> {
  const chunk = vector.data[0];
  const bytes = await (chunk.buffer as Buffer).readAsync(chunk.byteOffset, vector.length * 4);
  return Array.from(new Float32Array(bytes.buffer, bytes.byteOffset, vector.length));
}

async function readFloat32Coordinates(vector: GPUVector<'float32x2'>): Promise<number[]> {
  const chunk = vector.data[0];
  const bytes = await (chunk.buffer as Buffer).readAsync(chunk.byteOffset, vector.length * 8);
  return Array.from(new Float32Array(bytes.buffer, bytes.byteOffset, vector.length * 2));
}
