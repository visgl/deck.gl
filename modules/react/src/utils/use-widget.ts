import {useContext, useMemo, useEffect} from 'react';
import {DeckGlContext} from './deckgl-context';
import type {Widget} from '@deck.gl/core';

function useWidget<T extends Widget, PropsT extends {}>(
  WidgetClass: {new (props: PropsT): T},
  props: PropsT
): T {
  const context = useContext(DeckGlContext);
  const {widgets, deck} = context;
  const widget = useMemo(() => new WidgetClass(props), [WidgetClass]);

  widgets?.push(widget);
  widget.setProps(props);

  useEffect(() => {
    deck?.setProps({widgets});
  }, [widgets]);

  return widget;
}

export default useWidget;
