const noop = () => {};
export function createEventRegistrarMock() {
  return {
    addEventListener: noop,
    removeEventListener: noop
  };
}
