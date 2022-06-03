/* global setTimeout */
import Resource from './resource';
import type {ResourceSubscriber} from './resource';

export type ResourceManagerContext = {
  gl: WebGLRenderingContext;
  resourceManager: ResourceManager;
};

export default class ResourceManager {
  protocol: string;

  private _context: ResourceManagerContext;
  private _resources: Record<string, Resource>;
  private _consumers: Record<
    string,
    Record<
      string,
      ResourceSubscriber & {
        resourceId: string;
      }
    >
  >;
  private _pruneRequest: number | null;

  constructor({gl, protocol}) {
    this.protocol = protocol || 'resource://';

    this._context = {
      gl,
      resourceManager: this
    };
    this._resources = {};
    this._consumers = {};

    this._pruneRequest = null;
  }

  contains(resourceId: string): boolean {
    if (resourceId.startsWith(this.protocol)) {
      return true;
    }
    return resourceId in this._resources;
  }

  add({
    resourceId,
    data,
    forceUpdate = false,
    persistent = true
  }: {
    resourceId: string;
    data: any;
    forceUpdate?: boolean;
    persistent?: boolean;
  }) {
    let res = this._resources[resourceId];

    if (res) {
      res.setData(data, forceUpdate);
    } else {
      res = new Resource(resourceId, data, this._context);
      this._resources[resourceId] = res;
    }
    // persistent resources can only be removed by calling `remove`
    // non-persistent resources may be released when there are no more consumers
    res.persistent = persistent;
  }

  remove(resourceId: string): void {
    const res = this._resources[resourceId];

    if (res) {
      res.delete();
      delete this._resources[resourceId];
    }
  }

  unsubscribe({consumerId}: {consumerId: string}): void {
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

  subscribe<T>({
    resourceId,
    onChange,
    consumerId,
    requestId = 'default'
  }: {
    resourceId: string;
    onChange: (data: T | Promise<T>) => void;
    consumerId: string;
    requestId: string;
  }): T | Promise<T> | undefined {
    const {_resources: resources, protocol} = this;
    if (resourceId.startsWith(protocol)) {
      resourceId = resourceId.replace(protocol, '');
      if (!resources[resourceId]) {
        // Add placeholder. When this resource becomes available, the consumer will be notified.
        this.add({resourceId, data: null, persistent: false});
      }
    }
    const res: Resource<T> = resources[resourceId];
    this._track(consumerId, requestId, res, onChange);
    if (res) {
      return res.getData();
    }

    return undefined;
  }

  prune(): void {
    if (!this._pruneRequest) {
      // prune() may be called multiple times in the same animation frame.
      // Batch multiple requests together
      // @ts-ignore setTimeout returns NodeJS.Timeout in node
      this._pruneRequest = setTimeout(() => this._prune(), 0);
    }
  }

  finalize(): void {
    for (const key in this._resources) {
      this._resources[key].delete();
    }
  }

  private _track(
    consumerId: string,
    requestId: string,
    resource: Resource,
    onChange: (data: any) => void
  ) {
    const consumers = this._consumers;
    const consumer = (consumers[consumerId] = consumers[consumerId] || {});
    const request = consumer[requestId] || {};

    const oldResource = request.resourceId && this._resources[request.resourceId];
    if (oldResource) {
      oldResource.unsubscribe(request);
      this.prune();
    }
    if (resource) {
      consumer[requestId] = request;
      request.onChange = onChange;
      request.resourceId = resource.id;
      resource.subscribe(request);
    }
  }

  private _prune(): void {
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
