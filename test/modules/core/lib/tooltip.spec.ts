/* global document */
import test from 'tape-promise/tape';

import {WidgetManager} from '@deck.gl/core/lib/widget-manager';
import Tooltip from '@deck.gl/core/lib/tooltip';

const pickedInfo = {object: {elevationValue: 10}, x: 0, y: 0};

/* Create a clean container for testing */
function setupTest() {
  const container = document.createElement('div');
  const widgetManager = new WidgetManager({parentElement: container});
  const tooltip = new Tooltip();
  widgetManager.add(tooltip);
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

test('Tooltip#setTooltip', t => {
  const {widgetManager, tooltip} = setupTest();

  tooltip.setTooltip(getTooltipFunc(pickedInfo), pickedInfo.x, pickedInfo.y);

  const el = tooltip.element;
  t.equals(el.style.backgroundColor, 'lemonchiffon');
  t.equals(el.style.transform, 'translate(10px, 20px)');
  t.equals(el.innerHTML, '<strong>Number of points:</strong> 10');
  t.equals(el.className, 'coolTooltip');
  t.equals(el.style.top, '0px');

  widgetManager.finalize();
  t.end();
});

test('Tooltip#setTooltipWithString', t => {
  const {widgetManager, tooltip} = setupTest();

  const pickedInfoFunc = info => `Number of points: ${info.object.elevationValue}`;
  tooltip.setTooltip(pickedInfoFunc(pickedInfo), pickedInfo.x, pickedInfo.y);
  const el = tooltip.element;
  t.equals(el.innerText, 'Number of points: 10');
  t.equals(el.className, 'deck-tooltip');
  t.equals(el.style.transform, `translate(${pickedInfo.x}px, ${pickedInfo.y}px)`);

  widgetManager.finalize();
  t.end();
});

test('Tooltip#setTooltipDefaults', t => {
  const {widgetManager, tooltip} = setupTest();

  const tooltipResult = getTooltipFuncDefault(pickedInfo);
  tooltip.setTooltip(tooltipResult, pickedInfo.x, pickedInfo.y);
  const el = tooltip.element;
  t.equals(el.innerText, 'Number of points: 10');
  t.equals(el.className, 'deck-tooltip');

  widgetManager.finalize();
  t.end();
});

test('Tooltip#setTooltipNullCase', t => {
  const {widgetManager, tooltip} = setupTest();

  tooltip.setTooltip(null, pickedInfo.x, pickedInfo.y);
  const el = tooltip.element;
  t.equals(el.style.display, 'none');

  widgetManager.finalize();
  t.end();
});

test('Tooltip#remove', t => {
  const {widgetManager, tooltip, container} = setupTest();

  t.equals(container.querySelectorAll('.deck-tooltip').length, 1, 'Tooltip element present');
  widgetManager.remove(tooltip);
  t.equals(
    container.querySelectorAll('.deck-tooltip').length,
    0,
    'Tooltip element successfully removed'
  );

  widgetManager.finalize();
  t.end();
});
