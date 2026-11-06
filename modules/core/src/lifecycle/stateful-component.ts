// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import Component from './component';
import ComponentState from './component-state';
import {diffProps} from './props';

/** Experimental lifecycle base for declarative components with retained resources. */
export default class StatefulComponent<PropsT extends {} = {}> extends Component<PropsT> {
  static defaultProps: Readonly<{}> = {updateTriggers: {}};

  /** User state retained when an owner replaces a matching descriptor. */
  state: Record<string, any> = {};
  /** Async props and previous props associated with the retained state. */
  internalState: ComponentState<this> | null = null;

  /** Transfer retained state; owners decide identity and scheduling. */
  protected transferComponentState(previous: StatefulComponent<PropsT>): void {
    if (previous === this) return;
    this.state = previous.state;
    this.internalState = previous.internalState as ComponentState<this> | null;
    this.internalState?.setAsyncProps(this.props);
  }

  /** Compare props using the same accessor and update-trigger rules as layers. */
  protected diffComponentProps(
    newProps = this.props,
    oldProps = this.internalState?.getOldProps() || {}
  ) {
    return diffProps(newProps, oldProps);
  }
  /** Adopt a matching descriptor's resources, or initialize a new component. */
  updateComponent(previous: StatefulComponent<PropsT> | null, requestUpdate: () => void): void {
    if (
      previous &&
      previous !== this &&
      previous.id === this.id &&
      previous.constructor === this.constructor
    ) {
      this.transferComponentState(previous);
    } else if (previous && previous !== this) {
      previous.finalizeComponent();
    }
    const initialized = Boolean(this.internalState);
    if (!initialized) {
      this.internalState = new ComponentState(this);
    }
    this.internalState!.onAsyncPropUpdated = requestUpdate;
    this.internalState!.setAsyncProps(this.props);
    if (!initialized) this.initializeComponentState();
    const changes = this.diffComponentProps();
    if (
      !initialized ||
      changes.dataChanged ||
      changes.propsChanged ||
      changes.updateTriggersChanged ||
      changes.extensionsChanged ||
      changes.transitionsChanged
    ) {
      this.updateComponentState(changes);
    }
    this.internalState!.resetOldProps();
  }

  /** Allocate resources when first adopted, never in a descriptor constructor. */
  protected initializeComponentState(): void {}
  /** Update retained state after relevant props change. */
  protected updateComponentState(_changes: ReturnType<typeof diffProps>): void {}
  /** Release resources owned by this component. */
  protected finalizeComponentState(): void {}
  /** Finalize only the currently adopted descriptor. */
  finalizeComponent(): void {
    if (this.internalState?.component !== this) return;
    this.finalizeComponentState();
    this.internalState.finalize();
    this.internalState = null;
  }
}
