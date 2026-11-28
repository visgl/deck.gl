// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

/** Four source communities keep component coloring and hub importance visually distinguishable. */
export const GRAPH_EXPLORER_COMMUNITY_COUNT = 4;

/** Exact all-pairs layout remains interactive at this bounded demonstration population. */
export const GRAPH_EXPLORER_DEFAULT_VERTEX_COUNT = 128;

/** Deliberately bounded, directly selectable GPU graph populations. */
export const GRAPH_EXPLORER_VERTEX_COUNTS = [
  128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288, 1048576
] as const;

/** Initial population for interactive showcases; isolated fixtures can supply smaller graphs. */
export const GRAPH_EXPLORER_SHOWCASE_DEFAULT_VERTEX_COUNT = 1024;

/** Larger populations always use the explicitly approximate spatial force contributor. */
export const GRAPH_EXPLORER_MAXIMUM_EXACT_VERTEX_COUNT = 512;

/** Larger graphs replace all-cell force gathering with bounded four-sample edge-aware forces. */
export const GRAPH_EXPLORER_LINEAR_LAYOUT_VERTEX_COUNT = 16_384;

/** Every source vertex remains rendered while the GPU switches to one pixel-sized primitive. */
export const GRAPH_EXPLORER_POINT_VERTEX_COUNT = 65_536;

/** Bounds only visible original edge rows; resident graph edges and all nodes remain complete. */
export const GRAPH_EXPLORER_MAX_VISIBLE_EDGES = 65_536;

/** Keeps synchronous majority-vote community work bounded on large generated graphs. */
export const GRAPH_EXPLORER_MAXIMUM_HUB_SPOKES = 48;

/** Explicit domain shared by the generated coordinates and caller-owned spatial grid. */
export const GRAPH_EXPLORER_SPATIAL_BOUNDS = [-2, -2, 2, 2] as const;

/** Source-aligned analytic column used to color the original GPU node instances. */
export type GraphExplorerColorMode = 'community' | 'component' | 'degree' | 'pagerank' | 'distance';

/** Source-aligned analytic column used to size the original GPU node instances. */
export type GraphExplorerNodeSizeMode = 'pagerank' | 'degree' | 'uniform';

/** Explicit exact-versus-spatial selection; auto protects large graphs from quadratic layout. */
export type GraphExplorerLayoutMode = 'auto' | 'exact' | 'spatial' | 'sampled';

/** Deterministic graph input preserving an explicit empty aligned source batch. */
export type GraphExplorerDataset = {
  /** Number of stable zero-based graph vertices. */
  vertexCount: number;
  /** Original directed source-edge batches, including one intentionally empty batch. */
  sourceChunks: Uint32Array[];
  /** Original target-edge batches with source-aligned row counts and chunk boundaries. */
  targetChunks: Uint32Array[];
  /** Initial directly renderable two-component positions in source-vertex order. */
  positions: Float32Array;
  /** Caller-owned progressive two-component velocities in source-vertex order. */
  velocities: Float32Array;
};

/**
 * Creates deterministic directed community rings, unequal-importance hubs, and one isolated node.
 *
 * One bridge connects the first two communities; the remaining communities and final isolated
 * vertex stay disconnected. Original edge rows are deliberately partitioned around an empty
 * middle chunk so the explorer can draw the actual caller-owned edge batches without packing.
 */
