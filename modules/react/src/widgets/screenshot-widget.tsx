// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {ScreenshotWidget as _ScreenshotWidget} from '@deck.gl/widgets';
import type {ScreenshotWidgetProps} from '@deck.gl/widgets';
import {useWidget} from '../utils/use-widget';

/**
 * React wrapper for the ScreenshotWidget.
 */
export const ScreenshotWidget = (props: ScreenshotWidgetProps = {}) => {
  useWidget(_ScreenshotWidget, props);
  return null;
};
