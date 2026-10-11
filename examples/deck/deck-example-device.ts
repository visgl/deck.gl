// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {Device} from '@luma.gl/core';
import {
  ShaderAssembler,
  type GLSLShaderAssembler,
  type WGSLShaderAssembler
} from '@luma.gl/shadertools';
import {webgl2Adapter} from '@luma.gl/webgl';
import {webgpuAdapter} from '@luma.gl/webgpu';

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

/** Bridges exactly one legacy Deck assembler call while preserving strict language separation. */
export function installLegacyDeckShaderAssemblerCompatibility(device: Device): () => void {
  const original = ShaderAssembler.getDefaultShaderAssembler;
  let restored = false;

  function restore(): void {
    if (restored) return;
    if (ShaderAssembler.getDefaultShaderAssembler === getLegacyDeckShaderAssembler) {
      ShaderAssembler.getDefaultShaderAssembler = original;
    }
    restored = true;
  }

  function getLegacyDeckShaderAssembler(shaderLanguage: 'glsl'): GLSLShaderAssembler;
  function getLegacyDeckShaderAssembler(shaderLanguage: 'wgsl'): WGSLShaderAssembler;
  function getLegacyDeckShaderAssembler(
    shaderLanguage: 'glsl' | 'wgsl'
  ): GLSLShaderAssembler | WGSLShaderAssembler;
  function getLegacyDeckShaderAssembler(
    shaderLanguage?: 'glsl' | 'wgsl'
  ): GLSLShaderAssembler | WGSLShaderAssembler {
    if (shaderLanguage === undefined) {
      // TODO: Remove after deck.gl forwards its known shading language to luma.gl.
      // Restore before forwarding so later user calls retain strict explicit-language behavior.
      restore();
      return device.info.shadingLanguage === 'wgsl'
        ? original.call(ShaderAssembler, 'wgsl')
        : original.call(ShaderAssembler, 'glsl');
    }
    const shaderAssembler =
      shaderLanguage === 'wgsl'
        ? original.call(ShaderAssembler, 'wgsl')
        : original.call(ShaderAssembler, 'glsl');
    // deck.gl 9.4 passes its language explicitly, so the compatibility hook can be removed
    // immediately after the first bridged call instead of waiting for a legacy no-argument call.
    restore();
    return shaderAssembler;
  }

  ShaderAssembler.getDefaultShaderAssembler = getLegacyDeckShaderAssembler;
  return restore;
}
