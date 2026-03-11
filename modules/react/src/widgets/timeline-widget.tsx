// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {_TimelineWidget} from '@deck.gl/widgets';
import type {TimelineWidgetProps} from '@deck.gl/widgets';
import {useWidget} from '../utils/use-widget';

export const TimelineWidget = (props: TimelineWidgetProps = {}) => {
  useWidget(_TimelineWidget, props);
  return null;
};
