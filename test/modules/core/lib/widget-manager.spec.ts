// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
import {test, expect, describe} from 'vitest';

import {WidgetManager} from '@deck.gl/core/lib/widget-manager';
import {Widget, WebMercatorViewport, type WidgetProps, type WidgetPlacement} from '@deck.gl/core';

type TestWidgetProps = WidgetProps & {
  placement?: WidgetPlacement;
  viewId?: string;
  version?: number;
};
class TestWidget extends Widget<TestWidgetProps> {
  static defaultProps: Required<TestWidgetProps> = {
    ...Widget.defaultProps,
    id: 'test-widget',
    placement: 'top-left',
    version: 1,
    viewId: 'default-view'
  };

  placement: WidgetPlacement = 'top-left';
  className = 'deck-test-widget';
  isVisible = false;

  constructor(props: TestWidgetProps = {}) {
    super(props, TestWidget.defaultProps);
    this.viewId = props.viewId ?? this.viewId;
    this.placement = props.placement ?? 'top-left';
  }

  onRenderHTML(rootElement: HTMLElement): void {}

  setProps(props) {
    this.viewId = props.viewId ?? this.viewId;
    this.placement = props.placement ?? this.placement;
    super.setProps(props);
  }

  onAdd() {
    this.isVisible = true;
  }

  onRemove() {
    this.isVisible = false;
  }
}

const mockDeckInstance = {
  width: 600,
  height: 400
};

test('WidgetManager#setProps', () => {
  const container = document.createElement('div');
  const widgetManager = new WidgetManager({deck: mockDeckInstance, parentElement: container});

  expect(widgetManager.getWidgets().length, 'no widgets').toBe(0);

  const widgetA = new TestWidget({id: 'A'});
  // Only A
  widgetManager.setProps({widgets: [widgetA]});
  expect(widgetManager.getWidgets().length, 'widget is added').toBe(1);
  expect(widgetA.isVisible, 'widget.onAdd is called').toBeTruthy();
  expect(
    widgetManager.containers['root'].contains(widgetA.rootElement),
    'widget UI is added to the container'
  ).toBeTruthy();
  expect(container.childElementCount, 'widget container is added').toBe(1);

  const widgetB = new TestWidget({id: 'B', viewId: 'map', placement: 'bottom-right'});
  // A and B
  widgetManager.setProps({
    widgets: [widgetA, widgetB]
  });
  expect(widgetManager.getWidgets().length, 'widget is added').toBe(2);
  expect(widgetB.isVisible, 'widget.onAdd is called').toBeTruthy();
  expect(
    widgetManager.containers['map'].contains(widgetB.rootElement),
    'widget UI is added to the container'
  ).toBeTruthy();
  expect(container.childElementCount, 'widget container is added').toBe(2);

  const elementA = widgetA.rootElement;
  // Only B
  widgetManager.setProps({
    widgets: [widgetB]
  });
  expect(widgetManager.getWidgets().length, 'widget is removed').toBe(1);
  expect(widgetA.rootElement, 'widget context is cleared').toBeFalsy();
  expect(widgetA.isVisible, 'widget.onRemove is called').toBeFalsy();
  expect(
    widgetManager.containers['root'].contains(elementA),
    'widget UI is removed from the container'
  ).toBeFalsy();

  let widgetB2 = new TestWidget({id: 'B', version: 2, viewId: 'map', placement: 'bottom-right'});
  // Only B2
  widgetManager.setProps({widgets: [widgetB2]});
  expect(widgetManager.getWidgets().length, 'widget count').toBe(1);
  expect(widgetManager.getWidgets()[0], 'old widget is reused').toBe(widgetB);
  expect(widgetB.props.version, 'old widget is updated').toBe(2);

  widgetB2 = new TestWidget({id: 'B', version: 2, viewId: 'map', placement: 'fill'});
  // Only B2 with new placement
  widgetManager.setProps({widgets: [widgetB2]});
  expect(widgetManager.getWidgets().length, 'widget count').toBe(1);
  expect(widgetManager.getWidgets()[0], 'new widget is used').toBe(widgetB2);
  expect(widgetB.isVisible, 'widget.onRemove is called').toBeFalsy();
  expect(widgetB2.isVisible, 'widget.onAdd is called').toBeTruthy();

  widgetManager.setProps({widgets: []});
  expect(widgetManager.getWidgets().length, 'all widgets are removed').toBe(0);
  expect(widgetB2.isVisible, 'widget.onRemove is called').toBeFalsy();
});

test('WidgetManager#finalize', () => {
  const container = document.createElement('div');
  const widgetManager = new WidgetManager({deck: mockDeckInstance, parentElement: container});

  const widgetA = new TestWidget({id: 'A'});
  widgetManager.setProps({widgets: [widgetA]});

  widgetManager.finalize();
  expect(widgetManager.getWidgets().length, 'all widgets are removed').toBe(0);
  expect(container.childElementCount, 'all widget containers are removed').toBe(0);
  expect(widgetA.isVisible, 'widget.onRemove is called').toBeFalsy();
});

