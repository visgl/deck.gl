// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {Device} from '@luma.gl/core';

export function getDeviceLimit(device: Device, limitName: string): number {
  return (device.limits as unknown as Record<string, number | undefined>)[limitName] ?? 0;
}

export function supportsVertexStorageBuffers(device: Device, requiredBufferCount = 1): boolean {
  return (
    device.type === 'webgpu' &&
    getDeviceLimit(device, 'maxStorageBuffersInVertexStage') >= requiredBufferCount
  );
}
