// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {
  GPUGraphDeckEffect,
  GPUGraphEdgeLayer,
  GPUGraphNodeLayer,
  OrthographicView,
  type GPUGraphDeckEffectStats,
  type PickingInfo
} from '@deck.gl-community/arrow-layers';
import {Buffer, type Device} from '@luma.gl/core';
import {ArrowDeck} from '../arrow-deck';
import {getDeckExampleProps, type DeckExampleDeviceOptions} from '../deck-example-device';
import {
  GRAPH_EXPLORER_LINEAR_LAYOUT_VERTEX_COUNT,
  GRAPH_EXPLORER_MAX_VISIBLE_EDGES,
  GRAPH_EXPLORER_SHOWCASE_DEFAULT_VERTEX_COUNT,
  makeGraphExplorerDataset,
  type GraphExplorerColorMode,
  type GraphExplorerDataset,
  type GraphExplorerLayoutMode,
  type GraphExplorerNodeSizeMode
} from '../../experimental/gpu-graph-explorer/graph-data';
import {addGraphExplorerSampledLayoutToGraph} from '../../experimental/gpu-graph-explorer/graph-scale-layout';
import {
  createExplorerControls,
  createStandaloneContainer,
  DEFAULT_NEIGHBORHOOD_DEPTH
} from './app-ui';

type GPUGraphExplorerDeckOptions = DeckExampleDeviceOptions & {
  dataset?: GraphExplorerDataset;
  layoutMode?: GraphExplorerLayoutMode;
  pointMode?: boolean;
  maxVisibleEdges?: number;
};

/**
 * Creates an optional deck.gl explorer using resident GPU Graph analytics and original edge chunks.
 *
 * Deck owns the WebGPU frame encoder, rendering, controller, and asynchronous node picking. The
 * graph module never depends on deck.gl, and no graph column is downloaded for animation, color,
 * sizing, selection, or dragging.
 */
