// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {View} from '@deck.gl/core';

import {assertViewLayout, isViewLayout} from './view-layout';

import type {
  ViewLayoutChild,
  ColumnViewLayout,
  OverlayViewLayout,
  ViewLayoutInsets,
  ViewLayout,
  ViewLayoutLength,
  RowViewLayout
} from './view-layout';

/** Rectangle resolved by the layout compiler for one view id. */
export type ViewLayoutRect = {
  /** Left coordinate in deck pixels. */
  x: number;
  /** Top coordinate in deck pixels. */
  y: number;
  /** Width in deck pixels. */
  width: number;
  /** Height in deck pixels. */
  height: number;
};

/** Concrete views plus resolved rectangles produced by `buildViewsFromViewLayout`. */
export type CompiledDeckViews = {
  /** Concrete deck.gl views with numeric bounds resolved for the current canvas size. */
  views: View[];
  /** Resolved rectangles keyed by deck view id. */
  rectsById: Record<string, ViewLayoutRect>;
  /** User-adjustable split handles keyed by split id. */
  splittersById: Record<string, ViewLayoutSplitter>;
};

/** Layout-only view prop overrides keyed by deck view id. */
export type ViewLayoutViewPropsById = Readonly<Record<string, ViewLayoutViewOverrideProps>>;

/** Layout-only props that can be controlled outside the static layout tree. */
export type ViewLayoutViewOverrideProps = {
  /** Left offset relative to the current parent bounds. */
  x?: ViewLayoutLength;
  /** Top offset relative to the current parent bounds. */
  y?: ViewLayoutLength;
  /** Width expression resolved against the current parent bounds. */
  width?: ViewLayoutLength;
  /** Height expression resolved against the current parent bounds. */
  height?: ViewLayoutLength;
};

/** Values for user-adjustable splits keyed by split id. */
export type ViewLayoutSplitValues = Readonly<Record<string, number>>;

/** Resolved splitter metadata produced by `buildViewsFromViewLayout`. */
export type ViewLayoutSplitter = {
  /** Stable id for this split. */
  id: string;
  /** Stacking orientation controlled by this split. */
  orientation: 'horizontal' | 'vertical';
  /** Left position as a percentage of the deck canvas. */
  x: number;
  /** Top position as a percentage of the deck canvas. */
  y: number;
  /** Width as a percentage of the deck canvas. */
  width: number;
  /** Height as a percentage of the deck canvas. */
  height: number;
  /** Ratio of the first child over the split axis. */
  split: number;
  /** Minimum split ratio. */
  minSplit: number;
  /** Maximum split ratio. */
  maxSplit: number;
};

/** Minimal deck.gl view props shape needed by the layout compiler. */
type LayoutAwareViewProps = {
  /** Stable deck.gl view id. */
  id?: string;
  /** Left offset relative to the current parent bounds. */
  x?: ViewLayoutLength;
  /** Top offset relative to the current parent bounds. */
  y?: ViewLayoutLength;
  /** Width expression resolved against the current parent bounds. */
  width?: ViewLayoutLength;
  /** Height expression resolved against the current parent bounds. */
  height?: ViewLayoutLength;
} & Record<string, unknown>;

/**
 * Compiles one `ViewLayout` tree into concrete deck.gl views and resolved rectangles.
 *
 * @param args - Root layout plus the current canvas size and optional previous compilation.
 * @returns Concrete views with numeric bounds plus resolved rectangles keyed by view id.
 */
export function buildViewsFromViewLayout(args: {
  /** Root layout tree to compile. */
  layout: ViewLayout;
  /** Current deck width in pixels. */
  width: number;
  /** Current deck height in pixels. */
  height: number;
  /** Optional previous compilation used for structural view reuse. */
  previous?: CompiledDeckViews;
  /** Controlled split values keyed by layout `splitId`. */
  splitValues?: ViewLayoutSplitValues;
  /** Controlled layout-only view prop overrides keyed by deck view id. */
  viewPropsById?: ViewLayoutViewPropsById;
}): CompiledDeckViews {
  assertViewLayout(args.layout);

  const rootRect: ViewLayoutRect = {
    x: 0,
    y: 0,
    width: Math.max(1, args.width),
    height: Math.max(1, args.height)
  };
  const previousViewsById = new Map(
    (args.previous?.views ?? [])
      .map(view => [getViewId(view), view] as const)
      .filter((entry): entry is [string, View] => Boolean(entry[0]))
  );
  const outputViews: View[] = [];
  const rectsById: Record<string, ViewLayoutRect> = {};
  const splittersById: Record<string, ViewLayoutSplitter> = {};

  compileLayoutItem({
    item: args.layout,
    rect: rootRect,
    rootRect,
    outputViews,
    rectsById,
    splittersById,
    previousViewsById,
    splitValues: args.splitValues ?? {},
    viewPropsById: args.viewPropsById ?? {}
  });

  return {
    views: outputViews,
    rectsById,
    splittersById
  };
}

