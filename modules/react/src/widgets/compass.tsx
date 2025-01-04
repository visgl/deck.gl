import {CompassWidget} from '@deck.gl/widgets';
import type {CompassWidgetProps} from '@deck.gl/widgets';
import useWidget from '../utils/use-widget';

export const Compass = (props: CompassWidgetProps = {}) => {
  const widget = useWidget(CompassWidget, props);
  return null;
};
