import type {Layer, View} from '@deck.gl/core';
import {assert, log} from '@deck.gl/core';
import {RENDERER_PACKAGE_NAME, RENDERER_VERSION, globalScope} from '../shared/constants';
import {createContext} from 'react';
import type {Fiber, ReactContext} from 'react-reconciler';
import {
  ContinuousEventPriority,
  DefaultEventPriority,
  DiscreteEventPriority
} from 'react-reconciler/constants.js';

import type {
  ChildSet,
  Container,
  FormInstance,
  HostContext,
  Instance,
  Props,
  SuspendedState,
  TransitionStatus,
  Type,
  UpdatePayload
} from './types';
import {
  combineRootDescriptors,
  flattenTree,
  isLayer,
  isView,
  isEffect,
  isWidget,
  organizeList
} from './utils';

type EventPriority = number;

/**
 * Current priority level for the active update batch.
 *
 * React sets this via `setCurrentUpdatePriority` to control update scheduling.
 * Higher priorities interrupt lower-priority work.
 *
 * @see {@link setCurrentUpdatePriority}
 * @see {@link getCurrentUpdatePriority}
 */
let currentUpdatePriority = DefaultEventPriority;

/**
 * Priority level for the currently executing event.
 *
 * In some Meta host configs this is mutated, but in this implementation
 * it remains constant at DefaultEventPriority.
 *
 * @see {@link getCurrentEventPriority}
 */
const currentEventPriority = DefaultEventPriority;

/**
 * The reconciler has two modes: mutation mode and persistent mode. You must specify one of them.
 *
 * If your target platform has immutable trees, you'll want the **persistent mode** instead.
 * In that mode, existing nodes are never mutated, and instead every change clones the parent
 * tree and then replaces the whole parent tree at the root. This is the mode used by the new
 * React Native renderer, codenamed "Fabric".
 *
 * Depending on the mode, the reconciler will call different methods on your host config.
 *
 * **Deck.gl Choice:** Persistence mode because Deck.gl layers are cheap descriptor objects
 * designed to be recreated. This matches Deck.gl's immutable update philosophy perfectly.
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/README.md#persistence Persistence Mode Documentation}
 */
export const supportsMutation = false;
export const supportsPersistence = true;

/**
 * You can optionally implement hydration to "attach" to the existing tree during the initial
 * render instead of creating it from scratch. For example, the DOM renderer uses this to
 * attach to an HTML markup.
 */
export const supportsHydration = false;

/**
 * This is a property (not a function) that should be set to something that can never be a
 * valid timeout ID. For example, you can set it to `-1`.
 */
export const noTimeout = -1;

/**
 * Set this to `true` to indicate that your renderer supports `scheduleMicrotask`.
 * We use microtasks as part of our discrete event implementation in React DOM.
 * If you're not sure if your renderer should support this, you probably should.
 * The option to not implement `scheduleMicrotask` exists so that platforms with more
 * control over user events, like React Native, can choose to use a different mechanism.
 */
export const supportsMicrotasks = true;

/**
 * This is a property (not a function) that should be set to `true` if your renderer
 * is the main one on the page. For example, if you're writing a renderer for the
 * Terminal, it makes sense to set it to `true`, but if your renderer is used *on top of*
 * React DOM or some other existing renderer, set it to `false`.
 */
export const isPrimaryRenderer = false;

/** The renderer name and version that React DevTools reads when the renderer registers. */
export const rendererPackageName = RENDERER_PACKAGE_NAME;
export const rendererVersion = RENDERER_VERSION;

/** No custom inspection config for React DevTools. */
export const extraDevToolsConfig = null;

/**
 * You can proxy this to `setTimeout` or its equivalent in your environment.
 */
export const scheduleTimeout = setTimeout;

/**
 * You can proxy this to `clearTimeout` or its equivalent in your environment.
 */
export const cancelTimeout = clearTimeout;

/**
 * You can proxy this to `queueMicrotask` or its equivalent in your environment.
 */
export const scheduleMicrotask = queueMicrotask;

/** Names a value for an error message: its class name, or `undefined` / `null`. */
function describeValue(value: unknown): string {
  return (value as object | null | undefined)?.constructor?.name ?? String(value);
}

/** Warns, outside production builds, when a layer or view keeps a default id. */
function warnIfDefaultId(descriptor: Layer | View): void {
  if (process.env.NODE_ENV !== 'production' && (!descriptor.id || descriptor.id === 'unknown')) {
    log.warn(`${descriptor.constructor.name} needs a stable id`)();
  }
}

/**
 * Creates the supported native deck.gl elements.
 *
 * The reconciler accepts only pre-instantiated descriptors through `<deckLayer>`,
 * `<deckView>`, `<deckWidget>` and `<deckEffect>`, each of its own kind, so JavaScript
 * callers receive the same runtime contract as TypeScript callers. A wrong or missing
 * descriptor throws in every build.
 */
function createDeckGLObject(type: Type, props: Props): Instance {
  if (type === 'deckView') {
    const view = props.view;
    if (!isView(view)) {
      throw new Error(`<deckView> needs a View, got ${describeValue(view)}`);
    }
    warnIfDefaultId(view);
    return {children: [], node: view};
  }

  if (type === 'deckLayer') {
    const layer = props.layer;
    if (!isLayer(layer)) {
      throw new Error(`<deckLayer> needs a Layer, got ${describeValue(layer)}`);
    }
    warnIfDefaultId(layer);
    return {children: [], node: layer};
  }

  if (type === 'deckWidget') {
    const widget = props.widget;
    if (!isWidget(widget)) {
      throw new Error(`<deckWidget> needs a Widget, got ${describeValue(widget)}`);
    }
    return {children: [], node: widget};
  }

  if (type === 'deckEffect') {
    const effect = props.effect;
    if (!isEffect(effect)) {
      throw new Error(`<deckEffect> needs a deck.gl effect, got ${describeValue(effect)}`);
    }
    return {children: [], node: effect};
  }

  throw new Error(`Unsupported element <${type}>`);
}

/**
 * Creates a new Deck.gl Layer or View instance during the render phase.
 *
 * React calls this when mounting a new element to the tree. The instance is created
 * but not yet attached to the render output - attachment happens in the commit phase
 * via `replaceContainerChildren`.
 *
 * **Render Phase Rules:**
 * - CAN mutate the newly created instance before returning it
 * - CANNOT modify any other nodes in the tree
 * - CANNOT register event handlers on parent tree
 * - CANNOT perform side effects that assume the instance will be used
 * - Instance may be garbage collected if React decides not to commit it
 *
 * **Persistence Mode Behavior:**
 * Returns a wrapper `{ node: Layer | View, children: [] }`. The Deck.gl layer is a cheap
 * descriptor object that will be matched by ID during diffing. Because layers are immutable
 * descriptors, creating them is very cheap and they're designed to be recreated on updates.
 *
 * **Why Not `commitMount`?**
 * We don't need `commitMount` because Deck.gl layers don't have initialization side effects
 * that depend on being in the tree. They're just data descriptors.
 *
 * @param type - Element type (`"deckLayer"` or `"deckView"`)
 * @param props - Initial props for the instance
 * @param rootContainerInfo - Root container with its root store
 * @param hostContext - Context from parent (tracks View nesting, provides store access)
 * @param fiber - React Fiber node for debugging/error messages
 * @returns Instance wrapper with Deck.gl node and empty children array
 *
 * @example
 * ```tsx
 * // React calls this when rendering:
 * <deckLayer layer={new ScatterplotLayer({ id: "points", data: [...] })} />
 *
 * // Results in:
 * const instance = createInstance(
 *   "deckLayer",
 *   { layer: ScatterplotLayer {...} },
 *   rootContainer,
 *   hostContext,
 *   fiber
 * );
 * // Returns: { node: ScatterplotLayer, children: [] }
 * ```
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberCompleteWork.js#L1114 React Source - completeWork calls createInstance}
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-native-renderer/src/ReactFiberConfigFabric.js#L150 React Native Fabric Reference}
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/README.md#createinstance Official Reconciler Docs}
 */
