// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {
  _LayersPass,
  type Effect,
  type EffectContext,
  type Layer,
  type PreRenderOptions,
  type Viewport
} from '@deck.gl/core';
import {
  assert,
  type Device,
  type Framebuffer,
  type Parameters,
  type TextureFormatColor
} from '@luma.gl/core';
import {GBuffer} from '@luma.gl/experimental';
import {Matrix4} from '@math.gl/core';
import {getSceneBufferCamera} from './scene-buffer-camera';
import {SceneVelocityModel} from './scene-velocity-model';

export type SceneBufferLayerOptions = {
  /** Opaque surfaces write depth. Transparent surfaces contribute color after the opaque passes. */
  mode: 'opaque' | 'transparent';
  /** The layer shader implements surfaceBuffer output for normals and selection. */
  surfaceBuffer?: boolean;
  selected?: boolean;
  /** The shader implements motionBuffer output, including previous object positions. */
  motionBuffer?: boolean;
};
export type SceneBufferEffectProps = {
  id?: string;
  /** Explicit participation; return null for layers outside this scene capture. */
  getLayerOptions: (layer: Layer) => SceneBufferLayerOptions | null;
  /** Defaults to rgba16float. Formats are never silently downgraded. */
  colorFormat?: TextureFormatColor;
  /** Capture background, defaulting to transparent black. */
  clearColor?: [number, number, number, number];
  /** Allocate a second complete capture for the preceding frame. Defaults to false. */
  history?: boolean;
  /** Allocate and render an opaque selection mask. Defaults to false. */
  selection?: boolean;
  /** Capture current-minus-previous UV motion. Defaults to false. */
  motionVectors?: boolean;
  /** Caller-owned animation clock in seconds, sampled once per capture. */
  getTime?: () => number;
};
export type SceneBufferFrame = {
  /** Owned by the effect. Contents are valid until this slot is reused. */
  buffer: GBuffer;
  previousBuffer?: GBuffer;
  viewProjectionMatrix: readonly number[];
  previousViewProjectionMatrix?: readonly number[];
  /** Texture-space viewport rectangle, in physical pixels. */
  viewportBounds: readonly [number, number, number, number];
  frameIndex: number;
  historyValid: boolean;
  time: number;
  previousTime: number;
};
type CaptureResources = {
  buffer: GBuffer;
  colorFramebuffer: Framebuffer;
  normalFramebuffer: Framebuffer;
  selectionFramebuffer?: Framebuffer;
  velocityFramebuffer?: Framebuffer;
};
type ViewCapture = {
  slots: CaptureResources[];
  completedIndex?: number;
  frame?: SceneBufferFrame;
  historyInvalidated: boolean;
};
type CaptureMode = 'opaque' | 'normal' | 'selection' | 'transparent' | 'velocity';

/** Opt-in WebGPU auxiliary scene capture, independent of Deck's color-only postprocessing chain. */
export class SceneBufferEffect implements Effect {
  readonly id: string;
  readonly props: SceneBufferEffectProps;
  readonly useInPicking = false;
  private device?: Device;
  private capturePass?: SceneCapturePass;
  private velocityModel?: SceneVelocityModel;
  private readonly views = new Map<string, ViewCapture>();
  private frameIndex = 0;

