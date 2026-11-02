// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {Device} from '@luma.gl/core';
import {webgl2Adapter} from '@luma.gl/core/webgl';
import {webgpuAdapter} from '@luma.gl/core/webgpu';

/** GPU backend exposed by the standalone and website-hosted deck.gl examples. */
export type DeckExampleDeviceType = 'webgl' | 'webgpu';

/** Device selection accepted by standalone and website-hosted deck.gl examples. */
export type DeckExampleDeviceOptions = {
  /** Reuse a caller-owned device, such as the device selected by the website DeviceTabs. */
  device?: Device;
  /** Backend Deck should request when it owns device creation. */
  deviceType?: DeckExampleDeviceType;
};

/** Honors an explicit backend; otherwise prefers a usable WebGPU adapter over WebGL2. */
export async function resolveDeckExampleDeviceType(
  requestedType: string | null
): Promise<DeckExampleDeviceType> {
  if (requestedType === 'webgpu' || requestedType === 'webgl') return requestedType;
  try {
    return (await navigator.gpu?.requestAdapter()) ? 'webgpu' : 'webgl';
  } catch {
    return 'webgl';
  }
}

/** Returns the luma.gl device request used when Deck creates its presentation device. */
export function getDeckExampleDeviceProps(deviceType: DeckExampleDeviceType) {
  return {
    type: deviceType,
    adapters: deviceType === 'webgpu' ? [webgpuAdapter, webgl2Adapter] : [webgl2Adapter]
  };
}

/** Resolves host device selection into Deck construction props. */
export function getDeckExampleProps({device, deviceType = 'webgpu'}: DeckExampleDeviceOptions) {
  return device ? {device} : {deviceProps: getDeckExampleDeviceProps(deviceType)};
}
