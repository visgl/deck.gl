// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {DataType, Field, vectorFromArray, type Schema, type Vector} from 'apache-arrow';
import {compileArrowExpression, type ArrowTableFunction} from '@math.gl/expressions/arrow';
import type {Expression} from '@math.gl/expressions';

/** Binds deck.gl's default extraction functions to concrete nested Arrow field types. */
export function bindNestedExtraction(
  expression: Expression,
  inputSchema: Schema,
  functions: ArrowTableFunction[]
): Expression {
  const bind = (child: {type: string}) =>
    bindNestedExtraction(child as Expression, inputSchema, functions);
  switch (expression.type) {
    case 'BinaryExpression':
    case 'LogicalExpression':
      return {...expression, left: bind(expression.left), right: bind(expression.right)};
    case 'UnaryExpression':
      return {...expression, argument: bind(expression.argument)};
    case 'ConditionalExpression':
      return {
        ...expression,
        test: bind(expression.test),
        consequent: bind(expression.consequent),
        alternate: bind(expression.alternate)
      };
    case 'CallExpression':
      break;
    default:
      return expression;
  }

  const args = expression.arguments.map(bind);
  if (expression.callee.type !== 'Identifier' || typeof expression.callee.name !== 'string') {
    return {...expression, arguments: args};
  }
  const name = expression.callee.name.toUpperCase();
  if (
    (name !== 'LIST_EXTRACT' && name !== 'STRUCT_EXTRACT') ||
    functions.some(fn => fn.name.toUpperCase() === name)
  ) {
    return {...expression, arguments: args};
  }
  if (args.length !== 2 || args[0].type !== 'Identifier') {
    throw new Error(`${name} requires a nested Arrow column and a selector`);
  }

  const input = args[0];
  const inputField = inputSchema.fields.find(field => field.name === input.name);
  if (!inputField) {
    throw new Error(`Unknown Arrow column: ${input.name}`);
  }

  let child: Field;
  let argumentFields: Field[];
  let prepareReader: (vectors: readonly Vector[]) => (row: number) => unknown;
  if (name === 'LIST_EXTRACT') {
    if (!DataType.isList(inputField.type) && !DataType.isFixedSizeList(inputField.type)) {
      throw new Error('LIST_EXTRACT requires an Arrow list');
    }
    child = inputField.type.children[0];
    const index = compileArrowExpression(args[1], {inputSchema, functions}).outputField;
    if (
      !DataType.isInt(index.type) &&
      !DataType.isFloat(index.type) &&
      !DataType.isNull(index.type)
    ) {
      throw new Error('LIST_EXTRACT requires an integer index');
    }
    argumentFields = [inputField, index];
    prepareReader =
      ([lists, indices]) =>
      row => {
        const value = indices.get(row);
        const list = lists.get(row) as Vector | null;
        if (value == null || !list) {
          return null;
        }
        const index = Number(value);
        if (!Number.isInteger(index)) {
          throw new Error('LIST_EXTRACT requires an integer index');
        }
        const offset = index < 0 ? list.length + index : index - 1;
        return offset >= 0 && offset < list.length ? list.get(offset) : null;
      };
  } else {
    if (!DataType.isStruct(inputField.type)) {
      throw new Error('STRUCT_EXTRACT requires an Arrow struct');
    }
    const key = args[1];
    if (key.type !== 'Literal' || typeof key.value !== 'string') {
      throw new Error('STRUCT_EXTRACT requires a literal field name');
    }
    const field = inputField.type.children.find(candidate => candidate.name === key.value);
    if (!field) {
      throw new Error(`Unknown Arrow struct field: ${key.value}`);
    }
    child = field;
    argumentFields = [inputField];
    prepareReader = ([structs]) => {
      const values = structs.getChild(field.name)!;
      return row => (structs.isValid(row) ? values.get(row) : null);
    };
  }

  // Each call has its own output type, which math.gl requires when declaring a kernel.
  const boundName = `__deck_nested_${functions.length}`;
  const result = new Field(child.name, child.type, true, child.metadata);
  functions.push({
    name: boundName,
    prototypes: [
      {
        arguments: argumentFields,
        result,
        evaluate: (vectors, {activeRows}) => {
          const readValue = prepareReader(vectors);
          return vectorFromArray(
            Array.from(activeRows, (active, row) => (active ? readValue(row) : null)),
            result.type
          );
        }
      }
    ]
  });
  return {
    ...expression,
    callee: {type: 'Identifier', name: boundName},
    arguments: args.slice(0, argumentFields.length)
  };
}
