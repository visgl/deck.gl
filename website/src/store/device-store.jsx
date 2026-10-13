// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {create} from 'zustand';

import {luma, Device} from '@luma.gl/core';
import {webgl2Adapter} from '@luma.gl/webgl';
import {webgpuAdapter} from '@luma.gl/webgpu';
import {createDeviceStoreState} from './device-store-state';

// A backend's canvas and GPU resources belong to its Device. Reuse the same pending/resolved
// device when navigating examples or switching WebGPU -> WebGL -> WebGPU.
const cachedDevice = {};
const DEVICE_TYPE_STORAGE_KEY = 'deck-device-type';

function getStoredDeviceType() {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    const storedDeviceType = window.localStorage.getItem(DEVICE_TYPE_STORAGE_KEY);
    return storedDeviceType === 'webgl' || storedDeviceType === 'webgpu'
      ? storedDeviceType
      : undefined;
  } catch {
    // Some browser policies block localStorage access. Persistence is best-effort.
    return undefined;
  }
}

function storeDeviceType(deviceType) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(DEVICE_TYPE_STORAGE_KEY, deviceType);
  } catch {
    // Some browser policies block localStorage access. Persistence is best-effort.
  }
}

export async function createDevice(type) {
  // Cache the promise, rather than only the resolved device, so concurrent requests for the
  // same backend cannot initialize two devices against the same canvas.
  cachedDevice[type] =
    cachedDevice[type] ||
    luma
      .createDevice({
        adapters: [webgl2Adapter, webgpuAdapter],
        type,
        createCanvasContext: {
          // A switch deliberately unmounts the previous demo before the next one exists. The
          // target `deckgl-wrapper` therefore may not be in the DOM when the device is created.
          // Create the canvas in a detached container; Deck inserts that existing canvas into
          // the newly mounted React wrapper after the device has initialized.
          container: document.createElement('div'),
          alphaMode: 'premultiplied',
          useDevicePixels: true,
          autoResize: true,
          width: undefined,
          height: undefined
        }
      })
      .catch(error => {
        // A failed initialization must not poison the cache: selecting the same tab again
        // should attempt to create a fresh device rather than replaying a rejected promise.
        delete cachedDevice[type];
        throw error;
      });
  return await cachedDevice[type];
}

export const useStore = create(createDeviceStoreState(createDevice, storeDeviceType));

if (typeof window !== 'undefined') {
  // Browser-only initialization keeps Docusaurus server-side rendering free of document/GPU
  // access. WebGL is the initial fallback when the user has no persisted backend preference.
  void useStore.getState().setDeviceType(getStoredDeviceType() || 'webgl');
}
