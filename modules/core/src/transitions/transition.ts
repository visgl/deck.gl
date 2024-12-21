// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Timeline} from '@luma.gl/engine';

export type TransitionSettings = {
  duration: number;
  onStart?: (transition: Transition) => void;
  onUpdate?: (transition: Transition) => void;
  onInterrupt?: (transition: Transition) => void;
  onEnd?: (transition: Transition) => void;
};

export default class Transition {
  private _inProgress: boolean = false;
  private _handle: number | null = null;
  private _timeline: Timeline;

  time: number = 0;
  // @ts-expect-error
  settings: TransitionSettings & {fromValue; toValue; duration; easing; damping; stiffness} = {
    duration: 0
  };

  /**
   * @params timeline {Timeline}
   */
  constructor(timeline: Timeline) {
    this._timeline = timeline;
  }

  /* Public API */
  get inProgress(): boolean {
    return this._inProgress;
  }

  /**
   * (re)start this transition.
   * @params props {object} - optional overriding props. see constructor
   */
  start(settings: TransitionSettings) {
    this.cancel();
    // @ts-expect-error
    this.settings = settings;
    this._inProgress = true;
    this.settings.onStart?.(this);
  }

  /**
   * end this transition if it is in progress.
   */
  end() {
    if (this._inProgress) {
      this._timeline.removeChannel(this._handle as number);
      this._handle = null;
      this._inProgress = false;
      this.settings.onEnd?.(this);
    }
  }

  /**
   * cancel this transition if it is in progress.
   */
  cancel() {
    if (this._inProgress) {
      this.settings.onInterrupt?.(this);
      this._timeline.removeChannel(this._handle as number);
      this._handle = null;
      this._inProgress = false;
    }
  }

  /**
   * update this transition. Returns `true` if updated.
   */
  update() {
    if (!this._inProgress) {
      return false;
    }

    // It is important to initialize the handle during `update` instead of `start`.
    // The CPU time that the `start` frame takes should not be counted towards the duration.
    // On the other hand, `update` always happens during a render cycle. The clock starts when the
    // transition is rendered for the first time.
    if (this._handle === null) {
      const {_timeline: timeline, settings} = this;
      this._handle = timeline.addChannel({
        delay: timeline.getTime(),
        duration: settings.duration
      });
    }

    this.time = this._timeline.getTime(this._handle);
    // Call subclass method
    this._onUpdate();
    // Call user callback
    this.settings.onUpdate?.(this);

    // This only works if `settings.duration` is set
    // Spring transition must call `end` manually
    if (this._timeline.isFinished(this._handle)) {
      this.end();
    }
    return true;
  }

  /* Private API */

  protected _onUpdate() {
    // for subclass override
  }
}
