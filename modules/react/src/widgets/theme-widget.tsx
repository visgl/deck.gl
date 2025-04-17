// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {_ThemeWidget} from '@deck.gl/widgets';
import type {ThemeWidgetProps} from '@deck.gl/widgets';
import {useWidget} from '../utils/use-widget';

/**
 * React wrapper for the ThemeWidget.
 */
export const ThemeWidget = (props: ThemeWidgetProps = {}) => {
  useWidget(_ThemeWidget, props);
  return null;
};
