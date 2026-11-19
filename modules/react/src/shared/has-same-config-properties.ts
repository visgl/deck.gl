const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Checks whether two configuration objects have the same own enumerable string
 * properties and values according to {@link Object.is}.
 *
 * This deliberately performs a shallow comparison so new nested values remain
 * visible to the deck.gl root configuration lifecycle.
 */
export function hasSameConfigProperties(value: object, other: object): boolean {
  if (Object.is(value, other)) {
    return true;
  }

  const valueKeys = Object.keys(value);

  if (valueKeys.length !== Object.keys(other).length) {
    return false;
  }

  const valueRecord = value as Record<string, unknown>;
  const otherRecord = other as Record<string, unknown>;
  let index = valueKeys.length;

  while (index-- > 0) {
    const key = valueKeys[index]!;

    if (!hasOwnProperty.call(other, key) || !Object.is(valueRecord[key], otherRecord[key])) {
      return false;
    }
  }

  return true;
}
