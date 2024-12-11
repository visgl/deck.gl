import {ZoomWidget as VanillaZoomWidget} from '@deck.gl/widgets';
import type {ZoomWidgetProps} from '@deck.gl/widgets';
import useWidget from '../utils/use-widget';

export const ZoomWidget = (props: ZoomWidgetProps = {}) => {
  const widget = useWidget(VanillaZoomWidget, props);
  return null;
};
