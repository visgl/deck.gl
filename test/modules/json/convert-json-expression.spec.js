// Based on https://github.com/donmccurdy/expression-eval under MIT license
import test from 'tape-catch';
import convertJSONExpression from '@deck.gl/json/parsers/convert-json-expression';

const TEST_CASES = [
  {expr: 'true', expected: true}, // boolean literal

  // array expression
  {expr: '([1,2,3])[0]', expected: 1},
  {expr: '(["one","two","three"])[1]', expected: 'two'},
  {expr: '([true,false,true])[2]', expected: true},
  {expr: '([1,true,"three"]).length', expected: 3},
  {expr: 'isArray([1,2,3])', expected: true},
  {expr: 'row.list[3]', expected: 4},
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
  // {expr: 'true', expected: true}, // boolean literal

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
  // {expr: 'foo.func("bar")', expected: 'baz'},

  // unary expression
  {expr: '-one', expected: -1},
  {expr: '+two', expected: 2},
  {expr: '!false', expected: true},
  {expr: '!!true', expected: true},
  {expr: '~15', expected: -16},

  // 'this' context
  {expr: 'this.three', expected: 3}
];

const row = Object.freeze({bar: 'baz', baz: 'wow', list: [1, 2, 3, 4]});

test('convertJSONExpression', t => {
  for (const testCase of TEST_CASES) {
    // Test a function string
    const isAccessor = true;
    const func = convertJSONExpression(testCase.expr, null, isAccessor);
    t.ok(func, `JSONConverter converted ${testCase.expr}`);
    t.deepEquals(
      func(row),
      testCase.expected,
      `JSONConverter correctly evaluated ${testCase.expected}`
    );
  }

  t.end();
});
