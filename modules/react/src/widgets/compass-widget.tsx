import {CompassWidget as _CompassWidget} from '@deck.gl/widgets';
import type {CompassWidgetProps} from '@deck.gl/widgets';
import {useWidget} from '../utils/use-widget';

export const CompassWidget = (props: CompassWidgetProps = {}) => {
  const widget = useWidget(_CompassWidget, props);
  return null;
};
