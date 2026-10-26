// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Layer, UpdateParameters, Viewport} from '@deck.gl/core';
import type {Device, Framebuffer, RenderPass} from '@luma.gl/core';
import {Tile3D, TILE_REFINEMENT} from '@loaders.gl/tiles';
import {ScenegraphLayer} from '@deck.gl/mesh-layers';
import type TileProcessingScheduler from './tile-processing-scheduler';

/** Parameters that composite fragments with the pixels behind them. */
const BLEND_PARAMETERS = [
  'blendColorOperation',
  'blendColorSrcFactor',
  'blendColorDstFactor',
  'blendAlphaOperation',
  'blendAlphaSrcFactor',
  'blendAlphaDstFactor',
  'blendEquation',
  'blendFunc'
];

/**
 * Whether render parameters request blending, as glTF `BLEND` and transmission materials do.
 * Deck's default alpha blending leaves fragments with full alpha opaque, so it does not count.
 */
function enablesBlending(parameters?: Record<string, unknown> | null): boolean {
  if (!parameters || parameters.blend === false) return false;
  return parameters.blend === true || BLEND_PARAMETERS.some(key => parameters[key] !== undefined);
}

/** The glTF material fields that make luma.gl blend a material. */
type GLTFMaterialBlending = {
  alphaMode?: string;
  extensions?: {
    KHR_materials_transmission?: {transmissionFactor?: number; transmissionTexture?: unknown};
  };
};

/**
 * Whether luma.gl draws a glTF material with blending: `BLEND` alpha, or transmission,
 * which it approximates with premultiplied-alpha blending.
 */
function isBlendedMaterial({alphaMode, extensions}: GLTFMaterialBlending): boolean {
  const transmission = extensions?.KHR_materials_transmission;
  return (
    alphaMode === 'BLEND' ||
    (transmission?.transmissionFactor ?? 0) > 0 ||
    Boolean(transmission?.transmissionTexture)
  );
}

/** Layer draw options; picking and shadow passes set their shader module props. */
type DrawOptions<DataT> = Parameters<ScenegraphLayer<DataT>['draw']>[0] & {
  shaderModuleProps?: {
    picking?: {isActive?: boolean | number};
    shadow?: {drawToShadowMap?: boolean};
  };
};

/** Passes that draw coverage layers. Shadow maps store depth only and never mask. */
type CoveragePass = 'color' | 'picking' | 'shadow';

/** Whether the default WebGL framebuffer has a stencil buffer. */
function canvasCanMask(device: Device): boolean {
  const {gl} = device as Device & {gl?: WebGL2RenderingContext};
  return device.type === 'webgl' && Boolean(gl?.getContextAttributes()?.stencil);
}

