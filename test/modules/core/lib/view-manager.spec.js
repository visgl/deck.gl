// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import test from 'tape-catch';
import {MapView} from '@deck.gl/core';
import ViewManager from '@deck.gl/core/lib/view-manager';
import {equals} from 'math.gl';

test('ViewManager#constructor', t => {
  const viewManager = new ViewManager({
    views: [new MapView({id: 'map'})],
    viewState: {longitude: -122, latitude: 38, zoom: 12},
    width: 100,
    height: 100
  });
  t.ok(viewManager, 'ViewManager is constructed');

  viewManager.finalize();

  t.end();
});

test('ViewManager#getView, getViewState, getViewport', t => {
  const mainView = new MapView({id: 'main'});
  const minimapView = new MapView({id: 'minimap', width: '10%', height: '10%', x: '5%', y: '5%'});

  const viewManager = new ViewManager({
    views: [mainView, minimapView],
    viewState: {
      longitude: -122,
      latitude: 38,
      zoom: 12,
      pitch: 30,
      minimap: {longitude: -122, latitude: 38, zoom: 8}
    },
    width: 100,
    height: 100
  });

  t.deepEqual(viewManager.getViews(), {main: mainView, minimap: minimapView}, 'returns view map');

  t.is(viewManager.getView('main'), mainView, 'returns correct view');
  t.is(viewManager.getView('minimap'), minimapView, 'returns correct view');

  t.is(viewManager.getViewState('main').zoom, 12, 'returns correct view state');
  t.is(viewManager.getViewState('minimap').zoom, 8, 'returns correct view state');

  t.deepEqual(
    viewManager.getViewports().map(v => v.id),
    ['main', 'minimap'],
    'returns all viewports'
  );
  t.deepEqual(
    viewManager.getViewports({x: 10, y: 10}).map(v => v.id),
    ['main', 'minimap'],
    'returns correct viewports'
  );
  t.deepEqual(
    viewManager.getViewports({x: 50, y: 50}).map(v => v.id),
    ['main'],
    'returns correct viewports'
  );

  t.is(viewManager.getViewport('main').id, 'main', 'returns correct viewport');
  t.is(viewManager.getViewport('minimap').id, 'minimap', 'returns correct viewport');

  viewManager.finalize();

  t.end();
});

test('ViewManager#unproject', t => {
  const mainView = new MapView({id: 'main'});
  const minimapView = new MapView({id: 'minimap', width: '10%', height: '10%', x: '5%', y: '5%'});

  const viewManager = new ViewManager({
    views: [mainView, minimapView],
    viewState: {
      longitude: -122,
      latitude: 38,
      zoom: 12,
      pitch: 30,
      minimap: {longitude: -122, latitude: 38, zoom: 8}
    },
    width: 100,
    height: 100
  });

  t.ok(equals(viewManager.unproject([50, 50]), [-122, 38]), 'viewManager.unproject');
  t.ok(equals(viewManager.unproject([10, 10]), [-122, 38]), 'viewManager.unproject');

  viewManager.finalize();

  t.end();
});

test('ViewManager#controllers', t => {
  const mainView = new MapView({id: 'main', controller: true});
  const minimapView = new MapView({id: 'minimap', width: '10%', height: '10%', x: '5%', y: '5%'});

  const viewManager = new ViewManager({
    views: [mainView, minimapView],
    viewState: {
      longitude: -122,
      latitude: 38,
      zoom: 12,
      pitch: 30,
      minimap: {longitude: -122, latitude: 38, zoom: 8}
    },
    width: 100,
    height: 100
  });

  t.ok(viewManager.controllers.main, 'controller is constructed');

  viewManager.finalize();
  t.notOk(viewManager.controllers.main, 'controller is deleted');

  t.end();
});