/**
 * Compiles one validated layout node inside the given parent rectangle.
 *
 * @param args - Layout item, allocated bounds, and compilation accumulators.
 */
function compileLayoutItem(args: {
  item: ViewLayout;
  rect: ViewLayoutRect;
  rootRect: ViewLayoutRect;
  outputViews: View[];
  rectsById: Record<string, ViewLayoutRect>;
  splittersById: Record<string, ViewLayoutSplitter>;
  previousViewsById: Map<string, View>;
  splitValues: ViewLayoutSplitValues;
  viewPropsById: ViewLayoutViewPropsById;
}): void {
  const {item} = args;

  switch (item.type) {
    case 'row':
      compileStackLayout({...args, item, orientation: 'row', children: item.children});
      return;
    case 'column':
      compileStackLayout({...args, item, orientation: 'column', children: item.children});
      return;
    case 'overlay':
      compileOverlayLayout({...args, item, children: item.children});
      return;
    case 'spacer':
      return;
    default: {
      const exhaustiveCheck: never = item;
      throw new Error(`Unsupported view layout item: ${String(exhaustiveCheck)}`);
    }
  }
}

/**
 * Compiles one stack container by splitting the stack axis across its children.
 *
 * @param args - Stack orientation, children, and compilation accumulators.
 */
function compileStackLayout(args: {
  item: RowViewLayout | ColumnViewLayout;
  rect: ViewLayoutRect;
  rootRect: ViewLayoutRect;
  orientation: 'row' | 'column';
  children: readonly ViewLayoutChild[];
  outputViews: View[];
  rectsById: Record<string, ViewLayoutRect>;
  splittersById: Record<string, ViewLayoutSplitter>;
  previousViewsById: Map<string, View>;
  splitValues: ViewLayoutSplitValues;
  viewPropsById: ViewLayoutViewPropsById;
}): void {
  const containerRect = applyInsets(args.rect, args.item.inset);
  const children = args.children.filter(isPresentChild);
  if (children.length === 0) {
    return;
  }

  const containerAxisLength =
    args.orientation === 'row' ? containerRect.width : containerRect.height;
  const explicitLengths = getStackChildAxisLengths({
    children,
    containerAxisLength,
    item: args.item,
    orientation: args.orientation,
    splitValues: args.splitValues
  });
  const fixedLength = explicitLengths.reduce<number>((sum, length) => sum + (length ?? 0), 0);
  const flexibleChildCount = explicitLengths.filter(length => length === undefined).length;
  const flexibleLength =
    flexibleChildCount > 0
      ? Math.max(containerAxisLength - fixedLength, 0) / flexibleChildCount
      : 0;

  let cursor = args.orientation === 'row' ? containerRect.x : containerRect.y;
  const splitConfig = getStackSplitConfig(args.item, args.splitValues);
  if (splitConfig !== null) {
    args.splittersById[splitConfig.splitId] = {
      id: splitConfig.splitId,
      orientation: args.orientation === 'row' ? 'horizontal' : 'vertical',
      x: (containerRect.x / args.rootRect.width) * 100,
      y: (containerRect.y / args.rootRect.height) * 100,
      width: (containerRect.width / args.rootRect.width) * 100,
      height: (containerRect.height / args.rootRect.height) * 100,
      split: splitConfig.split,
      minSplit: splitConfig.minSplit,
      maxSplit: splitConfig.maxSplit
    };
  }

  children.forEach((child, index) => {
    const childAxisLength = explicitLengths[index] ?? flexibleLength;
    const childRect =
      args.orientation === 'row'
        ? {
            x: cursor,
            y: containerRect.y,
            width: childAxisLength,
            height: containerRect.height
          }
        : {
            x: containerRect.x,
            y: cursor,
            width: containerRect.width,
            height: childAxisLength
          };
    cursor += childAxisLength;
    compileLayoutChild({
      child,
      rect: childRect,
      rootRect: args.rootRect,
      outputViews: args.outputViews,
      rectsById: args.rectsById,
      splittersById: args.splittersById,
      previousViewsById: args.previousViewsById,
      splitValues: args.splitValues,
      viewPropsById: args.viewPropsById
    });
  });
}

