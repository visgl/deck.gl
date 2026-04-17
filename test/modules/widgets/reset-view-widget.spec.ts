// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterEach, test, expect, vi} from 'vitest';
import {OrthographicView} from '@deck.gl/core';
import {ResetViewWidget} from '@deck.gl/widgets';
import {WidgetTester} from './common';

let testInstance: WidgetTester<any> | undefined;

afterEach(() => {
  testInstance?.destroy();
  testInstance = undefined;
});

test('ResetViewWidget', async () => {
  const onReset = vi.fn();
  testInstance = new WidgetTester({
    initialViewState: {
      longitude: 0,
      latitude: 0,
      zoom: 1
    },
    widgets: [new ResetViewWidget({id: 'reset', onReset})]
  });

  await testInstance.idle();
  testInstance.click('.deck-widget-reset-focus');
  expect(onReset).toHaveBeenCalledWith({
    viewId: 'default-view',
    viewState: {
      longitude: 0,
      latitude: 0,
      zoom: 1
    }
  });

  testInstance.setProps({
    widgets: [
      new ResetViewWidget({
        id: 'reset',
        initialViewState: {
          longitude: -122,
          latitude: 38,
          zoom: 8
        },
        onReset
      })
    ]
  });
  await testInstance.idle();
  testInstance.click('.deck-widget-reset-focus');
  expect(onReset).toHaveBeenCalledWith({
    viewId: 'default-view',
    viewState: {
      longitude: -122,
      latitude: 38,
      zoom: 8
    }
  });
});

test('ResetViewWidget#multiple views', async () => {
  const onReset = vi.fn();
  testInstance = new WidgetTester({
    views: [
      new OrthographicView({id: 'left', width: '50%'}),
      new OrthographicView({id: 'right', width: '50%', x: '50%'})
    ],
    initialViewState: {
      left: {
        target: [-100, 0],
        zoom: 1
      },
      right: {
        target: [100, 0],
        zoom: 4
      }
    },
    widgets: [new ResetViewWidget({id: 'reset', onReset})]
  });

  await testInstance.idle();
  testInstance.click('.deck-widget-reset-focus');
  expect(onReset).toHaveBeenCalledWith({
    viewId: 'left',
    viewState: {
      target: [-100, 0],
      zoom: 1
    }
  });
  expect(onReset).toHaveBeenCalledWith({
    viewId: 'right',
    viewState: {
      target: [100, 0],
      zoom: 4
    }
  });

  testInstance.setProps({
    initialViewState: {
      left: {
        target: [0, 100],
        zoom: -1
      },
      right: {
        target: [0, 100],
        zoom: -1
      }
    },
    widgets: [new ResetViewWidget({id: 'reset', onReset, viewId: 'left'})]
  });

  testInstance.click('.deck-widget-reset-focus');
  expect(onReset).toHaveBeenCalledWith({
    viewId: 'left',
    viewState: {
      target: [0, 100],
      zoom: -1
    }
  });
  expect(onReset).toHaveBeenCalledTimes(3);
});
