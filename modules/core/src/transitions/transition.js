
export const TRANSITION_STATE = {
  NONE: 'none',
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  ENDED: 'ended'
};

function noop() {}

export default class Transition {

  constructor(props) {
    this._startTime = null;
    this._state = TRANSITION_STATE.NONE;

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
    return this._state === TRANSITION_STATE.PENDING ||
      this._state === TRANSITION_STATE.IN_PROGRESS;
  }

  start(props) {
    if (this.inProgress) {
      this.onInterrupt(this);
    }
    Object.assign(this, props);
    this._setState(TRANSITION_STATE.PENDING);
  }

  cancel() {
    if (this.inProgress) {
      this.onInterrupt(this);
      this._setState(TRANSITION_STATE.NONE);
    }
  }

  update(currentTime) {
    if (this.state === TRANSITION_STATE.PENDING) {
      this._startTime = currentTime;
      this._setState(TRANSITION_STATE.IN_PROGRESS);
    }

    if (this.state === TRANSITION_STATE.IN_PROGRESS) {
      let shouldEnd = false;
      let time = (currentTime - this._startTime) / this.duration;
      if (time >= 1) {
        time = 1;
        shouldEnd = true;
      }
      this.time = this.easing(time);
      this.onUpdate(this);

      if (shouldEnd) {
        this._setState(TRANSITION_STATE.ENDED);
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
    case TRANSITION_STATE.PENDING:
      this.onStart(this);
      break;
    case TRANSITION_STATE.ENDED:
      this.onEnd(this);
      break;
    default:
    }
  }
}
