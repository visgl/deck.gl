// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterEach, test, expect} from 'vitest';
import {updateWidgetTooltip, ZoomWidget} from '@deck.gl/widgets';
import {WidgetTester} from './common';

let rootElement: HTMLDivElement | undefined;
let testInstance: WidgetTester<any> | undefined;

afterEach(() => {
  rootElement?.remove();
  rootElement = undefined;
  testInstance?.destroy();
  testInstance = undefined;
});

function createTooltipTarget(label: string) {
  rootElement = document.createElement('div');
  rootElement.className = 'deck-widget';

  const button = document.createElement('button');
  button.setAttribute('data-deck-widget-tooltip', label);
  button.setAttribute('aria-label', label);
  button.title = label;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  svg.append(path);
  button.append(svg);
  rootElement.append(button);
  document.body.append(rootElement);
  updateWidgetTooltip(rootElement);

  return {button, path};
}

function dispatchPointerOver(element: Element): void {
  element.dispatchEvent(new PointerEvent('pointerover', {bubbles: true}));
}

function dispatchPointerOut(element: Element): void {
  element.dispatchEvent(new PointerEvent('pointerout', {bubbles: true}));
}

test('updateWidgetTooltip shows and hides themed text tooltips', () => {
  const {button} = createTooltipTarget('Zoom In');
  expect(button.title).toBe('');

  dispatchPointerOver(button);
  expect(rootElement?.querySelector('.deck-widget-tooltip')?.textContent).toBe('Zoom In');
  dispatchPointerOut(button);
  expect(rootElement?.querySelector('.deck-widget-tooltip')).toBe(null);

  button.focus();
  expect(rootElement?.querySelector('.deck-widget-tooltip')?.textContent).toBe('Zoom In');
  button.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
  expect(rootElement?.querySelector('.deck-widget-tooltip')).toBe(null);

  button.blur();
  button.focus();
  expect(rootElement?.querySelector('.deck-widget-tooltip')?.textContent).toBe('Zoom In');
  button.blur();
  expect(rootElement?.querySelector('.deck-widget-tooltip')).toBe(null);
});

test('updateWidgetTooltip resolves SVG targets and updated labels', () => {
  const {button, path} = createTooltipTarget('Reset north');

  dispatchPointerOver(path);
  expect(rootElement?.querySelector('.deck-widget-tooltip')?.textContent).toBe('Reset north');

  button.setAttribute('data-deck-widget-tooltip', 'Reset view');
  updateWidgetTooltip(rootElement!);
  dispatchPointerOver(button);
  expect(rootElement?.querySelector('.deck-widget-tooltip')?.textContent).toBe('Reset view');
});

test('button widgets use themed tooltips', async () => {
  testInstance = new WidgetTester({
    widgets: [new ZoomWidget()]
  });
  await testInstance.idle();

  const button = testInstance.findElements('.deck-widget-zoom-in')[0] as HTMLButtonElement;
  expect(button.title).toBe('');
  expect(button.getAttribute('aria-label')).toBe('Zoom In');
  expect(button.getAttribute('data-deck-widget-tooltip')).toBe('Zoom In');

  dispatchPointerOver(button);
  expect(testInstance.findElements('.deck-widget-tooltip')[0].textContent).toBe('Zoom In');
});
