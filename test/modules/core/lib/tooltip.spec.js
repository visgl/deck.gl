import test from 'tape-catch';

import Tooltip from '@deck.gl/core/lib/tooltip';
import DocumentTest from 'deck.gl-test/utils/document';

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
  const documentTest = new DocumentTest(Tooltip);
  documentTest.setup();
  t.ok(documentTest.document.getElementsByClassName('deck-tooltip'), 'Tooltip exists in document');
  t.equals(documentTest.document.getElementsByClassName('deck-tooltip')[0].style.top, '0px');
  documentTest.teardown();
  t.end();
});

test('Tooltip#setTooltip', t => {
  const documentTest = new DocumentTest(Tooltip);
  documentTest.setup();
  const tooltip = documentTest.testObject;
  tooltip.setTooltip(getTooltipFunc(pickedInfo), pickedInfo.x, pickedInfo.y);
  t.equals(tooltip.el.style.backgroundColor, 'lemonchiffon');
  t.equals(tooltip.el.innerHTML, '<strong>Number of points:</strong> 10');
  t.equals(tooltip.el.className, 'coolTooltip');
  documentTest.teardown();
  t.end();
});

test('Tooltip#setTooltipWithString', t => {
  const documentTest = new DocumentTest(Tooltip);
  documentTest.setup();
  const tooltip = documentTest.testObject;
  const pickedInfoFunc = info => `Number of points: ${info.object.elevationValue}`;
  tooltip.setTooltip(pickedInfoFunc(pickedInfo), pickedInfo.x, pickedInfo.y);
  t.equals(tooltip.el.innerText, 'Number of points: 10');
  t.equals(tooltip.el.className, 'deck-tooltip');
  documentTest.teardown();
  t.end();
});

test('Tooltip#setTooltipDefaults', t => {
  const documentTest = new DocumentTest(Tooltip);
  documentTest.setup();
  const tooltip = documentTest.testObject;
  const tooltipResult = getTooltipFuncDefault(pickedInfo);
  tooltip.setTooltip(tooltipResult, pickedInfo.x, pickedInfo.y);
  t.equals(tooltip.el.innerText, 'Number of points: 10');
  t.equals(tooltip.el.className, 'deck-tooltip');
  documentTest.teardown();
  t.end();
});

test('Tooltip#setTooltipNullCase', t => {
  const documentTest = new DocumentTest(Tooltip);
  documentTest.setup();
  const tooltip = documentTest.testObject;
  tooltip.setTooltip(null, pickedInfo.x, pickedInfo.y);
  t.equals(tooltip.el.style.display, 'none');
  documentTest.teardown();
  t.end();
});

test('Tooltip#remove', t => {
  const documentTest = new DocumentTest(Tooltip);
  documentTest.setup();
  const tooltip = documentTest.testObject;
  t.equals(
    documentTest.document.getElementsByClassName('deck-tooltip').length,
    1,
    'Tooltip element present'
  );
  tooltip.remove();
  t.equals(
    documentTest.document.getElementsByClassName('deck-tooltip').length,
    0,
    'Tooltip element successfully removed'
  );
  documentTest.teardown();
  t.end();
});
