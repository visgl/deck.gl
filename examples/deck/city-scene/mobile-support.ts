// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {ExampleSupportDefinition} from '../../example-support';

export default {
  id: 'deck/city-scene',
  mobileMode: 'full',
  mobileProfile: 'standard',
  requirements: {backends: ['webgpu', 'webgl2']}
} satisfies ExampleSupportDefinition;
