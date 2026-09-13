// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/**
 * jscodeshift transform to convert tape tests to vitest syntax.
 *
 * This is an AST-based alternative to the regex-based migration script.
 * It provides more accurate transformations by understanding code structure.
 */

import type {
  API,
  FileInfo,
  Options,
  Collection,
  CallExpression,
  Identifier,
  ArrowFunctionExpression,
  FunctionExpression
} from 'jscodeshift';

export default function transform(
  fileInfo: FileInfo,
  api: API,
  options: Options
): string | undefined {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Track what imports we need
  const neededImports = new Set<string>();
  neededImports.add('test');
  neededImports.add('expect');

  // Track tape test parameter names in scope (e.g., 't', 't0', 't1')
  const tapeTestParams = new Set<string>();

  // Tape assertion methods to detect
  const tapeAssertionMethods = ['ok', 'notOk', 'equal', 'equals', 'is', 'deepEqual', 'deepEquals', 'same', 'throws', 'doesNotThrow', 'comment', 'end', 'plan', 'pass', 'fail', 'true', 'false', 'not', 'notEqual', 'notEquals', 'notDeepEqual', 'isNot'];

  // ============================================================================
  // Step 0: Detect tape test parameters in utility functions
  // These are functions that receive 't' as a parameter and use tape assertions
  // ============================================================================
  root
    .find(j.FunctionDeclaration)
    .forEach(path => {
      const params = path.node.params;
      if (params.length === 0) return;

      const firstParam = params[0];
      if (!j.Identifier.check(firstParam)) return;

      const paramName = firstParam.name;

      // Check if this parameter is used with tape assertion methods
      const usesTapeAssertions = j(path)
        .find(j.CallExpression)
        .filter(callPath => {
          const callee = callPath.node.callee;
          return (
            j.MemberExpression.check(callee) &&
            j.Identifier.check(callee.object) &&
            callee.object.name === paramName &&
            j.Identifier.check(callee.property) &&
            tapeAssertionMethods.includes(callee.property.name)
          );
        })
        .size() > 0;

      if (usesTapeAssertions) {
        tapeTestParams.add(paramName);
        // Remove the t parameter from the function
        path.node.params = params.slice(1);
      }
    });

  // Also check arrow function expressions and function expressions assigned to variables
  root
    .find(j.VariableDeclarator)
    .forEach(path => {
      const init = path.node.init;
      if (!init) return;
      if (!j.ArrowFunctionExpression.check(init) && !j.FunctionExpression.check(init)) return;

      const params = init.params;
      if (params.length === 0) return;

      const firstParam = params[0];
      if (!j.Identifier.check(firstParam)) return;

      const paramName = firstParam.name;

      // Check if this parameter is used with tape assertion methods
      const usesTapeAssertions = j(init)
        .find(j.CallExpression)
        .filter(callPath => {
          const callee = callPath.node.callee;
          return (
            j.MemberExpression.check(callee) &&
            j.Identifier.check(callee.object) &&
            callee.object.name === paramName &&
            j.Identifier.check(callee.property) &&
            tapeAssertionMethods.includes(callee.property.name)
          );
        })
        .size() > 0;

      if (usesTapeAssertions) {
        tapeTestParams.add(paramName);
        // Remove the t parameter from the function
        init.params = params.slice(1);
      }
    });

  // ============================================================================
  // Step 1: Save header comments from first node, then remove tape imports
  // ============================================================================
  let savedHeaderComments: any[] = [];

  // Save header comments from the very first node in the program
  const program = root.get().node.program;
  if (program.body.length > 0) {
    const firstNode = program.body[0];
    if (firstNode.comments && firstNode.comments.length > 0) {
      savedHeaderComments = firstNode.comments.filter((c: any) => c.leading);
      // Remove header comments from the first node
      firstNode.comments = firstNode.comments.filter((c: any) => !c.leading);
    }
  }

  // Remove tape imports
  root
    .find(j.ImportDeclaration)
    .filter(path => {
      const source = path.node.source.value;
      return (
        source === 'tape' ||
        source === 'tape-catch' ||
        source === 'tape-promise/tape'
      );
    })
    .forEach(path => {
      j(path).remove();
    });

  // ============================================================================
  // Step 2: Find test() calls and identify which have nested t.test()
  // ============================================================================
  root
    .find(j.CallExpression)
    .filter(path => {
      const callee = path.node.callee;
      return (
        j.Identifier.check(callee) && callee.name === 'test' ||
        (j.MemberExpression.check(callee) &&
          j.Identifier.check(callee.object) &&
          callee.object.name === 'test')
      );
    })
    .forEach(path => {
      const args = path.node.arguments;
      if (args.length < 2) return;

      const callback = args[1];
      if (!j.ArrowFunctionExpression.check(callback) && !j.FunctionExpression.check(callback)) {
        return;
      }

      // Get the parameter name (usually 't')
      const params = callback.params;
      if (params.length > 0 && j.Identifier.check(params[0])) {
        const paramName = params[0].name;
        tapeTestParams.add(paramName);

        // Check if this test has nested t.test() calls
        const hasNestedTest = j(callback)
          .find(j.CallExpression)
          .filter(nestedPath => {
            const nestedCallee = nestedPath.node.callee;
            return (
              j.MemberExpression.check(nestedCallee) &&
              j.Identifier.check(nestedCallee.object) &&
              nestedCallee.object.name === paramName &&
              j.Identifier.check(nestedCallee.property) &&
              nestedCallee.property.name === 'test'
            );
          })
          .size() > 0;

        if (hasNestedTest) {
          // Convert to describe()
          if (j.Identifier.check(path.node.callee)) {
            path.node.callee.name = 'describe';
          }
          neededImports.add('describe');
        }

        // Remove the t parameter from the callback
        callback.params = [];
      }
    });

  // ============================================================================
  // Step 3: Convert nested t.test() to test()
  // ============================================================================
  root
    .find(j.CallExpression)
    .filter(path => {
      const callee = path.node.callee;
      return (
        j.MemberExpression.check(callee) &&
        j.Identifier.check(callee.object) &&
        tapeTestParams.has(callee.object.name) &&
        j.Identifier.check(callee.property) &&
        callee.property.name === 'test'
      );
    })
    .forEach(path => {
      // Replace t.test(...) with test(...)
      path.node.callee = j.identifier('test');

      // Remove t parameter from nested test callback
      const args = path.node.arguments;
      if (args.length >= 2) {
        const callback = args[1];
        if (j.ArrowFunctionExpression.check(callback) || j.FunctionExpression.check(callback)) {
          if (callback.params.length > 0 && j.Identifier.check(callback.params[0])) {
            const nestedParam = callback.params[0].name;
            tapeTestParams.add(nestedParam);
          }
          callback.params = [];
        }
      }
    });

  // ============================================================================
  // Step 4: Convert t.end() and t.plan() - remove them (both as statements and return statements)
  // ============================================================================
  // Helper to check if a call is t.end() or t.plan()
  const isEndOrPlanCall = (expr: any) => {
    return (
      j.CallExpression.check(expr) &&
      j.MemberExpression.check(expr.callee) &&
      j.Identifier.check(expr.callee.object) &&
      tapeTestParams.has(expr.callee.object.name) &&
      j.Identifier.check(expr.callee.property) &&
      (expr.callee.property.name === 'end' || expr.callee.property.name === 'plan')
    );
  };

  // Remove t.end() and t.plan() as expression statements
  root
    .find(j.ExpressionStatement)
    .filter(path => isEndOrPlanCall(path.node.expression))
    .remove();

  // Remove return t.end() statements
  root
    .find(j.ReturnStatement)
    .filter(path => path.node.argument && isEndOrPlanCall(path.node.argument))
    .remove();

  // ============================================================================
  // Step 5: Convert t.ok/t.true/t.assert(value, msg) -> expect(value, msg).toBeTruthy()
  // Special case: t.ok(value, expected, msg) with 3 args is a bug in original test
  // that should have been t.equal - convert to expect(value, msg).toBe(expected)
  // ============================================================================
  const truthyMethods = ['ok', 'true', 'assert'];
  root
    .find(j.CallExpression)
    .filter(path => {
      const callee = path.node.callee;
      return (
        j.MemberExpression.check(callee) &&
        j.Identifier.check(callee.object) &&
        tapeTestParams.has(callee.object.name) &&
        j.Identifier.check(callee.property) &&
        truthyMethods.includes(callee.property.name)
      );
    })
    .forEach(path => {
      const args = path.node.arguments;
      const value = args[0];

      // Check for 3-argument pattern: t.ok(value, expected, message)
      // This is a bug in the original test - should have been t.equal
      // Convert to expect(value, message).toBe(expected)
      if (args.length >= 3) {
        const expected = args[1];
        const message = args[2];
        const expectArgs = message ? [value, message] : [value];
        const expectCall = j.callExpression(j.identifier('expect'), expectArgs);
        const toBeCall = j.callExpression(
          j.memberExpression(expectCall, j.identifier('toBe')),
          [expected]
        );
        j(path).replaceWith(toBeCall);
        return;
      }

      // Normal 1 or 2 argument case: t.ok(value) or t.ok(value, message)
      const message = args[1];

      // Build expect(value, msg).toBeTruthy()
      const expectArgs = message ? [value, message] : [value];
      const expectCall = j.callExpression(j.identifier('expect'), expectArgs);
      const toBeTruthyCall = j.callExpression(
        j.memberExpression(expectCall, j.identifier('toBeTruthy')),
        []
      );

      j(path).replaceWith(toBeTruthyCall);
    });

  // ============================================================================
  // Step 6: Convert t.notOk/t.false(value, msg) -> expect(value, msg).toBeFalsy()
  // ============================================================================
  const falsyMethods = ['notOk', 'false'];
  root
    .find(j.CallExpression)
    .filter(path => {
      const callee = path.node.callee;
      return (
        j.MemberExpression.check(callee) &&
        j.Identifier.check(callee.object) &&
        tapeTestParams.has(callee.object.name) &&
        j.Identifier.check(callee.property) &&
        falsyMethods.includes(callee.property.name)
      );
    })
    .forEach(path => {
      const args = path.node.arguments;
      const value = args[0];
      const message = args[1];

      const expectArgs = message ? [value, message] : [value];
      const expectCall = j.callExpression(j.identifier('expect'), expectArgs);
      const toBeFalsyCall = j.callExpression(
        j.memberExpression(expectCall, j.identifier('toBeFalsy')),
        []
      );

      j(path).replaceWith(toBeFalsyCall);
    });

  // ============================================================================
  // Step 7a: Convert t.is(spy.callCount, N, msg) -> expect(spy, msg).toHaveBeenCalledTimes(N)
  // ============================================================================
  const equalMethods = ['equal', 'equals', 'is'];
  root
    .find(j.CallExpression)
    .filter(path => {
      const callee = path.node.callee;
      if (
        !j.MemberExpression.check(callee) ||
        !j.Identifier.check(callee.object) ||
        !tapeTestParams.has(callee.object.name) ||
        !j.Identifier.check(callee.property) ||
        !equalMethods.includes(callee.property.name)
      ) {
        return false;
      }

      // Check if first argument is spy.callCount
      const args = path.node.arguments;
      if (args.length < 2) return false;
      const actual = args[0];
      return (
        j.MemberExpression.check(actual) &&
        j.Identifier.check(actual.property) &&
        actual.property.name === 'callCount'
      );
    })
    .forEach(path => {
      const args = path.node.arguments;
      const spyCallCount = args[0] as any;
      const spy = spyCallCount.object;
      const count = args[1];
      const message = args[2];

      // expect(spy, msg).toHaveBeenCalledTimes(count)
      const expectArgs = message ? [spy, message] : [spy];
      const expectCall = j.callExpression(j.identifier('expect'), expectArgs);
      const toHaveBeenCalledTimesCall = j.callExpression(
        j.memberExpression(expectCall, j.identifier('toHaveBeenCalledTimes')),
        [count]
      );

      j(path).replaceWith(toHaveBeenCalledTimesCall);
    });

  // ============================================================================
  // Step 7b: Convert t.equal(a, b, msg) -> expect(a, msg).toBe(b)
  // ============================================================================
  root
    .find(j.CallExpression)
    .filter(path => {
      const callee = path.node.callee;
      return (
        j.MemberExpression.check(callee) &&
        j.Identifier.check(callee.object) &&
        tapeTestParams.has(callee.object.name) &&
        j.Identifier.check(callee.property) &&
        equalMethods.includes(callee.property.name)
      );
    })
    .forEach(path => {
      const args = path.node.arguments;
      const actual = args[0];
      const expected = args[1];
      const message = args[2];

      const expectArgs = message ? [actual, message] : [actual];
      const expectCall = j.callExpression(j.identifier('expect'), expectArgs);
      const toBeCall = j.callExpression(
        j.memberExpression(expectCall, j.identifier('toBe')),
        [expected]
      );

      j(path).replaceWith(toBeCall);
    });

  // ============================================================================
  // Step 8: Convert t.deepEqual(a, b, msg) -> expect(a, msg).toEqual(b)
  // ============================================================================
  const deepEqualMethods = ['deepEqual', 'deepEquals', 'same'];
  root
    .find(j.CallExpression)
    .filter(path => {
      const callee = path.node.callee;
      return (
        j.MemberExpression.check(callee) &&
        j.Identifier.check(callee.object) &&
        tapeTestParams.has(callee.object.name) &&
        j.Identifier.check(callee.property) &&
        deepEqualMethods.includes(callee.property.name)
      );
    })
    .forEach(path => {
      const args = path.node.arguments;
      const actual = args[0];
      const expected = args[1];
      const message = args[2];

      const expectArgs = message ? [actual, message] : [actual];
      const expectCall = j.callExpression(j.identifier('expect'), expectArgs);
      const toEqualCall = j.callExpression(
        j.memberExpression(expectCall, j.identifier('toEqual')),
        [expected]
      );

      j(path).replaceWith(toEqualCall);
    });

  // ============================================================================
  // Step 9: Convert t.throws(fn, expected?, msg?) -> expect(fn, msg).toThrow(expected?)
  // tape signature: t.throws(fn, expected?, msg?)
  // where expected can be RegExp, constructor, or validation object
  // ============================================================================
  root
    .find(j.CallExpression)
    .filter(path => {
      const callee = path.node.callee;
      return (
        j.MemberExpression.check(callee) &&
        j.Identifier.check(callee.object) &&
        tapeTestParams.has(callee.object.name) &&
        j.Identifier.check(callee.property) &&
        callee.property.name === 'throws'
      );
    })
    .forEach(path => {
      const args = path.node.arguments;
      const fn = args[0];

      // Parse args: t.throws(fn), t.throws(fn, msg), t.throws(fn, expected, msg)
      let expected: any = undefined;
      let message: any = undefined;

      // Helper to check if an argument looks like a message (not an expected error)
      const looksLikeMessage = (arg: any): boolean => {
        // String literal -> message
        if (j.Literal.check(arg) && typeof arg.value === 'string') return true;
        // Template literal -> message
        if (j.TemplateLiteral.check(arg)) return true;
        // RegExp literal -> expected error, not message
        if (j.Literal.check(arg) && arg.regex) return false;
        // MemberExpression like testCase.title, testCase.message, etc. -> likely message
        if (j.MemberExpression.check(arg) && j.Identifier.check(arg.property)) {
          const propName = arg.property.name.toLowerCase();
          if (['title', 'message', 'msg', 'description', 'name'].includes(propName)) {
            return true;
          }
        }
        // Identifier like 'title', 'message', 'msg' -> likely message
        if (j.Identifier.check(arg)) {
          const name = arg.name.toLowerCase();
          if (['title', 'message', 'msg', 'description'].includes(name)) {
            return true;
          }
        }
        // Everything else (RegExp, constructors, etc.) -> expected error
        return false;
      };

      if (args.length === 2) {
        // Could be t.throws(fn, msg) or t.throws(fn, expected)
        const secondArg = args[1];
        if (looksLikeMessage(secondArg)) {
          message = secondArg;
        } else {
          expected = secondArg;
        }
      } else if (args.length >= 3) {
        // t.throws(fn, expected, msg)
        expected = args[1];
        message = args[2];
      }

      const expectArgs = message ? [fn, message] : [fn];
      const expectCall = j.callExpression(j.identifier('expect'), expectArgs);
      const toThrowArgs = expected ? [expected] : [];
      const toThrowCall = j.callExpression(
        j.memberExpression(expectCall, j.identifier('toThrow')),
        toThrowArgs
      );

      j(path).replaceWith(toThrowCall);
    });

  // ============================================================================
  // Step 10: Convert t.comment/t.pass(msg) -> console.log(msg)
  // ============================================================================
  const logMethods = ['comment', 'pass'];
  root
    .find(j.CallExpression)
    .filter(path => {
      const callee = path.node.callee;
      return (
        j.MemberExpression.check(callee) &&
        j.Identifier.check(callee.object) &&
        tapeTestParams.has(callee.object.name) &&
        j.Identifier.check(callee.property) &&
        logMethods.includes(callee.property.name)
      );
    })
    .forEach(path => {
      const args = path.node.arguments;
      const consoleLog = j.callExpression(
        j.memberExpression(j.identifier('console'), j.identifier('log')),
        args
      );
      j(path).replaceWith(consoleLog);
    });

  // ============================================================================
  // Step 11: Convert t.fail(msg) -> throw new Error(msg)
  // ============================================================================
  root
    .find(j.CallExpression)
    .filter(path => {
      const callee = path.node.callee;
      return (
        j.MemberExpression.check(callee) &&
        j.Identifier.check(callee.object) &&
        tapeTestParams.has(callee.object.name) &&
        j.Identifier.check(callee.property) &&
        callee.property.name === 'fail'
      );
    })
    .forEach(path => {
      const args = path.node.arguments;
      const message = args[0] || j.literal('Test failed');
      const throwStatement = j.throwStatement(
        j.newExpression(j.identifier('Error'), [message])
      );

      const parent = path.parent;
      if (j.ExpressionStatement.check(parent.node)) {
        // Direct statement: t.fail(msg); -> throw new Error(msg);
        j(parent).replaceWith(throwStatement);
      } else if (j.ArrowFunctionExpression.check(parent.node) && parent.node.body === path.node) {
        // Arrow function body: () => t.fail(msg) -> () => { throw new Error(msg) }
        parent.node.body = j.blockStatement([throwStatement]);
      } else {
        // Other contexts: wrap in an IIFE
        const iife = j.callExpression(
          j.arrowFunctionExpression([], j.blockStatement([throwStatement])),
          []
        );
        j(path).replaceWith(iife);
      }
    });

  // ============================================================================
  // Step 12: Convert t.notEqual/t.notEquals/t.isNot/t.not(a, b, msg) -> expect(a, msg).not.toBe(b)
  // ============================================================================
  const notEqualMethods = ['notEqual', 'notEquals', 'isNot', 'not'];
  root
    .find(j.CallExpression)
    .filter(path => {
      const callee = path.node.callee;
      return (
        j.MemberExpression.check(callee) &&
        j.Identifier.check(callee.object) &&
        tapeTestParams.has(callee.object.name) &&
        j.Identifier.check(callee.property) &&
        notEqualMethods.includes(callee.property.name)
      );
    })
    .forEach(path => {
      const args = path.node.arguments;
      const actual = args[0];
      const expected = args[1];
      const message = args[2];

      const expectArgs = message ? [actual, message] : [actual];
      const expectCall = j.callExpression(j.identifier('expect'), expectArgs);
      const notToBeCall = j.callExpression(
        j.memberExpression(
          j.memberExpression(expectCall, j.identifier('not')),
          j.identifier('toBe')
        ),
        [expected]
      );

      j(path).replaceWith(notToBeCall);
    });

  // ============================================================================
  // Step 13: Convert t.notDeepEqual/t.notDeepEquals(a, b, msg) -> expect(a, msg).not.toEqual(b)
  // ============================================================================
  const notDeepEqualMethods = ['notDeepEqual', 'notDeepEquals'];
  root
    .find(j.CallExpression)
    .filter(path => {
      const callee = path.node.callee;
      return (
        j.MemberExpression.check(callee) &&
        j.Identifier.check(callee.object) &&
        tapeTestParams.has(callee.object.name) &&
        j.Identifier.check(callee.property) &&
        notDeepEqualMethods.includes(callee.property.name)
      );
    })
    .forEach(path => {
      const args = path.node.arguments;
      const actual = args[0];
      const expected = args[1];
      const message = args[2];

      const expectArgs = message ? [actual, message] : [actual];
      const expectCall = j.callExpression(j.identifier('expect'), expectArgs);
      const notToEqualCall = j.callExpression(
        j.memberExpression(
          j.memberExpression(expectCall, j.identifier('not')),
          j.identifier('toEqual')
        ),
        [expected]
      );

      j(path).replaceWith(notToEqualCall);
    });

  // ============================================================================
  // Step 14: Convert t.doesNotThrow(fn, msg) -> expect(fn, msg).not.toThrow()
  // ============================================================================
  root
    .find(j.CallExpression)
    .filter(path => {
      const callee = path.node.callee;
      return (
        j.MemberExpression.check(callee) &&
        j.Identifier.check(callee.object) &&
        tapeTestParams.has(callee.object.name) &&
        j.Identifier.check(callee.property) &&
        callee.property.name === 'doesNotThrow'
      );
    })
    .forEach(path => {
      const args = path.node.arguments;
      const fn = args[0];
      const message = args.length > 1 ? args[args.length - 1] : undefined;

      const expectArgs = message ? [fn, message] : [fn];
      const expectCall = j.callExpression(j.identifier('expect'), expectArgs);
      const notToThrowCall = j.callExpression(
        j.memberExpression(
          j.memberExpression(expectCall, j.identifier('not')),
          j.identifier('toThrow')
        ),
        []
      );

      j(path).replaceWith(notToThrowCall);
    });

  // ============================================================================
  // Step 15: Convert callback patterns like onError: t.fail, .catch(t.fail)
  // ============================================================================
  // Pattern: onError: t.fail -> onError: (err) => { throw err }
  // Pattern: .catch(t.fail) -> .catch(e => { throw e })
  root
    .find(j.MemberExpression)
    .filter(path => {
      return (
        j.Identifier.check(path.node.object) &&
        tapeTestParams.has(path.node.object.name) &&
        j.Identifier.check(path.node.property) &&
        path.node.property.name === 'fail'
      );
    })
    .forEach(path => {
      // Create (err) => { throw err }
      const errParam = j.identifier('err');
      const throwErr = j.arrowFunctionExpression(
        [errParam],
        j.blockStatement([j.throwStatement(errParam)])
      );
      j(path).replaceWith(throwErr);
    });

  // Pattern: onError: t.notOk -> onError: (err) => expect(err).toBeFalsy()
  root
    .find(j.MemberExpression)
    .filter(path => {
      return (
        j.Identifier.check(path.node.object) &&
        tapeTestParams.has(path.node.object.name) &&
        j.Identifier.check(path.node.property) &&
        path.node.property.name === 'notOk'
      );
    })
    .forEach(path => {
      const errParam = j.identifier('err');
      const expectCall = j.callExpression(j.identifier('expect'), [errParam]);
      const toBeFalsyCall = j.callExpression(
        j.memberExpression(expectCall, j.identifier('toBeFalsy')),
        []
      );
      const callback = j.arrowFunctionExpression([errParam], toBeFalsyCall);
      j(path).replaceWith(callback);
    });

  // Pattern: assert: t.ok -> assert: (cond, msg) => expect(cond, msg).toBeTruthy()
  root
    .find(j.MemberExpression)
    .filter(path => {
      return (
        j.Identifier.check(path.node.object) &&
        tapeTestParams.has(path.node.object.name) &&
        j.Identifier.check(path.node.property) &&
        path.node.property.name === 'ok'
      );
    })
    .forEach(path => {
      const condParam = j.identifier('cond');
      const msgParam = j.identifier('msg');
      const expectCall = j.callExpression(j.identifier('expect'), [condParam, msgParam]);
      const toBeTruthyCall = j.callExpression(
        j.memberExpression(expectCall, j.identifier('toBeTruthy')),
        []
      );
      const callback = j.arrowFunctionExpression([condParam, msgParam], toBeTruthyCall);
      j(path).replaceWith(callback);
    });

  // ============================================================================
  // Step 16: Convert makeSpy(obj, 'method') -> vi.spyOn(obj, 'method')
  // ============================================================================
  let needsVi = false;
  root
    .find(j.CallExpression)
    .filter(path => {
      const callee = path.node.callee;
      return j.Identifier.check(callee) && callee.name === 'makeSpy';
    })
    .forEach(path => {
      needsVi = true;
      // Replace makeSpy with vi.spyOn
      path.node.callee = j.memberExpression(j.identifier('vi'), j.identifier('spyOn'));
    });

  // Remove makeSpy import from @probe.gl/test-utils
  root
    .find(j.ImportDeclaration)
    .filter(path => {
      const source = path.node.source.value;
      return source === '@probe.gl/test-utils';
    })
    .forEach(path => {
      const specifiers = path.node.specifiers;
      if (!specifiers) return;

      // Filter out makeSpy
      const remaining = specifiers.filter(spec => {
        if (j.ImportSpecifier.check(spec)) {
          return spec.imported.name !== 'makeSpy';
        }
        return true;
      });

      if (remaining.length === 0) {
        // Remove entire import if no specifiers left
        j(path).remove();
      } else {
        path.node.specifiers = remaining;
      }
    });

  // ============================================================================
  // Step 17: Convert spy.called/spy.callCount patterns
  // ============================================================================
  // expect(spy.called).toBeTruthy() -> expect(spy).toHaveBeenCalled()
  root
    .find(j.CallExpression)
    .filter(path => {
      const callee = path.node.callee;
      if (!j.MemberExpression.check(callee)) return false;
      if (!j.Identifier.check(callee.property)) return false;
      if (callee.property.name !== 'toBeTruthy' && callee.property.name !== 'toBe') return false;

      // Check if it's expect(spy.called)
      const expectCall = callee.object;
      if (!j.CallExpression.check(expectCall)) return false;
      if (!j.Identifier.check(expectCall.callee)) return false;
      if (expectCall.callee.name !== 'expect') return false;

      const arg = expectCall.arguments[0];
      if (!j.MemberExpression.check(arg)) return false;
      if (!j.Identifier.check(arg.property)) return false;
      return arg.property.name === 'called';
    })
    .forEach(path => {
      const callee = path.node.callee as any;
      const expectCall = callee.object;
      const spyCalledArg = expectCall.arguments[0];
      const spy = spyCalledArg.object;
      const message = expectCall.arguments[1];

      // Check if this is .toBe(true) or .toBe(false) or .toBeTruthy()/.toBeFalsy()
      const methodName = callee.property.name;
      const toBeArg = path.node.arguments[0];

      let isNegative = false;
      if (methodName === 'toBe' && j.Literal.check(toBeArg) && toBeArg.value === false) {
        isNegative = true;
      } else if (methodName === 'toBeFalsy') {
        isNegative = true;
      }

      const newExpectArgs = message ? [spy, message] : [spy];
      const newExpectCall = j.callExpression(j.identifier('expect'), newExpectArgs);

      let result;
      if (isNegative) {
        result = j.callExpression(
          j.memberExpression(
            j.memberExpression(newExpectCall, j.identifier('not')),
            j.identifier('toHaveBeenCalled')
          ),
          []
        );
      } else {
        result = j.callExpression(
          j.memberExpression(newExpectCall, j.identifier('toHaveBeenCalled')),
          []
        );
      }

      j(path).replaceWith(result);
    });

  // expect(spy.called).toBeFalsy() -> expect(spy).not.toHaveBeenCalled()
  root
    .find(j.CallExpression)
    .filter(path => {
      const callee = path.node.callee;
      if (!j.MemberExpression.check(callee)) return false;
      if (!j.Identifier.check(callee.property)) return false;
      if (callee.property.name !== 'toBeFalsy') return false;

      const expectCall = callee.object;
      if (!j.CallExpression.check(expectCall)) return false;
      if (!j.Identifier.check(expectCall.callee)) return false;
      if (expectCall.callee.name !== 'expect') return false;

      const arg = expectCall.arguments[0];
      if (!j.MemberExpression.check(arg)) return false;
      if (!j.Identifier.check(arg.property)) return false;
      return arg.property.name === 'called';
    })
    .forEach(path => {
      const callee = path.node.callee as any;
      const expectCall = callee.object;
      const spyCalledArg = expectCall.arguments[0];
      const spy = spyCalledArg.object;
      const message = expectCall.arguments[1];

      const newExpectArgs = message ? [spy, message] : [spy];
      const newExpectCall = j.callExpression(j.identifier('expect'), newExpectArgs);

      const result = j.callExpression(
        j.memberExpression(
          j.memberExpression(newExpectCall, j.identifier('not')),
          j.identifier('toHaveBeenCalled')
        ),
        []
      );

      j(path).replaceWith(result);
    });

  // spy.restore() -> spy.mockRestore()
  root
    .find(j.CallExpression)
    .filter(path => {
      const callee = path.node.callee;
      return (
        j.MemberExpression.check(callee) &&
        j.Identifier.check(callee.property) &&
        callee.property.name === 'restore'
      );
    })
    .forEach(path => {
      const callee = path.node.callee as any;
      callee.property.name = 'mockRestore';
    });

  // spy.reset() -> spy.mockClear()
  root
    .find(j.CallExpression)
    .filter(path => {
      const callee = path.node.callee;
      return (
        j.MemberExpression.check(callee) &&
        j.Identifier.check(callee.property) &&
        callee.property.name === 'reset'
      );
    })
    .forEach(path => {
      const callee = path.node.callee as any;
      callee.property.name = 'mockClear';
    });

  // ============================================================================
  // Step 18: Convert @deck.gl/test-utils -> @deck.gl/test-utils/vitest
  // ============================================================================
  root
    .find(j.ImportDeclaration)
    .filter(path => {
      const source = path.node.source.value;
      return source === '@deck.gl/test-utils';
    })
    .forEach(path => {
      path.node.source.value = '@deck.gl/test-utils/vitest';
    });

  // ============================================================================
  // Step 19: Remove t argument from function call sites
  // e.g., testAsyncData(t, getData()) -> testAsyncData(getData())
  // ============================================================================
  root
    .find(j.CallExpression)
    .forEach(path => {
      const args = path.node.arguments;
      if (args.length === 0) return;

      const firstArg = args[0];
      if (j.Identifier.check(firstArg) && tapeTestParams.has(firstArg.name)) {
        // Remove the first argument if it's a tape test param
        path.node.arguments = args.slice(1);
      }
    });

  // ============================================================================
  // Step 20: Add vitest import at the top, preserving leading comments (header)
  // ============================================================================
  if (needsVi) {
    neededImports.add('vi');
  }
  const vitestImport = j.importDeclaration(
    Array.from(neededImports).map(name => j.importSpecifier(j.identifier(name))),
    j.literal('vitest')
  );

  // Attach saved header comments from the removed tape import
  if (savedHeaderComments.length > 0) {
    vitestImport.comments = savedHeaderComments;
  }

  // Find first import or add at the top
  const firstImport = root.find(j.ImportDeclaration).at(0);
  if (firstImport.size() > 0) {
    firstImport.insertBefore(vitestImport);
  } else {
    root.get().node.program.body.unshift(vitestImport);
  }

  return root.toSource();
}
