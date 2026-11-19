// The views and effects that @deck.gl/core exports, as components that take their props.
import {
  _CustomProjectionView as DeckCustomProjectionView,
  FirstPersonView as DeckFirstPersonView,
  _GlobeView as DeckGlobeView,
  LightingEffect as DeckLightingEffect,
  MapView as DeckMapView,
  OrbitView as DeckOrbitView,
  OrthographicView as DeckOrthographicView,
  PostProcessEffect as DeckPostProcessEffect
} from '@deck.gl/core';
import type {
  CustomProjectionViewProps,
  FirstPersonViewProps,
  GlobeViewProps,
  LightingEffectProps,
  MapViewProps,
  OrbitViewProps,
  OrthographicViewProps
} from '@deck.gl/core';
import type {ReactElement, ReactNode} from 'react';

import {renderEffect, renderView} from './factories';

/** An experimental planar view in the CRS given by `crs`. */
export function _CustomProjectionView({
  children,
  ...props
}: CustomProjectionViewProps & {children?: ReactNode}): ReactElement {
  return renderView(new DeckCustomProjectionView(props), children);
}

export function FirstPersonView({
  children,
  ...props
}: FirstPersonViewProps & {children?: ReactNode}): ReactElement {
  return renderView(new DeckFirstPersonView(props), children);
}

export function _GlobeView({
  children,
  ...props
}: GlobeViewProps & {children?: ReactNode}): ReactElement {
  return renderView(new DeckGlobeView(props), children);
}

export function MapView({children, ...props}: MapViewProps & {children?: ReactNode}): ReactElement {
  return renderView(new DeckMapView(props), children);
}

export function OrbitView({
  children,
  ...props
}: OrbitViewProps & {children?: ReactNode}): ReactElement {
  return renderView(new DeckOrbitView(props), children);
}

export function OrthographicView({
  children,
  ...props
}: OrthographicViewProps & {children?: ReactNode}): ReactElement {
  return renderView(new DeckOrthographicView(props), children);
}

/** Lights are props, keyed by name: `<LightingEffect ambient={ambientLight} sun={sunLight} />`. */
export function LightingEffect(props: LightingEffectProps): ReactElement {
  return renderEffect(new DeckLightingEffect(props));
}

/** The shader pass a `PostProcessEffect` runs. */
type ShaderPassModule = ConstructorParameters<typeof DeckPostProcessEffect>[0];

/** The shader pass, plus that pass's props: `<PostProcessEffect module={vignette} radius={0.5} />`. */
export type PostProcessEffectProps<ModuleT extends ShaderPassModule> = {
  module: ModuleT;
} & NonNullable<ModuleT['props']>;

/** `PostProcessEffect` takes its shader pass as a prop, next to that pass's props. */
export function PostProcessEffect<ModuleT extends ShaderPassModule>({
  module,
  ...props
}: PostProcessEffectProps<ModuleT>): ReactElement {
  return renderEffect(new DeckPostProcessEffect(module, props as ModuleT['props']));
}
