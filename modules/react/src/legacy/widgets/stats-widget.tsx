// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {_StatsWidget} from '@deck.gl/widgets';
import type {StatsWidgetProps} from '@deck.gl/widgets';
import {useWidget} from '../utils/use-widget';

export const StatsWidget = (props: StatsWidgetProps = {}) => {
  useWidget(_StatsWidget, props);
  return null;
};
