// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {ToggleWidget as _ToggleWidget} from '@deck.gl/widgets';
import type {ToggleWidgetProps} from '@deck.gl/widgets';
import {useWidget} from '../utils/use-widget';

export const ToggleWidget = (props: ToggleWidgetProps) => {
  useWidget(_ToggleWidget, props);
  return null;
};
