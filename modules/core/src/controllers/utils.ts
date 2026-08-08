// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {getPosition, parsePosition} from '../utils/positions';

import type {CommonViewProps} from '../views/view';
import type Viewport from '../viewports/viewport';

export type MaxBoundsPadding = CommonViewProps<any>['padding'];

export type ResolvedPadding = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export type MaxBoundsRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type MaxBoundsExtents = ResolvedPadding;

/** Returns the on-screen rectangle available for fitting max bounds, with a one-pixel floor. */
export function getMaxBoundsRect(
  width: number,
  height: number,
  padding: MaxBoundsPadding
): MaxBoundsRect {
  const left = getPosition(parsePosition(padding?.left ?? 0), width);
  const right = getPosition(parsePosition(padding?.right ?? 0), width);
  const top = getPosition(parsePosition(padding?.top ?? 0), height);
  const bottom = getPosition(parsePosition(padding?.bottom ?? 0), height);
  const availableWidth = Math.max(1, width - left - right);
  const availableHeight = Math.max(1, height - top - bottom);
  // Keep an over-constrained one-pixel box centered between the requested edges.
  const centerX = (left + width - right) / 2;
  const centerY = (top + height - bottom) / 2;
  return {
    x: centerX - availableWidth / 2,
    y: centerY - availableHeight / 2,
    width: availableWidth,
    height: availableHeight
  };
}

/** Measures the available screen space on each side of the projected semantic target. */
export function getMaxBoundsExtents(
  viewport: Viewport,
  target: number[],
  rect: MaxBoundsRect
): MaxBoundsExtents {
  let [x, y] = viewport.project(target);
  // Custom controller states may provide a viewport that cannot project their
  // semantic target. Preserve the historical centered behavior in that case.
  x = Number.isFinite(x) ? x : viewport.width / 2;
  y = Number.isFinite(y) ? y : viewport.height / 2;
  return {
    left: x - rect.x,
    right: rect.x + rect.width - x,
    top: y - rect.y,
    bottom: rect.y + rect.height - y
  };
}
