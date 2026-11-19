import {AmbientLight, OrthographicView as DeckOrthographicView} from '@deck.gl/core';
import {DataFilterExtension, type DataFilterExtensionProps} from '@deck.gl/extensions';
import {ScatterplotLayer as DeckScatterplotLayer} from '@deck.gl/layers';
import type {ShaderPass} from '@luma.gl/shaders';
import {describe, expect, it} from 'vitest';

import '../../types/jsx';
import {LightingEffect, MapView, PostProcessEffect} from '../core';
import {createLayerComponent, createViewComponent} from '../factories';
import {TileLayer} from '../geo-layers';
import {GeoJsonLayer, ScatterplotLayer} from '../layers';
import {_SplitterWidget as SplitterWidget, ZoomWidget} from '../widgets';

type Point = {position: [number, number]; size: number};
const points: Point[] = [{position: [0, 0], size: 1}];
type TintProps = {amount?: number};
const tint: ShaderPass<TintProps, TintProps> = {
  name: 'tint',
  fs: '',
  uniformTypes: {amount: 'f32'},
  passes: [{filter: true}]
};

describe('built-in wrapper types', () => {
  it('infers the data type from `data`, or takes it as a type argument', () => {
    const inferred = <ScatterplotLayer id="points" data={points} getPosition={d => d.position} />;
    const explicit = <ScatterplotLayer<Point> id="points" getRadius={d => d.size} />;

    // @ts-expect-error Accessors are checked against the inferred data type.
    const _wrongField = <ScatterplotLayer id="points" data={points} getRadius={d => d.missing} />;
    // @ts-expect-error Accessors are checked against the data type argument.
    const _wrongArgument = <ScatterplotLayer<Point> id="points" getPosition={d => d.missing} />;

    expect([inferred, explicit]).toBeDefined();
  });

  it('checks props against the layer props type', () => {
    // @ts-expect-error `getRadius` takes a number or an accessor.
    const _wrongType = <ScatterplotLayer id="points" getRadius="large" />;
    // @ts-expect-error The layer has no `radius` prop.
    const _unknownProp = <ScatterplotLayer id="points" radius={1} />;
    // @ts-expect-error `TileLayer` has no `getPosition` prop.
    const _otherLayersProp = <TileLayer id="tiles" getPosition={() => [0, 0]} />;
  });

  it('types extension props through the second type argument, as the layer class does', () => {
    const filtered = (
      <ScatterplotLayer<Point, DataFilterExtensionProps<Point>>
        id="points"
        data={points}
        extensions={[new DataFilterExtension()]}
        getFilterValue={d => d.size}
      />
    );
    // @ts-expect-error Extension props need the extension's props type.
    const _untyped = <ScatterplotLayer id="points" getFilterValue={() => 0} />;

    expect(filtered).toBeDefined();
  });

  it('types GeoJSON feature properties', () => {
    type Region = {population: number};
    const regions = (
      <GeoJsonLayer<Region> id="regions" getElevation={f => f.properties.population} />
    );
    // @ts-expect-error Feature properties are checked against the type argument.
    const _wrong = <GeoJsonLayer<Region> id="regions" getElevation={f => f.properties.area} />;

    expect(regions).toBeDefined();
  });

  it('types views, widgets and effects', () => {
    const tree = (
      <MapView id="main" controller>
        <ScatterplotLayer id="points" data={points} getPosition={d => d.position} />
      </MapView>
    );
    const zoom = <ZoomWidget id="zoom" placement="top-right" />;
    const splitter = (
      <SplitterWidget
        id="split"
        viewLayout={{
          orientation: 'horizontal',
          views: [new DeckOrthographicView(), new DeckOrthographicView()]
        }}
      />
    );
    const lighting = <LightingEffect ambient={new AmbientLight({intensity: 1})} />;
    const postProcess = <PostProcessEffect module={tint} amount={0.5} />;

    // @ts-expect-error MapView has no `zoom` prop.
    const _wrongView = <MapView id="main" zoom={3} />;
    // @ts-expect-error `placement` is a fixed set of corners.
    const _wrongPlacement = <ZoomWidget placement="middle" />;
    // @ts-expect-error Lights are light instances.
    const _wrongLight = <LightingEffect ambient="bright" />;
    // @ts-expect-error The pass's props are checked against the module.
    const _wrongPassProp = <PostProcessEffect module={tint} amount="half" />;
    // @ts-expect-error `module` is required.
    const _missingModule = <PostProcessEffect amount={0.5} />;

    expect([tree, zoom, splitter, lighting, postProcess]).toBeDefined();
  });
});

describe('component factory types', () => {
  class CustomLayer<DataT = unknown> extends DeckScatterplotLayer<DataT> {
    static layerName = 'CustomLayer';
  }
  const Custom = createLayerComponent(CustomLayer);
  const Orthographic = createViewComponent(DeckOrthographicView);

  it('keep the type parameters of a custom layer class', () => {
    const typed = <Custom<Point> id="custom" getPosition={d => d.position} />;
    // @ts-expect-error Accessors are checked against the data type argument.
    const _wrong = <Custom<Point> id="custom" getPosition={d => d.missing} />;

    const view = (
      <Orthographic id="main" flipY={false}>
        <Custom id="custom" />
      </Orthographic>
    );

    expect([typed, view]).toBeDefined();
  });
});