/**
 * Compiles one overlay container by giving every child the same parent rectangle.
 *
 * @param args - Overlay children, parent rectangle, and compilation accumulators.
 */
function compileOverlayLayout(args: {
  item: OverlayViewLayout;
  rect: ViewLayoutRect;
  rootRect: ViewLayoutRect;
  children: readonly ViewLayoutChild[];
  outputViews: View[];
  rectsById: Record<string, ViewLayoutRect>;
  splittersById: Record<string, ViewLayoutSplitter>;
  previousViewsById: Map<string, View>;
  splitValues: ViewLayoutSplitValues;
  viewPropsById: ViewLayoutViewPropsById;
}): void {
  const containerRect = applyInsets(args.rect, args.item.inset);
  args.children.filter(isPresentChild).forEach(child =>
    compileLayoutChild({
      child,
      rect: containerRect,
      rootRect: args.rootRect,
      outputViews: args.outputViews,
      rectsById: args.rectsById,
      splittersById: args.splittersById,
      previousViewsById: args.previousViewsById,
      splitValues: args.splitValues,
      viewPropsById: args.viewPropsById
    })
  );
}

/**
 * Compiles one child entry, which may be a nested layout object or a raw deck view.
 *
 * @param args - Child node plus the rectangle allocated for it.
 */
function compileLayoutChild(args: {
  child: Exclude<ViewLayoutChild, null | false | undefined>;
  rect: ViewLayoutRect;
  rootRect: ViewLayoutRect;
  outputViews: View[];
  rectsById: Record<string, ViewLayoutRect>;
  splittersById: Record<string, ViewLayoutSplitter>;
  previousViewsById: Map<string, View>;
  splitValues: ViewLayoutSplitValues;
  viewPropsById: ViewLayoutViewPropsById;
}): void {
  if (isViewLayout(args.child)) {
    compileLayoutItem({
      item: args.child,
      rect: args.rect,
      rootRect: args.rootRect,
      outputViews: args.outputViews,
      rectsById: args.rectsById,
      splittersById: args.splittersById,
      previousViewsById: args.previousViewsById,
      splitValues: args.splitValues,
      viewPropsById: args.viewPropsById
    });
    return;
  }

  compileResolvedView({
    view: args.child,
    rect: args.rect,
    outputViews: args.outputViews,
    rectsById: args.rectsById,
    previousViewsById: args.previousViewsById,
    viewPropsById: args.viewPropsById
  });
}

function getStackChildAxisLengths(args: {
  children: Array<Exclude<ViewLayoutChild, null | false | undefined>>;
  containerAxisLength: number;
  item: RowViewLayout | ColumnViewLayout;
  orientation: 'row' | 'column';
  splitValues: ViewLayoutSplitValues;
}): Array<number | undefined> {
  const splitConfig = getStackSplitConfig(args.item, args.splitValues);
  if (splitConfig !== null) {
    return [
      args.containerAxisLength * splitConfig.split,
      args.containerAxisLength * (1 - splitConfig.split)
    ];
  }
  return args.children.map(child =>
    resolveStackChildAxisLength(child, args.orientation, args.containerAxisLength)
  );
}

function getStackSplitConfig(
  item: RowViewLayout | ColumnViewLayout,
  splitValues: ViewLayoutSplitValues
): {splitId: string; split: number; minSplit: number; maxSplit: number} | null {
  if (!item.splitId) {
    return null;
  }
  const minSplit = item.minSplit ?? 0.05;
  const maxSplit = item.maxSplit ?? 0.95;
  const split = Math.min(
    Math.max(splitValues[item.splitId] ?? item.initialSplit ?? 0.5, minSplit),
    maxSplit
  );
  return {splitId: item.splitId, split, minSplit, maxSplit};
}

/**
 * Resolves one raw deck view against a parent rectangle and reuses a previous instance when equal.
 *
 * @param args - View instance, allocated rectangle, and compilation accumulators.
 */
