// math.gl
// SPDX-License-Identifier: MIT and Apache-2.0
// Copyright (c) vis.gl contributors

// s2-geometry is a pure JavaScript port of Google/Niantic's S2 Geometry library
// which is perfect since it works in the browser.

// const MAXIMUM_TOKEN_LENGTH = 16;

// INDEX CALCULATIONS

/**
 * Given an S2 token (String) this function convert the token to 64 bit id (Index)
 * 'X' is the empty cell
 * https://github.com/google/s2-geometry-library-java/blob/c04b68bf3197a9c34082327eeb3aec7ab7c85da1/src/com/google/common/geometry/S2CellId.java#L439
 */
export function getS2IndexFromToken(token: string): bigint {
  if (token === 'X') {
    token = '';
  }
  // pad token with zeros to make the length 16
  const paddedToken = token.padEnd(16, '0');
  return BigInt(`0x${paddedToken}`);
}

/**
 * Convert a 64 bit number to a string token
 * 'X' is the empty cell
 */
export function getS2TokenFromIndex(cellId: bigint): string {
  if (cellId === 0n) {
    return 'X';
  }
  let numZeroDigits = countTrailingZeros(cellId);

  const remainder = numZeroDigits % 4;
  numZeroDigits = (numZeroDigits - remainder) / 4;
  const trailingZeroHexChars = numZeroDigits;
  numZeroDigits *= 4;

  const x = cellId >> BigInt(numZeroDigits);
  const hexString = x.toString(16).replace(/0+$/, '');
  const zeroString = Array(17 - trailingZeroHexChars - hexString.length).join('0');
  return zeroString + hexString;
}

export function getS2ChildIndex(s2Index: bigint, index: number): bigint {
  // Shift sentinel bit 2 positions to the right.
  const newLsb = lsb(s2Index) >> 2n;
  // Insert child index before the sentinel bit.
  const childCellId: bigint = s2Index + BigInt(2 * index + 1 - 4) * newLsb;
  return childCellId;
}

/**
 * Return the lowest-numbered bit that is on for this cell id
 * @private
 */
function lsb(cellId: bigint): bigint {
  return cellId & (cellId + 1n); // eslint-disable-line
}

function countTrailingZeros(n: bigint): number {
  let count = 0;
  while (n % 2n === 0n) {
    n /= 2n;
    count++;
  }
  return count;
}