export function createInstance(
  type: Type,
  props: Props,
  rootContainerInfo: Container,
  hostContext: HostContext,
  fiber: Fiber
): Instance {
  return createDeckGLObject(type, props);
}

/**
 * Creates a text node instance during the render phase.
 *
 * React calls this when rendering plain text content (like the text inside a `<div>`
 * in DOM). Custom renderers that support text rendering (DOM, Canvas, Terminal) implement
 * this to create text nodes. Renderers that don't support text should throw an error.
 *
 * **Render Phase Behavior:**
 * - Called during render phase when React encounters text content
 * - Should create and return a text node instance
 * - Must not modify other parts of the tree
 *
 * **Deck.gl Implementation:**
 * Always throws an error because Deck.gl is a WebGL renderer focused on map layers
 * and 3D visualizations - it doesn't support text rendering. Users should only render
 * Deck.gl layers and views, not text nodes.
 *
 * If you need text labels in your visualization, use Deck.gl's TextLayer which renders
 * text as part of the WebGL scene, not as React text nodes.
 *
 * @throws {Error} Always throws because text nodes are not supported in Deck.gl renderer
 *
 * @example
 * ```typescript
 * // ❌ This will throw an error in Deck.gl renderer:
 * // <deckLayer>Some text</deckLayer>
 *
 * // ✅ Instead, use TextLayer for labels:
 * // <deckLayer layer={new TextLayer({ id: 'labels', data: [...] })} />
 * ```
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberCompleteWork.js Text Node Creation}
 * @see {@link https://deck.gl/docs/api-reference/layers/text-layer TextLayer for rendering text in Deck.gl}
 */
export function createTextInstance() {
  throw new Error('Text nodes are not supported');
}

/**
 * Clones an instance with updated props during reconciliation (persistence mode).
 *
 * React calls this in persistence mode when an element's props change. Instead of mutating
 * the existing instance, we create a new one with updated props. This is the core of
 * persistence mode - every change creates a new immutable tree.
 *
 * **Persistence Mode Flow:**
 * 1. Props change detected in render phase
 * 2. `cloneInstance` creates new instance with new props
 * 3. React rebuilds parent chain up to root with new instances
 * 4. `replaceContainerChildren` commits entire new tree in one shot
 *
 * **Why Clone Instead of Mutate:**
 * Deck.gl layers are designed as immutable descriptors. Creating new layer objects is
 * cheap, and Deck.gl's ID-based diffing efficiently detects what actually changed. This
 * matches React's concurrent rendering model perfectly - render phase can be interrupted
 * without leaving half-mutated trees.
 *
 * **keepChildren Parameter:**
 * - `true` = Reuse existing children array (children didn't change)
 * - `false` = Use `newChildSet` (children were rebuilt due to reordering/additions/removals)
 *
 * React determines this based on whether child reconciliation happened. If children are
 * unchanged, `keepChildren=true` avoids unnecessary work.
 *
 * @param instance - Current instance to clone
 * @param type - Element type (same as original)
 * @param oldProps - Previous props (for comparison if needed)
 * @param newProps - New props to apply
 * @param keepChildren - If true, reuse instance.children; if false, use newChildSet
 * @param newChildSet - New children array when keepChildren is false
 * @returns New instance with updated node and appropriate children
 *
 * @example
 * ```tsx
 * // Component updates from:
 * <deckLayer layer={new ScatterplotLayer({ id: "p", getRadius: 5 })} />
 * // To:
 * <deckLayer layer={new ScatterplotLayer({ id: "p", getRadius: 10 })} />
 *
 * // React calls:
 * const cloned = cloneInstance(
 *   oldInstance,
 *   "deckLayer",
 *   { layer: ScatterplotLayer {getRadius: 5} },
 *   { layer: ScatterplotLayer {getRadius: 10} },
 *   true, // children unchanged
 *   undefined
 * );
 * // Returns: { node: new ScatterplotLayer, children: oldInstance.children }
 * ```
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberCompleteWork.js#L682 React Source - Persistence Mode Clone Path}
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-native-renderer/src/ReactFiberConfigFabric.js#L194 React Native Fabric Reference}
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/README.md#persistence Persistence Mode Documentation}
 */
export function cloneInstance(
  instance: Instance | undefined,
  type: string,
  oldProps: Props,
  newProps: Props,
  keepChildren: boolean,
  recyclableInstance: Instance | null | undefined
): Instance | undefined {
  // If instance is undefined, we can't clone it
  if (!instance) {
    return undefined;
  }

  const cloned = createDeckGLObject(type, newProps);

  // Handle children based on keepChildren flag
  // If we're not keeping children and there's a recyclable instance with children, use those
  if (keepChildren) {
    cloned.children = instance.children;
  } else if (recyclableInstance?.children) {
    cloned.children = recyclableInstance.children;
  } else {
    cloned.children = [];
  }

  return cloned;
}

/**
 * Creates a hidden clone of an instance when React Suspense suspends during render.
 *
 * React calls this in the render phase when a component suspends and a Suspense boundary
 * catches it. The hidden instance is kept in the tree but marked as hidden until the
 * suspended data loads. This allows Suspense to maintain the tree structure while showing
 * a fallback UI.
 *
 * **Render Phase Behavior:**
 * - Called during render phase when Suspense boundary activates
 * - Creates a new instance that will remain hidden until data resolves
 * - Must return a valid instance structure
 *
 * **Persistence Mode Implementation:**
 * For Deck.gl, we return the same instance structure since visibility is handled through
 * the layer's built-in `visible` prop. The layer stays in the tree and Deck.gl's prop
 * diffing handles visibility updates automatically when `unhideInstance` is called.
 *
 * @param instance - The instance to hide while Suspense is active
 * @param type - Element type (`"deckLayer"` or `"deckView"`)
 * @param props - Current props for the instance
 * @returns Instance structure with same node and children (Deck.gl handles visibility internally)
 *
 * @example
 * ```tsx
 * <Suspense fallback={<LoadingIndicator />}>
 *   <AsyncLayerComponent /> // cloneHiddenInstance called while loading
 * </Suspense>
 * ```
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/README.md#suspense React Suspense Support}
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberCompleteWork.js Suspense Implementation}
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-native-renderer/src/ReactFiberConfigFabric.js#L280 Reference Implementation}
 */
export function cloneHiddenInstance(instance: Instance, type: Type, props: Props): Instance {
  return {
    children: instance.children,
    node: instance.node
  };
}

/**
 * Creates a hidden clone of a text instance when React Suspense suspends.
 *
 * This method is called during Suspense activation for text nodes. Since Deck.gl
 * is a WebGL renderer that doesn't support text content, this method throws an error.
 * Users should only render Deck.gl layers and views, not text nodes.
 *
 * @param instance - The text instance to clone (not supported)
 * @returns Never returns - always throws
 * @throws {Error} Always throws because text nodes are not supported in Deck.gl renderer
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberCompleteWork.js Suspense Implementation}
 */
export function cloneHiddenTextInstance(): void {
  // Unreachable: createTextInstance throws, so no text instance exists.
  assert(false);
}

