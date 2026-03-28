// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {create} from 'zustand';

import {luma, Device} from '@luma.gl/core';
import {webgl2Adapter} from '@luma.gl/webgl';
import {webgpuAdapter} from '@luma.gl/webgpu';

const cachedDevice = {};

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
    return set(state => ({deviceType, deviceError, device}));
  },
}));
