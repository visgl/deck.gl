// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape';
import {_OverviewMapWidget as OverviewMapWidget} from '@deck.gl/widgets';

test('OverviewMapWidget#constructor - default props', t => {
  const widget = new OverviewMapWidget();

  t.is(widget.id, 'overview-map', 'default id');
  t.is(widget.placement, 'bottom-right', 'default placement');
  t.is(widget.className, 'deck-widget-overview-map', 'className');
  t.is(widget.props.maxSize, 150, 'default maxSize');
  t.is(widget.props.transitionDuration, 200, 'default transitionDuration');
  t.is(widget.props.refreshInterval, 1000, 'default refreshInterval');
  t.is(widget.props.collapsed, false, 'default collapsed');

  t.end();
});

test('OverviewMapWidget#constructor - custom props', t => {
  const widget = new OverviewMapWidget({
    id: 'custom-overview',
    placement: 'top-left',
    maxSize: 200,
    transitionDuration: 500,
    refreshInterval: 2000,
    collapsed: true
  });

  t.is(widget.id, 'custom-overview', 'custom id');
  t.is(widget.placement, 'top-left', 'custom placement');
  t.is(widget.props.maxSize, 200, 'custom maxSize');
  t.is(widget.props.transitionDuration, 500, 'custom transitionDuration');
  t.is(widget.props.refreshInterval, 2000, 'custom refreshInterval');
  t.is(widget.props.collapsed, true, 'custom collapsed');

  t.end();
});

test('OverviewMapWidget#setProps - updates placement', t => {
  const widget = new OverviewMapWidget();

  t.is(widget.placement, 'bottom-right', 'initial placement');

  widget.setProps({placement: 'top-right'});

  t.is(widget.placement, 'top-right', 'updated placement');

  t.end();
});

test('OverviewMapWidget#setProps - updates viewId', t => {
  const widget = new OverviewMapWidget();

  t.is(widget.viewId, null, 'initial viewId is null');

  widget.setProps({viewId: 'main-view'});

  t.is(widget.viewId, 'main-view', 'updated viewId');

  t.end();
});

test('OverviewMapWidget#setProps - updates collapsed state', t => {
  const widget = new OverviewMapWidget({collapsed: false});

  widget.setProps({collapsed: true});

  t.is(widget.props.collapsed, true, 'collapsed state updated');

  t.end();
});

test('OverviewMapWidget#thumbnailUrl prop', t => {
  const widget = new OverviewMapWidget({
    thumbnailUrl: 'https://example.com/thumbnail.png'
  });

  t.is(widget.props.thumbnailUrl, 'https://example.com/thumbnail.png', 'thumbnailUrl set');

  t.end();
});

test('OverviewMapWidget#sourceWidth and sourceHeight props', t => {
  const widget = new OverviewMapWidget({
    sourceWidth: 1920,
    sourceHeight: 1080
  });

  t.is(widget.props.sourceWidth, 1920, 'sourceWidth set');
  t.is(widget.props.sourceHeight, 1080, 'sourceHeight set');

  t.end();
});
