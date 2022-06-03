import {load} from '@loaders.gl/core';

import type {ResourceManagerContext} from './resource-manager';

export type ResourceSubscriber<T = any> = {
  onChange: (data: T | Promise<T>) => void;
};

export default class Resource<T = any> {
  id: string;
  context: ResourceManagerContext;
  isLoaded!: boolean;
  persistent?: boolean;

  private _loadCount: number = 0;
  private _subscribers = new Set<ResourceSubscriber<T>>();
  private _data!: T | Promise<T> | string;
  private _loader?: Promise<void>;
  private _error?: Error;
  private _content?: T;

  constructor(id: string, data: T | Promise<T> | string, context: ResourceManagerContext) {
    this.id = id;
    this.context = context;

    this.setData(data);
  }

  // consumer: {onChange: Function}
  subscribe(consumer: ResourceSubscriber<T>): void {
    this._subscribers.add(consumer);
  }

  unsubscribe(consumer: ResourceSubscriber<T>): void {
    this._subscribers.delete(consumer);
  }

  inUse(): boolean {
    return this._subscribers.size > 0;
  }

  delete(): void {
    // Remove any resources created
  }

  getData(): T | Promise<T> {
    return this.isLoaded
      ? this._error
        ? Promise.reject(this._error)
        : this._content!
      : this._loader!.then(() => this.getData());
  }

  setData(data: any, forceUpdate?: boolean) {
    if (data === this._data && !forceUpdate) {
      return;
    }
    this._data = data;
    const loadCount = ++this._loadCount;

    let loader = data;
    if (typeof data === 'string') {
      loader = load(data);
    }
    if (loader instanceof Promise) {
      this.isLoaded = false;
      this._loader = loader
        .then(result => {
          // check if source has changed
          if (this._loadCount === loadCount) {
            this.isLoaded = true;
            this._error = undefined;
            this._content = result;
          }
        })
        .catch(error => {
          if (this._loadCount === loadCount) {
            this.isLoaded = true;
            this._error = error || true;
          }
        });
    } else {
      this.isLoaded = true;
      this._error = undefined;
      this._content = data;
    }

    for (const subscriber of this._subscribers) {
      subscriber.onChange(this.getData());
    }
  }
}
