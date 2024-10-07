// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import jsep from 'jsep';

/**
 * Sources:
 * - Copyright (c) 2013 Stephen Oney, http://jsep.from.so/, MIT License
 * - Copyright (c) 2023 Don McCurdy, https://github.com/donmccurdy/expression-eval, MIT License
 */

// Default operator precedence from https://github.com/EricSmekens/jsep/blob/master/src/jsep.js#L55
const DEFAULT_PRECEDENCE = {
  '||': 1,
  '&&': 2,
  '|': 3,
  '^': 4,
  '&': 5,
  '==': 6,
  '!=': 6,
  '===': 6,
  '!==': 6,
  '<': 7,
  '>': 7,
  '<=': 7,
  '>=': 7,
  '<<': 8,
  '>>': 8,
  '>>>': 8,
  '+': 9,
  '-': 9,
  '*': 10,
  '/': 10,
  '%': 10
};

const binops = {
  '||': (a: unknown, b: unknown) => {
    return a || b;
  },
  '&&': (a: unknown, b: unknown) => {
    return a && b;
  },
  '|': (a: number, b: number) => {
    return a | b;
  },
  '^': (a: number, b: number) => {
    return a ^ b;
  },
  '&': (a: number, b: number) => {
    return a & b;
  },
  '==': (a: unknown, b: unknown) => {
    // eslint-disable-next-line eqeqeq
    return a == b;
  },
  '!=': (a: unknown, b: unknown) => {
    // eslint-disable-next-line eqeqeq
    return a != b;
  },
  '===': (a: unknown, b: unknown) => {
    return a === b;
  },
  '!==': (a: unknown, b: unknown) => {
    return a !== b;
  },
  '<': (a: number | string, b: number | string) => {
    return a < b;
  },
  '>': (a: number | string, b: number | string) => {
    return a > b;
  },
  '<=': (a: number | string, b: number | string) => {
    return a <= b;
  },
  '>=': (a: number | string, b: number | string) => {
    return a >= b;
  },
  '<<': (a: number, b: number) => {
    return a << b;
  },
  '>>': (a: number, b: number) => {
    return a >> b;
  },
  '>>>': (a: number, b: number) => {
    return a >>> b;
  },
  '+': (a: unknown, b: unknown) => {
    // @ts-expect-error
    return a + b;
  },
  '-': (a: number, b: number) => {
    return a - b;
  },
  '*': (a: number, b: number) => {
    return a * b;
  },
  '/': (a: number, b: number) => {
    return a / b;
  },
  '%': (a: number, b: number) => {
    return a % b;
  }
};

const unops = {
  '-': (a: number) => {
    return -a;
  },
  '+': (a: unknown) => {
    // @ts-expect-error
    // eslint-disable-next-line no-implicit-coercion
    return +a;
  },
  '~': (a: number) => {
    return ~a;
  },
  '!': (a: unknown) => {
    return !a;
  }
};

declare type operand = number | string;
declare type unaryCallback = (a: operand) => operand;
declare type binaryCallback = (a: operand, b: operand) => operand;

type AnyExpression =
  | jsep.ArrayExpression
  | jsep.BinaryExpression
  | jsep.MemberExpression
  | jsep.CallExpression
  | jsep.ConditionalExpression
  | jsep.Identifier
  | jsep.Literal
  | jsep.LogicalExpression
  | jsep.ThisExpression
  | jsep.UnaryExpression;

function evaluateArray(list, context) {
  return list.map(function (v) {
    return evaluate(v, context);
  });
}

async function evaluateArrayAsync(list, context) {
  const res = await Promise.all(list.map(v => evalAsync(v, context)));
  return res;
}

function evaluateMember(node: jsep.MemberExpression, context: object) {
  const object = evaluate(node.object, context);
  let key: string;
  if (node.computed) {
    key = evaluate(node.property, context);
  } else {
    key = (node.property as jsep.Identifier).name;
  }
  if (/^__proto__|prototype|constructor$/.test(key)) {
    throw Error(`Access to member "${key}" disallowed.`);
  }
  return [object, object[key]];
}

async function evaluateMemberAsync(node: jsep.MemberExpression, context: object) {
  const object = await evalAsync(node.object, context);
  let key: string;
  if (node.computed) {
    key = await evalAsync(node.property, context);
  } else {
    key = (node.property as jsep.Identifier).name;
  }
  if (/^__proto__|prototype|constructor$/.test(key)) {
    throw Error(`Access to member "${key}" disallowed.`);
  }
  return [object, object[key]];
}

