import 'client-only';
import type {Effect, Layer, View} from '@deck.gl/core';
import type {ReactElement, ReactNode} from 'react';

import type {AnyWidget} from '../types/jsx';

/**
 * The props a layer class's constructor takes. The wrappers cast their public props type, such as
 * `ScatterplotLayerProps<DataT>`, to it: the two match, but TypeScript cannot prove it while
 * `DataT` is a type parameter.
 * @internal
 */
export type LayerProps<LayerClassT extends abstract new (...args: never[]) => Layer> =
  ConstructorParameters<LayerClassT>[0];

/**
 * Blocks inference of a type parameter, like TypeScript 5.4's built-in `NoInfer`, but works on
 * TypeScript 5.3. Without it, TypeScript would infer `ExtraPropsT` from any unknown prop and
 * accept it.
 * @internal
 */
export type NoInferProps<T> = [T][T extends unknown ? 0 : never];

/**
 * The four functions below are the only place the wrappers name the native elements.
 * @internal
 */
export function renderLayer(layer: Layer): ReactElement {
  return <deckLayer layer={layer} />;
}

/** @internal */
export function renderView(view: View, children?: ReactNode): ReactElement {
  return <deckView view={view}>{children}</deckView>;
}

/** @internal */
export function renderWidget(widget: AnyWidget): ReactElement {
  return <deckWidget widget={widget} />;
}

/** @internal */
export function renderEffect(effect: Effect): ReactElement {
  return <deckEffect effect={effect} />;
}

/** Names the component after the class, so React DevTools shows `ScatterplotLayer`. */
function nameComponent<ComponentT extends (props: never) => ReactElement>(
  component: ComponentT,
  DeckClass: {name: string; layerName?: string}
): ComponentT {
  (component as ComponentT & {displayName?: string}).displayName =
    DeckClass.layerName ?? DeckClass.name;
  return component;
}

/**
 * Wraps a layer class as a component that renders a `<deckLayer>` element.
 *
 * The component builds a new layer from its props on every render. Generic layer
 * classes keep their type parameters: `<ScatterplotLayer<Point> getPosition={d => d.position} />`.
 */
export function createLayerComponent<PropsT extends {id?: string}>(
  LayerClass: new (props: PropsT) => Layer
): (props: PropsT) => ReactElement {
  return nameComponent(function LayerComponent(props: PropsT) {
    return renderLayer(new LayerClass(props));
  }, LayerClass);
}

/** The props a class's constructor takes, for classes with an optional props argument. */
type ConstructorProps<ClassT extends abstract new (...args: never[]) => unknown> = NonNullable<
  ConstructorParameters<ClassT>[0]
>;

/**
 * Wraps a view class as a component that renders a `<deckView>` element. Children pass
 * through, as with `<deckView>`.
 */
export function createViewComponent<ViewClassT extends new (props: never) => View>(
  ViewClass: ViewClassT
): (props: ConstructorProps<ViewClassT> & {children?: ReactNode}) => ReactElement {
  return nameComponent(function ViewComponent(
    propsWithChildren: ConstructorProps<ViewClassT> & {children?: ReactNode}
  ) {
    const {children, ...props} = propsWithChildren as {children?: ReactNode};
    return renderView(new ViewClass(props as never), children);
  }, ViewClass);
}

/**
 * Wraps a widget class as a component that renders a `<deckWidget>` element.
 *
 * deck.gl keeps the first widget with a given id and passes it the props of each new one,
 * so the widget keeps its DOM and state across renders.
 */
export function createWidgetComponent<WidgetClassT extends new (props: never) => AnyWidget>(
  WidgetClass: WidgetClassT
): (props: ConstructorProps<WidgetClassT>) => ReactElement {
  return nameComponent(function WidgetComponent(props: ConstructorProps<WidgetClassT>) {
    return renderWidget(new WidgetClass(props as never));
  }, WidgetClass);
}

/**
 * Wraps an effect class whose constructor takes one props object, such as
 * `LightingEffect`, as a component that renders a `<deckEffect>` element.
 *
 * deck.gl keeps the first effect with a given id and passes it the props of each new one.
 */
export function createEffectComponent<EffectClassT extends new (props: never) => Effect>(
  EffectClass: EffectClassT
): (props: ConstructorProps<EffectClassT>) => ReactElement {
  return nameComponent(function EffectComponent(props: ConstructorProps<EffectClassT>) {
    return renderEffect(new EffectClass(props as never));
  }, EffectClass);
}
