// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {CompassWidget as _CompassWidget} from '@deck.gl/widgets';
import type {CompassWidgetProps} from '@deck.gl/widgets';
import {useWidget} from '../utils/use-widget';

export const CompassWidget = (props: CompassWidgetProps = {}) => {
  useWidget(_CompassWidget, props);
  return null;
};
