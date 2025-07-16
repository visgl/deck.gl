import {_ContextMenuWidget} from '@deck.gl/widgets';
import type {ContextMenuWidgetProps} from '@deck.gl/widgets';
import {useWidget} from '../utils/use-widget';

/**
 * React wrapper for the ContextMenuWidget.
 */
export const ContextMenuWidget = (props: ContextMenuWidgetProps) => {
  useWidget(_ContextMenuWidget, props);
  return null;
};
