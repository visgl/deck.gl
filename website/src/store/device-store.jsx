// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {create} from 'zustand';

import {luma, Device} from '@luma.gl/core';
import {webgl2Adapter} from '@luma.gl/webgl';
import {webgpuAdapter} from '@luma.gl/webgpu';

const cachedDevice = {};
const DEVICE_TYPE_STORAGE_KEY = 'deck-device-type';

function getStoredDeviceType() {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const storedDeviceType = window.localStorage.getItem(DEVICE_TYPE_STORAGE_KEY);
  return storedDeviceType === 'webgl' || storedDeviceType === 'webgpu'
    ? storedDeviceType
    : undefined;
}

export async function createDevice(type) {
  cachedDevice[type] =
    cachedDevice[type] ||
    luma.createDevice({
      adapters: [webgl2Adapter, webgpuAdapter],
      type,
      createCanvasContext: {
        container: 'deckgl-wrapper',
        alphaMode: 'premultiplied',
        useDevicePixels: true,
        autoResize: true,
        width: undefined,
        height: undefined,
      },
    });
  return await cachedDevice[type];
}

export const useStore = create(set => ({
  deviceType: undefined,
  deviceError: undefined,
  device: undefined,
  setDeviceType: async (deviceType) => {
    let deviceError;
    let device;
    try {
      device = await createDevice(deviceType);
    } catch (error) {
      deviceError = error.message;
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DEVICE_TYPE_STORAGE_KEY, deviceType);
    }
    return set(state => ({deviceType, deviceError, device}));
  },
}));

const storedDeviceType = getStoredDeviceType();
if (storedDeviceType) {
  void useStore.getState().setDeviceType(storedDeviceType);
}
