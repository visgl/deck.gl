// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
import test from 'tape-promise/tape';

import {WidgetManager} from '@deck.gl/core/lib/widget-manager';
import {WebMercatorViewport} from '@deck.gl/core';

class TestWidget {
  constructor(props) {
    this.id = props.id;
    this.viewId = props.viewId || null;
    this.placement = props.placement || 'top-left';
    this.props = props;
  }

  setProps(props) {
    Object.assign(this.props, props);
  }

  onAdd() {
    this.isVisible = true;

    const el = document.createElement('div');
    el.id = this.id;
    return el;
  }

  onRemove() {
    this.isVisible = false;
  }
}

const mockDeckInstance = {
  width: 600,
  height: 400
};

test('WidgetManager#setProps', t => {
  const container = document.createElement('div');
  const widgetManager = new WidgetManager({deck: mockDeckInstance, parentElement: container});

  t.is(widgetManager.getWidgets().length, 0, 'no widgets');

  const widgetA = new TestWidget({id: 'A'});
  // Only A
  widgetManager.setProps({widgets: [widgetA]});
  t.is(widgetManager.getWidgets().length, 1, 'widget is added');
  t.ok(widgetA.isVisible, 'widget.onAdd is called');
  t.ok(
    widgetManager.containers['__root'].contains(widgetA._element),
    'widget UI is added to the container'
  );
  t.is(container.childElementCount, 1, 'widget container is added');

  const widgetB = new TestWidget({id: 'B', viewId: 'map', placement: 'bottom-right'});
  // A and B
  widgetManager.setProps({
    widgets: [widgetA, widgetB]
  });
  t.is(widgetManager.getWidgets().length, 2, 'widget is added');
  t.ok(widgetB.isVisible, 'widget.onAdd is called');
  t.ok(
    widgetManager.containers['map'].contains(widgetB._element),
    'widget UI is added to the container'
  );
  t.is(container.childElementCount, 2, 'widget container is added');

  const elementA = widgetA._element;
  // Only B
  widgetManager.setProps({
    widgets: [widgetB]
  });
  t.is(widgetManager.getWidgets().length, 1, 'widget is removed');
  t.notOk(widgetA._element, 'widget context is cleared');
  t.notOk(widgetA.isVisible, 'widget.onRemove is called');
  t.notOk(
    widgetManager.containers['__root'].contains(elementA),
    'widget UI is removed from the container'
  );

  let widgetB2 = new TestWidget({id: 'B', version: 2, viewId: 'map', placement: 'bottom-right'});
  // Only B2
  widgetManager.setProps({widgets: [widgetB2]});
  t.is(widgetManager.getWidgets().length, 1, 'widget count');
  t.is(widgetManager.getWidgets()[0], widgetB, 'old widget is reused');
  t.is(widgetB.props.version, 2, 'old widget is updated');

  widgetB2 = new TestWidget({id: 'B', version: 2, viewId: 'map', placement: 'fill'});
  // Only B2 with new placement
  widgetManager.setProps({widgets: [widgetB2]});
  t.is(widgetManager.getWidgets().length, 1, 'widget count');
  t.is(widgetManager.getWidgets()[0], widgetB2, 'new widget is used');
  t.notOk(widgetB.isVisible, 'widget.onRemove is called');
  t.ok(widgetB2.isVisible, 'widget.onAdd is called');

  widgetManager.setProps({widgets: []});
  t.is(widgetManager.getWidgets().length, 0, 'all widgets are removed');
  t.notOk(widgetB2.isVisible, 'widget.onRemove is called');

  t.end();
});

test('WidgetManager#finalize', t => {
  const container = document.createElement('div');
  const widgetManager = new WidgetManager({deck: mockDeckInstance, parentElement: container});

  const widgetA = new TestWidget({id: 'A'});
  widgetManager.setProps({widgets: [widgetA]});

  widgetManager.finalize();
  t.is(widgetManager.getWidgets().length, 0, 'all widgets are removed');
  t.is(container.childElementCount, 0, 'all widget containers are removed');
  t.notOk(widgetA.isVisible, 'widget.onRemove is called');

  t.end();
});

