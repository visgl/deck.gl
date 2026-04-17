// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {ScatterplotLayer} from '@deck.gl/layers';
import {LoadingWidget} from '@deck.gl/widgets';
import {WidgetTester} from './common';

test('LoadingWidget', async () => {
  let resolveDataLoader: (result: any[]) => void = () => {};
  const dataLoader = new Promise<any[]>(res => {
    resolveDataLoader = res;
  });
  const layer = new ScatterplotLayer({
    data: dataLoader
  });
  const testInstance = new WidgetTester({
    layers: [layer],
    widgets: [new LoadingWidget()]
  });

  await testInstance.idle();
  // Spinner is shown
  let spinner = testInstance.findElements('.deck-widget-spinner')[0];
  expect(spinner).toBeTruthy();

  resolveDataLoader([]);
  await testInstance.idle();
  // Spinner is hidden
  spinner = testInstance.findElements('.deck-widget-spinner')[0];
  expect(spinner).toBeFalsy();

  testInstance.destroy();
});

test('LoadingWidget - onRedraw calls onLoadingChange when loading state changes', () => {
  const onLoadingChange = vi.fn();
  const widget = new LoadingWidget({onLoadingChange});
  widget.loading = true;

  widget.onRedraw({layers: [{isLoaded: false} as any]});
  expect(onLoadingChange).not.toHaveBeenCalled();

  widget.onRedraw({layers: [{isLoaded: true} as any]});
  expect(onLoadingChange).toHaveBeenCalledWith(false);
  expect(widget.loading).toBe(false);

  onLoadingChange.mockClear();

  widget.onRedraw({layers: [{isLoaded: false} as any]});
  expect(onLoadingChange).toHaveBeenCalledWith(true);
  expect(widget.loading).toBe(true);
});