/**
 * Restores a previously hidden instance when Suspense resolves and data is ready.
 *
 * React calls this in the commit phase when suspended data finishes loading and the
 * Suspense boundary transitions from fallback to showing the actual content. This
 * method should make the instance visible again.
 *
 * **Commit Phase Behavior:**
 * - Called during commit phase when Suspense boundary resolves
 * - Should restore instance visibility
 * - Can perform side effects (commit phase allows mutations)
 *
 * **Deck.gl Implementation:**
 * No-op for Deck.gl since visibility is handled through the layer's built-in `visible` prop.
 * React will update props as needed through the normal reconciliation process, and Deck.gl's
 * prop diffing will handle the visibility change automatically.
 *
 * @param instance - Instance to unhide (make visible again)
 * @param props - Props to apply when unhiding
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/README.md#suspense React Suspense Support}
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberCommitWork.js Commit Phase Implementation}
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-native-renderer/src/ReactFiberConfigFabric.js#L289 Reference Implementation}
 */
export function unhideInstance(instance: Instance, props: Props): void {
  // No-op: deck.gl handles visibility through its `visible` prop
}

/**
 * Restores a previously hidden text instance when Suspense resolves.
 *
 * This method is called during Suspense resolution for text nodes. Since Deck.gl
 * is a WebGL renderer that doesn't support text content, this method throws an error.
 * Users should only render Deck.gl layers and views, not text nodes.
 *
 * @param textInstance - The text instance to unhide (not supported)
 * @param text - The text content to display
 * @throws {Error} Always throws because text nodes are not supported in Deck.gl renderer
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberCommitWork.js Commit Phase Implementation}
 */
export function unhideTextInstance(): void {
  // Unreachable: createTextInstance throws, so no text instance exists.
  assert(false);
}

/**
 * Creates a new empty child set for building container children (persistence mode).
 *
 * React calls this at the start of the commit phase when preparing to replace container
 * children. The returned array will be populated via `appendChildToContainerChildSet` and
 * then passed to `replaceContainerChildren` to update the Deck.gl instance.
 *
 * **ChildSet Lifecycle:**
 * 1. `createContainerChildSet()` - Create empty array
 * 2. `appendChildToContainerChildSet(childSet, child)` - Add each root child (mutates array)
 * 3. `finalizeContainerChildren(container, childSet)` - Validate before commit
 * 4. `replaceContainerChildren(container, childSet)` - Commit to Deck.gl
 *
 * **Why Mutable Container ChildSet:**
 * While `appendChildToSet` returns immutable arrays for cloning instances, container child
 * sets are different - they're built up during commit phase and used once, so mutation is
 * fine and more efficient. React Native Fabric follows the same pattern.
 *
 * **Rebuild Every Commit:**
 * We rebuild the entire layer list from scratch on every commit. This simplifies the
 * reconciler and works well because Deck.gl's ID-based diffing efficiently determines
 * what actually changed.
 *
 * @returns Empty array to be populated with root children
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberCommitWork.js#L2891 React Source - Persistence Mode Commit}
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-native-renderer/src/ReactFiberConfigFabric.js#L237 React Native Fabric Reference}
 */
export function createContainerChildSet(): ChildSet {
  return [];
}

/**
 * Appends a root-level child to the container's child set during commit phase.
 *
 * React calls this for each root child when building the new container children array.
 * Only direct children of the container (root `<DeckGL>`) are added here - nested
 * children are already attached via the `children` property of their parent instances.
 *
 * **Container vs Parent Children:**
 * - **Container children**: Root elements directly under `<DeckGL>` - go through this method
 * - **Parent children**: Nested elements - handled via `appendChildToSet` during instance cloning
 *
 * The distinction exists because container operations happen in commit phase (can mutate),
 * while parent operations happen in render phase (must be immutable in persistence mode).
 *
 * **Why Mutate the Array:**
 * Container child sets are built during commit phase as a temporary structure that will
 * be consumed once by `replaceContainerChildren`. Mutation is safe and efficient here,
 * unlike render phase where we must maintain immutability.
 *
 * @param childSet - Array created by `createContainerChildSet` (mutated in place)
 * @param child - Root-level instance to append
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberCommitWork.js#L2904 React Source - Building Container Children}
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-native-renderer/src/ReactFiberConfigFabric.js#L245 React Native Fabric Reference}
 */
export function appendChildToContainerChildSet(childSet: ChildSet, child: Instance): void {
  childSet.push(child);
}

/**
 * Called when building a new child set for a cloned instance in persistence mode.
 *
 * Returns a new immutable array with the child appended. This is essential for
 * React's persistence mode where existing nodes are never mutated.
 *
 * @param childSet - Existing array of child instances
 * @param child - Child instance to append
 * @returns New array with child appended
 *
 * @example
 * When a parent instance is cloned due to prop changes, React rebuilds its
 * children array by calling this method for each child.
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-native-renderer/src/ReactFiberConfigFabric.js React Native Fabric Implementation}
 */
export function appendChildToSet(childSet: ChildSet, child: Instance): ChildSet {
  return [...childSet, child];
}

/**
 * Called after building the new container child set but before committing it.
 *
 * No-op: deck.gl's LayerManager already warns when two layers share an id.
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/README.md#persistence-mode React Persistence Mode}
 */
export function finalizeContainerChildren(): void {
  // deck.gl's LayerManager warns about duplicate layer ids, so there is nothing to validate here.
}

/**
 * Commits the new tree to Deck.gl by replacing container children (persistence mode).
 *
 * React calls this in the commit phase after all instances have been created/cloned and
 * assembled into a complete tree. This is where we actually update the Deck.gl instance
 * with the new layers and views.
 *
 * **Commit Phase - The Final Step:**
 * This is the culmination of React's reconciliation:
 * 1. Render phase builds new immutable tree (createInstance, cloneInstance)
 * 2. Commit phase builds container child set (createContainerChildSet, appendChildToContainerChildSet)
 * 3. Validation (finalizeContainerChildren)
 * 4. **THIS METHOD** - Actually update Deck.gl
 *
 * **Tree Flattening & Organization:**
 * React's tree is arbitrarily nested (e.g., wrapper components), but Deck.gl expects:
 * - Flat `layers` array
 * - Flat `views` array (optional)
 *
 * We flatten the nested React tree and separate layers from views.
 *
 * **Hybrid Layers:**
 * Supports "mix mode" where layers come from both:
 * - JSX children: `<deckLayer layer={...} />`
 * - Direct prop: `<DeckGL layers={[...]} />`
 *
 * As in `@deck.gl/react`, JSX layers come first and the `_passedLayers` from the store
 * follow them. See {@link combineRootDescriptors}.
 *
 * **Deck.gl Integration:**
 * Calls `deckgl.setProps({ layers, views })` which triggers Deck.gl's ID-based diffing.
 * Deck.gl efficiently determines what changed and only updates affected layers/views.
 *
 * **Why Not Incremental Updates:**
 * We replace the entire tree each time rather than applying individual mutations. This is:
 * - Simpler: No need to track diffs, adds, removes
 * - Efficient: Deck.gl's diffing is highly optimized for full tree updates
 * - Reliable: Single source of truth, no accumulation of stale state
 *
 * @param container - Root container with store and Deck.gl instance
 * @param newChildren - New tree of root-level instances
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberCommitWork.js#L2933 React Source - Persistence Mode Commit}
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-native-renderer/src/ReactFiberConfigFabric.js#L270 React Native Fabric Reference}
 * @see {@link https://deck.gl/docs/developer-guide/using-layers Layer Lifecycle in Deck.gl}
 */
