import // Add any needed widget imports here (or from controls)
'@jupyter-widgets/base';

// import {createTestModel} from './utils.spec';

import {DeckGLView} from '@deck.gl/jupyter-widget';
import test from 'tape-catch';

test('DeckGLView should initialize', t => {
  const obj = new DeckGLView();
  t.ok(obj, 'DeckGLView initalized');
  t.end();
});
