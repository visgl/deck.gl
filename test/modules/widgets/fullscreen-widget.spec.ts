// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {FullscreenWidget} from '@deck.gl/widgets';
import {WidgetManager} from '@deck.gl/core/lib/widget-manager';

test('FullscreenWidget - uncontrolled: defaults to not fullscreen', () => {
  const widget = new FullscreenWidget();
  expect(widget.getFullscreen()).toBe(false);
});

test('FullscreenWidget - pseudo-fullscreen toggles state and calls callback', () => {
  const onFullscreenChange = vi.fn();
  const widget = new FullscreenWidget({onFullscreenChange});

  const container = document.createElement('div');
  vi.spyOn(widget, 'getContainer').mockReturnValue(container);

  expect(widget.getFullscreen()).toBe(false);

  widget.togglePseudoFullscreen();

  expect(onFullscreenChange).toHaveBeenCalledWith(true);
  expect(widget.fullscreen).toBe(true);
  expect(container.classList.contains('deck-pseudo-fullscreen')).toBe(true);

  onFullscreenChange.mockClear();
  widget.togglePseudoFullscreen();

  expect(onFullscreenChange).toHaveBeenCalledWith(false);
  expect(widget.fullscreen).toBe(false);
  expect(container.classList.contains('deck-pseudo-fullscreen')).toBe(false);
});

test('FullscreenWidget - onFullscreenChange event updates state and calls callback', () => {
  const onFullscreenChange = vi.fn();
  const widget = new FullscreenWidget({onFullscreenChange});

  const container = document.createElement('div');
  vi.spyOn(widget, 'getContainer').mockReturnValue(container);

  widget.fullscreen = true;
  widget.onFullscreenChange();

  expect(onFullscreenChange).toHaveBeenCalledWith(false);
  expect(widget.fullscreen).toBe(false);
});

test('FullscreenWidget - onFullscreenChange does not fire callback when state unchanged', () => {
  const onFullscreenChange = vi.fn();
  const widget = new FullscreenWidget({onFullscreenChange});

  const container = document.createElement('div');
  vi.spyOn(widget, 'getContainer').mockReturnValue(container);

  widget.onFullscreenChange();
  expect(onFullscreenChange).not.toHaveBeenCalled();
});

test('FullscreenWidget - replacement retains and cleans up its listener', () => {
  const callback = vi.fn();
  const first = new FullscreenWidget({id: 'fullscreen-transfer'});
  const manager = new WidgetManager({
    deck: {props: {parent: document.createElement('div')}} as any
  });
  manager.setProps({widgets: [first]});
  const next = new FullscreenWidget({id: 'fullscreen-transfer', onFullscreenChange: callback});
  manager.setProps({widgets: [next]});
  next.fullscreen = true;
  document.dispatchEvent(new Event('fullscreenchange'));
  expect(callback).toHaveBeenCalledWith(false);
  manager.finalize();
  callback.mockClear();
  document.dispatchEvent(new Event('fullscreenchange'));
  expect(callback).not.toHaveBeenCalled();
});
