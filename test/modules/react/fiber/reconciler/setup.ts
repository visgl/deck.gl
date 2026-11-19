// Setup file for reconciler tests
// Mock globalThis.reportError which may be called during reconciler operations

globalThis.reportError =
  globalThis.reportError ||
  ((error: unknown) => {
    console.error('Unhandled error:', error);
  });
