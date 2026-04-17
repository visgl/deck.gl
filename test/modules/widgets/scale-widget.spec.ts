// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterEach, test, expect, vi} from 'vitest';
import {_ScaleWidget as ScaleWidget} from '@deck.gl/widgets';
import {WidgetTester} from './common';

let testInstance: WidgetTester<any> | undefined;

afterEach(() => {
  testInstance?.destroy();
  testInstance = undefined;
});

test('ScaleWidget', async () => {
  testInstance = new WidgetTester({
    widgets: [new ScaleWidget()]
  });

  await testInstance.idle();
});
