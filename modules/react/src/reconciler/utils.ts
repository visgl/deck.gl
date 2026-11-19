import {Layer, View, Widget} from '@deck.gl/core';
import type {DeckProps, Effect, LayersList} from '@deck.gl/core';

import type {Instance, JsxDescriptors, ViewOrViews} from './types';

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
 * @param arr - Array of root Instance nodes to flatten
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
export function flattenTree(arr: Instance[]): Instance['node'][] {
  // PERF: avoid-allocations.md - accumulator pattern instead of recursive spread
  // Issue: Recursive spread creates O(N*D) allocations for N nodes at depth D
  // Gain: 5-20x speedup for trees with 100+ nodes
  const result: Instance['node'][] = [];

  function flatten(instances: Instance[]): void {
    for (const val of instances) {
      result.push(val.node);
      if (val.children.length > 0) {
        flatten(val.children);
      }
    }
  }

  flatten(arr);
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
    (acc, curr) => {
      if (isView(curr)) {
        acc.views.push(curr);
      } else if (isWidget(curr)) {
        acc.widgets.push(curr);
      } else if (isEffect(curr)) {
        acc.effects.push(curr);
      } else {
        acc.layers.push(curr);
      }
      return acc;
    },
    {effects: [], layers: [], views: [], widgets: []}
  );
}

/** The `widgets` prop of a root. */
type RootWidgets = DeckProps<ViewOrViews>['widgets'];

/** The root props that are combined with committed JSX descriptors. */
interface RootDescriptorProps {
  _passedEffects?: Effect[];
  _passedLayers: LayersList;
  _passedViews?: ViewOrViews;
  _passedWidgets?: RootWidgets;
  isExternalOverlay?: boolean;
  forwardViews?: boolean;
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

  const viewsById = new Map<string, View>();
  for (const view of jsxViews) {
    viewsById.set(view.id, view);
  }
  for (const view of Array.isArray(passedViews) ? passedViews : [passedViews]) {
    if (view) {
      viewsById.set(view.id, view);
    }
  }
  return [...viewsById.values()];
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

  const widgetsById = new Map<string, NonNullable<RootWidgets>[number]>();
  for (const widget of [...jsxWidgets, ...passedWidgets]) {
    if (widget) {
      widgetsById.set(widget.id, widget);
    }
  }
  return [...widgetsById.values()];
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

  const effectsById = new Map<string, Effect>();
  for (const effect of [...jsxEffects, ...passedEffects]) {
    if (effect) {
      effectsById.set(effect.id, effect);
    }
  }
  return [...effectsById.values()];
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
