// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {SelectorWidget as _SelectorWidget} from '@deck.gl/widgets';
import type {SelectorWidgetProps} from '@deck.gl/widgets';
import {useWidget} from '../utils/use-widget';

export const SelectorWidget = <ValueT = string,>(props: SelectorWidgetProps<ValueT>) => {
  useWidget(
    _SelectorWidget as new (props_: SelectorWidgetProps<ValueT>) => _SelectorWidget<ValueT>,
    props
  );
  return null;
};
