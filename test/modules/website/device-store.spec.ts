// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {createDeviceStoreState} from '../../../website/src/store/device-store-state';

test('device store suspends rendering and ignores a stale device request', async () => {
  const webglDevice = {id: 'webgl-device', type: 'webgl'};
  const webgpuDevice = {id: 'webgpu-device', type: 'webgpu'};
  const persistedDeviceTypes: string[] = [];
  let resolveWebGPUDevice: ((device: typeof webgpuDevice) => void) | undefined;
  const webgpuDevicePromise = new Promise<typeof webgpuDevice>(resolve => {
    resolveWebGPUDevice = resolve;
  });

  const requestDevice = (type: string) =>
    type === 'webgpu' ? webgpuDevicePromise : Promise.resolve(webglDevice);
  type DeviceState = {
    deviceType?: string;
    deviceError?: string;
    device?: typeof webglDevice | typeof webgpuDevice;
    setDeviceType: (type: string) => Promise<void>;
  };
  const initializeStore = createDeviceStoreState(requestDevice, (type: string) =>
    persistedDeviceTypes.push(type)
  );
  let state: DeviceState;
  const setState = (partialState: Partial<DeviceState>) => {
    state = {...state, ...partialState};
  };
  state = initializeStore(setState);

  await state.setDeviceType('webgl');
  expect(state.device).toBe(webglDevice);

  const pendingWebGPUSwitch = state.setDeviceType('webgpu');
  expect(state).toMatchObject({
    deviceType: 'webgpu',
    device: undefined
  });

  await state.setDeviceType('webgl');
  resolveWebGPUDevice?.(webgpuDevice);
  await pendingWebGPUSwitch;

  expect(state).toMatchObject({
    deviceType: 'webgl',
    device: webglDevice
  });
  expect(persistedDeviceTypes).toEqual(['webgl', 'webgl']);
});