  constructor(props: SceneBufferEffectProps) {
    this.props = props;
    this.id = props.id || 'scene-buffers';
  }
  setup({device}: EffectContext): void {
    // The shared GBuffer and the downstream depth-aware passes currently require WebGPU.
    assert(device.type === 'webgpu');
    this.device = device;
    if (this.props.motionVectors) this.velocityModel = new SceneVelocityModel(device);
    this.capturePass = new SceneCapturePass(
      device,
      {id: `${this.id}-capture`},
      this.props.getLayerOptions
    );
  }
  getFrame(viewportId: string): SceneBufferFrame | undefined {
    return this.views.get(viewportId)?.frame;
  }
  /** Call for a camera cut, teleport, discontinuous time change, or scene replacement. */
  resetHistory(viewportId?: string): void {
    for (const [id, capture] of this.views) {
      if (viewportId === undefined || viewportId === id) capture.historyInvalidated = true;
    }
  }
  /** Restore normal material output for Deck's display and picking passes. */
  getShaderModuleProps(layer: Layer): object {
    const layerOptions = this.props.getLayerOptions(layer);
    return {
      ...(layerOptions?.surfaceBuffer ? {surfaceBuffer: {enabled: 0}} : {}),
      ...(layerOptions?.motionBuffer ? {motionBuffer: {enabled: 0}} : {})
    };
  }
  preRender(options: PreRenderOptions): void {
    if (options.isPicking || !this.device || !this.capturePass) return;
    const canvasContext = options.canvasContext || this.device.getCanvasContext();
    const [width, height] = canvasContext.getDrawingBufferSize();
    if (width <= 0 || height <= 0) return;
    const activeIds = new Set(
      options.viewports
        .filter(viewport => viewport.width > 0 && viewport.height > 0)
        .map(viewport => viewport.id)
    );
    for (const [id, capture] of this.views) {
      if (!activeIds.has(id)) {
        destroyCapture(capture);
        this.views.delete(id);
      }
    }
    const time = this.props.getTime?.() ?? 0;
    const effects = options.effects?.filter(effect => effect !== this);
    const baseOptions = {
      ...options,
      canvasContext,
      effects,
      isPicking: false,
      // View clearing would start a nested pass on this Deck version. Each view owns fresh targets.
      views: undefined,
      clearColor: undefined
    };
    for (const viewport of options.viewports) {
      if (viewport.width <= 0 || viewport.height <= 0) continue;
      let capture = this.views.get(viewport.id);
      if (
        !capture ||
        capture.slots[0].buffer.width !== width ||
        capture.slots[0].buffer.height !== height
      ) {
        const replacement = this.createCapture(viewport.id, width, height);
        if (capture) destroyCapture(capture);
        capture = replacement;
        this.views.set(viewport.id, capture);
      }
      const pixelRatio = canvasContext.cssToDeviceRatio();
      const viewportBounds: [number, number, number, number] = [
        viewport.x * pixelRatio,
        viewport.y * pixelRatio,
        viewport.width * pixelRatio,
        viewport.height * pixelRatio
      ];
      const previousFrame =
        !capture.historyInvalidated &&
        capture.frame?.viewportBounds.every((value, index) => value === viewportBounds[index])
          ? capture.frame
          : undefined;
      const camera = getSceneBufferCamera(viewport);
      const previousCamera = previousFrame
        ? new Matrix4([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0.5, 0, 0, 0, 0.5, 1]).multiplyRight(
            previousFrame.viewProjectionMatrix
          )
        : camera.viewProjectionMatrix;
      const currentClipToPreviousClip = new Matrix4(previousCamera).multiplyRight(
        camera.inverseViewProjectionMatrix
      );
      this.capturePass.motionProps = {
        enabled: 0,
        currentClipToPreviousClip,
        previousTime: previousFrame?.time ?? time,
        viewportScale: [viewportBounds[2] / width, viewportBounds[3] / height]
      };
      const nextIndex = this.props.history && capture.completedIndex === 0 ? 1 : 0;
      const target = capture.slots[nextIndex];
      const viewOptions = {...baseOptions, viewports: [viewport]};
      this.capturePass.viewParameters = options.views?.[viewport.id]?.props.parameters || {};
      const modelParameters = options.layers.flatMap(layer =>
        layer.getModels().map(model => ({model, parameters: {...model.parameters}}))
      );
      try {
        this.capturePass.captureMode = 'opaque';
        this.capturePass.render({
          ...viewOptions,
          pass: `${this.id}-opaque`,
          target: target.colorFramebuffer,
          clearCanvas: true,
          clearColor: this.props.clearColor ?? [0, 0, 0, 0]
        });
        this.capturePass.captureMode = 'normal';
        this.capturePass.render({
          ...viewOptions,
          pass: `${this.id}-normal`,
          target: target.normalFramebuffer,
          clearCanvas: false,
          clearColor: [0.5, 0.5, 1, 1]
        });
        if (target.selectionFramebuffer) {
          this.capturePass.captureMode = 'selection';
          this.capturePass.render({
            ...viewOptions,
            pass: `${this.id}-selection`,
            target: target.selectionFramebuffer,
            clearCanvas: false,
            clearColor: [0, 0, 0, 0]
          });
        }
        if (target.velocityFramebuffer) {
          this.velocityModel!.render(
            target.velocityFramebuffer,
            target.buffer.depthTexture,
            currentClipToPreviousClip,
            viewportBounds
          );
          this.capturePass.captureMode = 'velocity';
          this.capturePass.render({
            ...viewOptions,
            pass: `${this.id}-velocity`,
            target: target.velocityFramebuffer,
            clearCanvas: false,
            clearColor: undefined
          });
        }
        this.capturePass.captureMode = 'transparent';
        this.capturePass.render({
          ...viewOptions,
          pass: `${this.id}-transparent`,
          target: target.colorFramebuffer,
          clearCanvas: false
        });
      } finally {
        for (const {model, parameters} of modelParameters) model.setParameters(parameters);
        for (const layer of options.layers) {
          if (this.props.getLayerOptions(layer)?.surfaceBuffer)
            layer.setShaderModuleProps({surfaceBuffer: {enabled: 0}});
          if (this.props.getLayerOptions(layer)?.motionBuffer)
            layer.setShaderModuleProps({motionBuffer: {enabled: 0}});
        }
      }
      capture.frame = {
        buffer: target.buffer,
        previousBuffer: this.props.history ? previousFrame?.buffer : undefined,
        viewProjectionMatrix: [...viewport.viewProjectionMatrix],
        previousViewProjectionMatrix: previousFrame?.viewProjectionMatrix,
        viewportBounds,
        frameIndex: this.frameIndex,
        historyValid: Boolean(previousFrame),
        time,
        previousTime: previousFrame?.time ?? time
      };
      capture.completedIndex = nextIndex;
      capture.historyInvalidated = false;
    }
    this.frameIndex++;
  }
  cleanup(): void {
    for (const capture of this.views.values()) destroyCapture(capture);
    this.views.clear();
    this.velocityModel?.destroy();
    this.velocityModel = undefined;
    this.capturePass?.cleanup();
    this.capturePass = undefined;
    this.device = undefined;
  }
  private createCapture(viewportId: string, width: number, height: number): ViewCapture {
    const slots: CaptureResources[] = [];
    try {
      for (let index = 0; index < (this.props.history ? 2 : 1); index++) {
        const buffer = new GBuffer(this.device!, {
          id: `${this.id}-${viewportId}-${index}`,
          width,
          height,
          colorFormat: this.props.colorFormat || 'rgba16float',
          velocity: this.props.motionVectors ?? false,
          extraColorAttachments: this.props.selection
            ? [{name: 'selection', format: 'r8unorm'}]
            : []
        });
        const framebuffers: Framebuffer[] = [];
        try {
          for (const texture of [
            buffer.colorTexture,
            buffer.normalRoughnessTexture,
            ...(this.props.selection ? [buffer.getExtraColorTexture('selection')] : []),
            ...(this.props.motionVectors ? [buffer.velocityTexture] : [])
          ]) {
            framebuffers.push(
              this.device!.createFramebuffer({
                width,
                height,
                colorAttachments: [texture],
                depthStencilAttachment: buffer.depthTexture
              })
            );
          }
          slots.push({
            buffer,
            colorFramebuffer: framebuffers[0],
            normalFramebuffer: framebuffers[1],
            selectionFramebuffer: this.props.selection ? framebuffers[2] : undefined,
            velocityFramebuffer: this.props.motionVectors
              ? framebuffers[this.props.selection ? 3 : 2]
              : undefined
          });
        } catch (error) {
          for (const framebuffer of framebuffers) framebuffer.destroy();
          buffer.destroy();
          throw error;
        }
      }
      return {slots, historyInvalidated: true};
    } catch (error) {
      destroyCapture({slots, historyInvalidated: true});
      throw error;
    }
  }
}

