// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export function createDeviceStoreState(requestDevice, persistDeviceType) {
  let deviceRequestGeneration = 0;

  return set => ({
    deviceType: undefined,
    deviceError: undefined,
    device: undefined,
    setDeviceType: async deviceType => {
      const requestGeneration = ++deviceRequestGeneration;
      set({deviceType, deviceError: undefined, device: undefined});

      let deviceError;
      let device;
      try {
        device = await requestDevice(deviceType);
      } catch (error) {
        deviceError = error.message;
      }

      if (requestGeneration !== deviceRequestGeneration) {
        return;
      }

      persistDeviceType(deviceType);
      return set({deviceType, deviceError, device});
    }
  });
}
