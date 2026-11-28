// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {requestAnimationFramePolyfill, cancelAnimationFramePolyfill} from '@luma.gl/engine';
import type {AnimationFrameCallback, AnimationFrameProvider} from '@luma.gl/engine';

/** Callbacks that connect `OnDemandFrameProvider` to its owner */
export type OnDemandFrameProviderProps = {
  /** Checked after each frame, the loop goes idle if it returns `false` */
  needsFrame: () => boolean;
  /** Called when the loop goes idle */
  onIdle: () => void;
  /** Called when `requestFrame` resumes the idle loop */
  onResume: () => void;
};

/**
 * Frame source for luma.gl's `AnimationLoop` that stops requesting frames while
 * `needsFrame()` returns `false`. Call `requestFrame()` to resume the loop.
 */
export default class OnDemandFrameProvider implements AnimationFrameProvider {
  /** Callbacks supplied by the owner */
  private props: OnDemandFrameProviderProps;
  /** The loop's next frame callback, held while no browser frame is requested */
  private _callback: AnimationFrameCallback | null = null;
  /** Id of the pending browser frame, `null` if none is requested */
  private _animationFrameId: unknown = null;

  /** Creates a provider that asks `props.needsFrame()` before each frame */
  constructor(props: OnDemandFrameProviderProps) {
    this.props = props;
  }

  /** `true` if the loop is waiting for `requestFrame()` */
  get isIdle(): boolean {
    return this._callback !== null && this._animationFrameId === null;
  }

  /** Holds the loop's callback and requests a browser frame only if `needsFrame()` returns `true` */
  requestAnimationFrame(callback: AnimationFrameCallback): number {
    this._callback = callback;
    if (this.props.needsFrame()) {
      this._scheduleFrame();
    } else {
      this.props.onIdle();
    }
    // AnimationLoop only passes this id back to `cancelAnimationFrame`
    return 0;
  }

  /** Cancels the pending browser frame and drops the held callback */
  cancelAnimationFrame(): void {
    if (this._animationFrameId !== null) {
      cancelAnimationFramePolyfill(this._animationFrameId);
      this._animationFrameId = null;
    }
    this._callback = null;
  }

  /** Requests the next frame if the loop is idle */
  requestFrame(): void {
    if (this.isIdle) {
      this.props.onResume();
      this._scheduleFrame();
    }
  }

  /** Requests a browser frame that runs the held callback */
  private _scheduleFrame(): void {
    this._animationFrameId = requestAnimationFramePolyfill((time: number) => {
      const callback = this._callback;
      this._animationFrameId = null;
      this._callback = null;
      callback?.(time);
    });
  }
}