export function replaceContainerChildren(container: Container, newChildren: ChildSet): void {
  const state = container.store.getState();
  const {deckgl} = state;

  // NOTE: we may have already cleaned up deckgl at the point this is called
  if (deckgl) {
    // NOTE: takes our infinitely nestable tree of layers/views and flattens them
    const list = flattenTree(newChildren);

    // NOTE: splits views and layers into separate arrays
    const types = organizeList(list);

    // NOTE: keep the committed descriptors so a prop-only reconfigure can reapply them,
    // then combine them with the `layers` prop on `<DeckGL />` (JSX layers first)
    container.jsxDescriptors = types;
    const propsUpdate = combineRootDescriptors(state, types, container.sentViews);
    container.sentViews = Boolean(propsUpdate.views);

    log.log(3, 'DeckGL commit', propsUpdate)();

    deckgl.setProps(propsUpdate);
  }
}

/**
 * Attaches a child instance to its parent during initial tree construction.
 *
 * React calls this during the render phase when building the initial tree structure.
 * After `createInstance` creates both parent and child, this method links them together
 * by adding the child to the parent's children array.
 *
 * **Render Phase Constraints:**
 * - CAN mutate `parentInstance` and `child` (they're newly created)
 * - CANNOT modify any other nodes in the tree
 * - CANNOT perform side effects that assume the tree will be committed
 * - Tree is still being built and not yet on screen
 *
 * **Parent-Child Relationship Building:**
 * In React's tree construction order:
 * 1. `createInstance(child)` - Create child
 * 2. `createInstance(parent)` - Create parent
 * 3. `appendInitialChild(parent, child)` - Link them
 * 4. `finalizeInitialChildren(parent)` - Finalize parent
 *
 * React builds trees bottom-up, creating children before parents.
 *
 * **Why Direct Mutation is Safe:**
 * Both parent and child are newly created in this render pass and not yet visible to
 * other parts of the system, so mutation is safe despite being in render phase.
 *
 * **Deck.gl Tree Structure:**
 * We maintain a parallel tree structure that mirrors React's tree but uses Deck.gl
 * layers. The children array will be flattened later in `replaceContainerChildren`.
 *
 * @param parentInstance - Parent instance to append to (newly created)
 * @param child - Child instance to append (newly created)
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberCompleteWork.js#L846 React Source - appendAllChildren}
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/README.md#appendinitialchild Official Reconciler Docs}
 */
export function appendInitialChild(parentInstance: Instance, child: Instance): void {
  parentInstance.children.push(child);
}

/**
 * Performs final setup on an instance after all its children have been attached.
 *
 * React calls this during the render phase after `createInstance` and all
 * `appendInitialChild` calls for this instance have completed. This is the last
 * opportunity to inspect or modify the instance before it's committed to the screen.
 *
 * **Render Phase - Final Initialization:**
 * At this point:
 * - Instance is created
 * - All initial children are attached
 * - Instance is NOT yet in the committed tree
 * - Still safe to mutate the instance
 *
 * **Return Value Controls `commitMount`:**
 * - `true` = Schedule `commitMount(instance)` to run in commit phase
 * - `false` = No commit-time work needed (most common)
 *
 * Use `true` when you need to perform side effects that depend on the instance being
 * committed (e.g., DOM focus, measuring, event registration). Deck.gl layers are pure
 * descriptors with no commit-time side effects, so we return `false`.
 *
 * **When to Return True (commitMount):**
 * Examples from other renderers:
 * - DOM: Return true for `<input autoFocus>` to focus in commit phase
 * - Canvas: Return true to measure text dimensions (requires canvas context)
 * - Custom: Any setup that requires the element to be "live" on screen
 *
 * **Deck.gl Implementation:**
 * Returns `false` because Deck.gl layers don't need commit-time initialization.
 * They're declarative descriptors that become active when passed to `deckgl.setProps()`
 * in `replaceContainerChildren`, which happens automatically without needing `commitMount`.
 *
 * @param instance - Instance to finalize (with all children attached)
 * @param type - Element type
 * @param props - Initial props
 * @param rootContainer - Root container
 * @param hostContext - Host context (tracks View nesting)
 * @returns `false` - No commitMount needed for Deck.gl layers
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberCompleteWork.js#L918 React Source - completeWork finalization}
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/README.md#finalizeinitialchildren Official Reconciler Docs}
 * @see {@link commitMount} Called in commit phase if this returns true (we don't implement it)
 */
export function finalizeInitialChildren(
  instance: Instance,
  type: Type,
  props: Props,
  rootContainer: Container,
  hostContext: HostContext
): boolean {
  return false;
}

/**
 * Calculates what updates are needed when props change (mutation mode only).
 *
 * React calls this during the render phase when an element's props change. It compares
 * old and new props to determine what needs updating. The return value (update payload)
 * is passed to `commitUpdate` which applies the changes during commit phase.
 *
 * **Render Phase Behavior:**
 * - Called during render phase when props change
 * - Should only *calculate* updates, not apply them
 * - Must not mutate the tree or perform side effects
 * - Return null if no update needed, or payload object describing changes
 *
 * **Mutation Mode vs Persistence Mode:**
 * - **Mutation mode**: Uses `prepareUpdate` + `commitUpdate` to mutate existing instances
 * - **Persistence mode**: Uses `cloneInstance` to create new immutable instances
 *
 * This reconciler uses **persistence mode** (`supportsPersistence = true`, `supportsMutation = false`),
 * so React never calls this method. We provide a stub for type compatibility.
 *
 * **Why Persistence Mode:**
 * Deck.gl layers are cheap descriptor objects designed to be recreated on every update.
 * The immutable approach matches Deck.gl's diffing strategy perfectly - create new layer
 * descriptors and let Deck.gl's ID-based diffing handle the updates efficiently.
 *
 * @param instance - Current instance to potentially update
 * @param type - Element type
 * @param oldProps - Previous props
 * @param newProps - New props
 * @param rootContainer - Root container
 * @param hostContext - Host context
 * @returns `null` (never called in persistence mode)
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberCompleteWork.js Mutation Mode Update Path}
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/README.md#persistence Persistence Mode Documentation}
 */
export function prepareUpdate(
  instance: Instance,
  type: Type,
  oldProps: Props,
  newProps: Props,
  rootContainer: Container,
  hostContext: HostContext
): UpdatePayload | null {
  return null;
}

/**
 * Called before React begins the commit phase to save host-specific state.
 *
 * React calls this right before starting to mutate the host tree. This is the last
 * opportunity to capture state that might be lost during mutations. The returned value
 * is passed to `resetAfterCommit`, allowing you to restore state after the commit completes.
 *
 * **Commit Phase Hook:**
 * - Called at the start of the commit phase, before any mutations
 * - Can perform side effects (reading DOM state, capturing focus, etc.)
 * - Return value is preserved and passed to `resetAfterCommit`
 *
 * **Common Use Cases:**
 * - DOM renderer: Save text selection, active element, scroll position
 * - Canvas renderers: Save canvas context state
 * - Custom renderers: Capture any state that mutations might affect
 *
 * **Deck.gl Implementation:**
 * Returns `null` because Deck.gl handles its own state internally. Layer updates are
 * immutable descriptor objects, so there's no state to preserve across commits.
 *
 * @param container - Root container being committed
 * @returns State to restore in `resetAfterCommit`, or `null` if no state needs preserving
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberCommitWork.js Commit Phase}
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js DOM Implementation Example}
 */
export function prepareForCommit(container: Container): Record<string, unknown> | null {
  return null;
}

