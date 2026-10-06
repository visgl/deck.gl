// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Layer, UpdateParameters, Viewport} from '@deck.gl/core';
import type {Device, Framebuffer, RenderPass} from '@luma.gl/core';
import {Tile3D, TILE_REFINEMENT} from '@loaders.gl/tiles';
import {ScenegraphLayer} from '@deck.gl/mesh-layers';
import type TileProcessingScheduler from './tile-processing-scheduler';

/** Defers creation through the ordinary layer update so attributes stay synchronized. */
export default class Tile3DScenegraphLayer<DataT> extends ScenegraphLayer<
  DataT,
  {
    tileProcessingScheduler: TileProcessingScheduler;
    tile?: Tile3D;
    refinementCoverage?: Tile3DRefinementCoverage;
  }
> {
  static layerName = 'Tile3DScenegraphLayer';

  state!: ScenegraphLayer<DataT>['state'] & {scenegraphPending?: boolean};

  updateState(parameters: UpdateParameters<this>): void {
    const retryScenegraph =
      this.state.scenegraphPending &&
      parameters.props.scenegraph === parameters.oldProps.scenegraph;
    super.updateState(parameters);
    if (retryScenegraph) {
      this._updateScenegraph();
    }
  }

  protected _updateScenegraph(): void {
    this.state.scenegraphPending = !this.props.tileProcessingScheduler.run(this, () => {
      super._updateScenegraph();
    });
  }

  draw(options: Parameters<ScenegraphLayer<DataT>['draw']>[0]): void {
    if (this.props.refinementCoverage) {
      this.props.refinementCoverage.draw(this, () => super.draw(options));
    } else {
      super.draw(options);
    }
  }
}

/** A selected tile and its nearest selected descendants, independent of skipped levels. */
type CoverageNode = {tile: Tile3D; layer: Layer; children: CoverageNode[]};

/** Stencil bits that a tile reads and writes within its selected ancestry. */
type CoverageEntry = {path: Tile3D[]; ancestorMask: number; descendantMask: number};

/**
 * Draws replacement descendants first and masks only their own ancestors.
 * Single-child replacement chains share one reserved stencil bit. Branching subtrees
 * use separate bits, cleared between siblings while preserving ancestor coverage.
 */
export class Tile3DRefinementCoverage {
  /** Per-selection draw plan; rebuilt when Tile3DLayer renders its sublayers. */
  private entries = new Map<Tile3D, CoverageEntry>();
  /** Reserved stencil bits ordered from outermost to innermost replacement. */
  private bits: number[] = [];
  /** Current draw pass and branch, used to initialize bits before their first draw. */
  private renderPass: RenderPass | null = null;
  private viewport: Viewport | null = null;
  private path: Tile3D[] = [];

