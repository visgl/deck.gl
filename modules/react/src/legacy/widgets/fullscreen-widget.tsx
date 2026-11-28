// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {FullscreenWidget as _FullscreenWidget} from '@deck.gl/widgets';
import type {FullscreenWidgetProps} from '@deck.gl/widgets';
import {useWidget} from '../utils/use-widget';

export const FullscreenWidget = (props: FullscreenWidgetProps = {}) => {
  useWidget(_FullscreenWidget, props);
  return null;
};
