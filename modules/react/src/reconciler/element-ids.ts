// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Effect, Layer, LayersList, View, Widget} from '@deck.gl/core';
import {log} from '@deck.gl/core';
import type {Fiber} from 'react-reconciler';

import {hasGeneratedEffectId} from '../shared/generated-effect-id';
import {RootErrorBoundary} from './error-boundary';

/*
 * Ids for elements without one
 * ============================
 *
 * deck.gl matches each new layer, view, widget and effect with the previous one that has the same
 * id. A descriptor without an id keeps deck.gl's default, which is shared by every instance of its
 * class, so two of them would collide. The renderer gives such an element an id built from its
 * position in the React tree, and never changes an id the app passed, even one that equals the
 * default.
 *
 * Which descriptors have no id
 * ----------------------------
 *
 * Layers, views and widgets keep the props the app passed as own properties, and deck.gl's
 * default `id` on the prototype, so `Object.hasOwn(props, 'id')` is false exactly when no id was
 * passed. Views and widgets need visgl/deck.gl#11114 for this; layers always worked this way.
 * deck.gl effects take no `id` at all, so only an effect a component built, which the component
 * marks, gets an id from its path. An effect passed to `<deckEffect>` keeps its own id.
 *
 * The format
 * ----------
 *
 *   id      = encodeURIComponent(base) ("/" segment)*
 *   segment = "#" index        for an element without a key, by its index among its siblings
 *           | escape(key)      for an element with a key
 *   escape  = encodeURIComponent, which also escapes "/", "#", ":" and "%", plus "-" as "%2D"
 *
 * `base` is the id deck.gl would give the descriptor, usually its class name, such as
 * `ScatterplotLayer` or `MapView`. The segments run from the top of `DeckGL` down to the element,
 * through every component, fragment and element on the way, so `<Points key="a" />` that
 * renders a layer gives `ScatterplotLayer/a`.
 *
 * Why no two generated ids are ever equal
 * ---------------------------------------
 *
 * 1. The format is invertible. `encodeURIComponent(base)` contains no "/", so the base is
 *    everything before the first "/". No segment contains "/", so splitting the rest on "/" gives
 *    the segments back, including an empty segment for the key "". A segment starting with "#"
 *    is an index, because an escaped key never contains "#", and `decodeURIComponent` turns any
 *    other segment back into its key. So two ids are equal only if their bases and segment lists
 *    are equal.
 *
 * 2. The segment lists of two mounted elements differ. React identifies an element by its
 *    parent and its key, or, without one, by its index; that is what React itself uses to keep
 *    an element mounted between renders. The list is that identity, written out from the root,
 *    so two elements mounted at the same time have different lists. The only precondition is
 *    React's own: keys are unique among siblings, which React reports in development.
 *    A key or an index never changes while its element stays mounted, so the list is computed
 *    once, when the element mounts.
 *
 * 3. One shortening keeps 1 and 2. A component that returns a lone unkeyed element, as the
 *    built-in layer components do, would add a final `#0` to every id. So final `#0` segments are dropped,
 *    from the element up, while the fiber they describe has no siblings and its parent is not a
 *    deck.gl element. The shortened list is then the list of an ancestor A that is a component,
 *    a fragment or the root, never a mounted deck.gl element, so no element keeps A's list
 *    unshortened. Two elements shortened to A's list would both hang from A through chains of
 *    lone children, which is one chain; the deeper one would be shortened through the other, a
 *    deck.gl element, which the rule forbids. So shortened lists stay distinct. An element alone
 *    at the top of `DeckGL`, even inside components, gets the bare base: deck.gl's default id.
 *
 * 4. Sublayer ids stay distinct too. deck.gl names a composite layer's sublayers
 *    `${parentId}-${suffix}`. The last segment of a generated id never contains "-", because
 *    escape() replaces it and an index is digits, so appending "-suffix" yields an id outside
 *    the format, unless the suffix itself contains "/", which deck.gl's layers never do.
 *
 * Generated ids can still equal an id you chose, or one in the `layers` prop. Outside production
 * builds, `warnOnDuplicateIds` reports those collisions.
 */

