import {FullscreenWidget as VanillaFullscreenWidget} from '@deck.gl/widgets';
import type {FullscreenWidgetProps} from '@deck.gl/widgets';
import useWidget from './utils/use-widget';

export const FullscreenWidget = (props: FullscreenWidgetProps = {}) => {
  const widget = useWidget(VanillaFullscreenWidget, props);
  return null;
};