test('WidgetManager#onRedraw#without viewId', () => {
  const parentElement = document.createElement('div');
  const widgetManager = new WidgetManager({deck: mockDeckInstance, parentElement});

  const widget = new TestWidget({id: 'A'});
  widgetManager.addDefault(widget);

  expect(
    () =>
      widgetManager.onRedraw({
        viewports: [],
        layers: []
      }),
    'widget.onRedraw not defined'
  ).not.toThrow();

  let onViewportChangeCalledCount = 0;
  let onRedrawCalledCount = 0;
  widget.onViewportChange = () => onViewportChangeCalledCount++;
  widget.onRedraw = () => onRedrawCalledCount++;

  widgetManager.onRedraw({
    viewports: [
      new WebMercatorViewport({
        id: 'map',
        width: 600,
        height: 400,
        longitude: 0,
        latitude: 0,
        zoom: 4
      })
    ],
    layers: []
  });
  expect(onViewportChangeCalledCount, 'widget.onViewportChange called').toBe(1);
  expect(onRedrawCalledCount, 'widget.onRedraw called').toBe(1);

  const container = widgetManager.containers['root'];
  expect(container.style.left, 'container left is set').toBe('0px');
  expect(container.style.top, 'container top is set').toBe('0px');
  expect(container.style.width, 'container width is set').toBe('600px');
  expect(container.style.height, 'container height is set').toBe('400px');

  widgetManager.onRedraw({
    viewports: [
      // not changed
      new WebMercatorViewport({
        id: 'map',
        width: 600,
        height: 400,
        longitude: 0,
        latitude: 0,
        zoom: 4
      })
    ],
    layers: []
  });

  expect(onViewportChangeCalledCount, 'widget.onViewportChange called').toBe(2);
  expect(onRedrawCalledCount, 'widget.onRedraw called').toBe(2);

  widgetManager.onRedraw({
    viewports: [
      // zoom changed
      new WebMercatorViewport({
        id: 'map',
        width: 600,
        height: 400,
        longitude: 0,
        latitude: 0,
        zoom: 3
      }),
      // new viewport
      new WebMercatorViewport({
        id: 'minimap',
        width: 100,
        height: 100,
        longitude: 0,
        latitude: 0,
        zoom: 0
      })
    ],
    layers: []
  });
  expect(onViewportChangeCalledCount, 'widget.onViewportChange called').toBe(4);
  expect(onRedrawCalledCount, 'widget.onRedraw called').toBe(3);

  widgetManager.finalize();
});

test('WidgetManager#onRedraw#viewId', () => {
  const parentElement = document.createElement('div');
  const widgetManager = new WidgetManager({deck: mockDeckInstance, parentElement});

  const widget = new TestWidget({id: 'A', placement: 'bottom-right', viewId: 'minimap'});
  widgetManager.addDefault(widget);

  expect(
    () =>
      widgetManager.onRedraw({
        viewports: [],
        layers: []
      }),
    'widget.onRedraw not defined'
  ).not.toThrow();

  let onViewportChangeCalledCount = 0;
  let onRedrawCalledCount = 0;
  widget.onViewportChange = viewport => {
    expect(viewport.id, 'Widget only subscribed to viewId:minimap events').toBe('minimap');
    onViewportChangeCalledCount++;
  };
  widget.onRedraw = ({viewports}) => {
    expect(
      viewports.length === 1 && viewports[0].id,
      'Widget only subscribed to viewId:minimap events'
    ).toBe('minimap');
    onRedrawCalledCount++;
  };

  widgetManager.onRedraw({
    viewports: [
      new WebMercatorViewport({
        id: 'map',
        width: 600,
        height: 400,
        longitude: 0,
        latitude: 0,
        zoom: 4
      }),
      new WebMercatorViewport({
        id: 'minimap',
        x: 450,
        y: 250,
        width: 100,
        height: 100,
        longitude: 0,
        latitude: 0,
        zoom: 0
      })
    ],
    layers: []
  });
  expect(onViewportChangeCalledCount, 'widget.onViewportChange called').toBe(1);
  expect(onRedrawCalledCount, 'widget.onRedraw called').toBe(1);

  const container = widgetManager.containers['minimap'];
  expect(container.style.left, 'container right is set').toBe('450px');
  expect(container.style.top, 'container bottom is set').toBe('250px');
  expect(container.style.width, 'container width is set').toBe('100px');
  expect(container.style.height, 'container height is set').toBe('100px');

  widgetManager.onRedraw({
    viewports: [
      // center changed
      new WebMercatorViewport({
        id: 'map',
        width: 600,
        height: 400,
        longitude: 10,
        latitude: 0,
        zoom: 4
      }),
      new WebMercatorViewport({
        id: 'minimap',
        x: 450,
        y: 250,
        width: 100,
        height: 100,
        longitude: 10,
        latitude: 0,
        zoom: 0
      })
    ],
    layers: []
  });

  expect(onViewportChangeCalledCount, 'widget.onViewportChange called').toBe(2);
  expect(onRedrawCalledCount, 'widget.onRedraw called').toBe(2);

  widgetManager.onRedraw({
    viewports: [
      new WebMercatorViewport({
        id: 'map',
        width: 600,
        height: 400,
        longitude: 0,
        latitude: 0,
        zoom: 3
      })
      // minimap viewport removed
    ],
    layers: []
  });
  expect(onViewportChangeCalledCount, 'widget.onViewportChange not called').toBe(2);
  expect(onRedrawCalledCount, 'widget.onRedraw not called').toBe(2);

  widgetManager.finalize();
});

