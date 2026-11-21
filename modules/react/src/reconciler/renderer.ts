// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
// Copyright (c) Deckgl Fiber Renderer contributors

import type {Layer, View} from '@deck.gl/core';
import {Deck, _deepEqual, assert, log} from '@deck.gl/core';
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
 * import { renderer } from '@deck.gl/react/reconciler';
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

/**
 * Registers the renderer with React DevTools, which then shows the tree inside each `DeckGL`
 * root. Called once when this module loads. react-reconciler@0.33 reads the name and version
 * from the host config; the argument only satisfies older typings.
 *
 * @internal
 */
export function registerWithDevTools(): void {
  renderer.injectIntoDevTools({
    bundleType: process.env.NODE_ENV === 'production' ? 0 : 1,
    rendererPackageName: RENDERER_PACKAGE_NAME,
    version: RENDERER_VERSION
  });
}

registerWithDevTools();

/**
 * Active reconciler roots registry
 *
 * Maps RootElement containers to their ReconcilerRoot instances. Used internally
 * to ensure root idempotency and proper cleanup.
 *
 * @example
 * ```typescript
 * // Advanced usage: check if root exists for container
 * import { roots } from '@deck.gl/react/reconciler';
 *
 * if (roots.has(containerElement)) {
 *   const existingRoot = roots.get(containerElement);
 *   // Work with existing root
 * }
 * ```
 */
export const roots = new Map<RootElement, ReconcilerRoot>();

/** Descriptors for a tree with no JSX layers, views, widgets or effects. */
const EMPTY_JSX_DESCRIPTORS: JsxDescriptors = {effects: [], layers: [], views: [], widgets: []};

/** Props the root merges with JSX children. `combineRootDescriptors` handles their removal. */
const DESCRIPTOR_PROPS = new Set(['effects', 'layers', 'views', 'widgets']);

/**
 * Props the root manages itself. The `DeckGL` component sets `canvas` and `parent`, a new canvas
 * gets a new root, and a provider root makes a new overlay when `interleaved` changes. deck.gl
 * reads `id` only to name a canvas it creates, and the root always passes its own canvas.
 */
const ROOT_MANAGED_PROPS = new Set(['canvas', 'id', 'interleaved', 'parent']);

/**
 * Props that deck.gl reads only when it creates its device, canvas or event manager. Changing
 * them later has no effect, so the root leaves them alone and warns in development builds. See
 * the "Props that only apply at creation" section of the `DeckGL` docs.
 */
const CREATION_ONLY_PROPS: ReadonlySet<string> = new Set([
  '_typedArrayManagerProps',
  'debug',
  'deviceProps',
  'eventRecognizerOptions',
  'gl',
  'touchAction'
]);

/**
 * Creation-only props compared by reference. A WebGL context keeps its state behind prototype
 * getters and has no own enumerable keys, so a deep compare would see any two contexts as equal.
 */
const COMPARED_BY_REFERENCE: ReadonlySet<string> = new Set(['gl']);

const CREATION_ONLY_DOCS =
  'https://deck.gl/docs/api-reference/react/deckgl#props-that-only-apply-at-creation';

function isResetOnRemoval(key: string): boolean {
  return (
    !DESCRIPTOR_PROPS.has(key) && !ROOT_MANAGED_PROPS.has(key) && !CREATION_ONLY_PROPS.has(key)
  );
}

/**
 * Warns, in development builds, about each creation-only prop that changed since the last
 * configure, once per prop per root. Values are compared deeply, so a new object literal with the
 * same contents, such as `deviceProps={{type: 'webgl'}}`, is not a change. `gl` is compared by
 * reference instead.
 */
function warnOnCreationOnlyChanges(
  previous: DeckGLConfiguration,
  next: DeckGLConfiguration,
  warned: Set<string>
): void {
  if (process.env.NODE_ENV === 'production') {
    return;
  }
  const previousRecord = previous as Record<string, unknown>;
  const nextRecord = next as Record<string, unknown>;
  for (const key of CREATION_ONLY_PROPS) {
    const previousValue = previousRecord[key];
    const nextValue = nextRecord[key];
    const unchanged = COMPARED_BY_REFERENCE.has(key)
      ? previousValue === nextValue
      : _deepEqual(previousValue, nextValue, 3);
    if (!warned.has(key) && !unchanged) {
      warned.add(key);
      log.warn(
        `DeckGL: \`${key}\` only applies when deck.gl is created, so this change has no effect. ` +
          `Remount the root with a new React \`key\` to apply it. See ${CREATION_ONLY_DOCS}`
      )();
    }
  }
}

/**
 * Leaves out the props that the root sends as merged descriptors. A `views={undefined}` passed
 * through would otherwise reach `Deck.setProps`, which resets an explicit `undefined` to its
 * default (#10906), and clear views that a widget such as `SplitterWidget` set.
 */
function omitDescriptorProps(props: DeckGLConfiguration): DeckGLConfiguration {
  const rest: Record<string, unknown> = {...props};
  for (const key of DESCRIPTOR_PROPS) {
    delete rest[key];
  }
  return rest as DeckGLConfiguration;
}

/**
 * Returns the props that `previous` had and `next` no longer has, each set to its deck.gl
 * default. `Deck.setProps` merges into the props it already holds, so a prop that a React
 * render stops passing would otherwise keep its old value. A prop passed as `undefined` is not
 * removed: it reaches deck.gl, which falls back to the default itself (#10906).
 */
function getRemovedProps(
  previous: DeckGLConfiguration,
  next: DeckGLConfiguration
): Record<string, unknown> {
  const defaults = Deck.defaultProps as Record<string, unknown>;
  const removed: Record<string, unknown> = {};
  for (const key of Object.keys(previous)) {
    if (isResetOnRemoval(key) && !Object.hasOwn(next, key)) {
      removed[key] = defaults[key];
    }
  }
  return removed;
}

/** Logs an error that React reports from the renderer's tree. */
function reportError(error: unknown): void {
  log.error('DeckGL error', error)();
}

/**
 * Logs an error caught by an error boundary, unless the root's own boundary caught it and
 * rethrows it to the host tree.
 */
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
    // Commit the unmount now, so the tree's layout and passive effect cleanups run while Deck is
    // still live. On a concurrent root, `updateContainer` would only schedule it.
    renderer.updateContainerSync(null, root.container, null, noop);
    renderer.flushSyncWork();

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
 * import { createRoot } from '@deck.gl/react/reconciler';
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
  // The props of the last configure, to find the ones a later configure removes.
  let previousProps: DeckGLConfiguration = {};
  // Creation-only props this root has already warned about.
  const warnedCreationOnlyProps = new Set<string>();

  /**
   * Creates the deck.gl instance on the first call, then forwards new props to it. A prop passed
   * as `undefined` goes to deck.gl as is, and deck.gl falls back to its default (#10906),
   * the same as for a prop that is left out.
   */
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
        warnOnCreationOnlyChanges(previousProps, props, warnedCreationOnlyProps);
        deckgl.setProps({
          ...getRemovedProps(previousProps, props),
          ...omitDescriptorProps(props),
          ...descriptors
        });
      }
      previousProps = props;
      return;
    }

    previousProps = props;

    const state = store.getState();
    const deckgl = createExternalOverlay
      ? createExternalOverlay(props)
      : new Deck<View | View[] | null>(props);

    state.setDeckGL(deckgl);
    // The instance starts with the `views` prop, so removing it later must send `null`.
    containerInfo.sentViews = Boolean(props.views);

    configured = true;
  }

  /** Renders `children` into the root. */
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
