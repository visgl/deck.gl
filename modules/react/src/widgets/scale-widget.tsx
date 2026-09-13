// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {_ScaleWidget} from '@deck.gl/widgets';
import type {ScaleWidgetProps} from '@deck.gl/widgets';
import {useWidget} from '../utils/use-widget';

/**
 * React wrapper for the ScaleWidget.
 */
export const ScaleWidget = (props: ScaleWidgetProps = {}) => {
  useWidget(_ScaleWidget, props);
  return null;
};
