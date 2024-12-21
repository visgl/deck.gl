import type {ResourceManagerContext} from './resource-manager';
export declare type ResourceSubscriber<T = any> = {
  onChange: (data: T | Promise<T>) => void;
};
export default class Resource<T = any> {
  id: string;
  context: ResourceManagerContext;
  isLoaded: boolean;
  persistent?: boolean;
  private _loadCount;
  private _subscribers;
  private _data;
  private _loader?;
  private _error?;
  private _content?;
  constructor(id: string, data: T | Promise<T> | string, context: ResourceManagerContext);
  subscribe(consumer: ResourceSubscriber<T>): void;
  unsubscribe(consumer: ResourceSubscriber<T>): void;
  inUse(): boolean;
  delete(): void;
  getData(): T | Promise<T>;
  setData(data: any, forceUpdate?: boolean): void;
}
// # sourceMappingURL=resource.d.ts.map