/**
 * Called after React completes the commit phase to restore host-specific state.
 *
 * React calls this immediately after all commit phase mutations are complete. This is
 * the mirror of `prepareForCommit` - use it to restore any state that was captured
 * before the commit began.
 *
 * **Commit Phase Hook:**
 * - Called at the end of the commit phase, after all mutations complete
 * - Can perform side effects (restoring focus, scrolling, triggering events)
 * - Receives the same container that was passed to `prepareForCommit`
 *
 * **Common Use Cases:**
 * - DOM renderer: Restore text selection, refocus elements, scroll to saved position
 * - Custom renderers: Restore any state captured in `prepareForCommit`
 * - Trigger post-commit side effects or notifications
 *
 * **Deck.gl Implementation:**
 * No-op because Deck.gl doesn't need to restore state. The `replaceContainerChildren`
 * call has already updated the Deck.gl instance with the new layer tree, and Deck.gl
 * handles all state management internally.
 *
 * @param container - Root container that was committed
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberCommitWork.js Commit Phase}
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js DOM Implementation Example}
 */
export function resetAfterCommit(container: Container): void {}

/**
 * Called when a React Portal is mounted to prepare the target container.
 *
 * React calls this when a Portal component mounts, before inserting children into
 * the portal target. This allows the renderer to perform any setup needed for the
 * portal container (e.g., event handling, context setup).
 *
 * **Portal Lifecycle:**
 * - Called once when a Portal first mounts
 * - Happens before any children are inserted into the portal target
 * - Can initialize portal-specific state or event handlers
 *
 * **What are Portals:**
 * Portals let you render children into a different part of the tree:
 * ```tsx
 * ReactDOM.createPortal(<LayerGroup />, differentDeckGLContainer)
 * ```
 *
 * **Deck.gl Implementation:**
 * No-op because Deck.gl containers don't require special portal setup. Each container
 * is independent and handles its own layer tree, so portals work naturally without
 * additional initialization.
 *
 * @see {@link https://react.dev/reference/react-dom/createPortal React Portals Documentation}
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberCommitWork.js Portal Mounting}
 */
export function preparePortalMount(): void {}

/**
 * Determines if an element's children should be set as text content instead of child nodes.
 *
 * React calls this during render to check if it can optimize text handling by setting
 * content directly on the parent instead of creating separate text node children. This is
 * a performance optimization for renderers that support direct text content.
 *
 * **Render Phase Behavior:**
 * - Called during render phase before creating children
 * - Must not mutate the tree
 * - Return value affects how React processes children
 *
 * **Return Value Meaning:**
 * - `true` = React skips creating text nodes, expects you to handle text in `createInstance`
 *   - You must implement `resetTextContent` when returning true
 *   - Example: DOM `<textarea>` sets `node.textContent` directly
 * - `false` = React creates text nodes normally via `createTextInstance`
 *
 * **When to Return True:**
 * - Element type is a text-only container (like `<textarea>`)
 * - Children are a single string and element supports `textContent`-style optimization
 * - Your renderer can efficiently set text directly on parent
 *
 * **Deck.gl Implementation:**
 * Always returns `false` because Deck.gl layers don't support text content. All children
 * must be layers or views, never text. If `createTextInstance` is called (because we returned
 * false), it will throw an appropriate error.
 *
 * @param type - Element type being created
 * @param props - Props for the element (may contain `children`)
 * @returns `false` - Deck.gl never optimizes text content (doesn't support text at all)
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberCompleteWork.js Text Content Optimization}
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js DOM Text Optimization Example}
 */
export function shouldSetTextContent(type: Type, props: Props): boolean {
  return false;
}

/**
 * Returns the initial host context at the root of the tree.
 *
 * React calls this once when creating the root, before rendering any elements. The returned
 * context object is passed to `createInstance` for the root element and propagates down
 * through `getChildHostContext` to all descendants.
 *
 * **Host Context Purpose:**
 * Context carries information about "where you are" in the tree that affects how instances
 * are created. Examples from other renderers:
 * - DOM: Tracks HTML vs SVG namespace (`<div>` creates HTMLElement, `<circle>` creates SVGElement)
 * - Terminal: Tracks color mode or formatting state
 * - Custom: Any information needed to create instances correctly based on tree location
 *
 * **Render Phase Behavior:**
 * - Called during render phase before creating any instances
 * - Must not mutate the tree
 * - Can only read from rootContainer
 *
 * **Deck.gl Context Usage:**
 * We use context to:
 * 1. Provide root store access to all instances
 * 2. Track View nesting (via `insideView` flag added in `getChildHostContext`)
 *
 * The root context contains just the store. As React renders the tree, `getChildHostContext`
 * adds the `insideView` flag when entering View elements.
 *
 * @param rootContainer - Container passed to `createContainer` (contains store)
 * @returns Initial host context `{ store }` that propagates down the tree
 *
 * @example
 * ```tsx
 * // When creating the reconciler root:
 * const container = { store: rootStore };
 * const fiber = reconciler.createContainer(container, ...);
 *
 * // React calls getRootHostContext:
 * const rootContext = getRootHostContext(container);
 * // Returns: { store: rootStore }
 *
 * // This context is passed to createInstance for root elements
 * // and flows down via getChildHostContext
 * ```
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberBeginWork.js#L3726 React Source - Root Context Initialization}
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/README.md#getroothostcontext Official Reconciler Docs}
 * @see {@link getChildHostContext} How context propagates to children
 */
export function getRootHostContext(rootContainer: Container): HostContext {
  return rootContainer;
}

/**
 * Host context lets you track some information about where you are in the tree so that it's available
 * inside `createInstance` as the `hostContext` parameter. For example, the DOM renderer uses it to
 * track whether it's inside an HTML or an SVG tree, because `createInstance` implementation needs to
 * be different for them.
 *
 * If the node of this `type` does not influence the context you want to pass down, you can return
 * `parentHostContext`. Alternatively, you can return any custom object representing the information
 * you want to pass down.
 *
 * If you don't want to do anything here, return `parentHostContext`.
 *
 * This method happens **in the render phase**. Do not mutate the tree from it.
 */
/**
 * Returns child host context based on parent context and element type.
 *
 * Host context is used to track rendering environment that affects child behavior.
 * Similar to how DOM tracks whether you're inside SVG vs HTML context, we track
 * whether we're inside a View element.
 *
 * The native `<deckView>` element marks its descendants as being inside a view.
 *
 * @param parentHostContext - Context from parent element
 * @param type - Type of element being created
 * @returns Context for children of this element
 *
 * @example
 * ```tsx
 * <deckView view={new MapView({id: 'main'})}> // insideView: true
 *   <deckLayer layer={new ScatterplotLayer({id: 'points'})} />
 * </deckView>
 * ```
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/README.md#getchildhostcontext React Reconciler Docs}
 */
export function getChildHostContext(parentHostContext: HostContext, type: Type): HostContext {
  const isViewInstance = type === 'deckView';

  // Avoids redundant allocations in nested view hierarchies
  if (isViewInstance && !parentHostContext.insideView) {
    return {...parentHostContext, insideView: true};
  }

  // Return parent context unchanged (no allocation)
  return parentHostContext;
}

/**
 * Determines what object gets exposed as a ref.
 *
 * Returns the actual Deck.gl Layer or View instance instead of the internal wrapper,
 * giving users access to all Deck.gl methods and properties.
 *
 * @param instance - Internal instance wrapper `{ node, children }`
 * @returns The actual Deck.gl Layer or View instance
 *
 * @example
 * ```tsx
 * // User code - accessing layer instance via ref
 * const layerRef = useRef<ScatterplotLayer>(null);
 *
 * // After render, layerRef.current contains the actual ScatterplotLayer
 * <deckLayer ref={layerRef} layer={new ScatterplotLayer({ id: "points" })} />
 *
 * // Access Deck.gl layer properties and methods
 * useEffect(() => {
 *   if (layerRef.current) {
 *     console.log(layerRef.current.id); // "points"
 *     console.log(layerRef.current.props); // Layer props
 *   }
 * }, []);
 * ```
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/README.md#getpublicinstance React Reconciler Docs}
 */
export function getPublicInstance(instance: Instance): Instance['node'] {
  return instance.node;
}

