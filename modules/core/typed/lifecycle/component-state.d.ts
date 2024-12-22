import type Component from './component';
declare const EMPTY_PROPS: Readonly<{}>;
export default class ComponentState<ComponentT extends Component> {
  component: ComponentT;
  onAsyncPropUpdated: (propName: string, value: any) => void;
  private asyncProps;
  private oldProps;
  private oldAsyncProps;
  constructor(component: ComponentT);
  finalize(): void;
  getOldProps(): ComponentT['props'] | typeof EMPTY_PROPS;
  resetOldProps(): void;
  hasAsyncProp(propName: string): boolean;
  getAsyncProp(propName: string): any;
  isAsyncPropLoading(propName?: string): boolean;
  reloadAsyncProp(propName: string, value: any): void;
  setAsyncProps(props: ComponentT['props']): void;
  protected _fetch(propName: string, url: string): any;
  protected _onResolve(propName: string, value: any): void;
  protected _onError(propName: string, error: Error): void;
  private _updateAsyncProp;
  private _freezeAsyncOldProps;
  private _didAsyncInputValueChange;
  private _setPropValue;
  private _setAsyncPropValue;
  private _watchPromise;
  private _resolveAsyncIterable;
  private _postProcessValue;
  private _createAsyncPropData;
}
export {};
// # sourceMappingURL=component-state.d.ts.map