/** Whether a render pass target lets WebGL stencil coverage run. */
function targetCanMask(device: Device, renderPass: RenderPass): boolean {
  if (device.type !== 'webgl') return false;
  const framebuffer = renderPass.props.framebuffer as
    | (Framebuffer & {handle: WebGLFramebuffer | null})
    | null;
  if (framebuffer?.depthStencilAttachment) {
    return framebuffer.depthStencilAttachment.texture.format.includes('stencil');
  }
  return (!framebuffer || framebuffer.handle === null) && canvasCanMask(device);
}

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

  state!: ScenegraphLayer<DataT>['state'] & {
    scenegraphPending?: boolean;
    /** Whether the created scene's own model parameters enable blending. */
    blendedModels?: boolean;
  };

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
      // WebGL draws replace model parameters with layer parameters, so record
      // the scene's own blending, including custom `getScene` models, beforehand.
      this.state.blendedModels = this.state.models.some(model =>
        enablesBlending(model.parameters as Record<string, unknown>)
      );
    });
  }

  /**
   * Whether drawn pixels replace what is behind them, so they may mask replacement ancestors.
   * Fragment shader alpha cannot be inspected; translucent custom models must enable blending
   * in their model parameters.
   */
  isOpaque(): boolean {
    const {opacity, parameters, tile} = this.props;
    const gltf = tile?.content?.gltf;
    const materials: GLTFMaterialBlending[] | undefined = gltf?.materials || gltf?.json?.materials;
    // Material checks apply before models exist, including while creation is deferred.
    return !(
      opacity < 1 ||
      enablesBlending(parameters) ||
      this.state?.blendedModels ||
      materials?.some(isBlendedMaterial)
    );
  }

  draw(options: DrawOptions<DataT>): void {
    if (this.props.refinementCoverage) {
      const {picking, shadow} = options.shaderModuleProps || {};
      const pass: CoveragePass = picking?.isActive
        ? 'picking'
        : shadow?.drawToShadowMap
          ? 'shadow'
          : 'color';
      this.props.refinementCoverage.draw(this, pass, () => super.draw(options));
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
 * Draws replacement descendants first and masks only their own ancestors. Additive
 * parents keep their ordinary coarse-to-fine order and rely on depth testing alone.
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
  /**
   * Whether color targets can mask, learned from color passes. Until one draws, the
   * canvas decides. Picking targets always have stencil, so picking masks only when
   * the draw list was reordered for color.
   */
  private colorMasking: boolean | null = null;
  /** Whether the latest checked color pass could not mask. */
  private sawUnmaskedTarget = false;
  /** The latest color pass whose target was checked. */
  private checkedPass: RenderPass | null = null;
  /** Whether the current selection has a coverage plan, whether or not it is applied. */
  private planned = false;

  /**
   * Returns a postorder draw list and initializes its ancestry coverage plan. Layers keep
   * their original order when color targets cannot mask, so coplanar children still win.
   */
  updateLayers(layers: Layer[], stencilMask: number, device: Device): Layer[] {
    this.entries.clear();
    this.renderPass = null;
    this.planned = false;
    this.bits = Array.from({length: 8}, (_, index) => 1 << index).filter(
      bit => (stencilMask & bit) !== 0
    );
    if (!this.bits.length) return layers;

    const nodes = new Map<Tile3D, CoverageNode>();
    for (const layer of layers) {
      const tile = (layer.props as {tile?: Tile3D}).tile;
      if (!tile?.selected) continue;
      // Blended geometry and custom sublayers cannot establish opaque pixel coverage.
      if (!(layer instanceof Tile3DScenegraphLayer) || !layer.isOpaque()) {
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
    const replaces = (node: CoverageNode): boolean =>
      node.children.length > 0 && node.tile.refine === TILE_REFINEMENT.REPLACE;
    // Without a selected replacement there is nothing to mask; keep the original order.
    if (!Array.from(nodes.values()).some(replaces)) return layers;

    const ordered: Layer[] = [];
    let overflow = false;
    const visit = (
      node: CoverageNode,
      path: Tile3D[],
      ancestorMask: number,
      sharedMask: number
    ): void => {
      const replacesChildren = replaces(node);
      // Only replacement parents draw after the descendants that mask them. Additive
      // parents keep drawing first, so coplanar children resolve as without coverage.
      if (!replacesChildren) ordered.push(node.layer);
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
      if (replacesChildren) ordered.push(node.layer);
    };
    for (const root of roots) visit(root, [], 0, 0);
    if (overflow) {
      this.entries.clear();
      return layers;
    }
    this.planned = true;
    // Reordered parents would cover coplanar children wherever masking cannot run.
    if (!(this.colorMasking ?? canvasCanMask(device))) {
      this.entries.clear();
      return layers;
    }
    const selectedLayers = new Set(ordered);
    return ordered.concat(layers.filter(layer => !selectedLayers.has(layer)));
  }

  /** Applies scoped WebGL stencil state without changing color, depth, or geometry. */
  draw(layer: Tile3DScenegraphLayer<any>, pass: CoveragePass, draw: () => void): void {
    if (pass === 'shadow') return draw();
    if (pass === 'color') this.checkColorTarget(layer);
    const entry = layer.props.tile && this.entries.get(layer.props.tile);
    if (!entry || !(entry.ancestorMask | entry.descendantMask)) return draw();
    if (!layer.isOpaque()) {
      // Models created after this plan blend with what is behind them, so they must not
      // mask ancestors. Fall back to depth testing now and replan in the original order.
      this.replan(layer);
      return draw();
    }
    const {device, viewport, renderPass} = layer.context;
    if (!targetCanMask(device, renderPass)) return draw();
    const webglDevice = device as Device & {gl: WebGL2RenderingContext};
    const webglPass = renderPass as RenderPass & {glParameters: Record<string, any>};

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

  /** Records whether this color pass can mask, replanning when the draw order does not fit. */
  private checkColorTarget(layer: Tile3DScenegraphLayer<any>): void {
    const {device, renderPass} = layer.context;
    if (renderPass === this.checkedPass) return;
    this.checkedPass = renderPass;
    const canMask = targetCanMask(device, renderPass);
    // A masking pass right after an unmasked one does not count, so frames that mix targets,
    // such as a terrain height map and the screen, keep the original order instead of
    // alternating.
    this.colorMasking = canMask && !this.sawUnmaskedTarget;
    this.sawUnmaskedTarget = !canMask;
    // Replan when the draw order no longer matches: a reordered list that cannot be masked
    // lets coplanar parents cover their children, and an unordered list cannot mask.
    if (this.planned && this.colorMasking !== this.entries.size > 0) this.replan(layer);
  }

  /** Stops applying the current plan and asks the Tile3DLayer for a new draw list. */
  private replan(layer: Tile3DScenegraphLayer<any>): void {
    this.entries.clear();
    this.planned = false;
    layer.parent?.setNeedsUpdate();
  }
}
