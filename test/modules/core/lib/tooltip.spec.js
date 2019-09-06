/* global window */
import Tooltip from '@deck.gl/core/lib/tooltip';
import test from 'tape-catch';

let document;
if (typeof window === undefined || !window.document) {
  const {JSDOM} = require('jsdom');
  const dom = new JSDOM(`<!DOCTYPE html>`);
  document = dom.window.document;
} else {
  document = window.document;
}

const CANVAS_PARENT_CLASS_NAME = 'tooltip-canvas-parent';
const pickedInfo = {object: {elevationValue: 10}, picked: true};

function setup() {
  const canvas = document.createElement('canvas');
  const canvasParent = document.createElement('div');
  canvasParent.className = 'tooltip-canvas-parent';
  canvasParent.appendChild(canvas);
  document.body.appendChild(canvasParent);
  return new Tooltip(canvas);
}

function teardown() {
  const el = document.getElementsByClassName(CANVAS_PARENT_CLASS_NAME)[0];
  el.remove();
}

function getTooltipFunc(object) {
  return {
    className: 'coolTooltip',
    html: `<strong>Number of points:</strong> ${object.elevationValue}`,
    style: {
      backgroundColor: 'lemonchiffon'
    }
  };
}

function getTooltipFuncDefault(object) {
  return {
    text: `Number of points: ${object.elevationValue}`
  };
}

test('Tooltip#constructor', t => {
  const tooltip = setup(); // eslint-disable-line
  t.ok(document.getElementsByClassName('tooltip'), 'Tooltip exists in document');
  t.equals(document.getElementsByClassName('tooltip')[0].style.top, '0px');
  teardown();
  t.end();
});

test('Tooltip#setTooltip', t => {
  const tooltip = setup();
  tooltip.setTooltip(getTooltipFunc, pickedInfo);
  t.equals(tooltip.el.style.backgroundColor, 'lemonchiffon');
  t.equals(tooltip.el.innerHTML, '<strong>Number of points:</strong> 10');
  t.equals(tooltip.el.className, 'coolTooltip');
  teardown();
  t.end();
});

test('Tooltip#setTooltipWithString', t => {
  const tooltip = setup();
  tooltip.setTooltip(object => `Number of points: ${object.elevationValue}`, pickedInfo);
  t.equals(tooltip.el.innerText, 'Number of points: 10');
  t.equals(tooltip.el.className, 'tooltip');
  teardown();
  t.end();
});

test('Tooltip#setTooltipDefaults', t => {
  const tooltip = setup();
  tooltip.setTooltip(getTooltipFuncDefault, pickedInfo);
  t.equals(tooltip.el.innerText, 'Number of points: 10');
  t.equals(tooltip.el.className, 'tooltip');
  teardown();
  t.end();
});

test('Tooltip#remove', t => {
  const tooltip = setup();
  t.equals(document.getElementsByClassName('tooltip').length, 1, 'Tooltip element present');
  tooltip.remove();
  t.equals(
    document.getElementsByClassName('tooltip').length,
    0,
    'Tooltip element successfully removed'
  );
  t.end();
});