test('WidgetManager#onRedraw#container', () => {
  const parentElement = document.createElement('div');
  const widgetManager = new WidgetManager({deck: mockDeckInstance, parentElement});

  const targetElement = document.createElement('div');
  const widgetA = new TestWidget({id: 'A', _container: targetElement});
  widgetManager.addDefault(widgetA);

  expect(widgetA.rootElement?.parentNode, 'widget is attached to external container').toBe(
    targetElement
  );
  expect(
    Object.keys(widgetManager.containers).length,
    'WidgetManager does not create default container'
  ).toBe(0);

  const widgetB = new TestWidget({id: 'B', placement: 'bottom-right', _container: 'root'});
  widgetManager.addDefault(widgetB);

  widgetManager.onRedraw({
    viewports: [
      new WebMercatorViewport({
        id: 'map',
        width: 600,
        height: 400,
        longitude: 0,
        latitude: 0,
        zoom: 4
      })
    ],
    layers: []
  });

  const container = widgetManager.containers['root'];
  expect(container.style.left, 'container left is set').toBe('0px');
  expect(container.style.top, 'container top is set').toBe('0px');
  expect(container.style.width, 'container width is set').toBe('600px');
  expect(container.style.height, 'container height is set').toBe('400px');

  widgetManager.finalize();
});

test('WidgetManager#onHover, onEvent#without viewId', () => {
  const parentElement = document.createElement('div');
  const widgetManager = new WidgetManager({deck: mockDeckInstance, parentElement});

  const widget = new TestWidget({id: 'A'});
  widgetManager.addDefault(widget);

  const pickedInfo = {
    viewport: new WebMercatorViewport(),
    index: 0
  };

  expect(() => widgetManager.onHover(pickedInfo, {}), 'widget.onHover not defined').not.toThrow();

  let onHoverCalledCount = 0;
  let onClickCalledCount = 0;
  widget.onHover = () => onHoverCalledCount++;
  widget.onClick = () => onClickCalledCount++;

  // Given the pickedInfo, test that widgetManager does forward events to test widget
  // Trigger hover event leading to onHover callback
  widgetManager.onHover(pickedInfo, {});
  // Trigger click event leading to onClick callback
  widgetManager.onEvent(pickedInfo, {type: 'click'});
  // Trigger panstart event leading to onDragStart callback
  widgetManager.onEvent(pickedInfo, {type: 'panstart'});
  // Trigger dblclick event leading to onClick callback
  widgetManager.onEvent(pickedInfo, {type: 'dblclick'});

  expect(onHoverCalledCount, 'widget.onHover is called').toBe(1);
  expect(onClickCalledCount, 'widget.onClick is called').toBe(2);

  widgetManager.finalize();
});

test('WidgetManager#onHover, onEvent#viewId', () => {
  const parentElement = document.createElement('div');
  const widgetManager = new WidgetManager({deck: mockDeckInstance, parentElement});

  const widget = new TestWidget({id: 'A', viewId: 'map'});
  widgetManager.addDefault(widget);

  let pickedInfo = {
    viewport: new WebMercatorViewport({id: 'map'}),
    index: 0
  };

  let onHoverCalledCount = 0;
  let onClickCalledCount = 0;
  widget.onHover = () => onHoverCalledCount++;
  widget.onClick = () => onClickCalledCount++;

  // Given the pickedInfo, test that widgetManager does forward events to test widget
  // Trigger hover event leading to onHover callback
  widgetManager.onHover(pickedInfo, {});
  // Trigger click event leading to onClick callback
  widgetManager.onEvent(pickedInfo, {type: 'click'});
  // Trigger panstart event leading to onDragStart callback
  widgetManager.onEvent(pickedInfo, {type: 'panstart'});
  // Trigger dblclick event leading to onClick callback
  widgetManager.onEvent(pickedInfo, {type: 'dblclick'});

  expect(onHoverCalledCount, 'widget.onHover is called').toBe(1);
  expect(onClickCalledCount, 'widget.onClick is called').toBe(2);

  pickedInfo = {
    viewport: new WebMercatorViewport({id: 'minimap'}),
    index: 0
  };

  // Given the updated pickedInfo, test that widgetManager does *not* forward events to test widget
  // Trigger hover event not leading to onHover callback
  widgetManager.onHover(pickedInfo, {});
  // Trigger click event not leading to onClick callback
  widgetManager.onEvent(pickedInfo, {type: 'click'});

  expect(onHoverCalledCount, 'widget.onHover is not called').toBe(1);
  expect(onClickCalledCount, 'widget.onClick is not called').toBe(2);

  widgetManager.finalize();
});
