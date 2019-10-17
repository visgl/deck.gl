import test from 'tape-catch';
import DocumentTest from 'deck.gl-test/utils/document';

import * as wt from '@deck.gl/jupyter-widget/widget-tooltip';

const pickedInfo = {object: {elevationValue: 10, position: [0, 0]}, x: 0, y: 0};

const jsDomDocument = new DocumentTest();
wt.getDiv = () => {
  return jsDomDocument.createElement('div');
};

// eslint-disable-next-line
const TOOLTIP_HTML =
  '"<div style="display: flex; flex-direction: row; justify-content: space-between; align-items: stretch;"><div class="header" style="font-weight: 700; margin-right: 10px; flex: 1 1 0%;">elevationValue</div><div class="value" style="flex: 0 0 auto; max-width: 250px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">10</div></div>';

test('getDefaultTooltip', t => {
  const pickedInfoNull = Object.assign({picked: false}, pickedInfo);
  t.equal(wt.getTooltipDefault(pickedInfoNull), null, 'should return null if nothing picked');
  t.equal(wt.lastTooltip, undefined, 'lastTooltip should be undefined');
  t.equal(wt.lastPickedObject, undefined, 'lastTooltip should be undefined');
  const tooltip = wt.getTooltipDefault(pickedInfo);
  t.equal(tooltip, wt.lastTooltip, 'lastTooltip should be present');
  t.equal(tooltip, wt.lastPickedObject, 'lastPickedObject should be present');
  t.equal(tooltip, TOOLTIP_HTML, 'tooltip is expected result');
  t.end();
});

test('toText', t => {
  const TESTING_TABLE = [
    {
      input: ['arma', 'virumque', 'cano', 'Troiae'],
      expected: "['arma', 'virumque', 'cano', 'Troiae']",
      message: 'should convert arrays to strings'
    },
    {
      input: ['arma', 'virumque', 'cano', 'Troiae', 'ab', 'oris'],
      expected: 'Array<6>',
      message: 'should convert arrays to shorthand if excessively long'
    },
    {
      input: 4.51,
      expected: '4.51',
      message: 'should convert numbers to strings'
    },
    {
      input: {id: 1},
      expected: '{"id": 1}',
      message: 'should convert JSON to strings'
    },
    {
      // eslint-disable-next-line
      input: {id: BigInt(2)},
      expected: '<Non-Serializable Object>',
      message: 'should convert unserializable objects to a message'
    },
    {
      // eslint-disable-next-line
      input: 'input'.repeat(10) + '1',
      expected: 'input'.repeat(10),
      message: 'should cap length'
    }
  ];
  for (const kv of TESTING_TABLE) {
    t.equal(wt.toText(kv.input), kv.output, kv.message);
  }
  t.end();
});

test('substituteIn', t => {
  t.equal(
    wt.substituteIn('"{quote}" - {origin}', {
      quote: "Be an optimist. There's not much use being anything else.",
      origin: 'Winston Churchill'
    }),
    "Be an optimist. There's not much use being anything else. - Winston Churchill"
  );
  t.end();
});

test('makeTooltip', t => {
  t.equal(wt.makeTooltip(null), null, 'If no tooltip JSON passed, return null');
  const htmlTooltip = {
    html: '<b>Hey {all}</b>',
    style: {
      backgroundColor: 'lemonchiffon'
    }
  };
  t.equal(typeof wt.makeTooltip(htmlTooltip), 'function');
  t.end();
});
