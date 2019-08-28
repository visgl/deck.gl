// transition states
const STATE_NONE = 0;
const STATE_PENDING = 1;
const STATE_IN_PROGRESS = 2;
const STATE_ENDED = 3;

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
    this._state = STATE_NONE;
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
  get state() {
    return this._state;
  }

  get inProgress() {
    return this._state === STATE_PENDING || this._state === STATE_IN_PROGRESS;
  }

  /**
   * (re)start this transition.
   * @params props {object} - optional overriding props. see constructor
   */
  start(props) {
    if (this.inProgress) {
      this.onInterrupt(this);
    }
    Object.assign(this, props);
    this._setState(STATE_PENDING);
  }

  /**
   * cancel this transition if it is in progress.
   */
  cancel() {
    if (this.inProgress) {
      this.onInterrupt(this);
      this._setState(STATE_NONE);
      this.timeline.removeChannel(this._handle);
    }
  }

  /**
   * update this transition.
   */
  update() {
    const {timeline, duration, easing} = this;
    let handle = this._handle;
    if (this.state === STATE_PENDING) {
      if (handle !== null) {
        timeline.removeChannel(handle);
      }
      handle = timeline.addChannel({
        delay: timeline.getTime(),
        duration
      });
      this._handle = handle;
      this._setState(STATE_IN_PROGRESS);
    }

    if (this.state === STATE_IN_PROGRESS) {
      const time = timeline.getTime(handle);
      this.time = easing(time / duration);
      this.onUpdate(this);

      if (timeline.isFinished(handle)) {
        timeline.removeChannel(handle);
        this._handle = null;
        this._setState(STATE_ENDED);
      }
      return true;
    }

    return false;
  }

  /* Private API */
  _setState(newState) {
    if (this._state === newState) {
      return;
    }

    this._state = newState;

    switch (newState) {
      case STATE_PENDING:
        this.onStart(this);
        break;
      case STATE_ENDED:
        this.onEnd(this);
        break;
      default:
    }
  }
}
