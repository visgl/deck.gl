// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe, expect, it} from 'vitest';
import {
  getConcurrentPageLoadLimit,
  getRefinementFoveation,
  getResidencySplatCapacity,
  getTraversalRowBudget,
  isContinuityViewSettled,
  shouldAdvanceRefinementTraversal,
  shouldRetargetHierarchyForCameraUpdate
} from '../../../examples/experimental/gaussian-splats/coit-frontier-retention';

describe('frontier continuity', () => {
  it('uses an eight-request transport limit for newly exposed detail', () => {
    expect(getConcurrentPageLoadLimit()).toBe(8);
  });

  it('preserves transition headroom as the steady frontier footprint grows', () => {
    expect(getResidencySplatCapacity(15_000_000, 5_000_000, true)).toBe(20_000_000);
    expect(getResidencySplatCapacity(17_000_000, 5_000_000, true)).toBe(22_000_000);
    expect(getResidencySplatCapacity(17_000_000, 5_000_000, false)).toBe(17_000_000);
  });

  it('keeps a tight refinement fovea fixed at screen center', () => {
    expect(getRefinementFoveation()).toEqual({
      center: [0.5, 0.5],
      radius: 0.12,
      strength: 12
    });
  });

  it('spends substantially more traversal work after camera interaction settles', () => {
    const cameraUpdateBudget = getTraversalRowBudget('camera-update');
    const settledRefinementBudget = getTraversalRowBudget('settled-refinement');

    expect(cameraUpdateBudget).toBe(4_095);
    expect(settledRefinementBudget).toBe(65_535);
    expect(settledRefinementBudget).toBeGreaterThanOrEqual(cameraUpdateBudget * 16);
  });

  it('defers hierarchy retargeting while camera interaction is active', () => {
    expect(shouldRetargetHierarchyForCameraUpdate(true)).toBe(false);
    expect(shouldRetargetHierarchyForCameraUpdate(false)).toBe(true);
  });

  it('waits for the active page-admission batch before restarting refinement', () => {
    expect(
      shouldAdvanceRefinementTraversal({
        activePageLoadCount: 4,
        isCameraInteracting: false,
        traversalPending: true
      })
    ).toBe(false);
    expect(
      shouldAdvanceRefinementTraversal({
        activePageLoadCount: 0,
        isCameraInteracting: false,
        traversalPending: true
      })
    ).toBe(true);
  });

  it('does not settle while a current-view page is queued or loading', () => {
    expect(
      isContinuityViewSettled({
        activePageLoadCount: 0,
        isCameraInteracting: false,
        pageRequestCount: 1,
        traversalPending: false
      })
    ).toBe(false);
    expect(
      isContinuityViewSettled({
        activePageLoadCount: 1,
        isCameraInteracting: false,
        pageRequestCount: 0,
        traversalPending: false
      })
    ).toBe(false);
    expect(
      isContinuityViewSettled({
        activePageLoadCount: 0,
        isCameraInteracting: false,
        pageRequestCount: 0,
        traversalPending: false
      })
    ).toBe(true);
  });

  it('never publishes a settled replacement during camera interaction', () => {
    expect(
      isContinuityViewSettled({
        activePageLoadCount: 0,
        isCameraInteracting: true,
        pageRequestCount: 0,
        traversalPending: false
      })
    ).toBe(false);
  });
});
