import {useContext, useMemo, useEffect} from 'react';
import {DeckGlContext} from './deckgl-context';
import {log, type Widget, _deepEqual as deepEqual} from '@deck.gl/core';

function useWidget<T extends Widget, PropsT extends {}>(
  WidgetClass: {new (props: PropsT): T},
  props: PropsT
): T {
  const context = useContext(DeckGlContext);
  const {widgets, deck} = context;
  useEffect(() => {
    // warn if the user supplied a vanilla widget, since it will be ignored
    // NOTE: This effect runs once per widget. Context widgets and deck widget props are synced after first effect runs.
    const internalWidgets = deck?.props.widgets;
    if (widgets?.length && internalWidgets && !deepEqual(deck?.props.widgets, widgets, 1)) {
      log.warn('"widgets" prop will be ignored because React widgets are in use.')();
    }

    return () => {
      // Remove widget from context when it is unmounted
      const index = widgets?.indexOf(widget);
      if (index && index !== -1) {
        widgets?.splice(index, 1);
        deck?.setProps({widgets});
      }
    };
  }, []);
  const widget = useMemo(() => new WidgetClass(props), [WidgetClass]);

  widgets?.push(widget);
  widget.setProps(props);

  useEffect(() => {
    deck?.setProps({widgets});
  }, [widgets]);

  return widget;
}

export default useWidget;