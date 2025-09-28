// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {_LoadingWidget} from '@deck.gl/widgets';
import type {LoadingWidgetProps} from '@deck.gl/widgets';
import {useWidget} from '../utils/use-widget';

/**
 * React wrapper for the LoadingWidget.
 */
export const LoadingWidget = (props: LoadingWidgetProps = {}) => {
  useWidget(_LoadingWidget, props);
  return null;
};
