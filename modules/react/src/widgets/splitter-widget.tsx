// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {_SplitterWidget} from '@deck.gl/widgets';
import type {SplitterWidgetProps} from '@deck.gl/widgets';
import {useWidget} from '../utils/use-widget';

/**
 * React wrapper for the SplitterWidget.
 */
export const SplitterWidget = (props: SplitterWidgetProps) => {
  useWidget(_SplitterWidget, props);
  return null;
};
