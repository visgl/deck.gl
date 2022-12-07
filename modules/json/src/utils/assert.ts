export default function assert(condition, message = '') {
  if (!condition) {
    throw new Error(`JSON conversion error ${message}`);
  }
}
