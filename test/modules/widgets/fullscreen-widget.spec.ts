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

test('FullscreenWidget - rejected native request uses viewport fallback and exits by mode', async () => {
  const target = document.createElement('div');
  const root = document.createElement('div');
  const canvas = document.createElement('canvas');
  const opener = document.createElement('button');
  const ancestor = document.createElement('div');
  ancestor.style.cssText = 'transform: translateX(30px); overflow: hidden; width: 120px';
  ancestor.append(target);
  target.append(canvas, root);
  document.body.append(opener, ancestor);
  const styles = document.createElement('style');
  styles.textContent = widgetStyles;
  document.head.append(styles);
  opener.focus();
  const request = vi.fn().mockRejectedValue(new Error('Denied'));
  const exit = vi.fn().mockResolvedValue(undefined);
  const restoreRequest = mockFullscreenProperty(target, 'requestFullscreen', {value: request});
  const restoreExit = mockFullscreenProperty(document, 'exitFullscreen', {value: exit});
  const changed = vi.fn();
  const widget = new FullscreenWidget({container: target, onFullscreenChange: changed});
  try {
    widget.onRenderHTML(root);
    await widget.requestFullscreen();
    expect(request).toHaveBeenCalledOnce();
    expect(target.matches(':popover-open')).toBe(true);
    const bounds = target.getBoundingClientRect();
    expect(bounds.left).toBe(0);
    expect(bounds.top).toBe(0);
    expect(bounds.width).toBe(window.innerWidth);
    expect(bounds.height).toBe(window.innerHeight);
    expect(getComputedStyle(document.documentElement).overflow).toBe('hidden');
    expect(target.querySelector('canvas')).toBe(canvas);
    expect(target.getAttribute('aria-modal')).toBe('true');
    expect(document.activeElement).toBe(root.querySelector('button'));
    expect(document.documentElement.classList.contains('deck-fullscreen-scroll-lock')).toBe(true);
    document.dispatchEvent(new Event('fullscreenchange'));
    expect(widget.getFullscreen()).toBe(true);
    await widget.exitFullscreen();
    expect(exit).not.toHaveBeenCalled();
    expect(changed.mock.calls).toEqual([[true], [false]]);
    expect(document.activeElement).toBe(opener);
    expect(target.hasAttribute('aria-modal')).toBe(false);
    expect(document.documentElement.classList.contains('deck-fullscreen-scroll-lock')).toBe(false);
  } finally {
    widget.onRemove();
    restoreRequest();
    restoreExit();
    styles.remove();
    opener.remove();
    ancestor.remove();
  }
});

test('FullscreenWidget - removal cancels a pending request and unregisters its listener', async () => {
  const target = document.createElement('div');
  const root = target.appendChild(document.createElement('div'));
  document.body.append(target);
  const widget = new FullscreenWidget({container: target});
  const changed = vi.spyOn(widget, 'onFullscreenChange');
  let reject!: (error: Error) => void;
  const restoreRequest = mockFullscreenProperty(target, 'requestFullscreen', {
    value: () =>
      new Promise<void>((_resolve, rejectRequest) => {
        reject = rejectRequest;
      })
  });
  try {
    widget.onRenderHTML(root);
    const pending = widget.requestFullscreen();
    widget.onRemove();
    reject(new Error('Denied'));
    await pending;
    document.dispatchEvent(new Event('fullscreenchange'));
    expect(changed).not.toHaveBeenCalled();
    expect(target.classList.contains('deck-pseudo-fullscreen')).toBe(false);
  } finally {
    widget.onRemove();
    target.remove();
    restoreRequest();
  }
});

test('FullscreenWidget - Escape and removal release fallback without a native API', async () => {
  const target = document.createElement('div');
  const root = target.appendChild(document.createElement('div'));
  document.body.append(target);
  Object.defineProperty(target, 'requestFullscreen', {value: undefined});
  const widget = new FullscreenWidget({container: target});
  try {
    widget.onRenderHTML(root);
    await widget.handleClick();
    expect(widget.getFullscreen()).toBe(true);
    root
      .querySelector('button')!
      .dispatchEvent(
        new KeyboardEvent('keydown', {key: 'Escape', bubbles: true, cancelable: true})
      );
    expect(widget.getFullscreen()).toBe(false);
    await widget.handleClick();
    widget.onRemove();
    expect(target.hasAttribute('popover')).toBe(false);
    expect(target.classList.contains('deck-pseudo-fullscreen')).toBe(false);
    expect(document.body.classList.contains('deck-fullscreen-scroll-lock')).toBe(false);
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
    expect(changed.mock.calls).toEqual([[true], [false]]);
  } finally {
    fullscreenElement = null;
    widget.onRemove();
    restoreElement();
    restoreRequest();
    target.remove();
  }
});
