import {Device} from '@luma.gl/api';
export declare type ResourceManagerContext = {
  device: Device;
  resourceManager: ResourceManager;
  /** @deprecated */
  gl: WebGLRenderingContext;
};
export default class ResourceManager {
  protocol: string;
  private _context;
  private _resources;
  private _consumers;
  private _pruneRequest;
  constructor(props: {device: Device; protocol?: string});
  contains(resourceId: string): boolean;
  add({
    resourceId,
    data,
    forceUpdate,
    persistent
  }: {
    resourceId: string;
    data: any;
    forceUpdate?: boolean;
    persistent?: boolean;
  }): void;
  remove(resourceId: string): void;
  unsubscribe({consumerId}: {consumerId: string}): void;
  subscribe<T>({
    resourceId,
    onChange,
    consumerId,
    requestId
  }: {
    resourceId: string;
    onChange: (data: T | Promise<T>) => void;
    consumerId: string;
    requestId: string;
  }): T | Promise<T> | undefined;
  prune(): void;
  finalize(): void;
  private _track;
  private _prune;
}
// # sourceMappingURL=resource-manager.d.ts.map
