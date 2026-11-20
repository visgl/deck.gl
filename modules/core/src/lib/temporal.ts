// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Texture} from '@luma.gl/core';

/** Experimental scene inputs for temporal post-processing. */
export type TemporalProps = {
  /** Sub-pixel Halton(2,3) projection jitter. Default true. */
  jitter?: boolean;
  /** Camera and opted-in object velocity buffer (WebGPU only). Default true. */
  velocity?: boolean;
  /** Include opted-in object motion (WebGPU only). Default true. */
  objectVelocity?: boolean;
  /** Offscreen scale relative to the drawing buffer, (0, 1]. Default 1. */
  renderScale?: number;
};

/** Inputs shared with effects for one active temporal frame. Textures are filled before postRender. */
export type TemporalFrame = {
  /** Stable render-target identifier for effect-owned history. */
  targetId: string;
  /** Whether opted-in geometry supplied motion this frame. */
  objectVelocity: boolean;
  /** Zero-based active frame counter; restarts when temporal configuration changes. */
  frameIndex: number;
  /** Requested scene resolution scale. */
  renderScale: number;
  /** Rounded scene target dimensions in pixels. */
  renderSize: [number, number];
  /** Final drawing buffer dimensions in pixels. */
  outputSize: [number, number];
  /** Top-left-origin render-pixel jitter; zero when disabled. */
  jitter: [number, number];
  /** Same jitter as a clip-space offset. */
  jitterClip: [number, number];
  /** Number of Halton samples before repetition. */
  phaseCount: number;
  /** Main-pass sampleable depth, with near = 0 and far = 1. */
  depthTexture: Texture | null;
  /**
   * Render-size rgba16float: xy = previousUV - currentUV without jitter, z = 1 - expected
   * previous device depth, w = validity. Object pixels approximate z with current depth. WebGPU only.
   */
  velocityTexture: Texture | null;
  /** History invalidated by activation, configuration, resize, or viewport set changes. */
  reset: boolean;
};
