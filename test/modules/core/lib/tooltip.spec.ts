// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
import {test, expect, describe} from 'vitest';

import {WidgetManager} from '@deck.gl/core/lib/widget-manager';
import {TooltipWidget} from '@deck.gl/core/lib/tooltip-widget';
import {WebMercatorViewport} from '@deck.gl/core';

const pickedInfo = {object: {elevationValue: 10}, x: 0, y: 0};

/* Create a clean container for testing */
function setupTest() {
  const container = document.createElement('div');
  const widgetManager = new WidgetManager({parentElement: container});
  const tooltip = new TooltipWidget();
  widgetManager.addDefault(tooltip);
  return {tooltip, widgetManager, container};
}

function getTooltipFunc(pickedValue) {
  return {
    className: 'coolTooltip',
    html: `<strong>Number of points:</strong> ${pickedValue.object.elevationValue}`,
    style: {
      backgroundColor: 'lemonchiffon',
      transform: 'translate(10px, 20px)'
    }
  };
}

function getTooltipFuncDefault(pickedValue) {
  return {
    text: `Number of points: ${pickedValue.object.elevationValue}`
  };
}

test('TooltipWidget#setTooltip', () => {
  const {widgetManager, tooltip} = setupTest();

  tooltip.setTooltip(getTooltipFunc(pickedInfo), pickedInfo.x, pickedInfo.y);

  const el = tooltip.rootElement;
  expect(el.style.backgroundColor).toBe('lemonchiffon');
  expect(el.style.transform).toBe('translate(10px, 20px)');
  expect(el.innerHTML).toBe('<strong>Number of points:</strong> 10');
  expect(el.className).toBe('coolTooltip');
  expect(el.style.top).toBe('0px');

  widgetManager.finalize();
});

test('TooltipWidget#setTooltipWithString', () => {
  const {widgetManager, tooltip} = setupTest();

  const pickedInfoFunc = info => `Number of points: ${info.object.elevationValue}`;
  tooltip.setTooltip(pickedInfoFunc(pickedInfo), pickedInfo.x, pickedInfo.y);
  const el = tooltip.rootElement;
  expect(el.innerText).toBe('Number of points: 10');
  expect(el.className).toBe('deck-tooltip');
  expect(el.style.transform).toBe(`translate(${pickedInfo.x}px, ${pickedInfo.y}px)`);

  widgetManager.finalize();
});

test('TooltipWidget#setTooltipDefaults', () => {
  const {widgetManager, tooltip} = setupTest();

  const tooltipResult = getTooltipFuncDefault(pickedInfo);
  tooltip.setTooltip(tooltipResult, pickedInfo.x, pickedInfo.y);
  const el = tooltip.rootElement;
  expect(el.innerText).toBe('Number of points: 10');
  expect(el.className).toBe('deck-tooltip');

  widgetManager.finalize();
});

test('TooltipWidget#setTooltipNullCase', () => {
  const {widgetManager, tooltip} = setupTest();

  tooltip.setTooltip(null, pickedInfo.x, pickedInfo.y);
  const el = tooltip.rootElement;
  expect(el.style.display).toBe('none');

  widgetManager.finalize();
});

test('TooltipWidget#remove', () => {
  const {widgetManager, tooltip, container} = setupTest();

  expect(container.querySelectorAll('.deck-tooltip').length, 'TooltipWidget element present').toBe(
    1
  );
  widgetManager.finalize();
  expect(
    container.querySelectorAll('.deck-tooltip').length,
    'TooltipWidget element successfully removed'
  ).toBe(0);
});

test('TooltipWidget#onViewportChange', () => {
  const {widgetManager, tooltip} = setupTest();

  const viewportOptions = {
    width: 800,
    height: 600,
    longitude: -122.45,
    latitude: 37.78,
    zoom: 12
  };

  // Simulate showing tooltip and initial viewport from render loop
  tooltip.setTooltip('Test tooltip', 100, 100);
  const viewport1 = new WebMercatorViewport(viewportOptions);
  tooltip.onViewportChange(viewport1);

  expect(tooltip.isVisible, 'Tooltip is visible').toBe(true);
  expect(tooltip.lastViewport, 'lastViewport is set').toBe(viewport1);

  // Create new viewport with same properties (simulates redraw without camera change)
  const viewport2 = new WebMercatorViewport(viewportOptions);
  expect(viewport1, 'Viewports are different objects').not.toBe(viewport2);
  expect(viewport1.equals(viewport2), 'Viewports are equal by value').toBeTruthy();

  // onViewportChange should NOT clear the tooltip when viewports are equal by value
  tooltip.onViewportChange(viewport2);
  expect(tooltip.isVisible, 'Tooltip remains visible when viewport is equal').toBe(true);
  expect(tooltip.lastViewport, 'lastViewport is updated').toBe(viewport2);

  // Create viewport with different camera position
  const viewport3 = new WebMercatorViewport({...viewportOptions, longitude: -122.5});
  expect(viewport2.equals(viewport3), 'Viewports are not equal').toBeFalsy();

  // onViewportChange SHOULD clear tooltip when camera moves
  tooltip.onViewportChange(viewport3);
  expect(tooltip.isVisible, 'Tooltip is hidden when camera moves').toBe(false);

  widgetManager.finalize();
});