  /** Returns a postorder draw list and initializes its ancestry coverage plan. */
  updateLayers(layers: Layer[], stencilMask: number): Layer[] {
    this.entries.clear();
    this.renderPass = null;
    this.bits = Array.from({length: 8}, (_, index) => 1 << index).filter(
      bit => (stencilMask & bit) !== 0
    );
    if (!this.bits.length) return layers;

    const nodes = new Map<Tile3D, CoverageNode>();
    for (const layer of layers) {
      const tile = (layer.props as {tile?: Tile3D}).tile;
      if (!tile?.selected) continue;
      // Blended geometry and custom sublayers cannot establish opaque pixel coverage.
      if (
        !(layer instanceof Tile3DScenegraphLayer) ||
        layer.props.opacity < 1 ||
        (tile.content?.gltf?.materials || tile.content?.gltf?.json?.materials)?.some(
          (material: {alphaMode?: string}) => material.alphaMode === 'BLEND'
        )
      ) {
        return layers;
      }
      nodes.set(tile, {tile, layer, children: []});
    }
    const roots: CoverageNode[] = [];
    for (const node of nodes.values()) {
      let parent = node.tile.parent;
      while (parent && !nodes.has(parent)) parent = parent.parent;
      if (parent) nodes.get(parent)!.children.push(node);
      else roots.push(node);
    }

    const ordered: Layer[] = [];
    let overflow = false;
    const visit = (
      node: CoverageNode,
      path: Tile3D[],
      ancestorMask: number,
      sharedMask: number
    ): void => {
      const replacesChildren =
        node.children.length > 0 && node.tile.refine === TILE_REFINEMENT.REPLACE;
      const descendantMask = replacesChildren ? sharedMask || this.bits[path.length] : 0;
      if (replacesChildren && !descendantMask) overflow = true;
      const branch = replacesChildren && !sharedMask ? [...path, node.tile] : path;
      // A sole child has the same ancestry scope, so its descendants can accumulate
      // coverage in the parent's bit. Siblings need independent scopes to avoid masking
      // each other where their geometry overlaps.
      const childSharedMask = node.children.length === 1 ? descendantMask || 0 : 0;
      for (const child of node.children) {
        visit(child, branch, ancestorMask | (descendantMask || 0), childSharedMask);
      }
      this.entries.set(node.tile, {
        path: branch,
        ancestorMask,
        descendantMask: descendantMask || 0
      });
      ordered.push(node.layer);
    };
    for (const root of roots) visit(root, [], 0, 0);
    if (overflow) {
      this.entries.clear();
      return layers;
    }
    const selectedLayers = new Set(ordered);
    return ordered.concat(layers.filter(layer => !selectedLayers.has(layer)));
  }

  /** Applies scoped WebGL stencil state without changing color, depth, or geometry. */
  draw(layer: Tile3DScenegraphLayer<any>, draw: () => void): void {
    const entry = layer.props.tile && this.entries.get(layer.props.tile);
    if (!entry || !(entry.ancestorMask | entry.descendantMask)) return draw();
    const {device, viewport, renderPass} = layer.context;
    if (device.type !== 'webgl') return draw();
    const webglDevice = device as Device & {gl: WebGL2RenderingContext};
    const webglPass = renderPass as RenderPass & {glParameters: Record<string, any>};
    const framebuffer = renderPass.props.framebuffer as
      | (Framebuffer & {handle: WebGLFramebuffer | null})
      | null;
    const hasStencil = framebuffer?.depthStencilAttachment
      ? framebuffer.depthStencilAttachment.texture.format.includes('stencil')
      : (!framebuffer || framebuffer.handle === null) &&
        webglDevice.gl.getContextAttributes()?.stencil;
    if (!hasStencil) return draw();

    if (this.renderPass !== renderPass || this.viewport !== viewport) {
      this.renderPass = renderPass;
      this.viewport = viewport;
      this.path = [];
    }
    let common = 0;
    while (common < entry.path.length && this.path[common] === entry.path[common]) common++;
    let clearMask = 0;
    for (let index = common; index < entry.path.length; index++) clearMask |= this.bits[index];
    this.path = entry.path;

    const {gl} = webglDevice;
    if (clearMask) {
      device.withParametersWebGL({stencilMask: clearMask, clearStencil: 0}, () => {
        gl.clear(gl.STENCIL_BUFFER_BIT);
      });
    }
    const previousParameters = webglPass.glParameters;
    const parameters = {
      ...previousParameters,
      stencilTest: true,
      stencilMask: entry.ancestorMask,
      // Test an unset descendant bit, then write ancestor coverage. NOT_EQUAL
      // permits a single-child chain to read and write the same bit.
      stencilFunc: entry.descendantMask
        ? [gl.NOTEQUAL, entry.ancestorMask | entry.descendantMask, entry.descendantMask]
        : [gl.ALWAYS, entry.ancestorMask, 0],
      stencilOp: [gl.KEEP, gl.KEEP, gl.REPLACE]
    };
    webglPass.glParameters = parameters;
    try {
      device.withParametersWebGL(parameters, draw);
    } finally {
      webglPass.glParameters = previousParameters;
    }
  }
}
