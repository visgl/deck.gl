// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { load } from '@loaders.gl/core';
export default class Resource {
    constructor(id, data, context) {
        this._loadCount = 0;
        this._subscribers = new Set();
        this.id = id;
        this.context = context;
        this.setData(data);
    }
    // consumer: {onChange: Function}
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
        return this.isLoaded
            ? this._error
                ? Promise.reject(this._error)
                : this._content
            : this._loader.then(() => this.getData());
    }
    setData(data, forceUpdate) {
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
        }
        else {
            this.isLoaded = true;
            this._error = undefined;
            this._content = data;
        }
        for (const subscriber of this._subscribers) {
            subscriber.onChange(this.getData());
        }
    }
}
//# sourceMappingURL=resource.js.map