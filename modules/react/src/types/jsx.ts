// oxlint-disable typescript/no-empty-object-type
// oxlint-disable unicorn/require-module-specifiers
// oxlint-disable import/no-empty-named-blocks
// oxlint-disable typescript/no-empty-interface
// oxlint-disable typescript/no-namespace
import type {Effect, Layer, View, Widget, WidgetProps} from '@deck.gl/core';
import type {Key, ReactNode, Ref} from 'react';
import type {} from 'react';
import type {} from 'react/jsx-runtime';
import type {} from 'react/jsx-dev-runtime';

/**
 * A deck.gl widget for any views, including one typed for several views, such as
 * `SplitterWidget`.
 */
export type AnyWidget = Widget<WidgetProps, View | View[] | null>;

/**
 * JSX intrinsic elements supported by the deck.gl React Fiber renderer.
 *
 * Each name has a `deck` prefix so that it cannot clash with DOM and SVG elements, such as
 * SVG's `<view>`, or with another renderer's elements.
 */
export interface DeckGLElements {
  /** The deck.gl Layer instance to render. */
  deckLayer: {
    layer: Layer;
    children?: ReactNode;
    key?: Key;
    /** Receives the `layer` instance. */
    ref?: Ref<Layer>;
  };

  /** The deck.gl View instance that owns its child elements. */
  deckView: {
    view: View;
    children?: ReactNode;
    key?: Key;
    /** Receives the `view` instance. */
    ref?: Ref<View>;
  };

  /** The deck.gl Widget instance to add. Widgets have no children. */
  deckWidget: {
    widget: AnyWidget;
    key?: Key;
    /** Receives the `widget` instance. */
    ref?: Ref<AnyWidget>;
  };

  /** The deck.gl effect to apply, such as a `LightingEffect`. Effects have no children. */
  deckEffect: {
    effect: Effect;
    key?: Key;
    /** Receives the `effect` instance. */
    ref?: Ref<Effect>;
  };
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends DeckGLElements {}
  }
}

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements extends DeckGLElements {}
  }
}

declare module 'react/jsx-dev-runtime' {
  namespace JSX {
    interface IntrinsicElements extends DeckGLElements {}
  }
}
