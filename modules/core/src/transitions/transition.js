function noop() {}

export default class Transition {
  /**
   * @params props {object} - properties of the transition.
   *
   * @params props.timeline {Timeline}
   * @params props.duration {number} - total time to complete the transition
   * @params props.easing {func} - easing function
   * @params props.onStart {func} - callback when transition starts
   * @params props.onUpdate {func} - callback when transition updates
   * @params props.onInterrupt {func} - callback when transition is interrupted
   * @params props.onEnd {func} - callback when transition ends
   *
   * Any additional properties are also saved on the instance but have no effect.
   */
  constructor(props) {
    this._inProgress = false;
    this._handle = null;

    // Defaults
    this.duration = 1;
    this.easing = t => t;
    this.onStart = noop;
    this.onUpdate = noop;
    this.onInterrupt = noop;
    this.onEnd = noop;

    Object.assign(this, props);
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
    if (this._inProgress) {
      this.onInterrupt(this);
      this.timeline.removeChannel(this._handle);
      this._handle = null;
    }
    Object.assign(this, props);
    this._inProgress = true;
  }

  /**
   * cancel this transition if it is in progress.
   */
  cancel() {
    if (this._inProgress) {
      this.onInterrupt(this);
      this.timeline.removeChannel(this._handle);
      this._handle = null;
      this._inProgress = false;
    }
  }

  /**
   * update this transition.
   */
  update() {
    if (!this._inProgress) {
      return false;
    }
    const {timeline, duration, easing} = this;
    let handle = this._handle;

    if (handle === null) {
      handle = timeline.addChannel({
        delay: timeline.getTime(),
        duration
      });
      this._handle = handle;
      this.onStart(this);
    }

    const time = timeline.getTime(handle);
    this.time = easing(time / duration);
    this.onUpdate(this);

    if (timeline.isFinished(handle)) {
      timeline.removeChannel(handle);
      this._handle = null;
      this._inProgress = false;
      this.onEnd(this);
    }
    return true;
  }
}
