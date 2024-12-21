// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

const PERCENT_OR_PIXELS_REGEX = /([0-9]+\.?[0-9]*)(%|px)/;

export type Position = {
  position: number;
  relative: boolean;
};

// Takes a number or a string of formats `50%`, `33.3%` or `200px`
export function parsePosition(value: number | string): Position {
  switch (typeof value) {
    case 'number':
      return {
        position: value,
        relative: false
      };

    case 'string':
      const match = PERCENT_OR_PIXELS_REGEX.exec(value);
      if (match && match.length >= 3) {
        const relative = match[2] === '%';
        const position = parseFloat(match[1]);
        return {
          position: relative ? position / 100 : position,
          relative
        };
      }
    // fallthrough

    default:
      // eslint-disable-line
      throw new Error(`Could not parse position string ${value}`);
  }
}

export function getPosition(position: Position, extent: number): number {
  return position.relative ? Math.round(position.position * extent) : position.position;
}