/**
 * Called when an instance is deleted from the tree.
 *
 * Clears the children array to help garbage collection. While React handles
 * the primary cleanup, explicitly clearing references can help the GC reclaim
 * memory sooner, especially for large layer trees.
 *
 * @param instance - Instance being deleted
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/README.md#detachdeletedinstance React Reconciler Docs}
 */
export function detachDeletedInstance(instance: Instance): void {
  // Clear children array to help garbage collection
  instance.children.length = 0;
}

/**
 * Returns the priority of the currently executing event for concurrent rendering.
 *
 * React calls this to determine how to prioritize updates triggered by the current event.
 * The priority affects scheduling - high-priority updates interrupt low-priority work,
 * while low-priority updates can be deferred or batched.
 *
 * **Priority Levels:**
 *
 * | Priority | Event Types | Behavior |
 * |----------|------------|----------|
 * | **DiscreteEventPriority** | click, keydown, pointerdown, focusin | Each event is intentional - interrupt background work, don't batch |
 * | **ContinuousEventPriority** | pointermove, wheel, scroll, drag | Rapid sequence - interrupt background work, can batch |
 * | **DefaultEventPriority** | No active event, or unknown event | Background work - can be deferred |
 *
 * **Implementation Note:**
 * Uses `window.event` to check the current event type because React doesn't pass
 * the event object to this function. While `window.event` is deprecated, it's the
 * only way to access the current event from this context.
 *
 * @returns Event priority constant (DiscreteEventPriority, ContinuousEventPriority, or DefaultEventPriority)
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactEventPriorities.js Priority Constants}
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-dom-bindings/src/events/ReactDOMEventListener.js DOM Event Handling}
 */
// oxlint-disable-next-line complexity
export function getCurrentEventPriority(): number {
  if (!globalScope) {
    return DefaultEventPriority;
  }

  // NOTE: window.event is technically deprecated but React does not pass the event
  // to this host function for some reason so we have to use it.
  switch (globalScope.event?.type) {
    case 'click':
    case 'contextmenu':
    case 'dblclick':
    case 'pointercancel':
    case 'pointerdown':
    case 'pointerup':
    case 'keydown':
    case 'keyup':
    case 'focusin':
    case 'focusout': {
      return DiscreteEventPriority;
    }
    case 'pointermove':
    case 'pointerout':
    case 'pointerover':
    case 'pointerenter':
    case 'pointerleave':
    case 'wheel':
    case 'touchmove':
    case 'drag':
    case 'scroll': {
      return ContinuousEventPriority;
    }
    default: {
      return DefaultEventPriority;
    }
  }
}

/**
 * Tracks the current scheduler event for React's event system.
 *
 * React calls this before processing events to capture the current browser event.
 * This enables `resolveEventTimeStamp()` and `resolveEventType()` to access event
 * metadata during the update cycle.
 *
 * For non-DOM renderers like deck.gl, this is a no-op since event handling
 * happens through deck.gl's own event system rather than React's DOM event system.
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js#L1229 DOM Implementation}
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-noop-renderer/src/createReactNoop.js Noop Renderer Implementation}
 * @see {@link resolveEventTimeStamp} Event timestamp resolution
 * @see {@link resolveEventType} Event type resolution
 */
export function trackSchedulerEvent(): void {
  // No-op: deck.gl renderer doesn't track browser events
}

/**
 * Resolves the type of the current event being processed (e.g., 'click', 'keydown').
 *
 * React uses this for event-specific optimizations and debugging. For DOM renderers,
 * this returns `window.event.type`. For non-DOM renderers, returning null signals
 * "no event type available".
 *
 * The deck.gl renderer doesn't need event type information since it doesn't handle
 * browser events directly - deck.gl layers have their own event handling system.
 *
 * @returns Event type string (e.g., 'click', 'keydown') or null if unavailable
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js#L1238 DOM Implementation}
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-noop-renderer/src/createReactNoop.js Noop Renderer Implementation}
 * @see {@link trackSchedulerEvent} Related event tracking
 */
export function resolveEventType(): string | null {
  return null;
}

/**
 * Resolves the timestamp of the current event being processed.
 *
 * React uses this to track event timing for scheduling and analytics purposes.
 * For DOM renderers, this returns `window.event.timeStamp`. For non-DOM renderers
 * like deck.gl, returning -1.1 signals "no event timestamp available".
 *
 * The special value -1.1 (instead of -1) is used to distinguish "no timestamp"
 * from potential timeout IDs or other sentinel values.
 *
 * @returns Event timestamp in milliseconds, or -1.1 if no event is active
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js#L1234 DOM Implementation}
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-noop-renderer/src/createReactNoop.js Noop Renderer Implementation}
 * @see {@link trackSchedulerEvent} Related event tracking
 */
export function resolveEventTimeStamp(): number {
  return -1.1;
}

/**
 * Sets the priority for the current update batch.
 *
 * React calls this to control update batching and scheduling. When React batches
 * multiple updates together, it sets a priority level that affects how those
 * updates are scheduled relative to other work.
 *
 * **Usage:**
 * - React sets this before processing a batch of updates
 * - The priority determines scheduling behavior for that batch
 * - Higher priorities interrupt lower-priority work
 *
 * @param newPriority - Priority level to set (DiscreteEventPriority, ContinuousEventPriority, or DefaultEventPriority)
 *
 * @see {@link https://github.com/facebook/react/pull/28751 PR introducing update priority management}
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberWorkLoop.js Update Batching}
 */
export function setCurrentUpdatePriority(newPriority: EventPriority): void {
  currentUpdatePriority = newPriority;
}

/**
 * Returns the priority of the current update batch.
 *
 * React calls this to check what priority level has been set for the current
 * batch of updates. This is used in scheduling decisions to determine if work
 * should be interrupted or deferred.
 *
 * @returns Current update priority level
 *
 * @see {@link https://github.com/facebook/react/pull/28751 PR introducing update priority management}
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberWorkLoop.js Update Batching}
 */
export function getCurrentUpdatePriority(): EventPriority {
  return currentUpdatePriority;
}

/**
 * Resolves the effective priority for the current work.
 *
 * React calls this to determine what priority should be used when no explicit
 * priority has been set. It implements a fallback strategy: use the update
 * priority if one was set, otherwise fall back to the current event priority.
 *
 * **Priority Resolution:**
 * 1. If `currentUpdatePriority` is set (not DefaultEventPriority), return it
 * 2. Otherwise, return `currentEventPriority` (the priority of the active event)
 *
 * This ensures work is always scheduled with an appropriate priority even when
 * React hasn't explicitly set one via `setCurrentUpdatePriority`.
 *
 * @returns Resolved priority level (never undefined)
 *
 * @see {@link https://github.com/facebook/react/pull/28751 PR introducing update priority management}
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberWorkLoop.js Priority Resolution}
 */
export function resolveUpdatePriority(): EventPriority {
  if (currentUpdatePriority !== DefaultEventPriority) {
    return currentUpdatePriority;
  }

  return currentEventPriority;
}

/**
 * Determines if committing this instance might suspend due to async loading.
 *
 * React calls this during render to check if creating or updating an instance requires
 * waiting for asynchronous resources (like images, fonts, or external data) to load
 * before the commit phase. If this returns true, React may delay the commit until
 * resources are ready or trigger a Suspense boundary.
 *
 * **Usage:**
 * - Return `true` if the instance depends on async resources that aren't ready
 * - Return `false` if the instance can be committed immediately
 *
 * **Deck.gl Implementation:**
 * Returns `false` because Deck.gl layers handle their own async loading internally
 * (e.g., tile layers loading tiles, data layers loading resources). The layer creation
 * itself is synchronous - layers are descriptor objects that don't block.
 *
 * @param type - Element type (`"deckLayer"` or `"deckView"`)
 * @param props - Props for the instance
 * @returns `false` - Deck.gl layers never block commits
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberBeginWork.js Async Loading Check}
 */
