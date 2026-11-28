// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {_GeocoderWidget} from '@deck.gl/widgets';
import type {GeocoderWidgetProps} from '@deck.gl/widgets';
import {useWidget} from '../utils/use-widget';

/**
 * React wrapper for the GeocoderWidget.
 */
export const GeocoderWidget = (props: GeocoderWidgetProps = {}) => {
  useWidget(_GeocoderWidget, props);
  return null;
};
