export function compareArrays(array1, array2) {

  const length = Math.min(array1.length, array2.length);
  for (let i = 0; i < length; ++i) {
    if (array1[i] !== array2[i]) {
      return `Arrays are different in element ${i}: ${array1[i]} vs ${array2[i]}`;
    }
  }

  if (array1.length !== array2.length) {
    return `Arrays have different length ${array1.length} vs ${array2.length}`;
  }

  return null;
}

export function checkArray(array) {
  for (let i = 0; i < array.length; ++i) {
    if (!Number.isFinite(array[i])) {
      throw new Error(`Array has invalid element ${i}: ${array[i]}`);
    }
  }
  return null;
}