function compileResolvedView(args: {
  view: View;
  rect: ViewLayoutRect;
  outputViews: View[];
  rectsById: Record<string, ViewLayoutRect>;
  previousViewsById: Map<string, View>;
  viewPropsById: ViewLayoutViewPropsById;
}): void {
  const viewId = getRequiredViewId(args.view);
  const resolvedRect = resolveViewRectWithinParent(
    args.view,
    args.rect,
    args.viewPropsById[viewId]
  );
  args.rectsById[viewId] = resolvedRect;
  const nextProps = {
    ...args.view.props,
    x: resolvedRect.x,
    y: resolvedRect.y,
    width: resolvedRect.width,
    height: resolvedRect.height
  };
  const previousView = args.previousViewsById.get(viewId);
  const nextView =
    previousView &&
    previousView.constructor === args.view.constructor &&
    arePropsEqual(previousView.props as Record<string, unknown>, nextProps)
      ? previousView
      : instantiateView(args.view, nextProps);
  args.outputViews.push(nextView);
}

/**
 * Resolves one stack child length in the active stack axis, if it declares one.
 *
 * @param child - Stack child to inspect.
 * @param orientation - Active stack orientation.
 * @param parentAxisLength - Parent length in the active stack axis.
 * @returns Numeric child length, or `undefined` when the child should share remaining space.
 */
function resolveStackChildAxisLength(
  child: Exclude<ViewLayoutChild, null | false | undefined>,
  orientation: 'row' | 'column',
  parentAxisLength: number
): number | undefined {
  const axisValue = getAxisLengthValue(child, orientation);
  if (axisValue === undefined) {
    return undefined;
  }
  return resolveLength(axisValue, parentAxisLength);
}

/**
 * Resolves one raw deck view rectangle within the given parent rectangle.
 *
 * @param view - Raw deck view instance to position.
 * @param parentRect - Parent rectangle allocated by the layout compiler.
 * @returns Concrete rectangle for the compiled view.
 */
function resolveViewRectWithinParent(
  view: View,
  parentRect: ViewLayoutRect,
  overrides?: ViewLayoutViewOverrideProps
): ViewLayoutRect {
  const props = {...(view.props as LayoutAwareViewProps), ...overrides};
  const x = parentRect.x + resolveOffset(props.x, parentRect.width);
  const y = parentRect.y + resolveOffset(props.y, parentRect.height);
  const width = resolveDimension(props.width, parentRect.width, parentRect.width);
  const height = resolveDimension(props.height, parentRect.height, parentRect.height);
  return {
    x,
    y,
    width,
    height
  };
}

/**
 * Re-instantiates one deck view with a new resolved props object.
 *
 * @param view - Existing deck view instance whose constructor should be reused.
 * @param props - Resolved props for the compiled view.
 * @returns Fresh deck view instance with resolved numeric bounds.
 */
function instantiateView(view: View, props: Record<string, unknown>): View {
  const ViewConstructor = view.constructor as new (viewProps: Record<string, unknown>) => View;
  return new ViewConstructor(props);
}

/**
 * Reads the stack-axis length expression from one child, whether nested or raw.
 *
 * @param child - Candidate child entry.
 * @param orientation - Active stack orientation.
 * @returns Width for rows, height for columns, or `undefined` for flexible children.
 */
function getAxisLengthValue(
  child: Exclude<ViewLayoutChild, null | false | undefined>,
  orientation: 'row' | 'column'
): ViewLayoutLength | undefined {
  if (isViewLayout(child)) {
    return orientation === 'row' ? child.width : child.height;
  }
  const props = child.props as LayoutAwareViewProps;
  return orientation === 'row' ? props.width : props.height;
}

/**
 * Shrinks one rectangle by optional insets.
 *
 * @param rect - Rectangle allocated by the parent layout step.
 * @param inset - Insets to apply inside that rectangle.
 * @returns Inset rectangle clamped to non-negative size.
 */
function applyInsets(rect: ViewLayoutRect, inset: ViewLayoutInsets | undefined): ViewLayoutRect {
  if (!inset) {
    return rect;
  }
  const top = inset.top ?? 0;
  const right = inset.right ?? 0;
  const bottom = inset.bottom ?? 0;
  const left = inset.left ?? 0;
  return {
    x: rect.x + left,
    y: rect.y + top,
    width: Math.max(0, rect.width - left - right),
    height: Math.max(0, rect.height - top - bottom)
  };
}

/**
 * Resolves one optional x/y offset against a parent length.
 *
 * @param value - Authored offset expression.
 * @param parentLength - Parent width or height used for percentage resolution.
 * @returns Numeric offset in deck pixels.
 */
function resolveOffset(value: unknown, parentLength: number): number {
  if (value === undefined || value === null) {
    return 0;
  }
  return resolveLength(value as ViewLayoutLength, parentLength);
}

/**
 * Resolves one optional width or height against a parent length.
 *
 * @param value - Authored dimension expression.
 * @param parentLength - Parent width or height used for percentage resolution.
 * @param fallback - Fallback dimension used when no explicit expression is provided.
 * @returns Numeric dimension in deck pixels.
 */