/** react-reconciler's tags for the root fiber and for a host element, such as `<deckView>`. */
const HOST_ROOT_TAG = 3;
const HOST_COMPONENT_TAG = 5;

/**
 * Writes one path segment: `#` and the index for an element without a key, or the key, escaped
 * so that it can never read as an index, a separator or a sublayer suffix.
 */
export function formatPathSegment(key: string | null, index: number): string {
  return key === null ? `#${index}` : encodeURIComponent(key).replaceAll('-', '%2D');
}

/**
 * Lists an element's path segments, from the top of `DeckGL` down to the element.
 * See the format above.
 */
export function getElementPath(fiber: Fiber): string[] {
  const segments: string[] = [];
  for (
    let node: Fiber | null = fiber;
    node && node.tag !== HOST_ROOT_TAG && node.type !== RootErrorBoundary;
    node = node.return
  ) {
    segments.push(formatPathSegment(node.key, node.index));
  }
  // Rule 3: lone unkeyed fibers under components add nothing, up to the first that is not.
  // `segments[0]` describes `node`, the deepest fiber not yet dropped.
  let node = fiber;
  while (
    segments[0] === '#0' &&
    !node.sibling &&
    node.return &&
    node.return.tag !== HOST_COMPONENT_TAG
  ) {
    segments.shift();
    node = node.return;
  }
  return segments.reverse();
}

/** Builds an id from deck.gl's default id and the element's path. See the format above. */
export function formatElementId(base: string, path: readonly string[]): string {
  return encodeURIComponent(base) + path.map(segment => `/${segment}`).join('');
}

type ClassWithDefaults = {
  componentName?: string;
  name: string;
};

function getClass(descriptor: object): ClassWithDefaults {
  return descriptor.constructor as unknown as ClassWithDefaults;
}

/** Whether the app passed an id: an own `id` prop that is not empty. */
function hasIdProp(props: {id?: string}): boolean {
  return Object.prototype.hasOwnProperty.call(props, 'id') && Boolean(props.id);
}

/**
 * The ids widgets and effects had before the renderer gave them one in place, so a later render of
 * the same instance builds its id from that one, not from the id it was given.
 */
const ownIds = new WeakMap<object, string | undefined>();
/**
 * Widgets the renderer gives ids, decided when it first sees them. Giving a widget an id in place
 * sets `props.id`, so a later render of the same widget could no longer tell.
 */
const widgetsWithGeneratedIds = new WeakSet<Widget>();
// A widget or effect keeps its given id after its element unmounts. Restoring the original id
// then would rename an instance that deck.gl may still hold under the given id, or that a prop
// already passes to it, and deck.gl would set it up again and then clean it up as the removed
// one. The merge with props matches entries by their final id only; see `mergeById`.

function getOriginalId(descriptor: Widget | Effect): string | undefined {
  if (!ownIds.has(descriptor)) {
    ownIds.set(descriptor, descriptor.id);
  }
  return ownIds.get(descriptor);
}

/**
 * Gives a layer without an `id` one from its path. Layer props are frozen, and sublayer ids are
 * built from `props.id`, so the layer is cloned with the new id.
 */
export function withLayerId(layer: Layer, path: readonly string[]): Layer {
  if (hasIdProp(layer.props)) {
    return layer;
  }
  const LayerClass = getClass(layer);
  const id = formatElementId(LayerClass.componentName || LayerClass.name, path);
  return id === layer.id ? layer : layer.clone({id});
}

/**
 * Gives a view without an `id` one from its path, with deck.gl's default id, its class's
 * `displayName`, as the base. The view is cloned with the new id.
 */
export function withViewId(view: View, path: readonly string[]): View {
  if (hasIdProp(view.props)) {
    return view;
  }
  const id = formatElementId(view.id, path);
  if (id === view.id) {
    return view;
  }
  return view.clone({id});
}

/**
 * Gives a widget without an `id` one from its path, with its class's default id as the base.
 * Widgets hold DOM and state, and applications keep references to them, so the id is changed in
 * place rather than on a copy.
 */
