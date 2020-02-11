import test from 'tape-catch';
import extractStyles from '@deck.gl/react/utils/extract-styles';

test('extractStyles', t => {
  let result = extractStyles({width: '100%', height: '100%'});
  t.is(result.containerStyle.width, '100%', 'containerStyle has width');
  t.is(result.containerStyle.height, '100%', 'containerStyle has height');
  t.ok(result.canvasStyle, 'returns canvasStyle');

  result = extractStyles({
    width: 600,
    height: 400,
    style: {float: 'left', mixBlendMode: 'color-burn'}
  });
  t.is(result.containerStyle.width, 600, 'containerStyle has width');
  t.is(result.containerStyle.height, 400, 'containerStyle has height');
  t.is(result.containerStyle.float, 'left', 'containerStyle contains custom style');
  t.notOk(result.containerStyle.mixBlendMode, 'containerStyle does not contain canvas only style');
  t.is(result.canvasStyle.mixBlendMode, 'color-burn', 'canvasStyle contains custom style');
  t.notOk(result.canvasStyle.float, 'canvasStyle does not contain positioning style');

  t.end();
});
