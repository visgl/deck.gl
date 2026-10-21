// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, vi} from 'vitest';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import type {Device} from '@luma.gl/core';

/**
 * Returns the shared luma.gl WebGPU test device.
 * Fails (never skips) when the browser has no WebGPU adapter.
 */
export async function getRequiredWebGPUDevice(): Promise<Device> {
  const gpu = (navigator as any).gpu;
  expect(gpu, 'navigator.gpu is available').toBeTruthy();
  const adapter = await gpu.requestAdapter();
  expect(adapter, 'navigator.gpu.requestAdapter() returns an adapter').not.toBeNull();

  const device = await getWebGPUTestDevice();
  expect(device, 'luma.gl WebGPU test device is created').toBeTruthy();
  return device as unknown as Device;
}

/**
 * Runs `callback` inside a WebGPU validation error scope and returns the first error, if any.
 * luma.gl wraps many calls in its own inner error scopes and routes those errors to
 * `device.reportError`, so errors reported there are captured as well.
 * Synchronous exceptions (e.g. OperationError from writeBuffer) are also returned.
 */
export async function getValidationError(
  device: Device,
  callback: () => unknown | Promise<unknown>
): Promise<Error | GPUError | null> {
  const gpuDevice = (device as any).handle as GPUDevice;
  const reportedErrors: Error[] = [];
  const reportErrorSpy = vi.spyOn(device, 'reportError').mockImplementation((error: Error) => {
    reportedErrors.push(error);
    return () => {};
  });

  let thrownError: Error | null = null;
  gpuDevice.pushErrorScope('validation');
  try {
    await callback();
  } catch (error) {
    thrownError = error as Error;
  }
  await gpuDevice.queue.onSubmittedWorkDone();
  const scopeError = await gpuDevice.popErrorScope();
  // Let luma.gl's inner popErrorScope() callbacks run
  await new Promise(resolve => setTimeout(resolve, 0));
  reportErrorSpy.mockRestore();

  return thrownError || scopeError || reportedErrors[0] || null;
}