export function withWidgetId(widget: Widget, path: readonly string[]): Widget {
  if (!ownIds.has(widget) && !hasIdProp(widget.props)) {
    widgetsWithGeneratedIds.add(widget);
  }
  const originalId = getOriginalId(widget);
  if (!widgetsWithGeneratedIds.has(widget)) {
    return widget;
  }
  const id = formatElementId(originalId || getClass(widget).name, path);
  if (widget.id !== id) {
    widget.id = id;
    (widget.props as {id?: string}).id = id;
  }
  return widget;
}

/**
 * Gives an effect a component built an id from its path. deck.gl effects take no id: each class
 * assigns its own, such as `lighting-effect`, or `${module.name}-pass` for a `PostProcessEffect`,
 * and an app can only change it after construction. So an effect cannot say whether its id was
 * chosen; only the component that built it knows, and it marks the effect. An effect passed to
 * `<deckEffect>` keeps its id. A marked effect's class id is the base. The id is changed in place,
 * because an effect holds GPU resources and takes class-specific constructor arguments.
 */
export function withEffectId(effect: Effect, path: readonly string[]): Effect {
  if (!hasGeneratedEffectId(effect)) {
    return effect;
  }
  const id = formatElementId(getOriginalId(effect) || getClass(effect).name, path);
  if (effect.id !== id) {
    effect.id = id;
  }
  return effect;
}

/** Flattens a `layers` prop, which can nest arrays and hold empty entries. */
function flattenLayers(layers: LayersList, result: Layer[] = []): Layer[] {
  for (const layer of layers) {
    if (Array.isArray(layer)) {
      flattenLayers(layer, result);
    } else if (layer) {
      result.push(layer as Layer);
    }
  }
  return result;
}

type Described = {id: string; source: string; descriptor: object};

function findDuplicates(kind: string, entries: Described[], messages: Set<string>): void {
  const seen = new Map<string, Described>();
  for (const entry of entries) {
    const first = seen.get(entry.id);
    if (first) {
      const describe = ({descriptor, source}: Described) =>
        `${getClass(descriptor).name} from ${source}`;
      messages.add(
        `Two ${kind} share the id "${entry.id}": ${describe(first)} and ${describe(entry)}`
      );
    } else {
      seen.set(entry.id, entry);
    }
  }
}

/**
 * Warns, outside production builds, when two descriptors of one kind reach deck.gl with the same
 * id, naming both. Generated ids never collide with each other, but they can equal an explicit
 * id, and the `layers` prop is added to the JSX layers without merging. Views, widgets and
 * effects from props replace JSX elements with the same id by design, so only JSX elements are
 * compared for those.
 *
 * Every update sent to deck.gl is checked, whether a commit or a prop-only `configure` sends it.
 * One render can send both, so a collision is reported only when the previous update, whose
 * messages are passed as `reported`, did not have it.
 *
 * @returns The messages for this update, to pass as `reported` next time
 */
export function warnOnDuplicateIds(
  jsx: {effects: Effect[]; layers: Layer[]; views: View[]; widgets: Widget[]},
  passedLayers: LayersList,
  reported: ReadonlySet<string> = new Set()
): ReadonlySet<string> {
  const messages = new Set<string>();
  if (process.env.NODE_ENV === 'production') {
    return messages;
  }
  const fromJsx = (element: string) => (descriptor: {id: string}) => ({
    descriptor,
    id: descriptor.id,
    source: `<${element}>`
  });
  findDuplicates(
    'layers',
    [
      ...jsx.layers.map(fromJsx('deckLayer')),
      ...flattenLayers(passedLayers).map(layer => ({
        descriptor: layer,
        id: layer.id,
        source: 'the layers prop'
      }))
    ],
    messages
  );
  findDuplicates('views', jsx.views.map(fromJsx('deckView')), messages);
  findDuplicates('widgets', jsx.widgets.map(fromJsx('deckWidget')), messages);
  findDuplicates('effects', jsx.effects.map(fromJsx('deckEffect')), messages);
  for (const message of messages) {
    if (!reported.has(message)) {
      log.warn(message)();
    }
  }
  return messages;
}
