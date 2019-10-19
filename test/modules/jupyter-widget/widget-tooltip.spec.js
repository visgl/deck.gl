// eslint-disable-next-line
import test from 'tape-catch';
import DocumentTest from 'deck.gl-test/utils/document';

import {getModule} from './utils.spec';

const TOOLTIP_LIB = '@deck.gl/jupyter-widget/widget-tooltip';

const pickedInfo = {object: {elevationValue: 10, position: [0, 0]}, x: 0, y: 0, picked: true};

const jsDomDocument = new DocumentTest();

// eslint-disable-next-line
const TOOLTIP_HTML = {
  html:
    '<div style="display: flex; flex-direction: row; justify-content: space-between; align-items: stretch;"><div class="header" style="font-weight: 700; margin-right: 10px; flex: 1;"></div><div class="value" style="flex: 0 0 auto; max-width: 250px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;"></div></div>',
  style: {
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    display: 'flex',
    flex: 'wrap',
    maxWidth: '500px',
    flexDirection: 'column',
    zIndex: 2
  }
};

function safelyGetModule(t) {
  // Skip tests if in headless browser environment
  let module;
  try {
    module = getModule(TOOLTIP_LIB);
  } catch (err) {
    t.end();
  }
  return module;
}

test('getDefaultTooltip', t => {
  const wt = safelyGetModule(t);
  if (!wt) {
    return;
  }

  wt.getDiv = () => {
    return jsDomDocument.createElement('div');
  };

  Object.assign(pickedInfo, {picked: false});
  t.equal(wt.getTooltipDefault(pickedInfo), null, 'should return null if nothing picked');
  Object.assign(pickedInfo, {picked: true});
  const tooltip = wt.getTooltipDefault(pickedInfo);
  t.deepEquals(tooltip, TOOLTIP_HTML, 'tooltip is expected result');
  t.end();
});

test('toText', t => {
  const wt = safelyGetModule(t);
  if (!wt) {
    return;
  }

  const TESTING_TABLE = [
    {
      input: ['arma', 'virumque', 'cano', 'Troiae'],
      expected: '["arma","virumque","cano","Troiae"]',
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
      expected: '{"id":1}',
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
    t.equal(wt.toText(kv.input), kv.expected, kv.message);
  }
  t.end();
});

test('substituteIn', t => {
  const wt = safelyGetModule(t);
  if (!wt) {
    return;
  }

  t.equal(
    wt.substituteIn('"{quote}" - {origin}', {
      quote: "Be an optimist. There's not much use being anything else.",
      origin: 'Winston Churchill'
    }),
    '"Be an optimist. There\'s not much use being anything else." - Winston Churchill'
  );
  t.end();
});

test('makeTooltip', t => {
  const wt = safelyGetModule(t);
  if (!wt) {
    return;
  }
  const makeTooltip = wt.default;
  t.equal(makeTooltip(null), null, 'If no tooltip JSON passed, return null');
  const htmlTooltip = {
    html: '<b>Elevation Value:</b> {elevationValue}',
    style: {
      backgroundColor: 'lemonchiffon'
    }
  };
  const tooltip = makeTooltip(htmlTooltip)(pickedInfo);
  t.deepEquals(tooltip, {
    style: {backgroundColor: 'lemonchiffon'},
    html: '<b>Elevation Value:</b> 10'
  });
  t.end();
});
