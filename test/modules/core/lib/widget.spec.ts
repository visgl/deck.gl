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
