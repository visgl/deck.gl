// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Device} from '@luma.gl/core';

/**
 * Base class for passes
 * @todo v9 - should the luma.gl RenderPass be owned by this class?
 * Currently owned by subclasses
 */
export default class Pass {
  /** string id, mainly for debugging */
  id: string;
  /** The luma.gl Device that this pass is associated with */
  device: Device;
  /** TODO v9 - inject prop types from parent */
  props: any;

  /** Create a new Pass instance */
  constructor(device: Device, props: {id: string} = {id: 'pass'}) {
    const {id} = props;
    this.id = id; // id of this pass
    this.device = device;
    this.props = {...props};
  }

  setProps(props): void {
    Object.assign(this.props, props);
  }

  render(params): void {} // eslint-disable-line @typescript-eslint/no-empty-function

  cleanup() {} // eslint-disable-line @typescript-eslint/no-empty-function
}
