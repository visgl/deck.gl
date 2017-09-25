
export default class Stats {
  constructor({id}) {
    this.id = id;
    this.time = 0;
    this.total = 0;
    this.average = 0;
    this.count = 0;

    this._time = 0;
  }

  timeStart() {
    this._time = this.timestampMs();
  }

  timeEnd() {
    this.time = this.timestampMs() - this._time;
    this.total += this.time;
    this.count++;
    this.average = this.total / this.count;
  }

  timestampMs() {
    /* global window */
    return typeof window !== undefined && window.performance ?
      window.performance.now() :
      Date.now();
  }

  getTimeString() {
    return `${this.id}:${formatTime(this.time)}(${this.count})`;
  }
}

// TODO: Currently unused, keeping in case we want it later for log formatting
export function formatTime(ms) {
  let formatted;
  if (ms < 10) {
    formatted = `${ms.toFixed(2)}ms`;
  } else if (ms < 100) {
    formatted = `${ms.toFixed(1)}ms`;
  } else if (ms < 1000) {
    formatted = `${ms.toFixed(0)}ms`;
  } else {
    formatted = `${(ms / 1000).toFixed(2)}s`;
  }
  return formatted;
}

export function leftPad(string, length = 8) {
  while (string.length < length) {
    string = ` ${string}`;
  }
  return string;
}