// eslint-disable-next-line complexity
function evaluate(_node: jsep.Expression, context: object) {
  const node = _node as AnyExpression;

  switch (node.type) {
    case 'ArrayExpression':
      return evaluateArray(node.elements, context);

    case 'BinaryExpression':
      return binops[node.operator](evaluate(node.left, context), evaluate(node.right, context));

    case 'CallExpression':
      let caller: object;
      let fn: Function;
      let assign: unknown[];
      if (node.callee.type === 'MemberExpression') {
        assign = evaluateMember(node.callee as jsep.MemberExpression, context);
        caller = assign[0] as object;
        fn = assign[1] as Function;
      } else {
        fn = evaluate(node.callee, context);
      }
      if (typeof fn !== 'function') {
        return undefined;
      }
      return fn.apply(caller!, evaluateArray(node.arguments, context));

    case 'ConditionalExpression':
      return evaluate(node.test, context)
        ? evaluate(node.consequent, context)
        : evaluate(node.alternate, context);

    case 'Identifier':
      return context[node.name];

    case 'Literal':
      return node.value;

    case 'LogicalExpression':
      if (node.operator === '||') {
        return evaluate(node.left, context) || evaluate(node.right, context);
      } else if (node.operator === '&&') {
        return evaluate(node.left, context) && evaluate(node.right, context);
      }
      return binops[node.operator](evaluate(node.left, context), evaluate(node.right, context));

    case 'MemberExpression':
      return evaluateMember(node, context)[1];

    case 'ThisExpression':
      return context;

    case 'UnaryExpression':
      return unops[node.operator](evaluate(node.argument, context));

    default:
      return undefined;
  }
}

// eslint-disable-next-line complexity
async function evalAsync(_node: jsep.Expression, context: object) {
  const node = _node as AnyExpression;

  // Brackets used for some case blocks here, to avoid edge cases related to variable hoisting.
  // See: https://stackoverflow.com/questions/57759348/const-and-let-variable-shadowing-in-a-switch-statement
  switch (node.type) {
    case 'ArrayExpression':
      return await evaluateArrayAsync(node.elements, context);

    case 'BinaryExpression': {
      const [left, right] = await Promise.all([
        evalAsync(node.left, context),
        evalAsync(node.right, context)
      ]);
      return binops[node.operator](left, right);
    }

    case 'CallExpression': {
      let caller: object;
      let fn: Function;
      let assign: unknown[];
      if (node.callee.type === 'MemberExpression') {
        assign = await evaluateMemberAsync(node.callee as jsep.MemberExpression, context);
        caller = assign[0] as object;
        fn = assign[1] as Function;
      } else {
        fn = await evalAsync(node.callee, context);
      }
      if (typeof fn !== 'function') {
        return undefined;
      }
      return await fn.apply(caller!, await evaluateArrayAsync(node.arguments, context));
    }

    case 'ConditionalExpression':
      return (await evalAsync(node.test, context))
        ? await evalAsync(node.consequent, context)
        : await evalAsync(node.alternate, context);

    case 'Identifier':
      return context[node.name];

    case 'Literal':
      return node.value;

    case 'LogicalExpression': {
      if (node.operator === '||') {
        return (await evalAsync(node.left, context)) || (await evalAsync(node.right, context));
      } else if (node.operator === '&&') {
        return (await evalAsync(node.left, context)) && (await evalAsync(node.right, context));
      }

      const [left, right] = await Promise.all([
        evalAsync(node.left, context),
        evalAsync(node.right, context)
      ]);

      return binops[node.operator](left, right);
    }

    case 'MemberExpression':
      return (await evaluateMemberAsync(node, context))[1];

    case 'ThisExpression':
      return context;

    case 'UnaryExpression':
      return unops[node.operator](await evalAsync(node.argument, context));

    default:
      return undefined;
  }
}

function compile(expression: string | jsep.Expression): (context: object) => any {
  return evaluate.bind(null, jsep(expression));
}

function compileAsync(expression: string | jsep.Expression): (context: object) => Promise<any> {
  return evalAsync.bind(null, jsep(expression));
}

// Added functions to inject Custom Unary Operators (and override existing ones)
function addUnaryOp(operator: string, _function: unaryCallback): void {
  jsep.addUnaryOp(operator);
  unops[operator] = _function;
}

// Added functions to inject Custom Binary Operators (and override existing ones)
function addBinaryOp(
  operator: string,
  precedenceOrFn: number | binaryCallback,
  _function: binaryCallback
): void {
  if (_function) {
    jsep.addBinaryOp(operator, precedenceOrFn as number);
    binops[operator] = _function;
  } else {
    jsep.addBinaryOp(operator, DEFAULT_PRECEDENCE[operator] || 1);
    binops[operator] = precedenceOrFn;
  }
}

export {jsep as parse, evaluate as eval, evalAsync, compile, compileAsync, addUnaryOp, addBinaryOp};
