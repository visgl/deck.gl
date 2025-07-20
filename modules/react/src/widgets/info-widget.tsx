// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {_InfoWidget} from '@deck.gl/widgets';
import type {InfoWidgetProps} from '@deck.gl/widgets';
import {useWidget} from '../utils/use-widget';

/**
 * React wrapper for the InfoWidget.
 */
export const InfoWidget = (props: InfoWidgetProps) => {
  useWidget(_InfoWidget, props);
  return null;
};
