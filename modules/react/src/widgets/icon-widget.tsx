// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {IconWidget as _IconWidget} from '@deck.gl/widgets';
import type {IconWidgetProps} from '@deck.gl/widgets';
import {useWidget} from '../utils/use-widget';

export const IconWidget = (props: IconWidgetProps) => {
  useWidget(_IconWidget, props);
  return null;
};
