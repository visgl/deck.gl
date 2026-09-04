// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export type ContinuitySettlementState = {
  activePageLoadCount: number;
  isCameraInteracting: boolean;
  pageRequestCount: number;
  traversalPending: boolean;
};

export type RefinementTraversalState = {
  activePageLoadCount: number;
  isCameraInteracting: boolean;
  traversalPending: boolean;
};

export type TraversalPhase = 'camera-update' | 'settled-refinement';

export type RefinementFoveation = {
  center: [number, number];
  radius: number;
  strength: number;
};

const CAMERA_UPDATE_TRAVERSAL_ROWS = 4_095;
const SETTLED_REFINEMENT_TRAVERSAL_ROWS = 65_535;
const CONCURRENT_PAGE_LOAD_LIMIT = 8;

/** Returns a small synchronous camera slice or a larger center-first refinement slice. */
export function getTraversalRowBudget(phase: TraversalPhase): number {
  return phase === 'camera-update'
    ? CAMERA_UPDATE_TRAVERSAL_ROWS
    : SETTLED_REFINEMENT_TRAVERSAL_ROWS;
}

/** Returns the bounded transport width used to fill newly exposed current-view detail. */
export function getConcurrentPageLoadLimit(): number {
  return CONCURRENT_PAGE_LOAD_LIMIT;
}

/** Returns the current-view page capacity while preserving optional transition headroom. */
export function getResidencySplatCapacity(
  steadySplatCapacity: number,
  transitionSplatCapacity: number,
  isTransitionActive: boolean
): number {
  return steadySplatCapacity + (isTransitionActive ? transitionSplatCapacity : 0);
}

/** Returns a stable screen-center fovea for center-first hierarchy refinement and page loading. */
export function getRefinementFoveation(): RefinementFoveation {
  return {
    center: [0.5, 0.5],
    radius: 0.12,
    strength: 12
  };
}

/** Returns whether an unchanged camera can refine without racing an active page-admission batch. */
export function shouldAdvanceRefinementTraversal(state: RefinementTraversalState): boolean {
  return !state.isCameraInteracting && state.activePageLoadCount === 0 && state.traversalPending;
}

/** Returns whether a camera update should synchronously retarget and republish the hierarchy. */
export function shouldRetargetHierarchyForCameraUpdate(isCameraInteracting: boolean): boolean {
  return !isCameraInteracting;
}

/** Returns whether traversal and every current-view page request have completed. */
export function isContinuityViewSettled(state: ContinuitySettlementState): boolean {
  return (
    !state.isCameraInteracting &&
    !state.traversalPending &&
    state.pageRequestCount === 0 &&
    state.activePageLoadCount === 0
  );
}
