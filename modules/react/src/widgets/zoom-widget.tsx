import {ZoomWidget as _ZoomWidget} from '@deck.gl/widgets';
import type {ZoomWidgetProps} from '@deck.gl/widgets';
import {useWidget} from '../utils/use-widget';

export const ZoomWidget = (props: ZoomWidgetProps = {}) => {
  const widget = useWidget(_ZoomWidget, props);
  return null;
};
