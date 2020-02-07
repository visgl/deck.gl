/* global document */
import test from 'tape-catch';

import Tooltip from '@deck.gl/core/lib/tooltip';

const pickedInfo = {object: {elevationValue: 10}, x: 0, y: 0};

/* Create a clean canvas and its container testing */
function setupCanvasTest() {
  const canvas = document.createElement('canvas');
  const canvasContainer = document.createElement('div');
  canvasContainer.className = 'canvas-parent';
  canvasContainer.appendChild(canvas);
  const remove = () => {
    canvasContainer.remove();
  };
  return {
    canvasContainer,
    canvas,
    remove
  };
}

function getTooltipFunc(pickedValue) {
  return {
    className: 'coolTooltip',
    html: `<strong>Number of points:</strong> ${pickedValue.object.elevationValue}`,
    style: {
      backgroundColor: 'lemonchiffon'
    }
  };
}

function getTooltipFuncDefault(pickedValue) {
  return {
    text: `Number of points: ${pickedValue.object.elevationValue}`
  };
}

test('Tooltip#setTooltip', t => {
  const {canvas, canvasContainer, remove} = setupCanvasTest();
  const tooltip = new Tooltip(canvas);
  tooltip.setTooltip(getTooltipFunc(pickedInfo), pickedInfo.x, pickedInfo.y);
  t.equals(tooltip.el.style.backgroundColor, 'lemonchiffon');
  t.equals(tooltip.el.innerHTML, '<strong>Number of points:</strong> 10');
  t.equals(tooltip.el.className, 'coolTooltip');
  t.equals(canvasContainer.querySelector('.coolTooltip').style.top, '0px');
  remove();
  t.end();
});

test('Tooltip#setTooltipWithString', t => {
  const {canvas, remove} = setupCanvasTest();
  const tooltip = new Tooltip(canvas);

  const pickedInfoFunc = info => `Number of points: ${info.object.elevationValue}`;
  tooltip.setTooltip(pickedInfoFunc(pickedInfo), pickedInfo.x, pickedInfo.y);
  t.equals(tooltip.el.innerText, 'Number of points: 10');
  t.equals(tooltip.el.className, 'deck-tooltip');
  remove();
  t.end();
});

test('Tooltip#setTooltipDefaults', t => {
  const {canvas, remove} = setupCanvasTest();
  const tooltip = new Tooltip(canvas);

  const tooltipResult = getTooltipFuncDefault(pickedInfo);
  tooltip.setTooltip(tooltipResult, pickedInfo.x, pickedInfo.y);
  t.equals(tooltip.el.innerText, 'Number of points: 10');
  t.equals(tooltip.el.className, 'deck-tooltip');
  remove();
  t.end();
});

test('Tooltip#setTooltipNullCase', t => {
  const {canvas, remove} = setupCanvasTest();
  const tooltip = new Tooltip(canvas);

  tooltip.setTooltip(null, pickedInfo.x, pickedInfo.y);
  t.equals(tooltip.el.style.display, 'none');
  remove();
  t.end();
});

test('Tooltip#remove', t => {
  const {canvasContainer, canvas, remove} = setupCanvasTest();
  const tooltip = new Tooltip(canvas);

  t.equals(canvasContainer.querySelectorAll('.deck-tooltip').length, 1, 'Tooltip element present');
  tooltip.remove();
  t.equals(
    canvasContainer.querySelectorAll('.deck-tooltip').length,
    0,
    'Tooltip element successfully removed'
  );
  remove();
  t.end();
});
