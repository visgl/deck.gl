// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe, expect, it} from 'vitest';
import {OrthographicView} from '@deck.gl/core';
import {buildViewsFromViewLayout} from '@deck.gl/widgets';
import type {ViewLayout} from '@deck.gl/widgets';

describe('buildViewsFromViewLayout', () => {
  it('splits remaining row width evenly across children without explicit widths', () => {
    const layout = {
      type: 'row',
      children: [
        new OrthographicView({id: 'fixed', width: 100}),
        new OrthographicView({id: 'flex-a'}),
        new OrthographicView({id: 'flex-b'})
      ]
    } satisfies ViewLayout;

    const compiled = buildViewsFromViewLayout({
      layout,
      width: 400,
      height: 120
    });

    expect(compiled.rectsById.fixed).toEqual({x: 0, y: 0, width: 100, height: 120});
    expect(compiled.rectsById['flex-a']).toEqual({x: 100, y: 0, width: 150, height: 120});
    expect(compiled.rectsById['flex-b']).toEqual({x: 250, y: 0, width: 150, height: 120});
  });

  it('splits remaining column height evenly across children without explicit heights', () => {
    const layout = {
      type: 'column',
      children: [
        new OrthographicView({id: 'header', height: 40}),
        new OrthographicView({id: 'body-a'}),
        new OrthographicView({id: 'body-b'})
      ]
    } satisfies ViewLayout;

    const compiled = buildViewsFromViewLayout({
      layout,
      width: 200,
      height: 200
    });

    expect(compiled.rectsById.header).toEqual({x: 0, y: 0, width: 200, height: 40});
    expect(compiled.rectsById['body-a']).toEqual({x: 0, y: 40, width: 200, height: 80});
    expect(compiled.rectsById['body-b']).toEqual({x: 0, y: 120, width: 200, height: 80});
  });

  it('resolves overlay children against the same parent bounds', () => {
    const layout = {
      type: 'overlay',
      children: [new OrthographicView({id: 'base'}), new OrthographicView({id: 'top'})]
    } satisfies ViewLayout;

    const compiled = buildViewsFromViewLayout({
      layout,
      width: 320,
      height: 180
    });

    expect(compiled.rectsById.base).toEqual({x: 0, y: 0, width: 320, height: 180});
    expect(compiled.rectsById.top).toEqual({x: 0, y: 0, width: 320, height: 180});
  });

  it('resolves raw view expressions against the current parent bounds', () => {
    const layout = {
      type: 'overlay',
      children: [
        new OrthographicView({
          id: 'calc-view',
          x: 10,
          y: '10%',
          width: 'calc(50% - 20px)',
          height: '50%'
        })
      ]
    } satisfies ViewLayout;

    const compiled = buildViewsFromViewLayout({
      layout,
      width: 300,
      height: 200
    });

    expect(compiled.rectsById['calc-view']).toEqual({x: 10, y: 20, width: 130, height: 100});
  });

  it('applies controlled view prop overrides by id', () => {
    const layout = {
      type: 'overlay',
      children: [
        new OrthographicView({
          id: 'minimap',
          x: 'calc(100% - 196px)',
          y: 16,
          width: 180,
          height: 120
        })
      ]
    } satisfies ViewLayout;

    const compiled = buildViewsFromViewLayout({
      layout,
      width: 400,
      height: 240,
      viewPropsById: {
        minimap: {x: 24, y: 32, width: 160, height: 96}
      }
    });

    expect(compiled.rectsById.minimap).toEqual({x: 24, y: 32, width: 160, height: 96});
  });

  it('resolves controlled view prop override expressions against the current parent bounds', () => {
    const layout = {
      type: 'row',
      children: [
        new OrthographicView({id: 'sidebar', width: 100}),
        {
          type: 'overlay',
          children: [new OrthographicView({id: 'minimap', x: 0, y: 0, width: 120, height: 80})]
        }
      ]
    } satisfies ViewLayout;

    const compiled = buildViewsFromViewLayout({
      layout,
      width: 500,
      height: 240,
      viewPropsById: {
        minimap: {x: 'calc(100% - 180px)', y: '10%', width: '25%', height: 'calc(50% - 20px)'}
      }
    });

    expect(compiled.rectsById.minimap).toEqual({x: 320, y: 24, width: 100, height: 100});
  });

  it('supports nested items and reuses unchanged compiled views by id', () => {
    const layout = {
      type: 'column',
      children: [
        {
          type: 'row',
          height: 50,
          children: [{type: 'spacer', width: 80}, new OrthographicView({id: 'header'})]
        },
        {
          type: 'row',
          children: [
            new OrthographicView({id: 'legend', width: 80}),
            new OrthographicView({id: 'main'})
          ]
        }
      ]
    } satisfies ViewLayout;

    const first = buildViewsFromViewLayout({
      layout,
      width: 300,
      height: 200
    });
    const second = buildViewsFromViewLayout({
      layout,
      width: 300,
      height: 200,
      previous: first
    });

    expect(second.rectsById.header).toEqual({x: 80, y: 0, width: 220, height: 50});
    expect(second.rectsById.legend).toEqual({x: 0, y: 50, width: 80, height: 150});
    expect(second.rectsById.main).toEqual({x: 80, y: 50, width: 220, height: 150});
    expect(second.views.find(view => view.props.id === 'main')).toBe(
      first.views.find(view => view.props.id === 'main')
    );
  });

  it('supports named splits in row layouts', () => {
    const layout = {
      type: 'column',
      children: [
        new OrthographicView({id: 'header', height: 40}),
        {
          type: 'row',
          splitId: 'sidebar-main',
          initialSplit: 0.25,
          minSplit: 0.1,
          maxSplit: 0.5,
          children: [new OrthographicView({id: 'sidebar'}), new OrthographicView({id: 'main'})]
        }
      ]
    } satisfies ViewLayout;

    const compiled = buildViewsFromViewLayout({
      layout,
      width: 400,
      height: 200,
      splitValues: {'sidebar-main': 0.4}
    });

    expect(compiled.rectsById.header).toEqual({x: 0, y: 0, width: 400, height: 40});
    expect(compiled.rectsById.sidebar).toEqual({x: 0, y: 40, width: 160, height: 160});
    expect(compiled.rectsById.main).toEqual({x: 160, y: 40, width: 240, height: 160});
    expect(compiled.splittersById['sidebar-main']).toEqual({
      id: 'sidebar-main',
      orientation: 'horizontal',
      x: 0,
      y: 20,
      width: 100,
      height: 80,
      split: 0.4,
      minSplit: 0.1,
      maxSplit: 0.5
    });
  });

  it('constrains split layouts with minPixels and maxPixels', () => {
    const layout = {
      type: 'row',
      splitId: 'sidebar-main',
      initialSplit: 0.25,
      minSplit: 0.1,
      maxSplit: 0.8,
      children: [
        {
          type: 'overlay',
          minPixels: 120,
          maxPixels: 200,
          children: [new OrthographicView({id: 'sidebar'})]
        },
        new OrthographicView({id: 'main'})
      ]
    } satisfies ViewLayout;

    const compiled = buildViewsFromViewLayout({
      layout,
      width: 400,
      height: 200,
      splitValues: {'sidebar-main': 0.9}
    });

    expect(compiled.rectsById.sidebar).toEqual({x: 0, y: 0, width: 200, height: 200});
    expect(compiled.rectsById.main).toEqual({x: 200, y: 0, width: 200, height: 200});
    expect(compiled.splittersById['sidebar-main']).toMatchObject({
      split: 0.5,
      minSplit: 0.3,
      maxSplit: 0.5
    });
  });

  it('clamps split layouts to minPixels when controlled values are too small', () => {
    const layout = {
      orientation: 'vertical',
      splitId: 'header-body',
      views: [
        {
          type: 'overlay',
          minPixels: 96,
          children: [new OrthographicView({id: 'header'})]
        },
        new OrthographicView({id: 'body'})
      ]
    } satisfies ViewLayout;

    const compiled = buildViewsFromViewLayout({
      layout,
      width: 400,
      height: 240,
      splitValues: {'header-body': 0.1}
    });

    expect(compiled.rectsById.header).toEqual({x: 0, y: 0, width: 400, height: 96});
    expect(compiled.rectsById.body).toEqual({x: 0, y: 96, width: 400, height: 144});
    expect(compiled.splittersById['header-body']).toMatchObject({
      orientation: 'vertical',
      split: 0.4,
      minSplit: 0.4,
      maxSplit: 0.95
    });
  });

  it('combines percentage sizing with item minPixels and maxPixels', () => {
    const layout = {
      type: 'row',
      children: [
        {
          type: 'overlay',
          width: '50%',
          minPixels: 240,
          children: [new OrthographicView({id: 'left'})]
        },
        new OrthographicView({id: 'right'})
      ]
    } satisfies ViewLayout;

    const compiled = buildViewsFromViewLayout({
      layout,
      width: 400,
      height: 200
    });

    expect(compiled.rectsById.left).toEqual({x: 0, y: 0, width: 240, height: 200});
    expect(compiled.rectsById.right).toEqual({x: 240, y: 0, width: 160, height: 200});
  });

  it('supports generated split ids between multiple children', () => {
    const layout = {
      type: 'row',
      splitId: 'panes',
      children: [
        {
          type: 'overlay',
          minPixels: 100,
          maxPixels: 250,
          children: [new OrthographicView({id: 'left'})]
        },
        {
          type: 'overlay',
          minPixels: 80,
          children: [new OrthographicView({id: 'middle'})]
        },
        {
          type: 'overlay',
          minPixels: 120,
          children: [new OrthographicView({id: 'right'})]
        }
      ]
    } satisfies ViewLayout;

    const compiled = buildViewsFromViewLayout({
      layout,
      width: 600,
      height: 200,
      splitValues: {'panes-0': 0.25, 'panes-1': 0.75}
    });

    expect(compiled.rectsById.left).toEqual({x: 0, y: 0, width: 150, height: 200});
    expect(compiled.rectsById.middle).toEqual({x: 150, y: 0, width: 300, height: 200});
    expect(compiled.rectsById.right).toEqual({x: 450, y: 0, width: 150, height: 200});
    expect(compiled.splittersById['panes-0']).toMatchObject({
      id: 'panes-0',
      split: 0.25
    });
    expect(compiled.splittersById['panes-1']).toMatchObject({
      id: 'panes-1',
      split: 0.75
    });
    expect(compiled.splittersById.panes).toBeUndefined();
  });

  it('supports SplitterWidgetViewLayout-style orientation and views aliases', () => {
    const layout = {
      orientation: 'horizontal',
      splitId: 'sidebar-main',
      initialSplit: 0.25,
      views: [new OrthographicView({id: 'sidebar'}), new OrthographicView({id: 'main'})]
    } satisfies ViewLayout;

    const compiled = buildViewsFromViewLayout({
      layout,
      width: 400,
      height: 200,
      splitValues: {'sidebar-main': 0.4}
    });

    expect(compiled.rectsById.sidebar).toEqual({x: 0, y: 0, width: 160, height: 200});
    expect(compiled.rectsById.main).toEqual({x: 160, y: 0, width: 240, height: 200});
    expect(compiled.splittersById['sidebar-main']).toMatchObject({
      id: 'sidebar-main',
      orientation: 'horizontal',
      split: 0.4
    });
  });
});
