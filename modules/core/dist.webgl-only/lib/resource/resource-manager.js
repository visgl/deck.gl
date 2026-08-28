// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import Resource from "./resource.js";
export default class ResourceManager {
    constructor(props) {
        this.protocol = props.protocol || 'resource://';
        this._context = {
            device: props.device,
            // @ts-expect-error
            gl: props.device?.gl,
            resourceManager: this
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
    add({ resourceId, data, forceUpdate = false, persistent = true }) {
        let res = this._resources[resourceId];
        if (res) {
            res.setData(data, forceUpdate);
        }
        else {
            res = new Resource(resourceId, data, this._context);
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
    unsubscribe({ consumerId }) {
        const consumer = this._consumers[consumerId];
        if (consumer) {
            for (const requestId in consumer) {
                const request = consumer[requestId];
                const resource = this._resources[request.resourceId];
                if (resource) {
                    resource.unsubscribe(request);
                }
            }
            delete this._consumers[consumerId];
            this.prune();
        }
    }
    subscribe({ resourceId, onChange, consumerId, requestId = 'default' }) {
        const { _resources: resources, protocol } = this;
        if (resourceId.startsWith(protocol)) {
            resourceId = resourceId.replace(protocol, '');
            if (!resources[resourceId]) {
                // Add placeholder. When this resource becomes available, the consumer will be notified.
                this.add({ resourceId, data: null, persistent: false });
            }
        }
        const res = resources[resourceId];
        this._track(consumerId, requestId, res, onChange);
        if (res) {
            return res.getData();
        }
        return undefined;
    }
    prune() {
        if (!this._pruneRequest) {
            // prune() may be called multiple times in the same animation frame.
            // Batch multiple requests together
            // @ts-ignore setTimeout returns NodeJS.Timeout in node
            this._pruneRequest = setTimeout(() => this._prune(), 0);
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
        let request = consumer[requestId];
        const oldResource = request && request.resourceId && this._resources[request.resourceId];
        if (oldResource) {
            oldResource.unsubscribe(request);
            this.prune();
        }
        if (resource) {
            if (request) {
                request.onChange = onChange;
                request.resourceId = resource.id;
            }
            else {
                request = {
                    onChange,
                    resourceId: resource.id
                };
            }
            consumer[requestId] = request;
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
//# sourceMappingURL=resource-manager.js.map