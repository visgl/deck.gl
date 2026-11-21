// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
// Copyright (c) Deckgl Fiber Renderer contributors

import {Layer, View, Widget} from '@deck.gl/core';
import type {DeckProps, Effect, LayersList} from '@deck.gl/core';

import {warnOnDuplicateIds} from './element-ids';
import type {Container, Instance, JsxDescriptors, ViewOrViews} from './types';

/**
 * Type guard to check if a node is a View instance.
 *
 * Used to distinguish View objects from Layer objects in the reconciler tree.
 * Enables TypeScript to narrow the type in conditional branches.
 *
 * @param instance - The Layer or View node to check
 * @returns True if the instance is a View, false if it's a Layer
 *
 * @example
 * ```typescript
 * const node = getInstance();
 * if (isView(node)) {
 *   // node is narrowed to View type
 *   console.log(node.controller);
 * } else {
 *   // node is narrowed to Layer type
 *   console.log(node.props);
 * }
 * ```
 */
export function isView(instance: unknown): instance is View {
  return instance instanceof View;
}

/** Type guard to check if a node is a Widget instance. */
export function isWidget(instance: unknown): instance is Widget {
  return instance instanceof Widget;
}

/**
 * Type guard to check if a node is a deck.gl effect, such as a `LightingEffect` or
 * `PostProcessEffect`. deck.gl's `Effect` is an interface, so this checks its shape.
 */
export function isEffect(instance: unknown): instance is Effect {
  if (!instance || typeof instance !== 'object' || isLayer(instance)) {
    return false;
  }
  const effect = instance as Partial<Effect>;
  return (
    typeof effect.id === 'string' &&
    typeof effect.setup === 'function' &&
    typeof effect.cleanup === 'function'
  );
}

/** Type guard to check if a node is a Layer instance. */
export function isLayer(instance: unknown): instance is Layer {
  return instance instanceof Layer;
}

/**
 * Flattens a tree of Instance nodes into a flat array.
 *
 * Performs depth-first traversal to extract all Layer/View nodes from the
 * reconciler tree structure. Optimized using accumulator pattern to avoid
 * O(N*D) allocations from recursive spreading.
 *
 * @param roots - Array of root Instance nodes to flatten
 * @returns Flat array of all Layer and View nodes in depth-first order
 *
 * @example
 * ```typescript
 * const instances = [
 *   {
 *     node: layer1,
 *     children: [
 *       { node: layer2, children: [] }
 *     ]
 *   }
 * ];
 * const nodes = flattenTree(instances);
 * // [layer1, layer2] - depth-first order
 * ```
 */
export function flattenTree(roots: Instance[]): Instance['node'][] {
  // PERF: avoid-allocations.md - accumulator pattern instead of recursive spread
  // Issue: Recursive spread creates O(N*D) allocations for N nodes at depth D
  // Gain: 5-20x speedup for trees with 100+ nodes
  const result: Instance['node'][] = [];

  /** Appends each instance's node, then its children's, skipping hidden subtrees. */
  function flatten(instances: Instance[]): void {
    for (const instance of instances) {
      if (instance.hidden) {
        continue;
      }
      result.push(instance.node);
      if (instance.children.length > 0) {
        flatten(instance.children);
      }
    }
  }

  flatten(roots);
  return result;
}

/**
 * Partitions a list of nodes into separate views, layers, widgets and effects arrays.
 *
 * Uses the isView, isWidget and isEffect type guards to separate View, Widget and effect
 * objects from Layer objects, organizing them into the structure expected by deck.gl's
 * setProps method.
 *
 * @param list - Array of Layer, View, Widget and effect nodes to partition
 * @returns Object with separate arrays for views, layers, widgets and effects
 *
 * @example
 * ```typescript
 * const nodes = [view1, layer1, layer2, view2];
 * const { views, layers } = organizeList(nodes);
 * // views: [view1, view2]
 * // layers: [layer1, layer2]
 * ```
 */
export function organizeList(list: Instance['node'][]) {
  // oxlint-disable-next-line unicorn/no-array-reduce
  return list.reduce<JsxDescriptors>(
    (descriptors, node) => {
      if (isView(node)) {
        descriptors.views.push(node);
      } else if (isWidget(node)) {
        descriptors.widgets.push(node);
      } else if (isEffect(node)) {
        descriptors.effects.push(node);
      } else {
        descriptors.layers.push(node);
      }
      return descriptors;
    },
    {effects: [], layers: [], views: [], widgets: []}
  );
}

/** The `widgets` prop of a root. */
type RootWidgets = DeckProps<ViewOrViews>['widgets'];

/** The root props that are combined with committed JSX descriptors. */
interface RootDescriptorProps {
  /** The root's `effects` prop. */
  _passedEffects?: Effect[];
  /** The root's `layers` prop. */
  _passedLayers: LayersList;
  /** The root's `views` prop. */
  _passedViews?: ViewOrViews;
  /** The root's `widgets` prop. */
  _passedWidgets?: RootWidgets;
  /** True when the root drives a map overlay instead of a standalone `Deck`. */
  isExternalOverlay?: boolean;
  /** Sends JSX views to the external overlay. */
  forwardViews?: boolean;
}

/**
 * Merges JSX descriptors with a prop's descriptors by their final id.
 *
 * JSX entries with one id collapse into the last of them, at the first one's place. A prop entry
 * then replaces the entry with its id, so the prop wins over JSX. Other prop entries follow the
 * JSX entries. Only the final id is compared: elements without an id get distinct ids from their
 * paths, so a prop entry with the class's default id, such as `new MapView()`, matches none of
 * them and is added beside them, instead of replacing every one built from that class.
 */
