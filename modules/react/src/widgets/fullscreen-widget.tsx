import {FullscreenWidget as _FullscreenWidget} from '@deck.gl/widgets';
import type {FullscreenWidgetProps} from '@deck.gl/widgets';
import {useWidget} from '../utils/use-widget';

export const FullscreenWidget = (props: FullscreenWidgetProps = {}) => {
  const widget = useWidget(_FullscreenWidget, props);
  return null;
};
