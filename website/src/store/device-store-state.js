// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export function createDeviceStoreState(requestDevice, persistDeviceType) {
  // Device creation is asynchronous. A monotonically increasing request identifier makes the
  // most recently selected tab authoritative, even when an earlier WebGPU request finishes last.
  let deviceRequestGeneration = 0;

  return set => ({
    deviceType: undefined,
    deviceError: undefined,
    device: undefined,
    setDeviceType: async deviceType => {
      const requestGeneration = ++deviceRequestGeneration;

      // Clear the old device immediately. makeExample unmounts the old DeckGL before mounting
      // a replacement, so WebGL and WebGPU never try to own the same canvas at the same time.
      set({deviceType, deviceError: undefined, device: undefined});

      let deviceError;
      let device;
      try {
        device = await requestDevice(deviceType);
      } catch (error) {
        deviceError = error.message;
      }

      // A newer tab selection wins. In particular, a slow WebGPU request must not replace a
      // subsequently selected WebGL device or overwrite the persisted device preference.
      if (requestGeneration !== deviceRequestGeneration) {
        return;
      }

      // Persist only the request that actually became current; stale completions are ignored.
      persistDeviceType(deviceType);
      return set({deviceType, deviceError, device});
    }
  });
}
