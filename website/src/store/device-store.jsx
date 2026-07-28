// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {create} from 'zustand';

import {luma, Device} from '@luma.gl/core';
import {webgl2Adapter} from '@luma.gl/webgl';
import {webgpuAdapter} from '@luma.gl/webgpu';
import {createDeviceStoreState} from './device-store-state';

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
  cachedDevice[type] =
    cachedDevice[type] ||
    luma
      .createDevice({
        adapters: [webgl2Adapter, webgpuAdapter],
        type,
        createCanvasContext: {
          // Deck moves a detached external-device canvas into its React wrapper on initialization.
          // Creating it in a detached container avoids depending on a wrapper that may not be
          // mounted yet while a device switch is pending.
          container: document.createElement('div'),
          alphaMode: 'premultiplied',
          useDevicePixels: true,
          autoResize: true,
          width: undefined,
          height: undefined
        }
      })
      .catch(error => {
        delete cachedDevice[type];
        throw error;
      });
  return await cachedDevice[type];
}

export const useStore = create(createDeviceStoreState(createDevice, storeDeviceType));

if (typeof window !== 'undefined') {
  void useStore.getState().setDeviceType(getStoredDeviceType() || 'webgl');
}