function resolveDimension(value: unknown, parentLength: number, fallback: number): number {
  if (value === undefined || value === null) {
    return fallback;
  }
  return resolveLength(value as ViewLayoutLength, parentLength);
}

/**
 * Resolves one numeric, percentage, or `calc(...)` length expression.
 *
 * @param value - Authored length expression.
 * @param parentLength - Parent length used for percentage resolution.
 * @returns Numeric length in deck pixels.
 */
function resolveLength(value: ViewLayoutLength, parentLength: number): number {
  if (typeof value === 'number') {
    return value;
  }

  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new Error('View layout length must not be empty.');
  }
  if (normalized.startsWith('calc(') && normalized.endsWith(')')) {
    return resolveCalcExpression(normalized.slice(5, -1), parentLength);
  }
  return resolveLengthTerm(normalized, parentLength);
}

/**
 * Resolves one simple `calc(...)` expression made of additive length terms.
 *
 * @param expression - Inner `calc(...)` expression without the wrapper.
 * @param parentLength - Parent length used for percentage resolution.
 * @returns Numeric length in deck pixels.
 */
function resolveCalcExpression(expression: string, parentLength: number): number {
  const sanitized = expression.replace(/\s+/g, '');
  const terms = sanitized.match(/[+-]?[^+-]+/g);
  if (!terms) {
    throw new Error(`Unsupported calc expression: calc(${expression})`);
  }
  return terms.reduce((sum, term) => sum + resolveLengthTerm(term, parentLength), 0);
}

/**
 * Resolves one atomic length term such as `10`, `10px`, or `50%`.
 *
 * @param term - One atomic length term.
 * @param parentLength - Parent length used for percentage resolution.
 * @returns Numeric length in deck pixels.
 */
function resolveLengthTerm(term: string, parentLength: number): number {
  if (term.endsWith('%')) {
    return (Number.parseFloat(term.slice(0, -1)) / 100) * parentLength;
  }
  if (term.endsWith('px')) {
    return Number.parseFloat(term.slice(0, -2));
  }
  return Number.parseFloat(term);
}

/**
 * Reads the string id from one deck view when present.
 *
 * @param view - Deck view instance to inspect.
 * @returns String id or `null` when absent.
 */
function getViewId(view: View): string | null {
  const viewId = (view.props as LayoutAwareViewProps).id;
  return typeof viewId === 'string' && viewId.length > 0 ? viewId : null;
}

/**
 * Reads the required id from one deck view, throwing when missing.
 *
 * @param view - Deck view instance to inspect.
 * @returns Non-empty string id.
 */
function getRequiredViewId(view: View): string {
  const viewId = getViewId(view);
  if (!viewId) {
    throw new Error('Every compiled deck view must have a string id.');
  }
  return viewId;
}

/**
 * Compares two props objects for structural equality.
 *
 * @param left - Previous props object.
 * @param right - Next props object.
 * @returns Whether both props objects are structurally equal.
 */
function arePropsEqual(left: Record<string, unknown>, right: Record<string, unknown>): boolean {
  if (left === right) {
    return true;
  }

  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) {
    return false;
  }
  return leftKeys.every(key => areValuesEqual(left[key], right[key]));
}

/**
 * Recursively compares two primitive, array, or plain-object values.
 *
 * @param left - Previous value.
 * @param right - Next value.
 * @returns Whether both values are structurally equal.
 */
function areValuesEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) {
    return true;
  }
  if (Array.isArray(left) && Array.isArray(right)) {
    return (
      left.length === right.length &&
      left.every((value, index) => areValuesEqual(value, right[index]))
    );
  }
  if (isPlainObject(left) && isPlainObject(right)) {
    const leftEntries = Object.keys(left);
    const rightEntries = Object.keys(right);
    return (
      leftEntries.length === rightEntries.length &&
      leftEntries.every(key => areValuesEqual(left[key], right[key]))
    );
  }
  return false;
}

/**
 * Detects plain object records used by structural equality.
 *
 * @param value - Candidate value.
 * @returns Whether the value is a plain object record.
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    Boolean(value) && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype
  );
}

/**
 * Removes falsey optional children from authored child arrays.
 *
 * @param child - Candidate authored child entry.
 * @returns Whether the child should be compiled.
 */
function isPresentChild(
  child: ViewLayoutChild
): child is Exclude<ViewLayoutChild, null | false | undefined> {
  return Boolean(child);
}
