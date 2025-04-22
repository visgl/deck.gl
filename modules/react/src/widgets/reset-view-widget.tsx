// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {ResetViewWidget as _ResetViewWidget} from '@deck.gl/widgets';
import type {ResetViewWidgetProps} from '@deck.gl/widgets';
import {useWidget} from '../utils/use-widget';

/**
 * React wrapper for the ResetViewWidget.
 */
export const ResetViewWidget = (props: ResetViewWidgetProps = {}) => {
  useWidget(_ResetViewWidget, props);
  return null;
};
