// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {FullscreenWidget} from '@deck.gl/widgets';
import widgetStyles from '../../../modules/widgets/src/stylesheet.css?inline';

function mockFullscreenProperty(target: object, name: string, descriptor: PropertyDescriptor) {
  const original = Object.getOwnPropertyDescriptor(target, name);
  Object.defineProperty(target, name, {...descriptor, configurable: true});
  return () => {
    if (original) Object.defineProperty(target, name, original);
    else Reflect.deleteProperty(target, name);
  };
}

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

test('FullscreenWidget - rejected native request uses viewport fallback and exits by mode', async () => {
  const target = document.createElement('div');
  const root = document.createElement('div');
  root.className = 'deck-widget deck-widget-fullscreen';
  const canvas = document.createElement('canvas');
  const ancestor = document.createElement('div');
  ancestor.style.cssText = 'transform: translateX(30px); overflow: hidden; width: 120px';
  ancestor.append(target);
  target.append(canvas, root);
  document.body.append(ancestor);
  const styles = document.createElement('style');
  styles.textContent = widgetStyles;
  document.head.append(styles);
  const request = vi.fn().mockRejectedValue(new Error('Denied'));
  const exit = vi.fn().mockResolvedValue(undefined);
  const restoreRequest = mockFullscreenProperty(target, 'requestFullscreen', {value: request});
  const restoreExit = mockFullscreenProperty(document, 'exitFullscreen', {value: exit});
  const changed = vi.fn();
  const widget = new FullscreenWidget({container: target, onFullscreenChange: changed});
  try {
    widget.onRenderHTML(root);
    const originalBounds = target.getBoundingClientRect().toJSON();
    root.querySelector('button')!.click();
    await vi.waitFor(() => expect(widget.getFullscreen()).toBe(true));
    expect(request).toHaveBeenCalledOnce();
    expect(target.matches(':popover-open')).toBe(true);
    const bounds = target.getBoundingClientRect();
    expect(bounds.left).toBe(0);
    expect(bounds.top).toBe(0);
    expect(bounds.width).toBe(window.innerWidth);
    expect(bounds.height).toBe(window.innerHeight);
    expect(target.querySelector('canvas')).toBe(canvas);
    const button = root.querySelector('button')!;
    const frame = root.querySelector('.deck-widget-button')!;
    const buttonBounds = button.getBoundingClientRect();
    const frameBounds = frame.getBoundingClientRect();
    if (matchMedia('(pointer: coarse)').matches) {
      expect(buttonBounds.width).toBeGreaterThanOrEqual(44);
      expect(buttonBounds.height).toBeGreaterThanOrEqual(44);
    } else {
      expect(buttonBounds.width).toBeLessThan(44);
      expect(buttonBounds.height).toBeLessThan(44);
    }
    expect(frameBounds.width).toBeGreaterThan(buttonBounds.width);
    expect(frameBounds.height).toBeGreaterThan(buttonBounds.height);
    document.dispatchEvent(new Event('fullscreenchange'));
    expect(widget.getFullscreen()).toBe(true);
    button.click();
    await vi.waitFor(() => expect(widget.getFullscreen()).toBe(false));
    expect(target.hasAttribute('popover')).toBe(false);
    expect(target.getBoundingClientRect().toJSON()).toEqual(originalBounds);
    expect(canvas.parentElement).toBe(target);
    expect(exit).not.toHaveBeenCalled();
    expect(changed.mock.calls).toEqual([[true], [false]]);
  } finally {
    widget.onRemove();
    restoreRequest();
    restoreExit();
    styles.remove();
    ancestor.remove();
  }
});

test.each(['resolve', 'reject'] as const)(
  'FullscreenWidget - removed widget cleans up when a native request later %ss',
  async outcome => {
    const target = document.createElement('div');
    const root = target.appendChild(document.createElement('div'));
    document.body.append(target);
    const widget = new FullscreenWidget({container: target});
    const changed = vi.spyOn(widget, 'onFullscreenChange');
    const request = Promise.withResolvers<void>();
    let fullscreenElement: HTMLElement | null = null;
    const exit = vi.fn(async () => {
      fullscreenElement = null;
    });
    const restoreRequest = mockFullscreenProperty(target, 'requestFullscreen', {
      value: () => request.promise
    });
    const restoreElement = mockFullscreenProperty(document, 'fullscreenElement', {
      get: () => fullscreenElement
    });
    const restoreExit = mockFullscreenProperty(document, 'exitFullscreen', {value: exit});
    try {
      widget.onRenderHTML(root);
      const pending = widget.requestFullscreen();
      widget.onRemove();
      if (outcome === 'resolve') {
        fullscreenElement = target;
        request.resolve();
      } else {
        request.reject(new Error('Denied'));
      }
      await pending;
      document.dispatchEvent(new Event('fullscreenchange'));
      expect(changed).not.toHaveBeenCalled();
      expect(exit).toHaveBeenCalledTimes(outcome === 'resolve' ? 1 : 0);
      expect(fullscreenElement).toBeNull();
      expect(target.classList.contains('deck-pseudo-fullscreen')).toBe(false);
    } finally {
      widget.onRemove();
      target.remove();
      restoreRequest();
      restoreElement();
      restoreExit();
    }
  }
);

test('FullscreenWidget - removal releases fallback without a native API', async () => {
  const target = document.createElement('div');
  const root = target.appendChild(document.createElement('div'));
  document.body.append(target);
  Object.defineProperty(target, 'requestFullscreen', {value: undefined});
  const widget = new FullscreenWidget({container: target});
  try {
    widget.onRenderHTML(root);
    await widget.handleClick();
    expect(widget.getFullscreen()).toBe(true);
    widget.onRemove();
    expect(target.hasAttribute('popover')).toBe(false);
    expect(target.classList.contains('deck-pseudo-fullscreen')).toBe(false);
  } finally {
    widget.onRemove();
    target.remove();
  }
});

test('FullscreenWidget - native fullscreen follows browser exit events', async () => {
  const target = document.createElement('div');
  const root = target.appendChild(document.createElement('div'));
  document.body.append(target);
  let fullscreenElement: Element | null = null;
  const restoreElement = mockFullscreenProperty(document, 'fullscreenElement', {
    get: () => fullscreenElement
  });
  const restoreRequest = mockFullscreenProperty(target, 'requestFullscreen', {
    value: async () => {
      fullscreenElement = target;
      document.dispatchEvent(new Event('fullscreenchange'));
    }
  });
  const changed = vi.fn();
  const widget = new FullscreenWidget({container: target, onFullscreenChange: changed});
  try {
    widget.onRenderHTML(root);
    await widget.handleClick();
    expect(widget.getFullscreen()).toBe(true);
    expect(target.classList.contains('deck-pseudo-fullscreen')).toBe(false);
    fullscreenElement = null;
    document.dispatchEvent(new Event('fullscreenchange'));
    expect(widget.getFullscreen()).toBe(false);
    document.dispatchEvent(new Event('fullscreenchange'));
    expect(changed.mock.calls).toEqual([[true], [false]]);
  } finally {
    fullscreenElement = null;
    widget.onRemove();
    restoreElement();
    restoreRequest();
    target.remove();
  }
});
