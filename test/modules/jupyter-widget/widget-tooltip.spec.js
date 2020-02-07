// eslint-disable-next-line
/* global document */
import test from 'tape-catch';

const pickedInfo = {object: {elevationValue: 10, position: [0, 0]}, x: 0, y: 0, picked: true};

// eslint-disable-next-line
const TOOLTIP_HTML = {
  html:
    '<div style="display: flex; flex-direction: row; justify-content: space-between; align-items: stretch;">' +
    '<div class="header" style="font-weight: 700; margin-right: 10px; flex: 1 1 0%;">elevationValue</div>' +
    '<div class="value" style="flex: 0 0 auto; max-width: 250px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">10' +
    '</div>' +
    '</div>',
  style: {
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    display: 'flex',
    flex: 'wrap',
    maxWidth: '500px',
    flexDirection: 'column',
    zIndex: 2
  }
};

test('jupyter-widget: tooltip', t0 => {
  let widgetTooltipModule;
  try {
    widgetTooltipModule = require('@deck.gl/jupyter-widget/widget-tooltip');
  } catch (error) {
    t0.comment('dist mode, skipping tooltip tests');
    t0.end();
    return;
  }

  t0.test('getDefaultTooltip', t => {
    Object.assign(pickedInfo, {picked: false});
    t.equal(
      widgetTooltipModule.getTooltipDefault(pickedInfo),
      null,
      'should return null if nothing picked'
    );
    Object.assign(pickedInfo, {picked: true});
    const tooltip = widgetTooltipModule.getTooltipDefault(pickedInfo);
    t.deepEquals(tooltip, TOOLTIP_HTML, 'tooltip is expected result');
    const tooltipCached = widgetTooltipModule.getTooltipDefault(pickedInfo);
    t.deepEquals(tooltipCached, TOOLTIP_HTML, 'tooltip called twice hits its cached value');
    t.end();
  });

  t0.test('toText', t => {
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
      t.equal(widgetTooltipModule.toText(kv.input), kv.expected, kv.message);
    }
    t.end();
  });

  t0.test('substituteIn', t => {
    t.equal(
      widgetTooltipModule.substituteIn('"{quote}" - {origin}', {
        quote: "Be an optimist. There's not much use being anything else.",
        origin: 'Winston Churchill'
      }),
      '"Be an optimist. There\'s not much use being anything else." - Winston Churchill'
    );
    t.end();
  });

  t0.test('makeTooltip', t => {
    const makeTooltip = widgetTooltipModule.default;
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

    const textTooltip = {
      text: 'testing',
      style: {
        backgroundColor: 'lemonchiffon'
      }
    };
    t.deepEquals(textTooltip, {
      style: {backgroundColor: 'lemonchiffon'},
      text: 'testing'
    });

    t.end();
  });

  t0.end();
});
