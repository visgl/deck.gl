// Replacement for the external assert method to reduce bundle size
// Note: We don't use the second "message" argument in calling code,
// so no need to support it here
export default function assert(condition: any, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || 'deck.gl: assertion failed.');
  }
}
