// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {PopupWidget as _PopupWidget} from '@deck.gl/widgets';
import type {PopupWidgetProps} from '@deck.gl/widgets';
import {useWidget} from '../utils/use-widget';

export const PopupWidget = (props: PopupWidgetProps) => {
  useWidget(_PopupWidget, props);
  return null;
};
