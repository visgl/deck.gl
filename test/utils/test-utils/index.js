export function createEventRegistrarMock() {
  return {
    addEventListener: () => {},
    removeEventListener: () => {}
  };
}
