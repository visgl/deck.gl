function noop() {}

const DEFAULT_SETTINGS = {
  onStart: noop,
  onUpdate: noop,
  onInterrupt: noop,
  onEnd: noop
};

export default class Transition {
  /**
   * @params timeline {Timeline}
   */
  constructor(timeline) {
    this._inProgress = false;
    this._handle = null;
    this.timeline = timeline;

    // Defaults
    this.settings = {};
  }

  /* Public API */
  get inProgress() {
    return this._inProgress;
  }

  /**
   * (re)start this transition.
   * @params props {object} - optional overriding props. see constructor
   */
  start(props) {
    this.cancel();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, props);
    this._inProgress = true;
    this.settings.onStart(this);
  }

  /**
   * end this transition if it is in progress.
   */
  end() {
    if (this._inProgress) {
      this.timeline.removeChannel(this._handle);
      this._handle = null;
      this._inProgress = false;
      this.settings.onEnd(this);
    }
  }

  /**
   * cancel this transition if it is in progress.
   */
  cancel() {
    if (this._inProgress) {
      this.settings.onInterrupt(this);
      this.timeline.removeChannel(this._handle);
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
      const {timeline, settings} = this;
      this._handle = timeline.addChannel({
        delay: timeline.getTime(),
        duration: settings.duration
      });
    }

    this.time = this.timeline.getTime(this._handle);
    // Call subclass method
    this._onUpdate();
    // Call user callback
    this.settings.onUpdate(this);

    // This only works if `settings.duration` is set
    // Spring transition must call `end` manually
    if (this.timeline.isFinished(this._handle)) {
      this.end();
    }
    return true;
  }

  /* Private API */

  _onUpdate() {
    // for subclass override
  }
}
