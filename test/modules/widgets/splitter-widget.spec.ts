// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterEach, test, expect, vi} from 'vitest';
import {MapView, OrbitView} from '@deck.gl/core';
import {_SplitterWidget as SplitterWidget, type SplitterWidgetProps} from '@deck.gl/widgets';
import {WidgetTester} from './common';

let testInstance: WidgetTester<any> | undefined;

afterEach(() => {
  testInstance?.destroy();
  testInstance = undefined;
});

const mapsLayoutH: SplitterWidgetProps['viewLayout'] = {
  orientation: 'horizontal',
  views: [new MapView({id: 'left'}), new MapView({id: 'right'})]
};
const mapsLayoutV: SplitterWidgetProps['viewLayout'] = {
  orientation: 'vertical',
  views: [new MapView({id: 'top'}), new MapView({id: 'bottom'})]
};

const orbitLayout2x2: SplitterWidgetProps['viewLayout'] = {
  orientation: 'horizontal',
  initialSplit: 0.5,
  views: [
    {
      orientation: 'vertical',
      initialSplit: 0.3,
      views: [
        new OrbitView({
          id: 'top',
          orbitAxis: 'Z',
          orthographic: true,
          controller: {
            dragMode: 'pan',
            dragRotate: false
          }
        }),
        new OrbitView({
          id: 'front',
          orbitAxis: 'Z',
          orthographic: true,
          controller: {
            dragMode: 'pan',
            dragRotate: false
          }
        })
      ]
    },
    {
      orientation: 'vertical',
      initialSplit: 0.6,
      views: [
        new OrbitView({
          id: 'left',
          orbitAxis: 'Y',
          orthographic: true,
          controller: {
            dragMode: 'pan',
            dragRotate: false
          }
        }),
        new OrbitView({id: 'perspective', orbitAxis: 'Z', controller: true})
      ]
    }
  ]
};

test('SplitterWidget - parse viewLayout', () => {
  const widget = new SplitterWidget({
    viewLayout: mapsLayoutH
  });
  expect(widget.viewLayouts).toHaveLength(1);
  expect(widget.viewLayouts[0]).toMatchObject({
    id: 0,
    orientation: 'horizontal',
    split: 0.5,
    editable: true,
    minSplit: 0.05,
    maxSplit: 0.95,
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });
  expect(widget.viewLayouts[0].views[0]).toBeInstanceOf(MapView);
  expect(widget.viewLayouts[0].views[1]).toBeInstanceOf(MapView);
  expect((widget.viewLayouts[0].views[0] as MapView).id).toBe('left');
  expect((widget.viewLayouts[0].views[1] as MapView).id).toBe('right');

  const initialViewLayouts = widget.viewLayouts;
  const initialRootLayout = widget.viewLayouts[0];

  widget.setProps({
    viewLayout: {...mapsLayoutH}
  });

  expect(widget.viewLayouts).toBe(initialViewLayouts);
  expect(widget.viewLayouts[0]).toBe(initialRootLayout);

  widget.setProps({
    viewLayout: mapsLayoutV
  });

  expect(widget.viewLayouts).toHaveLength(1);
  expect(widget.viewLayouts[0]).toMatchObject({
    id: 0,
    orientation: 'vertical',
    split: 0.5,
    editable: true,
    minSplit: 0.05,
    maxSplit: 0.95
  });
  expect(widget.viewLayouts[0].views[0]).toBeInstanceOf(MapView);
  expect(widget.viewLayouts[0].views[1]).toBeInstanceOf(MapView);
  expect((widget.viewLayouts[0].views[0] as MapView).id).toBe('top');
  expect((widget.viewLayouts[0].views[1] as MapView).id).toBe('bottom');

  widget.setProps({
    viewLayout: orbitLayout2x2
  });

  expect(widget.viewLayouts).toHaveLength(3);
  expect(widget.viewLayouts[0]).toMatchObject({
    id: 0,
    orientation: 'horizontal',
    split: 0.5,
    editable: true,
    minSplit: 0.05,
    maxSplit: 0.95
  });
  expect(widget.viewLayouts[1]).toMatchObject({
    id: 1,
    orientation: 'vertical',
    split: 0.3,
    editable: true,
    minSplit: 0.05,
    maxSplit: 0.95
  });
  expect(widget.viewLayouts[2]).toMatchObject({
    id: 2,
    orientation: 'vertical',
    split: 0.6,
    editable: true,
    minSplit: 0.05,
    maxSplit: 0.95
  });
  expect(widget.viewLayouts[0].views[0]).toBe(widget.viewLayouts[1]);
  expect(widget.viewLayouts[0].views[1]).toBe(widget.viewLayouts[2]);
  expect(widget.viewLayouts[1].views[0]).toBeInstanceOf(OrbitView);
  expect(widget.viewLayouts[1].views[1]).toBeInstanceOf(OrbitView);
  expect(widget.viewLayouts[2].views[0]).toBeInstanceOf(OrbitView);
  expect(widget.viewLayouts[2].views[1]).toBeInstanceOf(OrbitView);
  expect((widget.viewLayouts[1].views[0] as OrbitView).id).toBe('top');
  expect((widget.viewLayouts[1].views[1] as OrbitView).id).toBe('front');
  expect((widget.viewLayouts[2].views[0] as OrbitView).id).toBe('left');
  expect((widget.viewLayouts[2].views[1] as OrbitView).id).toBe('perspective');
});

