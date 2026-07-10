// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterEach, test, expect} from 'vitest';
import {ZoomWidget} from '@deck.gl/widgets';
import {WidgetTester} from './common';

let testInstance: WidgetTester<any> | undefined;

afterEach(() => {
  testInstance?.destroy();
  testInstance = undefined;
});

test('Tooltip - string override', async () => {
  testInstance = new WidgetTester({
    widgets: [new ZoomWidget({zoomInTooltip: 'Custom Zoom In', zoomOutTooltip: 'Custom Zoom Out'})]
  });

  await testInstance.idle();
  const buttons = testInstance.findElements('.deck-widget-icon-button') as HTMLButtonElement[];
  expect(buttons[0].getAttribute('aria-label')).toBe('Zoom In');

  // Trigger tooltip via pointerenter
  buttons[0].dispatchEvent(new PointerEvent('pointerenter', {bubbles: true}));
  await testInstance.idle();

  const tooltip = testInstance.findElements('.deck-widget-tooltip')[0];
  expect(tooltip).toBeTruthy();
  expect(tooltip.textContent).toBe('Custom Zoom In');
});

test('Tooltip - false disables tooltip', async () => {
  testInstance = new WidgetTester({
    widgets: [new ZoomWidget({zoomInTooltip: false})]
  });

  await testInstance.idle();
  const button = testInstance.findElements('.deck-widget-icon-button')[0] as HTMLButtonElement;

  // Trigger pointer enter
  button.dispatchEvent(new PointerEvent('pointerenter', {bubbles: true}));
  await testInstance.idle();

  // No tooltip should appear for the zoom-in button
  const triggers = testInstance.findElements('.deck-widget-tooltip-trigger');
  const zoomInButton = testInstance.findElements('.deck-widget-zoom-in')[0];
  // The zoom-in button should not be wrapped in a tooltip trigger
  expect(zoomInButton.querySelector('.deck-widget-tooltip')).toBeNull();
});

test('Tooltip - HTMLElement content', async () => {
  const tip = document.createElement('span');
  tip.innerHTML = 'Zoom <kbd>⌘+</kbd>';

  testInstance = new WidgetTester({
    widgets: [new ZoomWidget({zoomInTooltip: tip})]
  });

  await testInstance.idle();
  const buttons = testInstance.findElements('.deck-widget-icon-button') as HTMLButtonElement[];

  // Trigger tooltip
  buttons[0].dispatchEvent(new PointerEvent('pointerenter', {bubbles: true}));
  await testInstance.idle();

  const tooltip = testInstance.findElements('.deck-widget-tooltip')[0];
  expect(tooltip).toBeTruthy();
  expect(tooltip.querySelector('kbd')).toBeTruthy();
  expect(tooltip.textContent).toContain('Zoom');
  expect(tooltip.textContent).toContain('⌘+');
});

test('Tooltip - HTMLElement replacement on content change', async () => {
  const tip1 = document.createElement('span');
  tip1.textContent = 'First';

  testInstance = new WidgetTester({
    widgets: [new ZoomWidget({zoomInTooltip: tip1})]
  });
  await testInstance.idle();

  const buttons = testInstance.findElements('.deck-widget-icon-button') as HTMLButtonElement[];
  buttons[0].dispatchEvent(new PointerEvent('pointerenter', {bubbles: true}));
  await testInstance.idle();

  let tooltip = testInstance.findElements('.deck-widget-tooltip')[0];
  expect(tooltip.textContent).toContain('First');

  // Hide tooltip
  buttons[0].dispatchEvent(new PointerEvent('pointerleave', {bubbles: true}));
  await testInstance.idle();

  // Change to new element
  const tip2 = document.createElement('span');
  tip2.textContent = 'Second';
  testInstance.setProps({
    widgets: [new ZoomWidget({zoomInTooltip: tip2})]
  });
  await testInstance.idle();

  // Re-trigger tooltip
  const buttonsAfter = testInstance.findElements('.deck-widget-icon-button') as HTMLButtonElement[];
  buttonsAfter[0].dispatchEvent(new PointerEvent('pointerenter', {bubbles: true}));
  await testInstance.idle();

  tooltip = testInstance.findElements('.deck-widget-tooltip')[0];
  expect(tooltip.textContent).toContain('Second');
});
