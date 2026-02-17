// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {_OverviewMapWidget as OverviewMapWidgetClass} from '@deck.gl/widgets';
import type {OverviewMapWidgetProps} from '@deck.gl/widgets';
import {useWidget} from '../utils/use-widget';

export const OverviewMapWidget = (props: OverviewMapWidgetProps = {}) => {
  useWidget(OverviewMapWidgetClass, props);
  return null;
};
