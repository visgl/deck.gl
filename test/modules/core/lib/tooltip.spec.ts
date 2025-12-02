// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
import test from 'tape-promise/tape';

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

test('TooltipWidget#setTooltip', t => {
  const {widgetManager, tooltip} = setupTest();

  tooltip.setTooltip(getTooltipFunc(pickedInfo), pickedInfo.x, pickedInfo.y);

  const el = tooltip.rootElement;
  t.equals(el.style.backgroundColor, 'lemonchiffon');
  t.equals(el.style.transform, 'translate(10px, 20px)');
  t.equals(el.innerHTML, '<strong>Number of points:</strong> 10');
  t.equals(el.className, 'coolTooltip');
  t.equals(el.style.top, '0px');

  widgetManager.finalize();
  t.end();
});

test('TooltipWidget#setTooltipWithString', t => {
  const {widgetManager, tooltip} = setupTest();

  const pickedInfoFunc = info => `Number of points: ${info.object.elevationValue}`;
  tooltip.setTooltip(pickedInfoFunc(pickedInfo), pickedInfo.x, pickedInfo.y);
  const el = tooltip.rootElement;
  t.equals(el.innerText, 'Number of points: 10');
  t.equals(el.className, 'deck-tooltip');
  t.equals(el.style.transform, `translate(${pickedInfo.x}px, ${pickedInfo.y}px)`);

  widgetManager.finalize();
  t.end();
});

test('TooltipWidget#setTooltipDefaults', t => {
  const {widgetManager, tooltip} = setupTest();

  const tooltipResult = getTooltipFuncDefault(pickedInfo);
  tooltip.setTooltip(tooltipResult, pickedInfo.x, pickedInfo.y);
  const el = tooltip.rootElement;
  t.equals(el.innerText, 'Number of points: 10');
  t.equals(el.className, 'deck-tooltip');

  widgetManager.finalize();
  t.end();
});

test('TooltipWidget#setTooltipNullCase', t => {
  const {widgetManager, tooltip} = setupTest();

  tooltip.setTooltip(null, pickedInfo.x, pickedInfo.y);
  const el = tooltip.rootElement;
  t.equals(el.style.display, 'none');

  widgetManager.finalize();
  t.end();
});

test('TooltipWidget#remove', t => {
  const {widgetManager, tooltip, container} = setupTest();

  t.equals(container.querySelectorAll('.deck-tooltip').length, 1, 'TooltipWidget element present');
  widgetManager.finalize();
  t.equals(
    container.querySelectorAll('.deck-tooltip').length,
    0,
    'TooltipWidget element successfully removed'
  );

  t.end();
});

test('TooltipWidget#onViewportChange', t => {
  const {widgetManager, tooltip} = setupTest();

  const viewportOptions = {
    width: 800,
    height: 600,
    longitude: -122.45,
    latitude: 37.78,
    zoom: 12
  };

  // Create initial viewport and simulate showing tooltip
  const viewport1 = new WebMercatorViewport(viewportOptions);
  tooltip.setTooltip('Test tooltip', 100, 100);
  tooltip.lastViewport = viewport1;

  t.equals(tooltip.isVisible, true, 'Tooltip is visible');

  // Create new viewport with same properties (simulates redraw without camera change)
  const viewport2 = new WebMercatorViewport(viewportOptions);
  t.notEquals(viewport1, viewport2, 'Viewports are different objects');
  t.ok(viewport1.equals(viewport2), 'Viewports are equal by value');

  // onViewportChange should NOT clear the tooltip when viewports are equal by value
  tooltip.onViewportChange(viewport2);
  t.equals(tooltip.isVisible, true, 'Tooltip remains visible when viewport is equal');

  // Create viewport with different camera position
  const viewport3 = new WebMercatorViewport({...viewportOptions, longitude: -122.5});
  t.notOk(viewport2.equals(viewport3), 'Viewports are not equal');

  // onViewportChange SHOULD clear tooltip when camera moves
  tooltip.onViewportChange(viewport3);
  t.equals(tooltip.isVisible, false, 'Tooltip is hidden when camera moves');

  widgetManager.finalize();
  t.end();
});

test('TooltipWidget#onViewportChange skips comparison after onHover', t => {
  const {widgetManager, tooltip} = setupTest();

  const viewportOptions = {
    width: 800,
    height: 600,
    longitude: -122.45,
    latitude: 37.78,
    zoom: 12
  };

  // Simulate the real-world scenario where onHover sets a viewport from picking
  // and onViewportChange receives a different viewport object from the render loop
  const pickingViewport = new WebMercatorViewport(viewportOptions);
  const renderViewport = new WebMercatorViewport({
    ...viewportOptions,
    // Slightly different near/far planes as happens in interleaved mapbox mode
    near: 0.1,
    far: 1000
  });

  // These viewports will NOT be equal due to different projection matrices
  t.notOk(pickingViewport.equals(renderViewport), 'Picking and render viewports are not equal');

  // Simulate onHover being called (sets _skipNextViewportCompare flag)
  tooltip.setTooltip('Test tooltip', 100, 100);
  tooltip.lastViewport = pickingViewport;
  // @ts-ignore - accessing private property for testing
  tooltip._skipNextViewportCompare = true;

  t.equals(tooltip.isVisible, true, 'Tooltip is visible after hover');

  // First onViewportChange after hover should skip comparison and update lastViewport
  tooltip.onViewportChange(renderViewport);
  t.equals(tooltip.isVisible, true, 'Tooltip remains visible (comparison skipped)');
  t.equals(tooltip.lastViewport, renderViewport, 'lastViewport updated to render viewport');

  // Subsequent onViewportChange with same viewport should not clear tooltip
  const renderViewport2 = new WebMercatorViewport({
    ...viewportOptions,
    near: 0.1,
    far: 1000
  });
  tooltip.onViewportChange(renderViewport2);
  t.equals(tooltip.isVisible, true, 'Tooltip remains visible when render viewports are equal');

  widgetManager.finalize();
  t.end();
});