class SceneCapturePass extends _LayersPass {
  captureMode: CaptureMode = 'opaque';
  viewParameters: Parameters = {};
  motionProps: object = {};
  constructor(
    device: Device,
    props: {id: string},
    private getLayerOptions: SceneBufferEffectProps['getLayerOptions']
  ) {
    super(device, props);
  }
  override shouldDrawLayer(layer: Layer): boolean {
    const options = this.getLayerOptions(layer);
    if (!options) return false;
    if (this.captureMode === 'velocity') return Boolean(options.motionBuffer);
    if (this.captureMode === 'normal' || this.captureMode === 'selection') {
      return (
        options.mode === 'opaque' &&
        Boolean(options.surfaceBuffer) &&
        (this.captureMode !== 'selection' || Boolean(options.selected))
      );
    }
    return options.mode === this.captureMode;
  }
  protected override getShaderModuleProps(layer: Layer): object {
    const layerOptions = this.getLayerOptions(layer);
    return {
      ...(layerOptions?.motionBuffer
        ? {motionBuffer: {...this.motionProps, enabled: this.captureMode === 'velocity' ? 1 : 0}}
        : {}),
      ...(layerOptions?.surfaceBuffer
        ? {
            surfaceBuffer: {
              enabled: this.captureMode === 'normal' ? 1 : this.captureMode === 'selection' ? 2 : 0,
              viewMatrix: layer.context.viewport.viewMatrix
            }
          }
        : {})
    };
  }
  protected override getLayerParameters(
    layer: Layer,
    _layerIndex: number,
    _viewport: Viewport
  ): Parameters {
    const parameters = {...this.viewParameters, ...layer.props.parameters};
    if (this.captureMode === 'transparent')
      return {...parameters, depthCompare: 'less-equal', depthWriteEnabled: false};
    return {
      ...parameters,
      depthCompare: 'less-equal',
      depthWriteEnabled: this.captureMode === 'opaque',
      blend: false,
      blendColorOperation: 'add',
      blendAlphaOperation: 'add',
      blendColorSrcFactor: 'one',
      blendColorDstFactor: 'zero',
      blendAlphaSrcFactor: 'one',
      blendAlphaDstFactor: 'zero'
    };
  }
}
function destroyCapture(capture: ViewCapture): void {
  for (const slot of capture.slots) {
    slot.colorFramebuffer.destroy();
    slot.normalFramebuffer.destroy();
    slot.selectionFramebuffer?.destroy();
    slot.velocityFramebuffer?.destroy();
    slot.buffer.destroy();
  }
}
