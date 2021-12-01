import {
  LIFECYCLE,
  Lifecycle,
  COMPONENT,
  ASYNC_ORIGINAL,
  ASYNC_RESOLVED,
  ASYNC_DEFAULTS
} from './constants';
import {createProps} from './create-props';
import ComponentState from './component-state';

let counter = 0;

export interface ComponentProps {
  id: string;
}

export type StatefulComponentProps<T extends ComponentProps> = T & {
  [COMPONENT]: Component<T>;
  [ASYNC_DEFAULTS]: Partial<T>;
  [ASYNC_ORIGINAL]: Partial<T>;
  [ASYNC_RESOLVED]: Partial<T>;
};

export default class Component<T extends ComponentProps> {
  static componentName: string = 'Component';
  static defaultProps: Readonly<{}> = {};

  id: string;
  props: StatefulComponentProps<T>;
  count: number;
  lifecycle: Lifecycle;
  parent: Component<any> | null;
  context: Record<string, any> | null;
  state: Record<string, any> | null;
  internalState: ComponentState<T> | null;

  constructor(...propObjects: Partial<T>[]) {
    // Merge supplied props with default props and freeze them.
    /* eslint-disable prefer-spread */
    this.props = createProps<T>(this, propObjects);
    /* eslint-enable prefer-spread */

    // Define all members before layer is sealed
    this.id = this.props.id; // The layer's id, used for matching with layers from last render cycle
    this.count = counter++; // Keep track of how many layer instances you are generating
    this.lifecycle = LIFECYCLE.NO_STATE; // Helps track and debug the life cycle of the layers
    this.parent = null; // reference to the composite layer parent that rendered this layer
    this.context = null; // Will reference layer manager's context, contains state shared by layers
    this.state = null; // Will be set to the shared layer state object during layer matching
    this.internalState = null;

    // Seal the layer
    Object.seal(this);
  }

  get root() {
    // eslint-disable-next-line
    let component: Component<any> = this;
    while (component.parent) {
      component = component.parent;
    }
    return component;
  }

  // clone this layer with modified props
  clone(newProps) {
    const {props} = this;

    // Async props cannot be copied with Object.assign, copy them separately
    const asyncProps: Partial<T> = {};

    // See async props definition in create-props.js
    for (const key in props[ASYNC_DEFAULTS]) {
      if (key in props[ASYNC_RESOLVED]) {
        asyncProps[key] = props[ASYNC_RESOLVED][key];
      } else if (key in props[ASYNC_ORIGINAL]) {
        asyncProps[key] = props[ASYNC_ORIGINAL][key];
      }
    }

    // Some custom layer implementation may not support multiple arguments in the constructor
    // @ts-ignore
    return new this.constructor({...props, ...asyncProps, ...newProps});
  }

  // PROTECTED METHODS, override in subclass

  _initState() {
    this.internalState = new ComponentState(this);
  }
}
