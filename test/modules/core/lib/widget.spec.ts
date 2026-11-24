// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {Widget, type WidgetProps, type WidgetPlacement} from '@deck.gl/core';

type TestWidgetProps = WidgetProps & {label?: string};

class TestWidget extends Widget<TestWidgetProps> {
  static defaultProps: Required<TestWidgetProps> = {
    ...Widget.defaultProps,
    id: 'test-widget',
    label: 'default'
  };

  placement: WidgetPlacement = 'top-left';
  className = 'deck-test-widget';

  onRenderHTML(rootElement: HTMLElement): void {}
}

test('Widget#id', () => {
  const implicit = new TestWidget({});
  const explicit = new TestWidget({id: 'test-widget'});

  expect(implicit.id, 'default id').toBe('test-widget');
  expect(implicit.props.id, 'props.id reads the default').toBe('test-widget');
  expect(implicit.props.label, 'other defaults apply').toBe('default');
  expect(Object.hasOwn(implicit.props, 'id'), 'default id is not own').toBe(false);
  expect(Object.hasOwn(explicit.props, 'id'), 'passed id is own').toBe(true);
  expect(new TestWidget({id: undefined}).id, 'undefined id uses the default').toBe('test-widget');

  implicit.setProps({label: 'updated'});
  expect(implicit.props.label, 'setProps updates props').toBe('updated');
  expect(implicit.props.id, 'setProps keeps the default id').toBe('test-widget');
  expect(Object.hasOwn(implicit.props, 'id'), 'setProps keeps the id implicit').toBe(false);

  // WidgetManager reuses a matching widget with `oldWidget.setProps(widget.props)`
  implicit.setProps(new TestWidget({label: 'next'}).props);
  expect(implicit.props.label, 'props from a new instance apply').toBe('next');
  expect(implicit.id, 'id is unchanged').toBe('test-widget');

  // Widgets such as TooltipWidget reapply props that may carry `id: undefined`
  implicit.setProps({id: undefined});
  expect(implicit.props.id, 'an undefined id falls back to the default').toBe('test-widget');
  expect(Object.hasOwn(implicit.props, 'id'), 'and stays implicit').toBe(false);
});

test('Widget#id falsy values use the default, as for views', () => {
  for (const id of [undefined, null, ''] as (string | undefined)[]) {
    const widget = new TestWidget({id});
    expect(widget.id, `id ${JSON.stringify(id)} uses the default`).toBe('test-widget');
    expect(widget.props.id, `props.id for ${JSON.stringify(id)} reads the default`).toBe(
      'test-widget'
    );
    expect(Object.hasOwn(widget.props, 'id'), `id ${JSON.stringify(id)} is not own`).toBe(false);
  }

  const explicit = new TestWidget({id: 'zoom-left'});
  expect(explicit.id, 'passed id is kept').toBe('zoom-left');
  expect(Object.hasOwn(explicit.props, 'id'), 'passed id is own').toBe(true);

  const implicit = new TestWidget({});
  const copy = new TestWidget(implicit.props);
  expect(copy.id, 'props from another widget reuse its default id').toBe('test-widget');
  expect(Object.hasOwn(copy.props, 'id'), 'a reused default id stays implicit').toBe(false);
  expect(
    Object.hasOwn(new TestWidget(explicit.props).props, 'id'),
    'a reused passed id stays own'
  ).toBe(true);

  for (const id of [null, ''] as (string | undefined)[]) {
    const updated = new TestWidget({});
    updated.setProps({id});
    expect(updated.props.id, `setProps id ${JSON.stringify(id)} reads the default`).toBe(
      'test-widget'
    );
    expect(Object.hasOwn(updated.props, 'id'), `setProps id ${JSON.stringify(id)} is not own`).toBe(
      false
    );
  }
});