test('SplitterWidget - uncontrolled', async () => {
  const widget = new SplitterWidget<MapView[]>({viewLayout: mapsLayoutH});
  testInstance = new WidgetTester<MapView[]>({
    initialViewState: {
      left: {longitude: 0, latitude: 0, zoom: 1},
      right: {longitude: -122, latitude: 38, zoom: 8}
    },
    widgets: [widget]
  });

  await testInstance.idle();
  let views = testInstance.getProps().views ?? [];
  expect(views).toHaveLength(2);
  expect(views[0]).toBeInstanceOf(MapView);
  expect(views[1]).toBeInstanceOf(MapView);
  expect(views[0].props.width).toBe('50%');
  expect(views[1].props.width).toBe('50%');

  // @ts-expect-error private method
  widget.onChange(0.25, widget.viewLayouts[0]);

  await testInstance.idle();
  views = testInstance.getProps().views ?? [];
  expect(views[0].props.width).toBe('25%');
  expect(views[1].props.width).toBe('75%');
});

test('SplitterWidget - controlled', async () => {
  const onViewsChange = vi.fn();
  const widget = new SplitterWidget<MapView[]>({
    viewLayout: mapsLayoutH,
    onChange: newViews => {
      onViewsChange(newViews);
      testInstance.setProps({views: newViews});
    }
  });
  testInstance = new WidgetTester<MapView[]>({
    views: [],
    initialViewState: {
      left: {longitude: 0, latitude: 0, zoom: 1},
      right: {longitude: -122, latitude: 38, zoom: 8}
    },
    widgets: [widget]
  });

  await testInstance.idle();
  let views = testInstance.getProps().views ?? [];
  expect(onViewsChange).lastCalledWith(views);
  expect(views).toHaveLength(2);
  expect(views[0]).toBeInstanceOf(MapView);
  expect(views[1]).toBeInstanceOf(MapView);
  expect(views[0].props.width).toBe('50%');
  expect(views[1].props.width).toBe('50%');

  // @ts-expect-error private method
  widget.onChange(0.25, widget.viewLayouts[0]);

  await testInstance.idle();
  views = testInstance.getProps().views ?? [];
  expect(onViewsChange).lastCalledWith(views);
  expect(views[0].props.width).toBe('25%');
  expect(views[1].props.width).toBe('75%');
});
