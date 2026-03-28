// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {GimbalWidget as _GimbalWidget} from '@deck.gl/widgets';
import type {GimbalWidgetProps} from '@deck.gl/widgets';
import {useWidget} from '../utils/use-widget';

export const GimbalWidget = (props: GimbalWidgetProps = {}) => {
  useWidget(_GimbalWidget, props);
  return null;
};
