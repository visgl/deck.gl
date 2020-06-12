/* global requestAnimationFrame */
import DataResource from './data-resource';
import log from '../../utils/log';

const DEFAULT_ERROR_HANDLER = error => {
  log.error(error.message)();
};

export default class DataManager {
  constructor({gl, protocol, onError}) {
    this.protocol = protocol || 'resource://';

    this._context = {
      gl,
      dataManager: this,
      onError: onError || DEFAULT_ERROR_HANDLER
    };
    this._resources = {};
    this._consumers = {};

    this._pruneRequest = null;
  }

  contains(resourceId) {
    if (resourceId.startsWith(this.protocol)) {
      return true;
    }
    return resourceId in this._resources;
  }

  add(resourceId, data, opts = {}) {
    const {forceUpdate = false, persistent = true} = opts;
    let res = this._resources[resourceId];

    if (res) {
      res.setData(data, forceUpdate);
    } else {
      res = new DataResource(resourceId, data, this._context);
      this._resources[resourceId] = res;
    }
    // persistent resources can only be removed by calling `remove`
    // non-persistent resources may be released when there are no more consumers
    res.persistent = persistent;
  }

  remove(resourceId) {
    const res = this._resources[resourceId];

    if (res) {
      res.delete();
      delete this._resources[resourceId];
    }
  }

  unsubscribe(consumerId) {
    const consumer = this._consumers[consumerId];
    if (consumer) {
      for (const requestId in consumer) {
        const request = consumer[requestId];
        if (request) {
          request.resource.unsubscribe(request);
        }
      }
      delete this._consumers[consumerId];
      this.prune();
    }
  }

  subscribe(resourceId, onChange, consumerId, requestId = 'default') {
    const {_resources: resources, protocol} = this;
    if (resourceId.startsWith(protocol)) {
      resourceId = resourceId.replace(protocol, '');
      if (!resources[resourceId]) {
        throw new Error(`${resourceId} not found`);
      }
    }
    const res = resources[resourceId];
    this._track(consumerId, requestId, res, onChange);
    if (res) {
      return res.getData();
    }

    return null;
  }

  prune() {
    if (!this._pruneRequest) {
      // Perf: batch multiple requests together
      this._pruneRequest = requestAnimationFrame(() => this._prune());
    }
  }

  finalize() {
    for (const key in this._resources) {
      this._resources[key].delete();
    }
  }

  _track(consumerId, requestId, resource, onChange) {
    const consumers = this._consumers;
    const consumer = (consumers[consumerId] = consumers[consumerId] || {});
    const request = consumer[requestId] || {};

    if (request.resource) {
      request.resource.unsubscribe(request);
      request.resources = null;
      this.prune();
    }
    if (resource) {
      consumer[requestId] = request;
      request.onChange = onChange;
      request.resource = resource;
      resource.subscribe(request);
    }
  }

  _prune() {
    this._pruneRequest = null;

    for (const key of Object.keys(this._resources)) {
      const res = this._resources[key];
      if (!res.persistent && !res.inUse()) {
        res.delete();
        delete this._resources[key];
      }
    }
  }
}
