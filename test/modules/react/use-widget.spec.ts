// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterEach, test, expect, vi} from 'vitest';
import {createElement, act, useEffect} from 'react';
import {createRoot, type Root} from 'react-dom/client';

import {Widget, log, type WidgetProps, type WidgetPlacement} from '@deck.gl/core';
import {useWidget} from '@deck.gl/react';
import {DeckGlContext} from '@deck.gl/react/utils/deckgl-context';

// Required by React 19
// @ts-expect-error undefined global flag
self.IS_REACT_ACT_ENVIRONMENT = true;

type TestWidgetProps = WidgetProps & {
  label?: string;
};

class TestWidget extends Widget<TestWidgetProps> {
  placement: WidgetPlacement = 'top-left';
  className = 'deck-test-widget';

  onRenderHTML(_rootElement: HTMLElement): void {}
}

let container: HTMLDivElement | undefined;
let root: Root | undefined;

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container?.remove();
  root = undefined;
  container = undefined;
});

function createDeckContext(widgets: Widget[] = [], deckOverrides: Record<string, unknown> = {}) {
  const deck = {
    props: {widgets: [] as Widget[]},
    setProps: vi.fn(),
    ...deckOverrides
  };

  return {
    deck,
    value: {
      viewport: {} as any,
      container: document.createElement('div'),
      eventManager: {} as any,
      onViewStateChange: undefined,
      deck: deck as any,
      widgets
    }
  };
}

test('useWidget registers widget and syncs props on rerender', () => {
  let lastWidget: TestWidget | undefined;
  let widgets: Widget[] = [];
  const {deck, value} = createDeckContext(widgets);

  function HookHarness(props: TestWidgetProps) {
    const widget = useWidget(TestWidget, props);
    useEffect(() => {
      lastWidget = widget;
    }, [widget]);
    return null;
  }

  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);

  act(() => {
    root!.render(
      createElement(
        DeckGlContext.Provider,
        {value},
        createElement(HookHarness, {id: 'widget', label: 'First'})
      )
    );
  });

  const firstWidget = lastWidget;
  expect(firstWidget).toBeInstanceOf(TestWidget);
  expect(widgets).toHaveLength(1);
  expect(widgets[0]).toBe(firstWidget);
  expect(firstWidget?.props.label).toBe('First');
  expect(deck.setProps).toHaveBeenCalledWith({widgets});

  widgets = [];
  const rerenderValue = {...value, widgets};

  act(() => {
    root!.render(
      createElement(
        DeckGlContext.Provider,
        {value: rerenderValue},
        createElement(HookHarness, {id: 'widget', label: 'Second'})
      )
    );
  });

  expect(lastWidget).toBe(firstWidget);
  expect(firstWidget?.props.label).toBe('Second');
  expect(widgets).toHaveLength(1);
  expect(widgets[0]).toBe(firstWidget);
  expect(deck.setProps).toHaveBeenLastCalledWith({widgets});
});

test('useWidget warns when deck widgets prop conflicts with React widgets', () => {
  const widgets: Widget[] = [];
  const {deck, value} = createDeckContext(widgets, {
    props: {widgets: [new TestWidget({id: 'pure-js'})]}
  });
  const warnSpy = vi.spyOn(log, 'warn');

  function HookHarness() {
    useWidget(TestWidget, {id: 'react-widget'});
    return null;
  }

  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);

  act(() => {
    root!.render(createElement(DeckGlContext.Provider, {value}, createElement(HookHarness)));
  });

  expect(warnSpy).toHaveBeenCalled();
  warnSpy.mockRestore();
});

test('useWidget removes widget from context on unmount', () => {
  const widgets: Widget[] = [];
  const {deck, value} = createDeckContext(widgets);

  function HookHarness() {
    useWidget(TestWidget, {id: 'react-widget'});
    return null;
  }

  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);

  act(() => {
    root!.render(createElement(DeckGlContext.Provider, {value}, createElement(HookHarness)));
  });

  expect(widgets).toHaveLength(1);

  act(() => {
    root!.render(null);
  });

  expect(widgets).toHaveLength(0);
  expect(deck.setProps).toHaveBeenLastCalledWith({widgets});
});
