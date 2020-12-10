export function isNumberValid(value) {
  return Number.isFinite(value);
}

export function isNumberOrStringValid(value) {
  return Number.isFinite(value) || typeof value === 'string';
}