export function makeGraphExplorerDataset(
  vertexCount: number = GRAPH_EXPLORER_DEFAULT_VERTEX_COUNT
): GraphExplorerDataset {
  if (!Number.isSafeInteger(vertexCount) || vertexCount < GRAPH_EXPLORER_COMMUNITY_COUNT * 2) {
    throw new Error('Graph explorer requires at least eight graph vertices');
  }

  const positions = new Float32Array(vertexCount * 2);
  const velocities = new Float32Array(vertexCount * 2);
  let edgeCount = 1;
  for (let community = 0; community < GRAPH_EXPLORER_COMMUNITY_COUNT; community++) {
    const firstVertex = Math.floor((community * vertexCount) / GRAPH_EXPLORER_COMMUNITY_COUNT);
    const nextCommunityVertex = Math.floor(
      ((community + 1) * vertexCount) / GRAPH_EXPLORER_COMMUNITY_COUNT
    );
    const connectedCount =
      nextCommunityVertex - firstVertex - Number(community === GRAPH_EXPLORER_COMMUNITY_COUNT - 1);
    if (connectedCount >= 2) {
      edgeCount += connectedCount * (connectedCount > 3 ? 2 : 1);
      edgeCount += Math.min(
        GRAPH_EXPLORER_MAXIMUM_HUB_SPOKES,
        Math.floor((connectedCount - 1) / 4)
      );
    }
  }
  const sources = new Uint32Array(edgeCount);
  const targets = new Uint32Array(edgeCount);
  let edgeIndex = 0;

  for (let community = 0; community < GRAPH_EXPLORER_COMMUNITY_COUNT; community++) {
    const firstVertex = Math.floor((community * vertexCount) / GRAPH_EXPLORER_COMMUNITY_COUNT);
    const nextCommunityVertex = Math.floor(
      ((community + 1) * vertexCount) / GRAPH_EXPLORER_COMMUNITY_COUNT
    );
    const lastConnectedVertex =
      community === GRAPH_EXPLORER_COMMUNITY_COUNT - 1
        ? nextCommunityVertex - 1
        : nextCommunityVertex;
    const connectedCount = lastConnectedVertex - firstVertex;
    const centerX = community % 2 === 0 ? -0.52 : 0.52;
    const centerY = community < 2 ? -0.43 : 0.43;

    for (let vertex = firstVertex; vertex < nextCommunityVertex; vertex++) {
      const communityIndex = vertex - firstVertex;
      const angle = communityIndex * 2.399963229728653;
      const radius =
        vertexCount >= GRAPH_EXPLORER_LINEAR_LAYOUT_VERTEX_COUNT
          ? Math.sqrt((communityIndex + 0.5) / Math.max(connectedCount, 1)) * 0.38
          : 0.11 + (communityIndex % 7) * 0.016;
      positions[vertex * 2] = centerX + Math.cos(angle) * radius;
      positions[vertex * 2 + 1] = centerY + Math.sin(angle) * radius;

      if (vertex >= lastConnectedVertex || connectedCount < 2) {
        continue;
      }

      sources[edgeIndex] = vertex;
      targets[edgeIndex] = firstVertex + ((communityIndex + 1) % connectedCount);
      edgeIndex++;

      if (connectedCount > 3) {
        sources[edgeIndex] = vertex;
        targets[edgeIndex] = firstVertex + ((communityIndex + 3) % connectedCount);
        edgeIndex++;
      }

      if (
        communityIndex > 0 &&
        communityIndex % 4 === 0 &&
        communityIndex <= GRAPH_EXPLORER_MAXIMUM_HUB_SPOKES * 4
      ) {
        sources[edgeIndex] = vertex;
        targets[edgeIndex] = firstVertex;
        edgeIndex++;
      }
    }
  }

  // Join only the first pair so weak components, an isolated vertex, and hubs remain visible.
  sources[edgeIndex] = 0;
  targets[edgeIndex] = Math.floor(vertexCount / GRAPH_EXPLORER_COMMUNITY_COUNT);

  const midpoint = Math.ceil(edgeCount / 2);
  return {
    vertexCount,
    sourceChunks: [
      sources.subarray(0, midpoint),
      sources.subarray(midpoint, midpoint),
      sources.subarray(midpoint)
    ],
    targetChunks: [
      targets.subarray(0, midpoint),
      targets.subarray(midpoint, midpoint),
      targets.subarray(midpoint)
    ],
    positions,
    velocities
  };
}

/** Balances all-cell far-field gathers against exact near-cell populations. */
export function getGraphExplorerGridSize(vertexCount: number): readonly [number, number] {
  if (!Number.isSafeInteger(vertexCount) || vertexCount < GRAPH_EXPLORER_COMMUNITY_COUNT * 2) {
    throw new Error('Graph explorer spatial grids require at least eight graph vertices');
  }
  const dimension = Math.max(4, Math.min(32, Math.ceil(Math.sqrt(3) * vertexCount ** 0.25)));
  return [dimension, dimension];
}