export function maySuspendCommit(type: Type, props: Props): boolean {
  return false;
}

/**
 * Called at the start of a commit that may suspend.
 *
 * React calls this when beginning a commit phase that might involve suspended
 * components. The returned state object is passed to subsequent Suspense lifecycle
 * functions (`suspendInstance`, `waitForCommitToBeReady`) to track pending resources.
 *
 * **Suspense Lifecycle:**
 * This is the first function in the Suspense commit flow:
 * 1. `startSuspendingCommit()` - Initialize state
 * 2. `suspendInstance()` - Register suspended instances
 * 3. `waitForCommitToBeReady()` - Check if commit can proceed
 * 4. `getSuspendedCommitReason()` - Provide diagnostic info (if needed)
 *
 * **Deck.gl Implementation:**
 * Returns minimal state with `pendingCount: 0` since deck.gl layers are synchronous
 * descriptor objects that never suspend. Even when `layer.data` is async, deck.gl
 * manages loading internally - layer creation is always synchronous.
 *
 * @returns SuspendedState object with pendingCount set to 0
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-noop-renderer/src/createReactNoop.js#L363 React Noop Renderer implementation}
 * @see {@link suspendInstance}
 * @see {@link waitForCommitToBeReady}
 */
export function startSuspendingCommit(): SuspendedState {
  return {pendingCount: 0};
}

/**
 * Registers an instance that may suspend during commit.
 *
 * React calls this for each instance that might suspend (based on `maySuspendCommit`
 * returning true or other Suspense predicates). The host renderer can track these
 * instances in the suspended state to coordinate resource loading.
 *
 * **Suspense Lifecycle:**
 * Called during the commit phase after `startSuspendingCommit()`, once per instance
 * that may suspend. The state is mutated to track pending resources.
 *
 * **Deck.gl Implementation:**
 * No-op because deck.gl layers never suspend. Layer instances are synchronous
 * descriptors - even layers with async data (e.g., `GeoJsonLayer` with URL) are
 * created immediately, with deck.gl handling loading internally.
 *
 * @param state - Suspended state object from startSuspendingCommit
 * @param instance - The instance being suspended
 * @param type - Element type (`"deckLayer"` or `"deckView"`)
 * @param props - Props for the instance
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-noop-renderer/src/createReactNoop.js#L367 React Noop Renderer implementation}
 * @see {@link startSuspendingCommit}
 */
export function suspendInstance(type: Type, props: Props): void {
  // No-op: deck.gl layers never suspend
}

/**
 * Checks if the commit is ready to proceed or needs to wait for resources.
 *
 * React calls this after visiting all instances to determine if the commit can
 * complete immediately or needs to defer. Return null to proceed immediately, or
 * return a function that accepts a commit callback to defer until resources load.
 *
 * **Suspense Lifecycle:**
 * Called after all `suspendInstance()` calls complete. The returned function (if any)
 * is called with a commit callback that should be invoked when resources are ready.
 *
 * **Return Value:**
 * - `null`: Proceed with commit immediately (resources are ready)
 * - `(commit) => cancel`: Defer commit, call `commit()` when ready, return cancel function
 *
 * **Deck.gl Implementation:**
 * Returns `null` to proceed immediately since deck.gl layers are synchronous.
 * No async resources need to load before committing layer descriptors.
 *
 * @param state - Suspended state object from startSuspendingCommit
 * @param timeoutMs - Timeout in milliseconds for waiting (unused)
 * @returns `null` - Always proceed immediately
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-noop-renderer/src/createReactNoop.js#L371 React Noop Renderer implementation}
 * @see {@link startSuspendingCommit}
 */
export function waitForCommitToBeReady(
  state: SuspendedState,
  timeoutMs: number
): ((commit: () => void) => () => void) | null {
  return null;
}

/**
 * Checks if an instance might suspend during an update.
 *
 * React calls this during the commit phase when updating an existing instance to
 * determine if the update might trigger Suspense (e.g., new props reference async
 * resources that aren't ready). Return `true` to enter the Suspense commit flow.
 *
 * **When to return true:**
 * - New props reference images/fonts/data that need to load
 * - Props changed in a way that requires async resource fetching
 *
 * **Deck.gl Implementation:**
 * Returns `false` because deck.gl layers handle async loading internally. Even when
 * props reference URLs or Promises, the layer descriptor is created synchronously
 * and deck.gl manages loading behind the scenes.
 *
 * @param type - Element type (`"deckLayer"` or `"deckView"`)
 * @param oldProps - Previous props
 * @param newProps - New props
 * @returns `false` - Updates never suspend
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberBeginWork.js Update Suspension Check}
 * @see {@link maySuspendCommit}
 */
export function maySuspendCommitOnUpdate(type: Type, oldProps: Props, newProps: Props): boolean {
  return false;
}

/**
 * Checks if an instance might suspend during synchronous rendering.
 *
 * React calls this to determine if an instance might suspend when rendered in a
 * synchronous (non-concurrent) context. Synchronous renders can't be interrupted,
 * so React needs to know upfront if Suspense boundaries should be prepared.
 *
 * **When to return true:**
 * - Instance depends on resources that might not be loaded
 * - Rendering requires synchronous data fetching
 *
 * **Deck.gl Implementation:**
 * Returns `false` because deck.gl layer creation is always synchronous. Layers are
 * lightweight descriptor objects that don't block rendering even with async data.
 *
 * @param type - Element type (`"deckLayer"` or `"deckView"`)
 * @param props - Props for the instance
 * @returns `false` - Never suspends in sync renders
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberBeginWork.js Sync Render Check}
 * @see {@link maySuspendCommit}
 */
export function maySuspendCommitInSyncRender(type: Type, props: Props): boolean {
  return false;
}

/**
 * Checks if an instance's resources are preloaded and ready to commit.
 *
 * React calls this before committing an instance to verify all required resources
 * (images, fonts, data) are already loaded. Return `true` if resources are ready,
 * `false` to trigger Suspense.
 *
 * **When to return false:**
 * - Instance depends on images/fonts that need to load
 * - Data fetching is still in progress
 *
 * **Deck.gl Implementation:**
 * Returns `true` because deck.gl layers are always "ready" - they're synchronous
 * descriptors that can be committed immediately. Async loading (if any) happens
 * after the layer is created, managed by deck.gl internally.
 *
 * @param type - Element type (`"deckLayer"` or `"deckView"`)
 * @param props - Props for the instance
 * @returns `true` - Layers are always ready
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberBeginWork.js Preload Check}
 * @see {@link maySuspendCommit}
 */
export function preloadInstance(type: Type, props: Props): boolean {
  return true;
}

/**
 * Provides a diagnostic string explaining why a commit is suspended.
 *
 * React DevTools calls this to display suspension reasons to developers, helping
 * debug why a commit is blocked. Return a human-readable string describing what
 * resources are pending, or null if not suspended.
 *
 * **Example return values:**
 * - `"Waiting for 3 images to load"`
 * - `"Fetching data from /api/users"`
 * - `null` (not suspended)
 *
 * **Deck.gl Implementation:**
 * Returns `null` because deck.gl layers never suspend. Commits always proceed
 * immediately since layer descriptors are synchronous.
 *
 * @param state - Suspended state object from startSuspendingCommit
 * @param rootContainer - The root container being committed
 * @returns `null` - No suspension occurs
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberHostConfig.js Suspension Diagnostics}
 * @see {@link startSuspendingCommit}
 */
