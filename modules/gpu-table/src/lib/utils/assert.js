export default function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'gpu table assertion');
  }
}
