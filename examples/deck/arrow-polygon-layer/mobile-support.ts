// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {ExampleSupportDefinition} from '../../example-support';

const exampleSupport = {
  id: 'deck/arrow-polygon-layer',
  mobileMode: 'reduced',
  mobileProfile: 'dense',
  requirements: {backends: ['webgpu', 'webgl2']}
} satisfies ExampleSupportDefinition;

export default exampleSupport;
