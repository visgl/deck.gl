// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {_GeolocateWidget} from '@deck.gl/widgets';
import type {GeolocateWidgetProps} from '@deck.gl/widgets';
import {useWidget} from '../utils/use-widget';

/**
 * React wrapper for the GeolocateWidget.
 */
export const GeolocateWidget = (props: GeolocateWidgetProps = {}) => {
  useWidget(_GeolocateWidget, props);
  return null;
};
