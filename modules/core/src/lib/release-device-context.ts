// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Device} from '@luma.gl/core';

/** A canvas that a Deck created a device for. */
export type DeviceCanvas = HTMLCanvasElement | OffscreenCanvas;

/** A device that a Deck created, recorded so it can be released after the Deck is finalized. */
export type CreatedDevice = {
  /** The canvas the device renders to. */
  canvas: DeviceCanvas;
  /** The device, which may still be initializing. `null` if Deck reused a device it didn't create. */
  device: Promise<Device | null>;
  /** Whether Deck created the canvas too, and so removes it when it is finalized. */
  ownsCanvas: boolean;
};

/**
 * The canvas a device renders to, or `null` if it has none.
 * @param device A luma.gl device.
 */
export function getDeviceCanvas(device: Device): DeviceCanvas | null {
  try {
    return device.getDefaultCanvasContext().canvas;
  } catch {
    return null;
  }
}

/** Live Decks sharing a canvas and any wrapper awaiting their final release. */
const canvasUsers = new WeakMap<
  DeviceCanvas,
  {count: number; teardowns?: Map<Device, () => void>}
>();

/** Records a Deck rendering to this canvas. */
export function retainCanvas(canvas: DeviceCanvas): void {
  const users = canvasUsers.get(canvas);
  if (users) {
    users.count++;
  } else {
    canvasUsers.set(canvas, {count: 1});
  }
}

/** Releases a Deck's use of the canvas and runs any pending teardown. */
export function releaseCanvas(canvas: DeviceCanvas): void {
  const users = canvasUsers.get(canvas);
  if (users && --users.count === 0) {
    canvasUsers.delete(canvas);
    for (const teardown of users.teardowns?.values() ?? []) {
      teardown();
    }
  }
}

/**
 * Destroys Deck's wrapper after its last Deck user departs. If a wrapper owns the WebGL
 * context of a supplied canvas, wait a task and check that the canvas has been removed.
 * React StrictMode can remount on the same canvas during that task.
 */
export function destroyCreatedDevice({canvas, device, ownsCanvas}: CreatedDevice): void {
  void device.then(created => {
    if (!created) {
      return;
    }
    const waitForRemoval = !ownsCanvas && created.type === 'webgl' && created.ownsHandle;
    const destroy = () => {
      if (waitForRemoval && 'isConnected' in canvas && canvas.isConnected) {
        return;
      }
      const users = canvasUsers.get(canvas);
      if (users) {
        (users.teardowns ??= new Map()).set(created, destroy);
      } else {
        created.destroy();
      }
    };
    if (waitForRemoval) {
      setTimeout(destroy, 0);
    } else {
      destroy();
    }
  });
}
