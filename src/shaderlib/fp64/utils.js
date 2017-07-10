export function fp64ify(a) {
  const hiPart = Math.fround(a);
  const loPart = a - hiPart;
  return [hiPart, loPart];
}
