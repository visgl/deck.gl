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
    // warn if the user supplied a vanilla prop, since it will be ignored
    // NOTE: effect runs once per widget after the first render
    // TODO: this doesn't work since the widgets override the deck prop. Can't tell which are user set.
    // if (!deepEqual(deck?.props.widgets, widgets, 1)) {
    if (deck?.props.widgets.length !== 0) {
      log.warn('Detected deck "widgets" prop used simultaneously with React widgets. Vanilla widgets will be ignored.')();
    }
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
