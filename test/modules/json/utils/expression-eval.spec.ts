import test from 'tape-promise/tape';
import {compile, compileAsync, addUnaryOp, addBinaryOp} from '@deck.gl/json/utils/expression-eval';

const fixtures = [
  // array expression
  {expr: '([1,2,3])[0]', expected: 1},
  {expr: '(["one","two","three"])[1]', expected: 'two'},
  {expr: '([true,false,true])[2]', expected: true},
  {expr: '([1,true,"three"]).length', expected: 3},
  {expr: 'isArray([1,2,3])', expected: true},
  {expr: 'list[3]', expected: 4},
  {expr: 'numMap[1 + two]', expected: 'three'},

  // binary expression
  {expr: '1+2', expected: 3},
  {expr: '2-1', expected: 1},
  {expr: '2*2', expected: 4},
  {expr: '6/3', expected: 2},
  {expr: '5|3', expected: 7},
  {expr: '5&3', expected: 1},
  {expr: '5^3', expected: 6},
  {expr: '4<<2', expected: 16},
  {expr: '256>>4', expected: 16},
  {expr: '-14>>>2', expected: 1073741820},
  {expr: '10%6', expected: 4},
  {expr: '"a"+"b"', expected: 'ab'},
  {expr: 'one + three', expected: 4},

  // call expression
  {expr: 'func(5)', expected: 6},
  {expr: 'func(1+2)', expected: 4},

  // conditional expression
  {expr: '(true ? "true" : "false")', expected: 'true'},
  {expr: '( ( bool || false ) ? "true" : "false")', expected: 'true'},
  {expr: '( true ? ( 123*456 ) : "false")', expected: 123 * 456},
  {expr: '( false ? "true" : one + two )', expected: 3},

  // identifier
  {expr: 'string', expected: 'string'},
  {expr: 'number', expected: 123},
  {expr: 'bool', expected: true},

  // literal
  {expr: '"foo"', expected: 'foo'}, // string literal
  {expr: "'foo'", expected: 'foo'}, // string literal
  {expr: '123', expected: 123}, // numeric literal
  {expr: 'true', expected: true}, // boolean literal

  // logical expression
  {expr: 'true || false', expected: true},
  {expr: 'true && false', expected: false},
  {expr: '1 == "1"', expected: true},
  {expr: '2 != "2"', expected: false},
  {expr: '1.234 === 1.234', expected: true},
  {expr: '123 !== "123"', expected: true},
  {expr: '1 < 2', expected: true},
  {expr: '1 > 2', expected: false},
  {expr: '2 <= 2', expected: true},
  {expr: '1 >= 2', expected: false},

  // logical expression lazy evaluation
  {expr: 'true || throw()', expected: true},
  {expr: 'false || true', expected: true},
  {expr: 'false && throw()', expected: false},
  {expr: 'true && false', expected: false},

  // member expression
  {expr: 'foo.bar', expected: 'baz'},
  {expr: 'foo["bar"]', expected: 'baz'},
  {expr: 'foo[foo.bar]', expected: 'wow'},

  // call expression with member
  {expr: 'foo.func("bar")', expected: 'baz'},

  // unary expression
  {expr: '-one', expected: -1},
  {expr: '+two', expected: 2},
  {expr: '!false', expected: true},
  {expr: '!!true', expected: true},
  {expr: '~15', expected: -16},
  {expr: '+[]', expected: 0},

  // 'this' context
  {expr: 'this.three', expected: 3},

  // custom operators
  {expr: '@2', expected: 'two'},
  {expr: '3#4', expected: 3.4},
  {expr: '(1 # 2 # 3)', expected: 1.5}, // Fails with undefined precedence, see issue #45
  {expr: '1 + 2 ~ 3', expected: 9} // ~ is * but with low precedence
];

const context = {
  string: 'string',
  number: 123,
  bool: true,
  one: 1,
  two: 2,
  three: 3,
  foo: {
    bar: 'baz',
    baz: 'wow',
    func: function (x) {
      return this[x];
    }
  },
  numMap: {10: 'ten', 3: 'three'},
  list: [1, 2, 3, 4, 5],
  func: function (x) {
    return x + 1;
  },
  isArray: Array.isArray,
  throw: () => {
    throw new Error('Should not be called.');
  }
};

addUnaryOp('@', a => {
  if (a === 2) {
    return 'two';
  }
  throw new Error('Unexpected value: ' + a);
});

addBinaryOp('#', (a: number, b: number) => a + b / 10);

addBinaryOp('~', 1, (a: number, b: number) => a * b);

test('sync', t => {
  fixtures.forEach(o => {
    const val = compile(o.expr)(context);
    t.equal(val, o.expected, `${o.expr} (${val}) === ${o.expected}`);
  });

  t.end();
});

test('async', async t => {
  const asyncContext = context;
  (asyncContext as Record<string, unknown>).asyncFunc = async function (
    a: number | Promise<number>,
    b: number
  ) {
    return (await a) + b;
  };
  (asyncContext as Record<string, unknown>).promiseFunc = function (a: number, b: number) {
    return new Promise(resolve => setTimeout(() => resolve(a + b), 1000));
  };
  const asyncFixtures = fixtures;
  asyncFixtures.push(
    {
      expr: 'asyncFunc(one, two)',
      expected: 3
    },
    {
      expr: 'promiseFunc(one, two)',
      expected: 3
    }
  );

  for (let o of asyncFixtures) {
    const val = await compileAsync(o.expr)(asyncContext);
    t.equal(val, o.expected, `${o.expr} (${val}) === ${o.expected}`);
  }
  t.end();
});

test('errors', async t => {
  const expectedMsg = /Access to member "\w+" disallowed/;
  t.throws(() => compile(`o.__proto__`)({o: {}}), expectedMsg, '.__proto__');
  t.throws(() => compile(`o.prototype`)({o: {}}), expectedMsg, '.prototype');
  t.throws(() => compile(`o.constructor`)({o: {}}), expectedMsg, '.constructor');
  t.throws(() => compile(`o['__proto__']`)({o: {}}), expectedMsg, '["__proto__"]');
  t.throws(() => compile(`o['prototype']`)({o: {}}), expectedMsg, '["prototype"]');
  t.throws(() => compile(`o['constructor']`)({o: {}}), expectedMsg, '["constructor"]');
  t.throws(() => compile(`o[p]`)({o: {}, p: '__proto__'}), expectedMsg, '[~__proto__]');
  t.throws(() => compile(`o[p]`)({o: {}, p: 'prototype'}), expectedMsg, '[~prototype]');
  t.throws(() => compile(`o[p]`)({o: {}, p: 'constructor'}), expectedMsg, '[~constructor]');
  t.end();
});
