// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {ExampleSupportDefinition} from '../../example-support';

const exampleSupport = {
  id: 'deck/soft-shadows',
  mobileMode: 'full',
  mobileProfile: 'standard',
  requirements: {backends: ['webgpu']}
} satisfies ExampleSupportDefinition;

export default exampleSupport;
