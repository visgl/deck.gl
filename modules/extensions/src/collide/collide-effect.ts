import {Framebuffer, Renderbuffer, Texture2D, cssToDeviceRatio} from '@luma.gl/core';
import {readPixelsToArray} from '@luma.gl/core';
import {equals} from '@math.gl/core';
import type {Effect, Layer, PreRenderOptions, Viewport} from '@deck.gl/core';
import CollidePass from './collide-pass';
import MaskEffect from '../mask/mask-effect';

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

  private channels: Record<string, RenderInfo> = {};
  private collidePasses: Record<string, CollidePass> = {};
  private collideFBOs: Record<string, Framebuffer> = {};
  private dummyCollideMap?: Texture2D;
  private lastViewport?: Viewport;

  preRender(
    gl: WebGLRenderingContext,
    {effects: allEffects, layers, layerFilter, viewports, onViewportActive, views}: PreRenderOptions
  ): void {
    if (!this.dummyCollideMap) {
      this.dummyCollideMap = new Texture2D(gl, {width: 1, height: 1});
    }

    const collideLayers = layers.filter(
      // @ts-ignore
      ({props: {visible, collideEnabled}}) => visible && collideEnabled
    ) as Layer<CollideExtensionProps>[];
    if (collideLayers.length === 0) {
      this.channels = {};
      return;
    }

    // Detect if mask has rendered. TODO: better dependency system for Effects
    const effects = allEffects?.filter(e => e.constructor === MaskEffect);
    const otherEffectRendered = Boolean(
      effects && effects.filter(({didRender}) => didRender).length
    );

    // Collect layers to render
    const channels = this._groupByCollideGroup(gl, collideLayers);

    const viewport = viewports[0];
    const viewportChanged =
      !this.lastViewport || !this.lastViewport.equals(viewport) || otherEffectRendered;

    // Resize framebuffers to match canvas
    for (const collideGroup in channels) {
      const collideFBO = this.collideFBOs[collideGroup];
      const collidePass = this.collidePasses[collideGroup];
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

    // // @ts-ignore
    // if (window.debug && Object.keys(channels)[0]) {
    //   const collideFBO = this.collideFBOs[Object.keys(channels)[0]];
    //   this._debug(collideFBO);
    // }
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

    const renderInfoUpdated =
      // If render info is new
      renderInfo === oldRenderInfo ||
      // If sublayers have changed
      oldRenderInfo.layers.length !== renderInfo.layers.length ||
      // If a sublayer's bounds have been updated
      renderInfo.layerBounds.some((b, i) => !equals(b, oldRenderInfo.layerBounds[i]));

    this.channels[collideGroup] = renderInfo;

    if (renderInfoUpdated || viewportChanged) {
      this.lastViewport = viewport;
      const collideFBO = this.collideFBOs[collideGroup];
      const collidePass = this.collidePasses[collideGroup];

      // Rerender collide FBO
      // @ts-ignore (2532) This method is only called from preRender where collidePass is defined
      collidePass.renderCollideMap(collideFBO, {
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
      if (!this.collidePasses[collideGroup]) {
        this.createPass(gl, collideGroup);
      }
      if (!this.channels[collideGroup]) {
        this.channels[collideGroup] = channelMap[collideGroup];
      }
    }
    for (const collideGroup of Object.keys(this.collidePasses)) {
      if (!channelMap[collideGroup]) {
        this.destroyPass(collideGroup);
      }
    }

    return channelMap;
  }

  getModuleParameters(): {collideFBOs: Record<string, Framebuffer>; dummyCollideMap: Texture2D} {
    const {collideFBOs, dummyCollideMap} = this;
    return {collideFBOs, dummyCollideMap};
  }

  cleanup(): void {
    if (this.dummyCollideMap) {
      this.dummyCollideMap.delete();
      this.dummyCollideMap = undefined;
    }
    this.channels = {};
    for (const collideGroup of Object.keys(this.collidePasses)) {
      this.destroyPass(collideGroup);
    }
    this.collidePasses = {};
    this.lastViewport = undefined;
  }

  createPass(gl: WebGLRenderingContext, collideGroup: string) {
    this.collidePasses[collideGroup] = new CollidePass(gl, {id: collideGroup});

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

  destroyPass(collideGroup: string) {
    delete this.collidePasses[collideGroup];
    const fbo = this.collideFBOs[collideGroup];
    for (const attachment of Object.values(fbo.attachments as Texture2D[])) {
      attachment.delete();
    }
    fbo.delete();
    delete this.collideFBOs[collideGroup];
  }

  // Debug show FBO contents on screen
  // _debug(collideMap) {
  //   const minimap = true;
  //   const color = readPixelsToArray(collideMap);
  //   let canvas = document.getElementById('fbo-canvas') as HTMLCanvasElement;
  //   const canvasHeight = (minimap ? 2 : 1) * collideMap.height;
  //   if (!canvas) {
  //     canvas = document.createElement('canvas');
  //     canvas.id = 'fbo-canvas';
  //     canvas.style.zIndex = '100';
  //     canvas.style.position = 'absolute';
  //     canvas.style.top = '0';
  //     canvas.style.right = '0';
  //     canvas.style.border = 'blue 1px solid';
  //     canvas.style.transform = 'scaleY(-1)';
  //     document.body.appendChild(canvas);
  //   }
  //   if (canvas.width !== collideMap.width || canvas.height !== canvasHeight) {
  //     canvas.width = collideMap.width;
  //     canvas.height = canvasHeight;
  //     canvas.style.width = `${0.125 * DOWNSCALE * canvas.width}px`; // Fit with 80% width #app
  //   }
  //   const ctx = canvas.getContext('2d')!;
  //   const imageData = ctx.createImageData(canvas.width, canvas.height);

  //   // Minimap
  //   if (minimap) {
  //     const zoom = 8; // Zoom factor for minimap
  //     const {width, height} = canvas;
  //     for (let y = 0; y < height; y++) {
  //       for (let x = 0; x < width; x++) {
  //         const d = 4 * (x + y * width); // destination pixel
  //         const s = 4 * (Math.floor(x / zoom) + Math.floor(y / zoom) * width); // source
  //         imageData.data[d + 0] = color[s + 0];
  //         imageData.data[d + 1] = color[s + 1];
  //         imageData.data[d + 2] = color[s + 2];
  //         imageData.data[d + 3] = color[s + 3];
  //       }
  //     }
  //   }

  //   // Full map
  //   const offset = minimap ? color.length : 0;
  //   for (let i = 0; i < color.length; i += 4) {
  //     imageData.data[offset + i + 0] = color[i + 0];
  //     imageData.data[offset + i + 1] = color[i + 1];
  //     imageData.data[offset + i + 2] = color[i + 2];
  //     imageData.data[offset + i + 3] = color[i + 3];
  //   }

  //   ctx.putImageData(imageData, 0, 0);
  // }
}
