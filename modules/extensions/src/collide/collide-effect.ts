import {Texture2D, cssToDeviceRatio} from '@luma.gl/core';
import {readPixelsToArray} from '@luma.gl/core';
import type {Effect, Layer, PreRenderOptions, Viewport} from '@deck.gl/core';
import CollidePass from './collide-pass';

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
      ({props: {visible, extensions, collideGroup}}) =>
        visible &&
        extensions.find(e => e.constructor.extensionName === 'CollideExtension') &&
        collideGroup
    ) as Layer<CollideExtensionProps>[];
    if (collideLayers.length === 0) {
      this.channels = {};
      return;
    }

    const effects = allEffects?.filter(({useInCollide}) => useInCollide);
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
      const collidePass = this.collidePasses[collideGroup];
      const renderInfo = channels[collideGroup];
      collidePass.fbo.resize({
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
    const oldRenderInfo = this.channels[renderInfo.collideGroup];
    if (!oldRenderInfo) {
      return;
    }

    const renderInfoUpdated =
      // If render info is new
      renderInfo === oldRenderInfo ||
      // If sublayers have changed
      oldRenderInfo.layers.length !== renderInfo.layers.length ||
      // If a sublayer's positions have been updated, the cached bounds will change shallowly
      renderInfo.layerBounds.some((b, i) => b !== oldRenderInfo.layerBounds[i]);

    this.channels[renderInfo.collideGroup] = renderInfo;

    if (renderInfoUpdated || viewportChanged) {
      this.lastViewport = viewport;
      const collidePass = this.collidePasses[renderInfo.collideGroup];

      // Rerender collide FBO
      // @ts-ignore (2532) This method is only called from preRender where collidePass is defined
      collidePass.render({
        pass: 'collide',
        layers: renderInfo.layers,
        effects,
        layerFilter,
        viewports: viewport ? [viewport] : [],
        onViewportActive,
        views,
        moduleParameters: {
          devicePixelRatio: cssToDeviceRatio(collidePass.gl) / DOWNSCALE
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
        this.collidePasses[collideGroup] = new CollidePass(gl, {
          id: collideGroup,
          dummyCollideMap: this.dummyCollideMap
        });
        this.channels[collideGroup] = channelMap[collideGroup];
      }
    }
    for (const [collideGroup, collidePass] of Object.entries(this.collidePasses)) {
      if (!channelMap[collideGroup]) {
        collidePass.delete();
        delete this.collidePasses[collideGroup];
      }
    }

    return channelMap;
  }

  getModuleParameters(): {collideMaps: Record<string, Texture2D>; dummyCollideMap: Texture2D} {
    const collideMaps = {};
    for (const collideGroup in this.collidePasses) {
      collideMaps[collideGroup] = this.collidePasses[collideGroup].collideMap;
    }
    return {collideMaps, dummyCollideMap: this.dummyCollideMap};
  }

  cleanup(): void {
    if (this.dummyCollideMap) {
      this.dummyCollideMap.delete();
      this.dummyCollideMap = undefined;
    }
    this.channels = {};
    for (const collidePass of Object.values(this.collidePasses)) {
      collidePass.delete();
    }
    this.collidePasses = {};
    this.lastViewport = undefined;
  }

  // Debug show FBO contents on screen
  // _debug(collidePass) {
  //   const minimap = true;
  //   const collideMap = collidePass.collideMap;
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
