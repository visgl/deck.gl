import test from 'tape-catch';
import Viewport from 'viewport-mercator-project/viewport';
import {mat4} from 'gl-matrix';

const TEST_DATA = {
  viewport: {
    view: mat4.create(),
    perspective: mat4.create()
  }
};

test('Viewport#imports', t => {
  t.ok(Viewport, 'Viewport import ok');
  t.end();
});

test('Viewport#constructor', t => {
  t.ok(new Viewport() instanceof Viewport,
    'Created new Viewport with default args');
  t.ok(new Viewport(TEST_DATA.viewport) instanceof Viewport,
    'Created new Viewport with test args');
  t.end();
});

test('Viewport#constructor - 0 width/height', t => {
  const viewport = new Viewport(Object.assign({}, TEST_DATA.viewport, {
    width: 0,
    height: 0
  }));
  t.ok(viewport instanceof Viewport,
    'Viewport constructed successfully with 0 width and height');
  t.end();
});

test('Viewport#equals', t => {
  const viewport1 = new Viewport(TEST_DATA.viewport);
  const viewport2 = new Viewport(TEST_DATA.viewport);
  const viewport3 = new Viewport(Object.assign({}, TEST_DATA.viewport, {height: 33}));

  t.ok(viewport1.equals(viewport1),
    'Viewport equality correct');
  t.ok(viewport1.equals(viewport2),
    'Viewport equality correct');
  t.notOk(viewport1.equals(viewport3),
    'Viewport equality correct');
  t.end();
});
