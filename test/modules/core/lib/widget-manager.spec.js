/* global document */
import test from 'tape-promise/tape';

import {WidgetManager} from '@deck.gl/core/lib/widget-manager';
import {WebMercatorViewport} from '@deck.gl/core';

class TestWidget {
  constructor({id}) {
    this.id = id;
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

test('WidgetManager#add, remove', t => {
  const container = document.createElement('div');
  const widgetManager = new WidgetManager({deck: mockDeckInstance, parentElement: container});

  t.is(widgetManager.widgets.length, 0, 'no widgets');

  const widgetA = new TestWidget({id: 'A'});
  widgetManager.add(widgetA);
  t.is(widgetManager.widgets.length, 1, 'widget is added');
  t.is(widgetA._viewId, null, 'view id is assigned');
  t.ok(widgetA.isVisible, 'widget.onAdd is called');
  t.ok(
    widgetManager.containers['__root'].contains(widgetA._element),
    'widget UI is added to the container'
  );
  t.is(container.childElementCount, 1, 'widget container is added');

  widgetManager.add(widgetA);
  t.is(widgetManager.widgets.length, 1, 'widget cannot be added more than once');

  const widgetB = new TestWidget({id: 'B'});
  widgetManager.add(widgetB, {viewId: 'map', placement: 'bottom-right'});
  t.is(widgetManager.widgets.length, 2, 'widget is added');
  t.is(widgetB._viewId, 'map', 'view id is assigned');
  t.ok(widgetB.isVisible, 'widget.onAdd is called');
  t.ok(
    widgetManager.containers['map'].contains(widgetB._element),
    'widget UI is added to the container'
  );
  t.is(container.childElementCount, 2, 'widget container is added');

  const elementA = widgetA._element;
  widgetManager.remove(widgetA);
  t.is(widgetManager.widgets.length, 1, 'widget is removed');
  t.notOk(widgetA._element, 'widget context is cleared');
  t.notOk(widgetA.isVisible, 'widget.onRemove is called');
  t.notOk(
    widgetManager.containers['__root'].contains(elementA),
    'widget UI is removed from the container'
  );

  widgetManager.remove(widgetA);
  t.is(widgetManager.widgets.length, 1, 'widget is already removed');

  widgetManager.finalize();
  t.is(widgetManager.widgets.length, 0, 'all widgets are removed');
  t.is(container.childElementCount, 0, 'all widget containers are removed');
  t.notOk(widgetB.isVisible, 'widget.onRemove is called');

  t.end();
});

test('WidgetManager#onRedraw#without viewId', t => {
  const parentElement = document.createElement('div');
  const widgetManager = new WidgetManager({deck: mockDeckInstance, parentElement});

  const widget = new TestWidget({id: 'A'});
  widgetManager.add(widget);

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

  t.is(onViewportChangeCalledCount, 1, 'widget.onViewportChange not called');
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
  t.is(onViewportChangeCalledCount, 3, 'widget.onViewportChange called');
  t.is(onRedrawCalledCount, 3, 'widget.onRedraw called');

  widgetManager.finalize();
  t.end();
});

test('WidgetManager#onRedraw#viewId', t => {
  const parentElement = document.createElement('div');
  const widgetManager = new WidgetManager({deck: mockDeckInstance, parentElement});

  const widget = new TestWidget({id: 'A'});
  widgetManager.add(widget, {placement: 'bottom-right', viewId: 'minimap'});

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
  widgetManager.add(widget);

  const pickedInfo = {
    viewport: new WebMercatorViewport(),
    index: 0
  };

  t.doesNotThrow(() => widgetManager.onHover(pickedInfo, {}), 'widget.onHover not defined');

  let onHoverCalledCount = 0;
  let onClickCalledCount = 0;
  widget.onHover = () => onHoverCalledCount++;
  widget.onClick = () => onClickCalledCount++;

  // Trigger onHover event
  widgetManager.onHover(pickedInfo, {});
  // Trigger onClick event
  widgetManager.onEvent(pickedInfo, {type: 'click'});
  // Trigger onDragStart event
  widgetManager.onEvent(pickedInfo, {type: 'panstart'});
  // Event not defined
  widgetManager.onEvent(pickedInfo, {type: 'dblclick'});

  t.is(onHoverCalledCount, 1, 'widget.onHover is called');
  t.is(onClickCalledCount, 1, 'widget.onClick is called');

  widgetManager.finalize();
  t.end();
});

test('WidgetManager#onHover, onEvent#viewId', t => {
  const parentElement = document.createElement('div');
  const widgetManager = new WidgetManager({deck: mockDeckInstance, parentElement});

  const widget = new TestWidget({id: 'A'});
  widgetManager.add(widget, {viewId: 'map'});

  let pickedInfo = {
    viewport: new WebMercatorViewport({id: 'map'}),
    index: 0
  };

  let onHoverCalledCount = 0;
  let onClickCalledCount = 0;
  widget.onHover = () => onHoverCalledCount++;
  widget.onClick = () => onClickCalledCount++;

  // Trigger onHover event
  widgetManager.onHover(pickedInfo, {});
  // Trigger onClick event
  widgetManager.onEvent(pickedInfo, {type: 'click'});
  // Trigger onDragStart event
  widgetManager.onEvent(pickedInfo, {type: 'panstart'});
  // Event not defined
  widgetManager.onEvent(pickedInfo, {type: 'dblclick'});

  t.is(onHoverCalledCount, 1, 'widget.onHover is called');
  t.is(onClickCalledCount, 1, 'widget.onClick is called');

  pickedInfo = {
    viewport: new WebMercatorViewport({id: 'minimap'}),
    index: 0
  };

  // Trigger onHover event
  widgetManager.onHover(pickedInfo, {});
  // Trigger onClick event
  widgetManager.onEvent(pickedInfo, {type: 'click'});

  t.is(onHoverCalledCount, 1, 'widget.onHover is not called');
  t.is(onClickCalledCount, 1, 'widget.onClick is not called');

  widgetManager.finalize();
  t.end();
});
