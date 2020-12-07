// Based on https://github.com/donmccurdy/expression-eval under MIT license
import test from 'tape-catch';
import parseExpression from '@deck.gl/json/helpers/parse-expression';

const row = Object.freeze({
  foo: {
    bar: 'baz',
    baz: 'wow',
    addOne: x => x + 1
  },
  bool: true,
  list: [1, 2, 3, 4],
  one: 1,
  two: 2,
  three: 3,
  number: 123,
  string: 'string',
  addOne: x => x + 1
});

const TEST_CASES = [
  {expr: 'true', expected: true}, // boolean literal

  // array expression
  {expr: '([1,2,3])[0]', expected: 1},
  {expr: '(["one","two","three"])[1]', expected: 'two'},
  {expr: '([true,false,true])[2]', expected: true},
  {expr: '([1,true,"three"]).length', expected: 3},
  {expr: 'list[3]', expected: 4},

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
  {expr: 'false || true', expected: true},
  {expr: 'true && false', expected: false},

  // member expression
  {expr: 'foo.bar', expected: 'baz'},
  {expr: 'foo["bar"]', expected: 'baz'},
  {expr: 'foo[foo.bar]', expected: 'wow'},

  // call expressions -- should all fail
  {expr: 'foo.addOne("bar")', expected: null, errorRegex: /not allowed/},
  {expr: 'Math.sin(x)', expected: null, errorRegex: /not allowed/},
  {expr: 'Array.isArray([1,2,3])', expected: null, errorRegex: /not allowed/},
  {expr: 'addOne(5)', expected: null, errorRegex: /not allowed/},
  {expr: 'addOne(1+2)', expected: null, errorRegex: /not allowed/},
  {expr: 'true || new Error()', expected: null, errorRegex: /not allowed/},
  {expr: 'false && Error()', expected: null, errorRegex: /not allowed/},

  // unary expression
  {expr: '-one', expected: -1},
  {expr: '+two', expected: 2},
  {expr: '!false', expected: true},
  {expr: '!!true', expected: true},
  {expr: '~15', expected: -16},

  // 'this' context
  {expr: 'this.three', expected: 3}
];

const isAccessor = true;

test('parseExpression', t => {
  for (const testCase of TEST_CASES) {
    const isErrorCase = Boolean(testCase.errorRegex);
    if (isErrorCase) {
      t.throws(
        () => parseExpression(testCase.expr, null, isAccessor),
        testCase.errorRegex,
        `throws on ${testCase.expr}`
      );
      /* eslint-disable-next-line no-continue */
      continue;
    }
    const func = parseExpression(testCase.expr, null, isAccessor);

    t.ok(func, `parseExpression converted ${testCase.expr}`);
    t.deepEquals(
      func(row),
      testCase.expected,
      `parseExpression correctly evaluated ${testCase.expr} to ${testCase.expected}`
    );
  }

  const func = parseExpression('-', null, isAccessor);
  t.deepEquals(
    func('identity'),
    'identity',
    'parseExpression of - returns a cached identity function'
  );

  t.end();
});
