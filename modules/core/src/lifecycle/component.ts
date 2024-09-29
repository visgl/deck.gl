// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  COMPONENT_SYMBOL,
  PROP_TYPES_SYMBOL,
  ASYNC_ORIGINAL_SYMBOL,
  ASYNC_RESOLVED_SYMBOL,
  ASYNC_DEFAULTS_SYMBOL
} from './constants';
import {PropType} from './prop-types';
import {createProps} from './create-props';

let counter = 0;

export type StatefulComponentProps<PropsT extends {}> = PropsT & {
  id: string;
  [COMPONENT_SYMBOL]: Component<PropsT>;
  [PROP_TYPES_SYMBOL]: Record<string, PropType>;
  [ASYNC_DEFAULTS_SYMBOL]: Partial<PropsT>;
  [ASYNC_ORIGINAL_SYMBOL]: Partial<PropsT>;
  [ASYNC_RESOLVED_SYMBOL]: Partial<PropsT>;
};

export default class Component<PropsT extends {} = {}> {
  static componentName: string = 'Component';
  static defaultProps: Readonly<{}> = {};

  id: string;
  props: StatefulComponentProps<PropsT>;
  count: number;

  constructor(...propObjects: Partial<PropsT>[]) {
    // Merge supplied props with default props and freeze them.
    /* eslint-disable prefer-spread */
    this.props = createProps<PropsT>(this, propObjects);
    /* eslint-enable prefer-spread */

    this.id = this.props.id; // The layer's id, used for matching with layers from last render cycle
    this.count = counter++; // Keep track of how many layer instances you are generating
  }

  // clone this layer with modified props
  clone(newProps: Partial<PropsT>) {
    const {props} = this;

    // Async props cannot be copied with Object.assign, copy them separately
    const asyncProps: Partial<PropsT> = {};

    // See async props definition in create-props.js
    for (const key in props[ASYNC_DEFAULTS_SYMBOL]) {
      if (key in props[ASYNC_RESOLVED_SYMBOL]) {
        asyncProps[key] = props[ASYNC_RESOLVED_SYMBOL][key];
      } else if (key in props[ASYNC_ORIGINAL_SYMBOL]) {
        asyncProps[key] = props[ASYNC_ORIGINAL_SYMBOL][key];
      }
    }

    // Some custom layer implementation may not support multiple arguments in the constructor
    // @ts-ignore
    return new this.constructor({...props, ...asyncProps, ...newProps});
  }
}
