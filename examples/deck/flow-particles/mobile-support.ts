// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors
import type {ExampleSupportDefinition} from '../../example-support';
const exampleSupport = {
  id: 'deck/flow-particles',
  mobileMode: 'full',
  mobileProfile: 'standard',
  requirements: {backends: ['webgpu', 'webgl2']}
} satisfies ExampleSupportDefinition;
export default exampleSupport;
