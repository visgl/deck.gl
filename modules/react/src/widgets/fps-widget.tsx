// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {_FpsWidget} from '@deck.gl/widgets';
import type {FpsWidgetProps} from '@deck.gl/widgets';
import {useWidget} from '../utils/use-widget';

export const FpsWidget = (props: FpsWidgetProps = {}) => {
  useWidget(_FpsWidget, props);
  return null;
};
