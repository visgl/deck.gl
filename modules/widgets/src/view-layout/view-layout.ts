// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {View} from '@deck.gl/core';

/** Discriminated plain-object layout tree accepted by the view layout compiler. */
export type ViewLayout =
  | ColumnViewLayout
  | RowViewLayout
  | SplitViewLayout
  | OverlayViewLayout
  | SpacerViewLayout;

/** CSS-like length accepted by the view layout builder. */
export type ViewLayoutLength = number | string;

/** Insets applied inside an allocated child rectangle before compiling its contents. */
export type ViewLayoutInsets = {
  /** Top inset in pixels. */
  top?: number;
  /** Right inset in pixels. */
  right?: number;
  /** Bottom inset in pixels. */
  bottom?: number;
  /** Left inset in pixels. */
  left?: number;
};

/** A raw deck.gl view or nested layout object allowed inside `children`. */
export type ViewLayoutChild = ViewLayout | View | null | false | undefined;

/** Common layout metadata shared by every authored layout item. */
export type ViewLayoutBaseProps = {
  /** Optional width expression resolved against the current parent bounds. */
  width?: ViewLayoutLength;
  /** Optional height expression resolved against the current parent bounds. */
  height?: ViewLayoutLength;
  /** Optional insets applied after parent layout allocation. */
  inset?: ViewLayoutInsets;
};

/** Optional split metadata for a row or column with exactly two children. */
export type ViewLayoutSplitProps = {
  /** Stable id for a user-adjustable split between the two children. */
  splitId?: string;
  /** Initial ratio of the first child's share over the stack axis. */
  initialSplit?: number;
  /** Minimum split ratio. */
  minSplit?: number;
  /** Maximum split ratio. */
  maxSplit?: number;
};

/** One horizontal layout container that splits width among its children. */
export type RowViewLayout = ViewLayoutBaseProps &
  ViewLayoutSplitProps & {
    /** Discriminator for horizontal stack layout. */
    type: 'row';
    /** Ordered child items or raw deck views. */
    children: readonly ViewLayoutChild[];
  };

/** One vertical layout container that splits height among its children. */
export type ColumnViewLayout = ViewLayoutBaseProps &
  ViewLayoutSplitProps & {
    /** Discriminator for vertical stack layout. */
    type: 'column';
    /** Ordered child items or raw deck views. */
    children: readonly ViewLayoutChild[];
  };

/** Split layout container using the same orientation/views shape as SplitterWidgetViewLayout. */
export type SplitViewLayout = ViewLayoutBaseProps &
  ViewLayoutSplitProps & {
    /** Split axis. Horizontal splits width; vertical splits height. */
    orientation: 'horizontal' | 'vertical';
    /** Ordered child items or raw deck views. */
    views: readonly ViewLayoutChild[];
  };

export type ViewLayoutWithChildren =
  | ColumnViewLayout
  | RowViewLayout
  | SplitViewLayout
  | OverlayViewLayout;

/** One overlay container that gives each child the same parent bounds. */
export type OverlayViewLayout = ViewLayoutBaseProps & {
  /** Discriminator for overlay layout. */
  type: 'overlay';
  /** Ordered child items or raw deck views. */
  children: readonly ViewLayoutChild[];
};

/** One empty slot used to reserve fixed or flexible space in a stack. */
export type SpacerViewLayout = ViewLayoutBaseProps & {
  /** Discriminator for an empty spacer item. */
  type: 'spacer';
};

const VIEW_LAYOUT_TYPES = new Set(['row', 'column', 'overlay', 'spacer']);
const VIEW_LAYOUT_ORIENTATIONS = new Set(['horizontal', 'vertical']);

/** Returns true when a child is a plain view layout object instead of a deck.gl View. */
export function isViewLayout(child: ViewLayoutChild): child is ViewLayout {
  return Boolean(
    child &&
      typeof child === 'object' &&
      !(child instanceof View) &&
      (('type' in child && VIEW_LAYOUT_TYPES.has(String(child.type))) ||
        ('orientation' in child && VIEW_LAYOUT_ORIENTATIONS.has(String(child.orientation))))
  );
}

/** Resolves the canonical layout type for either the type/children or orientation/views syntax. */
export function getViewLayoutType(item: ViewLayout): 'row' | 'column' | 'overlay' | 'spacer' {
  if ('orientation' in item) {
    return item.orientation === 'horizontal' ? 'row' : 'column';
  }
  return item.type;
}

/** Resolves child entries for either the type/children or orientation/views syntax. */
export function getViewLayoutChildren(item: ViewLayoutWithChildren): readonly ViewLayoutChild[] {
  return 'views' in item ? item.views : item.children;
}

/**
 * Validates one discriminated-union plain object before compiling it.
 *
 * @param item - Candidate layout item.
 */
export function assertViewLayout(item: ViewLayout): void {
  if (!item || typeof item !== 'object') {
    throw new Error('ViewLayout must be an object.');
  }

  const type = getViewLayoutType(item);
  switch (type) {
    case 'row':
    case 'column':
    case 'overlay': {
      const children = getViewLayoutChildren(item as ViewLayoutWithChildren);
      if (!Array.isArray(children)) {
        throw new Error('ViewLayout requires a children or views array.');
      }
      if (isSplitLayoutItem(item) && item.splitId) {
        if (children.filter(Boolean).length !== 2) {
          throw new Error('ViewLayout with splitId requires two children.');
        }
      }
      children.forEach(assertViewLayoutChild);
      break;
    }
    case 'spacer':
      break;
    default:
      throw new Error(`Unsupported view layout item: ${String(type)}`);
  }
}

function isSplitLayoutItem(
  item: ViewLayout
): item is RowViewLayout | ColumnViewLayout | SplitViewLayout {
  const type = getViewLayoutType(item);
  return type === 'row' || type === 'column';
}

function assertViewLayoutChild(child: ViewLayoutChild): void {
  if (!child) {
    return;
  }
  if (isViewLayout(child)) {
    assertViewLayout(child);
    return;
  }
  if (child instanceof View) {
    return;
  }
  throw new Error('ViewLayout children must be deck.gl View instances or layout objects.');
}
