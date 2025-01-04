import {FullscreenWidget} from '@deck.gl/widgets';
import type {FullscreenWidgetProps} from '@deck.gl/widgets';
import useWidget from '../utils/use-widget';

export const Fullscreen = (props: FullscreenWidgetProps = {}) => {
  const widget = useWidget(FullscreenWidget, props);
  return null;
};