function mergeById<T extends {id: string}>(
  jsxEntries: readonly T[],
  passedEntries: readonly (T | null | undefined | false)[]
): T[] {
  const merged: T[] = [];
  for (const entry of [...jsxEntries, ...passedEntries]) {
    if (!entry) {
      continue;
    }
    const index = merged.findIndex(other => other.id === entry.id);
    if (index < 0) {
      merged.push(entry);
    } else {
      merged[index] = entry;
    }
  }
  return merged;
}

/**
 * Merges JSX views with the `views` prop as `@deck.gl/react` does.
 *
 * Without JSX views, the prop is used unchanged. When it is also absent, the result is
 * `null`, which makes deck.gl restore its default view after the last JSX view is removed.
 * An empty list would leave deck.gl with no view at all. With JSX views, prop views are
 * merged in by id: a prop view replaces the JSX view with the same id, and other prop
 * views follow the JSX views.
 */
function mergeViews(jsxViews: View[], passedViews: ViewOrViews | undefined): ViewOrViews {
  if (jsxViews.length === 0) {
    return passedViews ?? null;
  }
  if (!passedViews) {
    return jsxViews;
  }
  return mergeById(jsxViews, Array.isArray(passedViews) ? passedViews : [passedViews]);
}

/**
 * Merges JSX widgets with the `widgets` prop by id, the way views are merged.
 *
 * deck.gl's WidgetManager matches widgets by id, so two widgets with one id would be added
 * twice. A prop widget replaces the JSX widget with the same id, and other prop widgets
 * follow the JSX widgets. The result is never `undefined`, so removing the last JSX widget
 * removes it from deck.gl.
 */
function mergeWidgets(
  jsxWidgets: Widget[],
  passedWidgets: RootWidgets | undefined
): NonNullable<RootWidgets> {
  if (jsxWidgets.length === 0) {
    return passedWidgets ?? [];
  }
  if (!passedWidgets) {
    return jsxWidgets;
  }
  return mergeById<NonNullable<NonNullable<RootWidgets>[number]>>(jsxWidgets, passedWidgets);
}

/**
 * Merges JSX effects with the `effects` prop by id, the way widgets are merged.
 *
 * deck.gl's EffectManager matches effects by id. A prop effect replaces the JSX effect with
 * the same id, and other prop effects follow the JSX effects. The result is never
 * `undefined`, so removing the last JSX effect leaves only the prop effects.
 */
function mergeEffects(jsxEffects: Effect[], passedEffects: Effect[] | undefined): Effect[] {
  if (jsxEffects.length === 0) {
    return passedEffects ?? [];
  }
  if (!passedEffects) {
    return jsxEffects;
  }
  return mergeById(jsxEffects, passedEffects);
}

/**
 * Combines a root's `layers`, `views` and `widgets` props with the layers and views of its committed
 * JSX tree.
 *
 * As in `@deck.gl/react`, JSX layers come first and `layers` prop layers follow them, so
 * prop layers draw above JSX layers, and JSX views are merged with the `views` prop by id,
 * with the prop winning. JSX widgets and effects are merged with the `widgets` and `effects`
 * props the same way.
 * An external overlay receives views only when its root forwards them, as the Mapbox and
 * MapLibre roots do; other overlays keep only their `views` prop.
 *
 * A root with no views leaves deck.gl's `views` alone, as `@deck.gl/react` does, so a
 * widget such as `SplitterWidget` can set them. After the last view is removed, the root
 * sends `null` once, which restores deck.gl's default view.
 *
 * @param props - The root's passed descriptors, and whether it is an external overlay that
 *   forwards views
 * @param jsx - Layers, views, widgets and effects from the committed JSX tree
 * @param sentViews - Whether the previous update sent views
 * @returns The `layers`, `widgets` and `effects` to send, and `views` when the root has any or
 *   just removed its last one
 */
export function combineRootDescriptors(
  props: RootDescriptorProps,
  jsx: JsxDescriptors,
  sentViews = false
): Pick<DeckProps<ViewOrViews>, 'effects' | 'layers' | 'views' | 'widgets'> {
  const descriptors: Pick<DeckProps<ViewOrViews>, 'effects' | 'layers' | 'views' | 'widgets'> = {
    effects: mergeEffects(jsx.effects, props._passedEffects),
    layers: [...jsx.layers, ...props._passedLayers],
    widgets: mergeWidgets(jsx.widgets, props._passedWidgets)
  };

  if (!props.isExternalOverlay || props.forwardViews) {
    const views = mergeViews(jsx.views, props._passedViews);
    if (views || sentViews) {
      descriptors.views = views;
    }
  }

  return descriptors;
}

/**
 * Builds the update a root sends to deck.gl from its JSX descriptors and its props, and checks
 * it for duplicate ids. Commits and prop-only reconfigures both send their updates through it.
 */
export function prepareRootUpdate(
  container: Container,
  jsx: JsxDescriptors
): ReturnType<typeof combineRootDescriptors> {
  const state = container.store.getState();
  container.duplicateIdWarnings = warnOnDuplicateIds(
    jsx,
    state._passedLayers,
    container.duplicateIdWarnings
  );
  const descriptors = combineRootDescriptors(state, jsx, container.sentViews);
  container.sentViews = Boolean(descriptors.views);
  return descriptors;
}
