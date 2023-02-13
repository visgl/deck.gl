import {Framebuffer, Renderbuffer, Texture2D, cssToDeviceRatio} from '@luma.gl/core';
import {equals} from '@math.gl/core';
import {_deepEqual as deepEqual} from '@deck.gl/core';
import type {Effect, Layer, PreRenderOptions, Viewport} from '@deck.gl/core';
import CollidePass from './collide-pass';
import MaskEffect, {MaskPreRenderStats} from '../mask/mask-effect';
// import {debugFBO} from '../utils/debug';

type CollideExtensionProps = {
  collideTestProps?: {};
  collideGroup: string;
};

// Factor by which to downscale Collide FBO relative to canvas
const DOWNSCALE = 2;

type RenderInfo = {
  collideGroup: string;
  layers: Layer<CollideExtensionProps>[];
  layerBounds: ([number[], number[]] | null)[];
};

// Class to manage collide effect
export default class CollideEffect implements Effect {
  id = 'collide-effect';
  props = null;
  useInPicking = true;
  order = 1;

  private channels: Record<string, RenderInfo> = {};
  private collidePass?: CollidePass;
  private collideFBOs: Record<string, Framebuffer> = {};
  private dummyCollideMap?: Texture2D;
  private lastViewport?: Viewport;

  preRender(
    gl: WebGLRenderingContext,
    {
      effects: allEffects,
      layers,
      layerFilter,
      viewports,
      onViewportActive,
      views,
      pass,
      preRenderStats = {}
    }: PreRenderOptions
  ): void {
    if (!this.dummyCollideMap) {
      this.dummyCollideMap = new Texture2D(gl, {width: 1, height: 1});
    }

    if (pass.startsWith('picking')) {
      // Do not update on picking pass
      return;
    }

    const collideLayers = layers.filter(
      // @ts-ignore
      ({props: {visible, collideEnabled}}) => visible && collideEnabled
    ) as Layer<CollideExtensionProps>[];
    if (collideLayers.length === 0) {
      this.channels = {};
      return;
    }

    if (!this.collidePass) {
      this.collidePass = new CollidePass(gl, {id: 'default-collide'});
    }

    // Detect if mask has rendered. TODO: better dependency system for Effects
    const effects = allEffects?.filter(e => e.constructor === MaskEffect);
    const maskEffectRendered = (preRenderStats['mask-effect'] as MaskPreRenderStats)?.didRender;

    // Collect layers to render
    const channels = this._groupByCollideGroup(gl, collideLayers);

    const viewport = viewports[0];
    const viewportChanged =
      !this.lastViewport || !this.lastViewport.equals(viewport) || maskEffectRendered;

    // Resize framebuffers to match canvas
    for (const collideGroup in channels) {
      const collideFBO = this.collideFBOs[collideGroup];
      const renderInfo = channels[collideGroup];
      collideFBO.resize({
        width: gl.canvas.width / DOWNSCALE,
        height: gl.canvas.height / DOWNSCALE
      });
      this._render(renderInfo, {
        effects,
        layerFilter,
        onViewportActive,
        views,
        viewport,
        viewportChanged
      });
    }

    // debugFBO(this.collideFBOs[Object.keys(channels)[0]], {minimap: true});
  }

  private _render(
    renderInfo: RenderInfo,
    {
      effects,
      layerFilter,
      onViewportActive,
      views,
      viewport,
      viewportChanged
    }: {
      effects: PreRenderOptions['effects'];
      layerFilter: PreRenderOptions['layerFilter'];
      onViewportActive: PreRenderOptions['onViewportActive'];
      views: PreRenderOptions['views'];
      viewport: Viewport;
      viewportChanged: boolean;
    }
  ) {
    const {collideGroup} = renderInfo;
    const oldRenderInfo = this.channels[collideGroup];
    if (!oldRenderInfo) {
      return;
    }

    const needsRender =
      viewportChanged ||
      // If render info is new
      renderInfo === oldRenderInfo ||
      // If sublayers have changed
      !deepEqual(oldRenderInfo.layers, renderInfo.layers, 0) ||
      // If a sublayer's bounds have been updated
      renderInfo.layerBounds.some((b, i) => !equals(b, oldRenderInfo.layerBounds[i]));

    this.channels[collideGroup] = renderInfo;

    if (needsRender) {
      this.lastViewport = viewport;
      const collideFBO = this.collideFBOs[collideGroup];

      // Rerender collide FBO
      this.collidePass!.renderCollideMap(collideFBO, {
        pass: 'collide',
        layers: renderInfo.layers,
        effects,
        layerFilter,
        viewports: viewport ? [viewport] : [],
        onViewportActive,
        views,
        moduleParameters: {
          // To avoid feedback loop forming between Framebuffer and active Texture.
          dummyCollideMap: this.dummyCollideMap,
          devicePixelRatio: cssToDeviceRatio(collideFBO.gl) / DOWNSCALE
        }
      });
    }
  }

