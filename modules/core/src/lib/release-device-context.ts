// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Finalizing a Deck doesn't free its WebGL context: luma.gl leaves it to garbage collection, and
// browsers cap the number of live contexts per page, dropping the oldest one first. These helpers
// release the context of a device Deck created, once nothing can render to its canvas again.

import type {Device} from '@luma.gl/core';

/** A canvas that a Deck created a device for. */
export type DeviceCanvas = HTMLCanvasElement | OffscreenCanvas;

/** A device that a Deck created, recorded so it can be released after the Deck is finalized. */
export type CreatedDevice = {
  /** The canvas the device renders to. */
  canvas: DeviceCanvas;
  /** The device, which may still be initializing. */
  device: Promise<Device>;
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

/** Number of live Decks rendering to each canvas. */
const liveDecks = new WeakMap<DeviceCanvas, number>();

/** Releases waiting for the last Deck on a canvas to stop, such as one that borrowed a device. */
const pendingReleases = new WeakMap<DeviceCanvas, () => void>();

/**
 * Records that a Deck renders to `canvas`. Call {@link releaseCanvas} once when it stops.
 * @param canvas The canvas of the Deck's device.
 */
export function retainCanvas(canvas: DeviceCanvas): void {
  liveDecks.set(canvas, (liveDecks.get(canvas) ?? 0) + 1);
}

/**
 * Records that a Deck no longer renders to `canvas`.
 * @param canvas The canvas passed to {@link retainCanvas}.
 */
export function releaseCanvas(canvas: DeviceCanvas): void {
  const count = (liveDecks.get(canvas) ?? 1) - 1;
  if (count > 0) {
    liveDecks.set(canvas, count);
  } else {
    liveDecks.delete(canvas);
    const pending = pendingReleases.get(canvas);
    pendingReleases.delete(canvas);
    pending?.();
  }
}

/** Whether a canvas is in the document. An `OffscreenCanvas` never is. */
function isInDocument(canvas: DeviceCanvas): boolean {
  return 'isConnected' in canvas && canvas.isConnected;
}

/**
 * Loses a created device once it has initialized. If a Deck still renders to its canvas, for
 * example one that was passed the device, the release waits until the last such Deck stops.
 * @param created The device to release.
 * @param canRelease Checked again just before the device is lost.
 */
export function loseCreatedDevice(
  created: CreatedDevice,
  canRelease: () => boolean = () => true
): void {
  const release = () => {
    created.device.then(
      device => {
        if (liveDecks.has(created.canvas)) {
          pendingReleases.set(created.canvas, release);
        } else if (!device.isLost && canRelease()) {
          device.loseDevice();
        }
      },
      () => {
        // Device creation failed, so there is no context to release.
      }
    );
  };
  release();
}

/**
 * Releases the WebGL context of a finalized Deck once its canvas has left the document.
 *
 * For components that render their own `<canvas>` and pass it to Deck, such as the React
 * `DeckGL` components. Call it right after `deck.finalize()` when the component unmounts. After
 * the current task, if the canvas is no longer in the document and no other Deck has started on
 * it, the device is lost. A remount that keeps the canvas in the document, such as React
 * StrictMode or `<Activity mode="hidden">`, is unaffected.
 *
 * Does nothing when the app passed its own `device` or `gl`, or when Deck created the canvas
 * (`finalize()` already releases those).
 *
 * Don't call it if the component may later start a new Deck on the same canvas after it has
 * left the document: a canvas only ever has one WebGL context, so that Deck would get the lost one.
 * @param deck A finalized Deck.
 */
export function releaseCanvasContext(deck: {readonly _createdDevice: CreatedDevice | null}): void {
  const created = deck._createdDevice;
  if (!created || created.ownsCanvas) {
    return;
  }
  const {canvas} = created;
  setTimeout(() => {
    if (!isInDocument(canvas)) {
      loseCreatedDevice(created, () => !isInDocument(canvas));
    }
  }, 0);
}
