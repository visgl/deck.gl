// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {ZoomWidget as _ZoomWidget} from '@deck.gl/widgets';
import type {ZoomWidgetProps} from '@deck.gl/widgets';
import {useWidget} from '../utils/use-widget';

export const ZoomWidget = (props: ZoomWidgetProps = {}) => {
  useWidget(_ZoomWidget, props);
  return null;
};