export function createGPUGraphExplorerDeck(
  parent?: HTMLDivElement,
  options: GPUGraphExplorerDeckOptions = {}
): ArrowDeck<OrthographicView> {
  const {
    dataset,
    layoutMode: initialLayoutMode = 'auto',
    pointMode,
    maxVisibleEdges = GRAPH_EXPLORER_MAX_VISIBLE_EDGES,
    ...deviceOptions
  } = options;
  const initialDataset =
    dataset ?? makeGraphExplorerDataset(GRAPH_EXPLORER_SHOWCASE_DEFAULT_VERTEX_COUNT);
  const ownsContainer = !parent;
  const container = parent ?? createStandaloneContainer();
  if (getComputedStyle(container).position === 'static') container.style.position = 'relative';

  let effect: GPUGraphDeckEffect | null = null;
  let activeDevice: Device | null = null;
  let latestStats: GPUGraphDeckEffectStats | null = null;
  let currentLayoutMode = initialLayoutMode;
  let currentColorMode: GraphExplorerColorMode = 'community';
  let currentNodeSizeMode: GraphExplorerNodeSizeMode = 'pagerank';
  let edgesVisible = initialDataset.vertexCount < GRAPH_EXPLORER_LINEAR_LAYOUT_VERTEX_COUNT;
  let pendingGraphVertexCount: number | null = null;
  let loadingStatus: string | null = null;
  let rebuildGeneration = 0;
  let rebuildFrame: number | null = null;
  let draggedVertex: number | null = null;
  let layoutPaused = false;
  let deck: ArrowDeck<OrthographicView>;
  const controls = createExplorerControls(container, {
    getEffect: () => effect,
    getStats: () => latestStats,
    getPendingVertexCount: () => pendingGraphVertexCount,
    getLoadingStatus: () => loadingStatus,
    getEdgesVisible: () => edgesVisible,
    resize: vertexCount => scheduleGraphResize(vertexCount),
    setLayoutMode: mode => {
      currentLayoutMode = mode;
      if (effect) scheduleGraphResize(effect.graph.vertexCount);
    },
    setColorMode: mode => {
      currentColorMode = mode;
      updateLayers('GPU Graph GPU visual color encoding changed');
    },
    setNodeSizeMode: mode => {
      currentNodeSizeMode = mode;
      updateLayers('GPU Graph GPU node sizing changed');
    },
    setEdgesVisible: visible => {
      edgesVisible = visible;
      updateLayers('GPU Graph source-chunk edge visibility changed');
    },
    setPaused: paused => {
      layoutPaused = paused;
      if (effect) effect.layoutPaused = paused;
      deck?.setProps({_animate: !paused});
      if (!paused) deck?.redraw('GPU Graph progressive GPU layout resumed');
    },
    redraw: reason => deck?.redraw(reason)
  });

  deck = new ArrowDeck<OrthographicView>({
    parent: container,
    ...getDeckExampleProps({...deviceOptions, deviceType: 'webgpu'}),
    views: new OrthographicView({id: 'gpu-graph-orthographic'}),
    initialViewState: {target: [0, 0, 0], zoom: 6.8, minZoom: 4, maxZoom: 12},
    controller: {
      dragPan: true,
      scrollZoom: {smooth: true, speed: 0.02},
      doubleClickZoom: true,
      touchZoom: true
    },
    _animate: true,
    pickAsync: 'auto',
    layers: [],
    effects: [],
    getTooltip: info => getVertexTooltip(info, effect),
    onClick: info => {
      effect?.setSelectedVertex(info.picked && info.index >= 0 ? info.index : null);
      controls.update();
      deck.redraw('GPU Graph deck selection changed');
    },
    onDragStart: (info, event) => {
      if (!effect || !info.picked || info.index < 0) return;
      draggedVertex = info.index;
      effect.setSelectedVertex(draggedVertex);
      effect.setPinnedVertex(draggedVertex, true);
      updateDraggedVertex(effect, draggedVertex, info);
      controls.update();
      event.stopPropagation();
      deck.redraw('GPU Graph vertex drag started');
    },
    onDrag: (info, event) => {
      if (!effect || draggedVertex === null) return;
      updateDraggedVertex(effect, draggedVertex, info);
      event.stopPropagation();
      deck.redraw('GPU Graph vertex dragged');
    },
    onDragEnd: (_info, event) => {
      if (draggedVertex === null) return;
      draggedVertex = null;
      controls.update();
      event.stopPropagation();
      deck.redraw('GPU Graph vertex pinned');
    },
    onLoad: ({deck: loadedDeck, device}) => {
      if (device.type !== 'webgpu') throw new Error('GPU Graph deck explorer requires WebGPU');
      activeDevice = device;
      rebuildGraph(initialDataset, loadedDeck);
    },
    onFinalize: () => {
      activeDevice = null;
      rebuildGeneration++;
      if (rebuildFrame !== null) cancelAnimationFrame(rebuildFrame);
      draggedVertex = null;
      controls.destroy();
      if (ownsContainer) container.remove();
    }
  });

  return deck;

  /** Yields before large CPU generation and GPU allocation so progress remains visible. */
  function scheduleGraphResize(vertexCount: number): void {
    const generation = ++rebuildGeneration;
    pendingGraphVertexCount = vertexCount;
    loadingStatus = `Preparing ${vertexCount.toLocaleString()} resident vertices…`;
    controls.update();
    scheduleAfterPaint(generation, () => {
      let nextDataset: GraphExplorerDataset;
      try {
        nextDataset = makeGraphExplorerDataset(vertexCount);
      } catch (error) {
        loadingStatus = error instanceof Error ? error.message : 'Graph generation failed';
        pendingGraphVertexCount = null;
        controls.update();
        return;
      }
      loadingStatus = `Uploading ${vertexCount.toLocaleString()} vertices and ${nextDataset.sourceChunks.reduce((total, chunk) => total + chunk.length, 0).toLocaleString()} original edges…`;
      controls.update();
      scheduleAfterPaint(generation, () => {
        try {
          rebuildGraph(nextDataset);
          loadingStatus = null;
          pendingGraphVertexCount = null;
          controls.update();
        } catch (error) {
          loadingStatus =
            error instanceof Error ? error.message : 'The current adapter cannot hold this graph';
          pendingGraphVertexCount = null;
          controls.update();
        }
      });
    });
  }

  /** Uses two frame callbacks so the current status is painted before expensive synchronous work. */
  function scheduleAfterPaint(generation: number, callback: () => void): void {
    if (rebuildFrame !== null) cancelAnimationFrame(rebuildFrame);
    rebuildFrame = requestAnimationFrame(() => {
      if (generation !== rebuildGeneration || !activeDevice) return;
      rebuildFrame = requestAnimationFrame(() => {
        rebuildFrame = null;
        if (generation === rebuildGeneration && activeDevice) callback();
      });
    });
  }

  /** Rebuilds resident algorithms and original source layers without changing Deck's camera. */
  function rebuildGraph(
    nextDataset: GraphExplorerDataset,
    targetDeck: ArrowDeck<OrthographicView> = deck
  ): void {
    if (!activeDevice) return;
    const previousDepth = effect?.currentNeighborhoodDepth ?? DEFAULT_NEIGHBORHOOD_DEPTH;
    const previousSelection = effect ? effect.currentSelection : 0;
    latestStats = null;
    draggedVertex = null;
    if (nextDataset.vertexCount >= GRAPH_EXPLORER_LINEAR_LAYOUT_VERTEX_COUNT) {
      edgesVisible = false;
    }
    const nextEffect = new GPUGraphDeckEffect(activeDevice, nextDataset, {
      layoutMode: currentLayoutMode,
      pointMode,
      maxVisibleEdges,
      addSampledLayoutToGraph: addGraphExplorerSampledLayoutToGraph,
      onStats: stats => {
        latestStats = stats;
        controls.update();
      }
    });
    nextEffect.layoutPaused = layoutPaused;
    nextEffect.setNeighborhoodDepth(previousDepth);
    nextEffect.setSelectedVertex(
      previousSelection !== null && previousSelection < nextDataset.vertexCount
        ? previousSelection
        : null
    );
    effect = nextEffect;
    targetDeck.setProps({effects: [nextEffect], layers: createLayers(nextEffect)});
    controls.update();
    // Deck updates same-ID layer bindings at the start of its next animation frame. Drawing
    // synchronously here would reuse the previous effect's already-destroyed GPU allocations.
  }

  /** Preserves stable layer IDs while custom layers rebind each newly owned physical buffer. */
  function updateLayers(reason: string): void {
    if (!effect || !deck) return;
    deck.setProps({layers: createLayers(effect)});
    controls.update();
    deck.redraw(reason);
  }

  function createLayers(
    graphEffect: GPUGraphDeckEffect
  ): (GPUGraphEdgeLayer | GPUGraphNodeLayer)[] {
    const nonemptyChunkCount = graphEffect.graph.sourceVertices.data.filter(
      chunk => chunk.length > 0
    ).length;
    let remainingVisibleEdges = graphEffect.renderedEdgeCount;
    let remainingVisibleChunks = nonemptyChunkCount;
    const edgeLayers = edgesVisible
      ? graphEffect.graph.sourceVertices.data.flatMap((source, chunkIndex) => {
          if (source.length === 0) return [];
          const target = graphEffect.graph.targetVertices.data[chunkIndex];
          const visibleEdgeCount = Math.min(
            source.length,
            Math.ceil(remainingVisibleEdges / Math.max(remainingVisibleChunks, 1))
          );
          remainingVisibleEdges -= visibleEdgeCount;
          remainingVisibleChunks--;
          if (visibleEdgeCount === 0) return [];
          return [
            new GPUGraphEdgeLayer({
              id: `gpu-graph-edges-${chunkIndex}`,
              data: [],
              pickable: false,
              positions: graphEffect.positions,
              sourceVertices:
                source.buffer instanceof Buffer ? source.buffer : source.buffer.buffer,
              targetVertices:
                target.buffer instanceof Buffer ? target.buffer : target.buffer.buffer,
              distances: graphEffect.distances,
              edgeCount: visibleEdgeCount,
              opacity: graphEffect.graph.vertexCount > 1_024 ? 0.22 : 0.55
            })
          ];
        })
      : [];
    const nodeLayer = new GPUGraphNodeLayer({
      id: 'gpu-graph-nodes',
      data: [],
      pickable: true,
      autoHighlight: true,
      positions: graphEffect.positions,
      importance: graphEffect.importance,
      degrees: graphEffect.degreeValues,
      components: graphEffect.componentLabels,
      communities: graphEffect.communityLabels,
      distances: graphEffect.distances,
      selectionMask: graphEffect.selectionMask,
      colorMode: currentColorMode,
      sizeMode: currentNodeSizeMode,
      pointMode: graphEffect.renderMode === 'points',
      vertexCount: graphEffect.graph.vertexCount,
      opacity: 1
    });
    return [...edgeLayers, nodeLayer];
  }
}

/** Updates the same float32x2 allocation bound directly by the node layer's instance attribute. */
function updateDraggedVertex(effect: GPUGraphDeckEffect, vertex: number, info: PickingInfo): void {
  const coordinate = info.coordinate;
  if (!coordinate || coordinate.length < 2) return;
  effect.setVertexPosition(vertex, [coordinate[0], coordinate[1]]);
}

function getVertexTooltip(info: PickingInfo, effect: GPUGraphDeckEffect | null): string | null {
  if (!info.picked || info.index < 0 || !effect) return null;
  const state = effect.isVertexPinned(info.index) ? 'pinned' : 'movable';
  return `Vertex ${info.index} · ${state}\nGPU communities · PageRank · neighborhood`;
}
