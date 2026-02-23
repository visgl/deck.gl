// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export type LayoutExpression =
  | {type: 'literal'; value: number}
  | {type: 'percentage'; value: number}
  | {type: 'binary'; operator: '+' | '-'; left: LayoutExpression; right: LayoutExpression};

type Token =
  | {type: 'number'; value: number}
  | {type: 'word'; value: string}
  | {type: 'symbol'; value: string};

const NUMBER_REGEX = /^(?:\d+\.?\d*|\.\d+)$/;

// Takes a number or a string expression that may include numbers, percentages, `px` units or
// CSS-style `calc()` expressions containing `+`/`-` operations and parentheses.
export function parsePosition(value: number | string): LayoutExpression {
  switch (typeof value) {
    case 'number':
      if (!Number.isFinite(value)) {
        throw new Error(`Could not parse position string ${value}`);
      }
      return {type: 'literal', value};

    case 'string':
      try {
        const tokens = tokenize(value);
        const parser = new LayoutExpressionParser(tokens);
        return parser.parseExpression();
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        throw new Error(`Could not parse position string ${value}: ${reason}`);
      }

    default:
      throw new Error(`Could not parse position string ${value}`);
  }
}

export function evaluateLayoutExpression(expression: LayoutExpression, extent: number): number {
  switch (expression.type) {
    case 'literal':
      return expression.value;
    case 'percentage':
      return Math.round(expression.value * extent);
    case 'binary':
      const left = evaluateLayoutExpression(expression.left, extent);
      const right = evaluateLayoutExpression(expression.right, extent);
      return expression.operator === '+' ? left + right : left - right;
    default:
      throw new Error('Unknown layout expression type');
  }
}

export function getPosition(expression: LayoutExpression, extent: number): number {
  return evaluateLayoutExpression(expression, extent);
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;
  while (index < input.length) {
    const char = input[index];
    if (/\s/.test(char)) {
      index++;
      continue;
    }
    if (char === '+' || char === '-' || char === '(' || char === ')' || char === '%') {
      tokens.push({type: 'symbol', value: char});
      index++;
      continue;
    }
    if (isDigit(char) || char === '.') {
      const start = index;
      let hasDecimal = char === '.';
      index++;
      while (index < input.length) {
        const next = input[index];
        if (isDigit(next)) {
          index++;
          continue;
        }
        if (next === '.' && !hasDecimal) {
          hasDecimal = true;
          index++;
          continue;
        }
        break;
      }
      const numberString = input.slice(start, index);
      if (!NUMBER_REGEX.test(numberString)) {
        throw new Error('Invalid number token');
      }
      tokens.push({type: 'number', value: parseFloat(numberString)});
      continue;
    }
    if (isAlpha(char)) {
      const start = index;
      while (index < input.length && isAlpha(input[index])) {
        index++;
      }
      const word = input.slice(start, index).toLowerCase();
      tokens.push({type: 'word', value: word});
      continue;
    }
    throw new Error('Invalid token in position string');
  }
  return tokens;
}

class LayoutExpressionParser {
  private tokens: Token[];
  private index = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parseExpression(): LayoutExpression {
    const expression = this.parseBinaryExpression();
    if (this.index < this.tokens.length) {
      throw new Error('Unexpected token at end of expression');
    }
    return expression;
  }

  private parseBinaryExpression(): LayoutExpression {
    let expression = this.parseFactor();
    let token = this.peek();
    while (isAddSubSymbol(token)) {
      this.index++;
      const right = this.parseFactor();
      expression = {type: 'binary', operator: token.value, left: expression, right};
      token = this.peek();
    }
    return expression;
  }

  private parseFactor(): LayoutExpression {
    const token = this.peek();
    if (!token) {
      throw new Error('Unexpected end of expression');
    }

    if (token.type === 'symbol' && token.value === '+') {
      this.index++;
      return this.parseFactor();
    }
    if (token.type === 'symbol' && token.value === '-') {
      this.index++;
      const factor = this.parseFactor();
      return {type: 'binary', operator: '-', left: {type: 'literal', value: 0}, right: factor};
    }
    if (token.type === 'symbol' && token.value === '(') {
      this.index++;
      const expression = this.parseBinaryExpression();
      if (!this.consumeSymbol(')')) {
        throw new Error('Missing closing parenthesis');
      }
      return expression;
    }
    if (token.type === 'word' && token.value === 'calc') {
      this.index++;
      if (!this.consumeSymbol('(')) {
        throw new Error('Missing opening parenthesis after calc');
      }
      const expression = this.parseBinaryExpression();
      if (!this.consumeSymbol(')')) {
        throw new Error('Missing closing parenthesis');
      }
      return expression;
    }
    if (token.type === 'number') {
      this.index++;
      const numberValue = token.value;
      const nextToken = this.peek();
      if (nextToken && nextToken.type === 'symbol' && nextToken.value === '%') {
        this.index++;
        return {type: 'percentage', value: numberValue / 100};
      }
      if (nextToken && nextToken.type === 'word' && nextToken.value === 'px') {
        this.index++;
        return {type: 'literal', value: numberValue};
      }
      return {type: 'literal', value: numberValue};
    }

    throw new Error('Unexpected token in expression');
  }

  private consumeSymbol(value: string): boolean {
    const token = this.peek();
    if (token && token.type === 'symbol' && token.value === value) {
      this.index++;
      return true;
    }
    return false;
  }

  private peek(): Token | null {
    return this.tokens[this.index] || null;
  }
}

function isDigit(char: string): boolean {
  return char >= '0' && char <= '9';
}

function isAlpha(char: string): boolean {
  return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
}

function isAddSubSymbol(token: Token | null): token is Token & {type: 'symbol'; value: '+' | '-'} {
  return Boolean(token && token.type === 'symbol' && (token.value === '+' || token.value === '-'));
}
