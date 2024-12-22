import {
  COMPONENT_SYMBOL,
  ASYNC_ORIGINAL_SYMBOL,
  ASYNC_RESOLVED_SYMBOL,
  ASYNC_DEFAULTS_SYMBOL
} from './constants';
export declare type StatefulComponentProps<PropsT> = PropsT & {
  id: string;
  [COMPONENT_SYMBOL]: Component<PropsT>;
  [ASYNC_DEFAULTS_SYMBOL]: Partial<PropsT>;
  [ASYNC_ORIGINAL_SYMBOL]: Partial<PropsT>;
  [ASYNC_RESOLVED_SYMBOL]: Partial<PropsT>;
};
export default class Component<PropsT = {}> {
  static componentName: string;
  static defaultProps: Readonly<{}>;
  id: string;
  props: StatefulComponentProps<PropsT>;
  count: number;
  constructor(...propObjects: Partial<PropsT>[]);
  clone(newProps: Partial<PropsT>): any;
}
// # sourceMappingURL=component.d.ts.map
