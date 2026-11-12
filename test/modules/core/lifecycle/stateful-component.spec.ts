// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import StatefulComponent from '../../../../modules/core/src/lifecycle/stateful-component';

class Resource extends StatefulComponent<{id: string; value: number}> {
  static componentName = 'Resource';
  static defaultProps = {id: 'resource', value: 1};
  protected initializeComponentState() {
    this.state.resource = {};
  }
  protected updateComponentState() {
    this.state.value = this.props.value;
  }
  protected finalizeComponentState() {
    this.state.disposed = true;
  }
}

test('Stateful components transfer resources and finalize replacements once', () => {
  const first = new Resource();
  first.updateComponent(null, () => {});
  const resource = first.state.resource;
  const next = new Resource({value: 2});
  next.updateComponent(first, () => {});
  expect(next.state.resource).toBe(resource);
  expect(next.state.value).toBe(2);
  first.finalizeComponent();
  expect(next.state.disposed).toBeUndefined();
  const finalize = vi.spyOn(next, 'finalizeComponent');
  const replacement = new Resource({id: 'replacement'});
  replacement.updateComponent(next, () => {});
  expect(finalize).toHaveBeenCalledTimes(1);
  expect(next.state.disposed).toBe(true);
  expect(replacement.state.resource).not.toBe(resource);
  replacement.finalizeComponent();
  replacement.finalizeComponent();
});

test('Async props notify the current owner after descriptor replacement', async () => {
  class AsyncResource extends Resource {
    static componentName = 'AsyncResource';
    static defaultProps = {value: {type: 'number', value: 0, async: true}};
  }
  let resolveValue!: (value: number) => void;
  const value = new Promise<number>(resolve => {
    resolveValue = resolve;
  });
  const first = new AsyncResource({value: value as unknown as number});
  const oldOwner = vi.fn();
  first.updateComponent(null, oldOwner);
  const next = first.clone({}) as AsyncResource;
  const owner = vi.fn();
  next.updateComponent(first, owner);
  resolveValue(7);
  await vi.waitFor(() => expect(owner).toHaveBeenCalled());
  expect(oldOwner).not.toHaveBeenCalled();
  next.updateComponent(next, owner);
  expect(next.state.value).toBe(7);
  next.finalizeComponent();
});
