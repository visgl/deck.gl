import {CompassWidget as VanillaCompassWidget} from '@deck.gl/widgets';
import type {CompassWidgetProps} from '@deck.gl/widgets';
import useWidget from '../utils/use-widget';

export const CompassWidget = (props: CompassWidgetProps = {}) => {
  const widget = useWidget(VanillaCompassWidget, props);
  return null;
};
