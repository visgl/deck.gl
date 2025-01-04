import {ZoomWidget} from '@deck.gl/widgets';
import type {ZoomWidgetProps} from '@deck.gl/widgets';
import useWidget from '../utils/use-widget';

export const Zoom = (props: ZoomWidgetProps = {}) => {
  const widget = useWidget(ZoomWidget, props);
  return null;
};
