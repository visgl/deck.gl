// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {_ViewSelectorWidget} from '@deck.gl/widgets';
import type {ViewSelectorWidgetProps} from '@deck.gl/widgets';
import {useWidget} from '../utils/use-widget';

export const ViewSelectorWidget = (props: ViewSelectorWidgetProps = {}) => {
  useWidget(_ViewSelectorWidget, props);
  return null;
};