export function getSuspendedCommitReason(
  state: SuspendedState,
  rootContainer: Container
): string | null {
  return null;
}

/**
 * Schedules a callback to run after the browser paints the current frame.
 *
 * React calls this to defer non-critical work until after the user sees the visual
 * update. Useful for analytics, telemetry, or cleanup work that shouldn't block paint.
 *
 * **Timing guarantees:**
 * - Callback fires after `requestAnimationFrame` (which fires before paint)
 * - Uses `setTimeout(0)` to defer until after paint completes
 * - Callback receives a timestamp from `performance.now()`
 *
 * **Use cases:**
 * - Sending telemetry/analytics after render
 * - Non-critical DOM measurements
 * - Cleanup work that can be deferred
 *
 * **Implementation:**
 * Uses the `requestAnimationFrame` + `setTimeout` pattern to ensure callback runs
 * after the browser has painted. RAF fires before paint, setTimeout fires after.
 *
 * @param callback - Function to call after paint, receives performance.now() timestamp
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js Post-Paint Callback}
 */
export function requestPostPaintCallback(
  // oxlint-disable-next-line promise/prefer-await-to-callbacks
  callback: (time: number) => void
): void {
  requestAnimationFrame(() => {
    // oxlint-disable-next-line promise/prefer-await-to-callbacks
    setTimeout(() => callback(performance.now()), 0);
  });
}

/**
 * Retrieves the React instance associated with a host node (Scope API).
 *
 * This is part of React's experimental Scope API for querying the instance tree.
 * React may call this to map from a host node back to its React instance, typically
 * for advanced features like focus management or accessibility queries.
 *
 * **Scope API:**
 * The Scope API is an experimental feature for querying and managing subtrees.
 * It's primarily used internally by React for focus management and accessibility.
 *
 * **Deck.gl Implementation:**
 * Returns `null` because this feature is not currently implemented. Deck.gl layers
 * don't have a direct mapping from host nodes that would require this lookup.
 *
 * @param node - Fiber node to look up
 * @returns `null` (not implemented)
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberHostConfig.js Scope API}
 */
export function getInstanceFromNode(node: Fiber): Fiber | null | undefined {
  return null;
}

/**
 * Called before an instance loses focus (Focus Management API).
 *
 * React calls this before the currently active instance is about to blur (lose focus).
 * This allows the renderer to capture state before focus changes, similar to how
 * `prepareForCommit` captures state before commits.
 *
 * **Focus Management:**
 * Part of React's focus management system, primarily used by renderers that need to
 * track and manage focus state across updates.
 *
 * **Deck.gl Implementation:**
 * No-op because Deck.gl doesn't manage focus. Focus is handled at the DOM level
 * (the canvas element), not at the individual layer level.
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js DOM Focus Management}
 */
export function beforeActiveInstanceBlur(): void {}

/**
 * Called after an instance loses focus (Focus Management API).
 *
 * React calls this after the previously active instance has blurred (lost focus).
 * This is the mirror of `beforeActiveInstanceBlur` - use it to clean up or trigger
 * side effects after focus changes.
 *
 * **Focus Management:**
 * Part of React's focus management system, paired with `beforeActiveInstanceBlur`
 * to bracket focus change events.
 *
 * **Deck.gl Implementation:**
 * No-op because Deck.gl doesn't manage focus at the layer level.
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js DOM Focus Management}
 */
export function afterActiveInstanceBlur(): void {}

/**
 * Retrieves an instance from a scope object (Scope API).
 *
 * This is part of React's experimental Scope API. React calls this to query instances
 * within a scope, typically for accessibility queries or focus management within
 * bounded regions of the tree.
 *
 * **Scope API:**
 * Scopes define boundaries in the tree that can be queried independently. This is
 * an advanced/experimental feature not commonly used by custom renderers.
 *
 * **Deck.gl Implementation:**
 * Returns `null` because scope queries are not implemented. Deck.gl's layer tree
 * doesn't use the scope abstraction.
 *
 * @param scopeInstance - Scope instance to query
 * @returns `null` (not implemented)
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberHostConfig.js Scope API}
 */
export function getInstanceFromScope(scopeInstance: Instance): Instance | null {
  return null;
}

/**
 * Prepares a scope for updates (Scope API).
 *
 * React calls this before updating instances within a scope. This allows the renderer
 * to perform any setup needed before scope-related changes are applied.
 *
 * **Scope API:**
 * Part of the experimental Scope API lifecycle, called during scope update preparation.
 *
 * **Deck.gl Implementation:**
 * No-op because scope updates are not implemented. Deck.gl updates work at the full
 * tree level through `replaceContainerChildren`, not through scoped updates.
 *
 * @param scopeInstance - Scope being updated
 * @param instance - Instance being updated within the scope
 *
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberHostConfig.js Scope API}
 */
export function prepareScopeUpdate(scopeInstance: Instance, instance: Instance): void {}

/**
 * Determines if React should attempt eager transitions for this renderer.
 *
 * React calls this to check if the renderer supports "eager transitions" - an optimization
 * where React attempts to complete transitions synchronously if they're fast enough,
 * avoiding the overhead of scheduling deferred work.
 *
 * **Eager Transitions:**
 * When a transition update is triggered (via `startTransition`), React can either:
 * 1. **Eager**: Try to complete it immediately if it's quick
 * 2. **Deferred**: Schedule it as low-priority work
 *
 * Returning `true` enables the eager path, which can reduce latency for fast transitions
 * but may block the main thread briefly.
 *
 * **Trade-offs:**
 * - `true` = Better perceived performance for fast transitions, but risk of jank if slow
 * - `false` = Conservative, always defers transitions (consistent but potentially slower)
 *
 * **Deck.gl Implementation:**
 * Returns `false` (conservative approach). Deck.gl layer updates can be expensive
 * (especially for large datasets or complex rendering), so we prefer to always defer
 * transitions rather than risk blocking the main thread with eager attempts.
 *
 * @returns `false` - Always defer transitions to avoid blocking
 *
 * @see {@link https://github.com/facebook/react/pull/26025 PR Introducing Eager Transitions}
 * @see {@link https://react.dev/reference/react/startTransition React Transitions Documentation}
 */
export function shouldAttemptEagerTransition(): boolean {
  return false;
}

/**
 * Constant representing "not pending transition" state.
 *
 * Required by React reconciler for transition tracking (React 19+).
 * Deck.gl doesn't use transitions, so this is always null.
 *
 * @see {@link https://github.com/facebook/react/pull/26722 PR Adding Transition Context}
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js React DOM Reference Implementation}
 */
export const NotPendingTransition: TransitionStatus | null = null;

/**
 * React context for tracking transition status.
 *
 * Required by React reconciler for transition state management (React 19+).
 * Following React Noop Renderer pattern: set to null for custom reconcilers
 * that don't need transition tracking.
 *
 * React DOM manually constructs a full context object because it needs specific
 * internal behavior, but custom reconcilers should use null.
 *
 * @see {@link https://github.com/facebook/react/pull/26722 PR Adding Transition Context}
 * @see {@link https://github.com/facebook/react/blob/main/packages/react-noop-renderer/src/createReactNoop.js React Noop Renderer Reference}
 */
export const HostTransitionContext = createContext<TransitionStatus>(
  null
) as unknown as ReactContext<TransitionStatus>;

/**
 * Resets form instance state.
 *
 * Required by React reconciler for form actions support (React 19+).
 * Deck.gl doesn't support forms, so this is a no-op.
 *
 * @param _form - Form instance to reset (unused)
 *
 * @see {@link https://github.com/facebook/react/pull/28804 PR Adding Form Support}
 */
export function resetFormInstance(_form: FormInstance): void {}
