import {Widget, type WidgetPlacement, type WidgetProps} from '@deck.gl/core';

/** A minimal concrete widget, so tests do not depend on @deck.gl/widgets. */
export class TestWidget extends Widget<WidgetProps> {
  static defaultProps: Required<WidgetProps> = {...Widget.defaultProps, id: 'test-widget'};

  className = 'test-widget';
  placement: WidgetPlacement = 'top-left';

  onRenderHTML(): void {}
}
