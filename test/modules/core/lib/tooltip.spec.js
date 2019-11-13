import test from 'tape-catch';

import Tooltip from '@deck.gl/core/lib/tooltip';
import setup from 'deck.gl-test/utils/canvas-test';

const pickedInfo = {object: {elevationValue: 10}, x: 0, y: 0};

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

test('Tooltip#constructor', t => {
  const {testDocument, canvas} = setup();
  const tooltip = new Tooltip(canvas); // eslint-disable-line
  t.ok(testDocument.getElementsByClassName('deck-tooltip'), 'Tooltip exists in document');
  t.equals(testDocument.getElementsByClassName('deck-tooltip')[0].style.top, '0px');
  t.end();
});

test('Tooltip#setTooltip', t => {
  const {canvas} = setup();
  const tooltip = new Tooltip(canvas);
  tooltip.setTooltip(getTooltipFunc(pickedInfo), pickedInfo.x, pickedInfo.y);
  t.equals(tooltip.el.style.backgroundColor, 'lemonchiffon');
  t.equals(tooltip.el.innerHTML, '<strong>Number of points:</strong> 10');
  t.equals(tooltip.el.className, 'coolTooltip');
  t.end();
});

test('Tooltip#setTooltipWithString', t => {
  const {canvas} = setup();
  const tooltip = new Tooltip(canvas);

  const pickedInfoFunc = info => `Number of points: ${info.object.elevationValue}`;
  tooltip.setTooltip(pickedInfoFunc(pickedInfo), pickedInfo.x, pickedInfo.y);
  t.equals(tooltip.el.innerText, 'Number of points: 10');
  t.equals(tooltip.el.className, 'deck-tooltip');
  t.end();
});

test('Tooltip#setTooltipDefaults', t => {
  const {canvas} = setup();
  const tooltip = new Tooltip(canvas);

  const tooltipResult = getTooltipFuncDefault(pickedInfo);
  tooltip.setTooltip(tooltipResult, pickedInfo.x, pickedInfo.y);
  t.equals(tooltip.el.innerText, 'Number of points: 10');
  t.equals(tooltip.el.className, 'deck-tooltip');
  t.end();
});

test('Tooltip#setTooltipNullCase', t => {
  const {canvas} = setup();
  const tooltip = new Tooltip(canvas);

  tooltip.setTooltip(null, pickedInfo.x, pickedInfo.y);
  t.equals(tooltip.el.style.display, 'none');
  t.end();
});

test('Tooltip#remove', t => {
  const {testDocument, canvas} = setup();
  const tooltip = new Tooltip(canvas);

  t.equals(
    testDocument.document.getElementsByClassName('deck-tooltip').length,
    1,
    'Tooltip element present'
  );
  tooltip.remove();
  t.equals(
    testDocument.document.getElementsByClassName('deck-tooltip').length,
    0,
    'Tooltip element successfully removed'
  );
  testDocument.finalize();
  t.end();
});
