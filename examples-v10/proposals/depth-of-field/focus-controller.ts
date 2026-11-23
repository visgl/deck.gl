// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

/** Smoothly racks focus in reciprocal distance (diopters), with an optional five-second tour. */
export class FocusController {
  automatic = true;
  selectedIndex = -1;
  private nextSelectionTime = 0;
  private lastUpdateTime?: number;
  private inverseDistance?: number;

  select(index: number): void {
    this.selectedIndex = index;
    this.automatic = false;
  }

  setAutomatic(enabled: boolean, time: number): void {
    this.automatic = enabled;
    this.nextSelectionTime = time + 5;
  }

  updateSelection(time: number, candidates: readonly number[]): void {
    if (!this.automatic || !candidates.length) return;
    if (this.selectedIndex >= 0 && time < this.nextSelectionTime) return;
    const currentIndex = candidates.indexOf(this.selectedIndex);
    this.selectedIndex = candidates[(currentIndex + 1) % candidates.length];
    this.nextSelectionTime = time + 5;
  }

  updateDistance(time: number, targetDistance: number): number {
    const targetInverseDistance = 1 / Math.max(targetDistance, 0.0001);
    if (this.inverseDistance === undefined) this.inverseDistance = targetInverseDistance;
    const elapsed = this.lastUpdateTime === undefined ? 0 : Math.max(0, time - this.lastUpdateTime);
    // Frame-rate-independent easing also follows the focused building while the camera moves.
    const blend = 1 - Math.exp(-elapsed / 0.65);
    this.inverseDistance += (targetInverseDistance - this.inverseDistance) * blend;
    this.lastUpdateTime = time;
    return 1 / this.inverseDistance;
  }
}