test('WidgetManager#onRedraw#without viewId', t => {
  const parentElement = document.createElement('div');
  const widgetManager = new WidgetManager({deck: mockDeckInstance, parentElement});

  const widget = new TestWidget({id: 'A'});
  widgetManager.addDefault(widget);

  t.doesNotThrow(
    () =>
      widgetManager.onRedraw({
        viewports: [],
        layers: []
      }),
    'widget.onRedraw not defined'
  );

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
  t.is(onViewportChangeCalledCount, 1, 'widget.onViewportChange called');
  t.is(onRedrawCalledCount, 1, 'widget.onRedraw called');

  const container = widgetManager.containers['__root'];
  t.is(container.style.left, '0px', 'container left is set');
  t.is(container.style.top, '0px', 'container top is set');
  t.is(container.style.width, '600px', 'container width is set');
  t.is(container.style.height, '400px', 'container height is set');

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

  t.is(onViewportChangeCalledCount, 2, 'widget.onViewportChange called');
  t.is(onRedrawCalledCount, 2, 'widget.onRedraw called');

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
  t.is(onViewportChangeCalledCount, 4, 'widget.onViewportChange called');
  t.is(onRedrawCalledCount, 3, 'widget.onRedraw called');

  widgetManager.finalize();
  t.end();
});

test('WidgetManager#onRedraw#viewId', t => {
  const parentElement = document.createElement('div');
  const widgetManager = new WidgetManager({deck: mockDeckInstance, parentElement});

  const widget = new TestWidget({id: 'A', placement: 'bottom-right', viewId: 'minimap'});
  widgetManager.addDefault(widget);

  t.doesNotThrow(
    () =>
      widgetManager.onRedraw({
        viewports: [],
        layers: []
      }),
    'widget.onRedraw not defined'
  );

  let onViewportChangeCalledCount = 0;
  let onRedrawCalledCount = 0;
  widget.onViewportChange = viewport => {
    t.is(viewport.id, 'minimap', 'Widget only subscribed to viewId:minimap events');
    onViewportChangeCalledCount++;
  };
  widget.onRedraw = ({viewports}) => {
    t.is(
      viewports.length === 1 && viewports[0].id,
      'minimap',
      'Widget only subscribed to viewId:minimap events'
    );
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
  t.is(onViewportChangeCalledCount, 1, 'widget.onViewportChange called');
  t.is(onRedrawCalledCount, 1, 'widget.onRedraw called');

  const container = widgetManager.containers['minimap'];
  t.is(container.style.left, '450px', 'container right is set');
  t.is(container.style.top, '250px', 'container bottom is set');
  t.is(container.style.width, '100px', 'container width is set');
  t.is(container.style.height, '100px', 'container height is set');

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

  t.is(onViewportChangeCalledCount, 2, 'widget.onViewportChange called');
  t.is(onRedrawCalledCount, 2, 'widget.onRedraw called');

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
  t.is(onViewportChangeCalledCount, 2, 'widget.onViewportChange not called');
  t.is(onRedrawCalledCount, 2, 'widget.onRedraw not called');

  widgetManager.finalize();
  t.end();
});

test('WidgetManager#onHover, onEvent#without viewId', t => {
  const parentElement = document.createElement('div');
  const widgetManager = new WidgetManager({deck: mockDeckInstance, parentElement});

  const widget = new TestWidget({id: 'A'});
  widgetManager.addDefault(widget);

  const pickedInfo = {
    viewport: new WebMercatorViewport(),
    index: 0
  };

  t.doesNotThrow(() => widgetManager.onHover(pickedInfo, {}), 'widget.onHover not defined');

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

  t.is(onHoverCalledCount, 1, 'widget.onHover is called');
  t.is(onClickCalledCount, 2, 'widget.onClick is called');

  widgetManager.finalize();
  t.end();
});

test('WidgetManager#onHover, onEvent#viewId', t => {
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

  t.is(onHoverCalledCount, 1, 'widget.onHover is called');
  t.is(onClickCalledCount, 2, 'widget.onClick is called');

  pickedInfo = {
    viewport: new WebMercatorViewport({id: 'minimap'}),
    index: 0
  };

  // Given the updated pickedInfo, test that widgetManager does *not* forward events to test widget
  // Trigger hover event not leading to onHover callback
  widgetManager.onHover(pickedInfo, {});
  // Trigger click event not leading to onClick callback
  widgetManager.onEvent(pickedInfo, {type: 'click'});

  t.is(onHoverCalledCount, 1, 'widget.onHover is not called');
  t.is(onClickCalledCount, 2, 'widget.onClick is not called');

  widgetManager.finalize();
  t.end();
});
