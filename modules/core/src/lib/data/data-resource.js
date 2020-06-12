import {load} from '@loaders.gl/core';

export default class DataResource {
  constructor(id, data, context) {
    this.id = id;
    this.context = context;

    this._subscribers = new Set();

    this.setData(data);
  }

  subscribe(consumer) {
    this._subscribers.add(consumer);
  }

  unsubscribe(consumer) {
    this._subscribers.delete(consumer);
  }

  inUse() {
    return this._subscribers.size > 0;
  }

  delete() {
    // Remove any resources created
  }

  getData() {
    return this.isLoaded ? this._content : this._loader;
  }

  setData(data, forceUpdate) {
    if (data === this._data && !forceUpdate) {
      return;
    }
    this._data = data;

    let loader = data;
    if (typeof data === 'string') {
      loader = load(data);
    }
    if (loader instanceof Promise) {
      this.isLoaded = false;
      this._loader = loader
        .then(result => {
          if (this._data === data) {
            // check if source has changed
            this._onDataLoad(result);
          }
        })
        .catch(error => {
          this.context.onError(error);
          if (this._data === data) {
            this._onDataLoad(null);
          }
        })
        .then(() => this.getData());
    } else {
      this._onDataLoad(data);
    }

    for (const subscriber of this._subscribers) {
      subscriber.onChange(this.getData());
    }
  }

  _onDataLoad(data) {
    this.isLoaded = true;
    this._content = data;
    return data;
  }
}
