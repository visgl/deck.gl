import type {Layer, View} from '@deck.gl/core';
import {Deck, assert, log} from '@deck.gl/core';
import {RENDERER_PACKAGE_NAME, RENDERER_VERSION} from '../shared/constants';
import {createStore, noop} from '../shared/index';
import type {ReactNode} from 'react';
import reactReconciler from 'react-reconciler';
import type {HostConfig} from 'react-reconciler';
import {ConcurrentRoot} from 'react-reconciler/constants.js';

import * as config from './config';
import {RootErrorBoundary} from './error-boundary';
import {combineRootDescriptors} from './utils';
import type {
  ChildSet,
  Container,
  DeckGLConfiguration,
  HostContext,
  Instance,
  JsxDescriptors,
  Props,
  ReconcilerRoot,
  RootElement,
  RootOptions
} from './types';

/**
 * React reconciler instance configured for deck.gl rendering
 *
 * Internal reconciler used by createRoot/unmountAtNode. Generally not used directly
 * by consumers - use the higher-level createRoot API instead.
 *
 * **Type Assertion Note:**
 * The `as unknown as HostConfig` assertion is necessary because @types/react-reconciler@0.33.0
 * has an incorrect type definition for `waitForCommitToBeReady`:
 *
 * - **@types definition (INCORRECT):** `waitForCommitToBeReady(): ...`
 *   - Takes 0 parameters
 *
 * - **Actual react-reconciler implementation (CORRECT):** `waitForCommitToBeReady(state, timeoutOffset): ...`
 *   - Takes 2 parameters: SuspendedState and timeout number
 *   - See: ReactFiberWorkLoop.js line `const schedulePendingCommit = waitForCommitToBeReady(suspendedState, timeoutOffset);`
 *
 * Our implementation follows the actual react-reconciler@0.33.0 source code.
 * The assertion only affects this renderer creation - the config module itself
 * remains fully typed and will catch other errors.
 *
 * **Related Issue:** https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/70858
 *
 * @example
 * ```typescript
 * // Advanced usage: direct container access
 * import { renderer } from '@deck.gl-community/react-fiber/reconciler';
 *
 * const container = renderer.createContainer(
 *   hostContext,
 *   ConcurrentRoot,
 *   // ... other params
 * );
 * renderer.updateContainer(element, container, null, callback);
 * ```
 */
export const renderer: ReturnType<typeof reactReconciler> = reactReconciler(
  config as unknown as HostConfig<
    string,
    Props,
    Container,
    Instance | undefined,
    void,
    unknown,
    unknown,
    never,
    Layer | View,
    HostContext,
    ChildSet,
    number,
    -1,
    null
  >
);

// Lets React DevTools show the tree inside each `DeckGL` root. react-reconciler@0.33 reads the
// name and version from the host config; the argument only satisfies older typings.
renderer.injectIntoDevTools({
  bundleType: process.env.NODE_ENV === 'production' ? 0 : 1,
  rendererPackageName: RENDERER_PACKAGE_NAME,
  version: RENDERER_VERSION
});

/**
 * Active reconciler roots registry
 *
 * Maps RootElement containers to their ReconcilerRoot instances. Used internally
 * to ensure root idempotency and proper cleanup.
 *
 * @example
 * ```typescript
 * // Advanced usage: check if root exists for container
 * import { roots } from '@deck.gl-community/react-fiber/reconciler';
 *
 * if (roots.has(containerElement)) {
 *   const existingRoot = roots.get(containerElement);
 *   // Work with existing root
 * }
 * ```
 */
export const roots = new Map<RootElement, ReconcilerRoot>();

const EMPTY_JSX_DESCRIPTORS: JsxDescriptors = {effects: [], layers: [], views: [], widgets: []};

function reportError(error: unknown): void {
  log.error('DeckGL error', error)();
}

function reportCaughtError(error: unknown, info: object): void {
  // `DeckGL` rethrows what its own boundary catches, so React reports that error in the host tree.
  // React passes the catching boundary in `info`, although @types/react-reconciler omits it.
  if ((info as {errorBoundary?: unknown}).errorBoundary instanceof RootErrorBoundary) {
    return;
  }
  reportError(error);
}

/**
 * Unmounts and cleans up a reconciler root
 *
 * Performs complete cleanup including:
 * - Unmounting React tree from the container
 * - Finalizing deck.gl instance (releases WebGL resources)
 * - Clearing internal state
 * - Removing root from registry
 *
 * Safe to call multiple times or on non-existent nodes (no-op if not found).
 *
 * Cleanup (state clearing and root removal) always completes even if finalize
 * throws, but the error is re-thrown to allow proper error handling by callers.
 *
 * @param node - Root element container to unmount
 * @throws {Error} When deck.gl finalize() fails (e.g., WebGL context errors)
 *
 * @example
 * ```typescript
 * const root = createRoot(container);
 * root.render(<MyApp />);
 *
 * // Later: cleanup with error handling
 * try {
 *   unmountAtNode(container);
 * } catch (error) {
 *   console.error('WebGL cleanup failed:', error);
 *   // Root is still removed from registry despite error
 * }
 * ```
 */
