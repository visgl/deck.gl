// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {ScrollbarWidget as _ScrollbarWidget} from '@deck.gl/widgets';
import type {ScrollbarWidgetProps} from '@deck.gl/widgets';
import {useWidget} from '../utils/use-widget';

export const ScrollbarWidget = (props: ScrollbarWidgetProps = {}) => {
  useWidget(_ScrollbarWidget, props);
  return null;
};