  /**
   * Group layers by collideGroup
   * Returns a map from collideGroup to render info
   */
  private _groupByCollideGroup(
    gl: WebGLRenderingContext,
    collideLayers: Layer<CollideExtensionProps>[]
  ): Record<string, RenderInfo> {
    const channelMap = {};
    for (const layer of collideLayers) {
      const {collideGroup} = layer.props;
      let channelInfo = channelMap[collideGroup];
      if (!channelInfo) {
        channelInfo = {
          collideGroup,
          layers: [],
          layerBounds: []
        };
        channelMap[collideGroup] = channelInfo;
      }
      channelInfo.layers.push(layer);
      channelInfo.layerBounds.push(layer.getBounds());
    }

    // Create any new passes and remove any old ones
    for (const collideGroup of Object.keys(channelMap)) {
      if (!this.collideFBOs[collideGroup]) {
        this.createFBO(gl, collideGroup);
      }
      if (!this.channels[collideGroup]) {
        this.channels[collideGroup] = channelMap[collideGroup];
      }
    }
    for (const collideGroup of Object.keys(this.collideFBOs)) {
      if (!channelMap[collideGroup]) {
        this.destroyFBO(collideGroup);
      }
    }

    return channelMap;
  }

  getModuleParameters(layer: Layer): {
    collideFBO: Framebuffer;
    dummyCollideMap: Texture2D;
  } {
    const {collideGroup} = (layer as Layer<CollideExtensionProps>).props;
    const {collideFBOs, dummyCollideMap} = this;
    return {collideFBO: collideFBOs[collideGroup], dummyCollideMap};
  }

  cleanup(): void {
    if (this.dummyCollideMap) {
      this.dummyCollideMap.delete();
      this.dummyCollideMap = undefined;
    }
    this.channels = {};
    for (const collideGroup of Object.keys(this.collideFBOs)) {
      this.destroyFBO(collideGroup);
    }
    this.collideFBOs = {};
    this.lastViewport = undefined;
  }

  createFBO(gl: WebGLRenderingContext, collideGroup: string) {
    const {width, height} = gl.canvas;
    const collideMap = new Texture2D(gl, {
      width,
      height,
      parameters: {
        [gl.TEXTURE_MIN_FILTER]: gl.NEAREST,
        [gl.TEXTURE_MAG_FILTER]: gl.NEAREST,
        [gl.TEXTURE_WRAP_S]: gl.CLAMP_TO_EDGE,
        [gl.TEXTURE_WRAP_T]: gl.CLAMP_TO_EDGE
      }
    });

    const depthBuffer = new Renderbuffer(gl, {format: gl.DEPTH_COMPONENT16, width, height});
    this.collideFBOs[collideGroup] = new Framebuffer(gl, {
      id: `Collide-${collideGroup}`,
      width,
      height,
      attachments: {
        [gl.COLOR_ATTACHMENT0]: collideMap,
        [gl.DEPTH_ATTACHMENT]: depthBuffer
      }
    });
  }

  destroyFBO(collideGroup: string) {
    const fbo = this.collideFBOs[collideGroup];
    for (const attachment of Object.values(fbo.attachments as Texture2D[])) {
      attachment.delete();
    }
    fbo.delete();
    delete this.collideFBOs[collideGroup];
  }
}