export function unmountAtNode(node: RootElement) {
  const root = roots.get(node);

  if (root?.container) {
    log.log(3, 'DeckGL root unmounted')();
    renderer.updateContainer(null, root.container, null, noop);

    const state = root.store.getState();
    const deckgl = state.deckgl;

    // Ensure cleanup completes even if finalize throws
    try {
      deckgl?.finalize();
    } finally {
      // Always clear state and remove from registry, even on error
      state.setDeckGL(null);
      roots.delete(node);
    }
  }
}

/**
 * Creates a reconciler root for deck.gl rendering
 *
 * Returns a ReconcilerRoot with methods to configure deck.gl and render React
 * elements. Calling createRoot multiple times with the same node returns the
 * existing root (idempotent).
 *
 * The returned root provides:
 * - `configure(props)` - Initialize deck.gl instance with props
 * - `render(children)` - Render React elements into deck.gl
 * - `container` - Internal reconciler container
 * - `store` - Shared state store
 *
 * @param node - Root element to attach the reconciler to
 * @returns ReconcilerRoot instance with configure/render methods
 *
 * @example
 * ```typescript
 * import { createRoot } from '@deck.gl-community/react-fiber/reconciler';
 * import { ScatterplotLayer } from '@deck.gl/layers';
 *
 * const root = createRoot(container);
 *
 * // Configure deck.gl
 * root.configure({
 *   views: [new MapView()],
 *   initialViewState: { longitude: 0, latitude: 0, zoom: 1 }
 * });
 *
 * // Render layers
 * root.render(
 *   <deckLayer layer={new ScatterplotLayer({ id: 'points', data })} />
 * );
 * ```
 */
export function createRoot(node: RootElement, options: RootOptions = {}): ReconcilerRoot {
  const createExternalOverlay = options.createExternalOverlay;
  const isExternalOverlay = Boolean(createExternalOverlay);

  const existingRoot = roots.get(node);
  if (existingRoot) {
    // A registry key has one immutable rendering capability. Reusing it with a
    // different provider could otherwise retain the wrong external control.
    assert(
      existingRoot.isExternalOverlay === isExternalOverlay &&
        existingRoot.createExternalOverlay === createExternalOverlay
    );
    return existingRoot;
  }

  // Create new root
  log.log(3, 'DeckGL root created')();
  const store = createStore(isExternalOverlay, Boolean(options.forwardViews));
  const containerInfo: Container = {store};

  /**
   * Create a new React reconciler container with the following configuration:
   * - tag: ConcurrentRoot for concurrent mode rendering
   * - hydration callbacks: null (no SSR hydration)
   * - isStrictMode: false
   * - concurrentUpdatesByDefaultOverride: null
   * - identifierPrefix: empty string
   * - onUncaughtError: reportError handler
   * - onCaughtError: reportCaughtError, which skips errors that `DeckGL` rethrows
   * - onRecoverableError: reportError handler
   * - transitionCallbacks: null
   *
   * @see https://github.com/facebook/react/blob/main/packages/react-noop-renderer/src/createReactNoop.js#L1159
   */
  const container = renderer.createContainer(
    containerInfo,
    ConcurrentRoot,
    null,
    false,
    null,
    '',
    reportError,
    reportCaughtError,
    reportError,
    () => null
  );

  let configured = false;

  function configure(props: DeckGLConfiguration) {
    log.log(4, 'DeckGL configure', props)();

    // NOTE: we want to support a "mix-mode" of sorts where a user can pass an explicit `layers` prop alongside
    // traditional usage of creating layers as JSX children.
    store.setState({
      _passedLayers: props.layers ?? [],
      _passedViews: props.views,
      _passedWidgets: props.widgets,
      _passedEffects: props.effects
    });

    if (configured) {
      const deckgl = store.getState().deckgl;
      if (deckgl) {
        // A prop-only update need not commit the JSX tree again, so reapply its last
        // committed layers, views, widgets and effects in the same order that a commit uses.
        const descriptors = combineRootDescriptors(
          store.getState(),
          containerInfo.jsxDescriptors ?? EMPTY_JSX_DESCRIPTORS,
          containerInfo.sentViews
        );
        containerInfo.sentViews = Boolean(descriptors.views);
        deckgl.setProps({...props, ...descriptors});
      }
      return;
    }

    const state = store.getState();
    const deckgl = createExternalOverlay
      ? createExternalOverlay(props)
      : new Deck<View | View[] | null>(props);

    state.setDeckGL(deckgl);
    // The instance starts with the `views` prop, so removing it later must send `null`.
    containerInfo.sentViews = Boolean(props.views);

    configured = true;
  }

  function render(children: ReactNode) {
    renderer.updateContainer(children, container, null, noop);
  }

  const root: ReconcilerRoot = {
    configure,
    container,
    createExternalOverlay,
    isExternalOverlay,
    render,
    store
  };
  roots.set(node, root);

  return root;
}
