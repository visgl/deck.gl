// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {_TimelineWidget as TimelineWidget} from '@deck.gl/widgets';
import {_StatsWidget as StatsWidget} from '@deck.gl/widgets';
import {FullscreenWidget} from '@deck.gl/widgets';
import {CompassWidget} from '@deck.gl/widgets';
import {GimbalWidget} from '@deck.gl/widgets';
import {ZoomWidget} from '@deck.gl/widgets';
import {ThemeWidget} from '@deck.gl/widgets';
import {LoadingWidget} from '@deck.gl/widgets';
import {_GeocoderWidget as GeocoderWidget} from '@deck.gl/widgets';
import {ResetViewWidget} from '@deck.gl/widgets';

// ---- TimelineWidget ----

test('TimelineWidget - uncontrolled: initialTime sets starting value', () => {
  const widget = new TimelineWidget({timeRange: [0, 100], initialTime: 25});
  expect(widget.getTime()).toBe(25);
});

test('TimelineWidget - uncontrolled: defaults to timeRange[0]', () => {
  const widget = new TimelineWidget({timeRange: [10, 50]});
  expect(widget.getTime()).toBe(10);
});

test('TimelineWidget - controlled: getTime returns time prop', () => {
  const widget = new TimelineWidget({timeRange: [0, 100], time: 42});
  expect(widget.getTime()).toBe(42);
});

test('TimelineWidget - controlled: constructor syncs Timeline to controlled time prop', () => {
  const timeline = {setTime: vi.fn()};
  new TimelineWidget({timeRange: [0, 100], time: 50, timeline: timeline as any});
  expect(timeline.setTime).toHaveBeenCalledWith(50);
});

test('TimelineWidget - controlled: setProps updates time and syncs Timeline', () => {
  const timeline = {setTime: vi.fn()};
  const widget = new TimelineWidget({timeRange: [0, 100], time: 0, timeline: timeline as any});
  timeline.setTime.mockClear();

  widget.setProps({time: 50});
  expect(widget.getTime()).toBe(50);
  expect(timeline.setTime).toHaveBeenCalledWith(50);
});

test('TimelineWidget - controlled: handleTimeChange calls onTimeChange but does not update internal state', () => {
  const onTimeChange = vi.fn();
  const widget = new TimelineWidget({timeRange: [0, 100], time: 0, onTimeChange});
  const initialInternalTime = widget.currentTime;

  // Simulate slider change via the private handler
  (widget as any).handleTimeChange([50, 50]);

  expect(onTimeChange).toHaveBeenCalledWith(50);
  // Internal state should not change in controlled mode
  expect(widget.currentTime).toBe(initialInternalTime);
});

test('TimelineWidget - uncontrolled: handleTimeChange updates internal state and syncs Timeline', () => {
  const onTimeChange = vi.fn();
  const timeline = {setTime: vi.fn()};
  const widget = new TimelineWidget({
    timeRange: [0, 100],
    onTimeChange,
    timeline: timeline as any
  });
  timeline.setTime.mockClear();

  (widget as any).handleTimeChange([50, 50]);

  expect(onTimeChange).toHaveBeenCalledWith(50);
  expect(widget.currentTime).toBe(50);
  expect(timeline.setTime).toHaveBeenCalledWith(50);
});

test('TimelineWidget - controlled: play() at max does not reset time (app handles restart)', () => {
  vi.useFakeTimers();
  const onTimeChange = vi.fn();
  const onPlayingChange = vi.fn();
  const widget = new TimelineWidget({
    timeRange: [0, 100],
    time: 100,
    onTimeChange,
    onPlayingChange,
    playInterval: 100
  });

  widget.play();

  // In controlled mode, play() does NOT auto-reset time to min.
  // The app is responsible for resetting time in its onPlayingChange handler.
  // tick() fires immediately, sees time=100 (at max), and stops.
  expect(onPlayingChange).toHaveBeenCalledWith(false);
  vi.useRealTimers();
});

test('TimelineWidget - controlled playing: tick calls onPlayingChange(false) when reaching end', () => {
  vi.useFakeTimers();
  const onPlayingChange = vi.fn();
  const onTimeChange = vi.fn();
  const widget = new TimelineWidget({
    timeRange: [0, 10],
    step: 5,
    time: 10, // already at max
    loop: false,
    playInterval: 100,
    onPlayingChange,
    onTimeChange
  });

  // Start controlled playing (transition from undefined -> true)
  widget.setProps({playing: true});

  // Advance timer to trigger tick
  vi.advanceTimersByTime(100);

  expect(onPlayingChange).toHaveBeenCalledWith(false);
  vi.useRealTimers();
});

test('TimelineWidget - uncontrolled playing: tick stops naturally at end without loop', () => {
  vi.useFakeTimers();
  const onTimeChange = vi.fn();
  const widget = new TimelineWidget({
    timeRange: [0, 10],
    step: 10,
    playInterval: 100,
    onTimeChange
  });

  widget.play();
  expect(widget.getPlaying()).toBe(true);

  // First tick moves to 10 (max)
  vi.advanceTimersByTime(100);
  expect(widget.getTime()).toBe(10);

  // Second tick should stop playing (already at max, no loop)
  vi.advanceTimersByTime(100);
  expect(widget.getPlaying()).toBe(false);

  vi.useRealTimers();
});

test('TimelineWidget - controlled playing: timer stops after reaching end without loop', () => {
  vi.useFakeTimers();
  const onPlayingChange = vi.fn();
  const onTimeChange = vi.fn();
  const widget = new TimelineWidget({
    timeRange: [0, 10],
    step: 5,
    time: 10, // already at max
    loop: false,
    playInterval: 100,
    playing: true,
    onPlayingChange,
    onTimeChange
  });

  // Manually start timer (simulating controlled mode activation)
  (widget as any)._startTimer();

  // First tick: reaches end, calls onPlayingChange(false)
  vi.advanceTimersByTime(100);
  expect(onPlayingChange).toHaveBeenCalledWith(false);

  onTimeChange.mockClear();
  onPlayingChange.mockClear();

  // Second tick should NOT fire — timer should have stopped
  vi.advanceTimersByTime(100);
  expect(onTimeChange).not.toHaveBeenCalled();
  expect(onPlayingChange).not.toHaveBeenCalled();

  vi.useRealTimers();
});

test('TimelineWidget - uncontrolled: loop wraps around at end', () => {
  vi.useFakeTimers();
  const onTimeChange = vi.fn();
  const widget = new TimelineWidget({
    timeRange: [0, 10],
    step: 10,
    loop: true,
    playInterval: 100,
    onTimeChange
  });

  widget.play();
  // play() calls tick() synchronously, which moves time to 10 (max)
  expect(widget.getTime()).toBe(10);

  // Next tick wraps to 0 (loop)
  vi.advanceTimersByTime(100);
  expect(widget.getTime()).toBe(0);
  expect(widget.getPlaying()).toBe(true);

  vi.useRealTimers();
});

test('TimelineWidget - controlled: getPlaying returns playing prop', () => {
  const widget = new TimelineWidget({timeRange: [0, 100], playing: true});
  expect(widget.getPlaying()).toBe(true);

  widget.setProps({playing: false});
  expect(widget.getPlaying()).toBe(false);
});

test('TimelineWidget - handlePlayPause in controlled mode calls onPlayingChange', () => {
  const onPlayingChange = vi.fn();
  const widget = new TimelineWidget({
    timeRange: [0, 100],
    playing: false,
    onPlayingChange
  });

  (widget as any).handlePlayPause();

  expect(onPlayingChange).toHaveBeenCalledWith(true);
});

test('TimelineWidget - controlled: autoPlay calls onPlayingChange instead of play()', () => {
  const onPlayingChange = vi.fn();
  const onTimeChange = vi.fn();
  const widget = new TimelineWidget({
    timeRange: [0, 100],
    playing: false,
    autoPlay: true,
    onPlayingChange,
    onTimeChange
  });

  // Simulate widget being added to deck
  widget.onAdd();

  // Should notify parent instead of starting timer directly
  expect(onPlayingChange).toHaveBeenCalledWith(true);
  // Timer should NOT be running (parent controls playing state)
  expect(widget['_playing']).toBe(false);
});

test('TimelineWidget - uncontrolled: autoPlay starts playing directly', () => {
  vi.useFakeTimers();
  const widget = new TimelineWidget({
    timeRange: [0, 100],
    autoPlay: true,
    playInterval: 100
  });

  widget.onAdd();

  expect(widget.getPlaying()).toBe(true);
  vi.useRealTimers();
});

// ---- StatsWidget ----

test('StatsWidget - uncontrolled: initialExpanded sets starting state', () => {
  const widget = new StatsWidget({initialExpanded: true});
  expect(widget.getExpanded()).toBe(true);
});

test('StatsWidget - uncontrolled: defaults to collapsed', () => {
  const widget = new StatsWidget();
  expect(widget.getExpanded()).toBe(false);
});

test('StatsWidget - controlled: getExpanded returns expanded prop', () => {
  const widget = new StatsWidget({expanded: true});
  expect(widget.getExpanded()).toBe(true);
});

test('StatsWidget - controlled: toggleExpanded calls onExpandedChange but does not update internal state', () => {
  const onExpandedChange = vi.fn();
  const widget = new StatsWidget({expanded: true, onExpandedChange});

  (widget as any)._toggleExpanded();

  expect(onExpandedChange).toHaveBeenCalledWith(false);
  // Internal state unchanged (controlled mode)
  expect(widget.getExpanded()).toBe(true);
});

test('StatsWidget - uncontrolled: toggleExpanded updates internal state and calls callback', () => {
  const onExpandedChange = vi.fn();
  const widget = new StatsWidget({onExpandedChange});

  expect(widget.getExpanded()).toBe(false);
  (widget as any)._toggleExpanded();
  expect(widget.getExpanded()).toBe(true);
  expect(onExpandedChange).toHaveBeenCalledWith(true);
});

// ---- FullscreenWidget ----

test('FullscreenWidget - uncontrolled: defaults to not fullscreen', () => {
  const widget = new FullscreenWidget();
  expect(widget.getFullscreen()).toBe(false);
});

test('FullscreenWidget - pseudo-fullscreen toggles state and calls callback', () => {
  const onFullscreenChange = vi.fn();
  const widget = new FullscreenWidget({onFullscreenChange});

  // Mock getContainer to return a div with classList
  const container = document.createElement('div');
  vi.spyOn(widget, 'getContainer').mockReturnValue(container);

  expect(widget.getFullscreen()).toBe(false);

  widget.togglePseudoFullscreen();

  expect(onFullscreenChange).toHaveBeenCalledWith(true);
  expect(widget.fullscreen).toBe(true);
  expect(container.classList.contains('deck-pseudo-fullscreen')).toBe(true);

  onFullscreenChange.mockClear();
  widget.togglePseudoFullscreen();

  expect(onFullscreenChange).toHaveBeenCalledWith(false);
  expect(widget.fullscreen).toBe(false);
  expect(container.classList.contains('deck-pseudo-fullscreen')).toBe(false);
});

test('FullscreenWidget - onFullscreenChange event updates state and calls callback', () => {
  const onFullscreenChange = vi.fn();
  const widget = new FullscreenWidget({onFullscreenChange});

  // Mock getContainer - document.fullscreenElement won't match, so fullscreen = false
  const container = document.createElement('div');
  vi.spyOn(widget, 'getContainer').mockReturnValue(container);

  // Set fullscreen to true so the event handler detects a change
  widget.fullscreen = true;
  widget.onFullscreenChange();

  expect(onFullscreenChange).toHaveBeenCalledWith(false);
  expect(widget.fullscreen).toBe(false);
});

test('FullscreenWidget - onFullscreenChange does not fire callback when state unchanged', () => {
  const onFullscreenChange = vi.fn();
  const widget = new FullscreenWidget({onFullscreenChange});

  const container = document.createElement('div');
  vi.spyOn(widget, 'getContainer').mockReturnValue(container);

  // fullscreen is already false, calling onFullscreenChange should be a no-op
  widget.onFullscreenChange();
  expect(onFullscreenChange).not.toHaveBeenCalled();
});

// ---- ThemeWidget ----

test('ThemeWidget - uncontrolled: initialThemeMode sets starting state', () => {
  const widget = new ThemeWidget({initialThemeMode: 'light'});
  expect(widget.getThemeMode()).toBe('light');
});

test('ThemeWidget - uncontrolled: initialThemeMode dark', () => {
  const widget = new ThemeWidget({initialThemeMode: 'dark'});
  expect(widget.getThemeMode()).toBe('dark');
});

test('ThemeWidget - controlled: getThemeMode returns themeMode prop', () => {
  const widget = new ThemeWidget({themeMode: 'light'});
  expect(widget.getThemeMode()).toBe('light');

  widget.setProps({themeMode: 'dark'});
  expect(widget.getThemeMode()).toBe('dark');
});

test('ThemeWidget - controlled: _handleClick calls onThemeModeChange but does not update internal state', () => {
  const onThemeModeChange = vi.fn();
  const widget = new ThemeWidget({themeMode: 'dark', onThemeModeChange});
  const internalBefore = widget.themeMode;

  (widget as any)._handleClick();

  expect(onThemeModeChange).toHaveBeenCalledWith('light');
  // Internal state unchanged in controlled mode
  expect(widget.themeMode).toBe(internalBefore);
  // getThemeMode still returns the controlled prop
  expect(widget.getThemeMode()).toBe('dark');
});

test('ThemeWidget - uncontrolled: _handleClick updates internal state and calls callback', () => {
  const onThemeModeChange = vi.fn();
  const widget = new ThemeWidget({initialThemeMode: 'dark', onThemeModeChange});

  expect(widget.getThemeMode()).toBe('dark');
  (widget as any)._handleClick();

  expect(onThemeModeChange).toHaveBeenCalledWith('light');
  expect(widget.themeMode).toBe('light');
});

// ---- ZoomWidget ----

test('ZoomWidget - onZoom callback is stored in props', () => {
  const onZoom = vi.fn();
  const widget = new ZoomWidget({onZoom});
  expect(widget.props.onZoom).toBe(onZoom);
});

test('ZoomWidget - default onZoom is a no-op', () => {
  const widget = new ZoomWidget();
  expect(() => widget.props.onZoom({viewId: 'test', delta: 1, zoom: 5})).not.toThrow();
});

test('ZoomWidget - handleZoom calls onZoom with correct params', () => {
  const onZoom = vi.fn();
  const widget = new ZoomWidget({onZoom});

  // Mock getViewState to return a basic view state
  vi.spyOn(widget, 'getViewState').mockReturnValue({zoom: 10});
  // Mock setViewState to prevent actual state changes
  vi.spyOn(widget, 'setViewState').mockImplementation(() => {});

  widget.handleZoom('default-view', 11, 1);

  expect(onZoom).toHaveBeenCalledWith({viewId: 'default-view', delta: 1, zoom: 11});
});

test('ZoomWidget - handleZoom respects minZoom/maxZoom constraints', () => {
  const onZoom = vi.fn();
  const widget = new ZoomWidget({onZoom});

  vi.spyOn(widget, 'getViewState').mockReturnValue({zoom: 10, minZoom: 2, maxZoom: 12});
  vi.spyOn(widget, 'setViewState').mockImplementation(() => {});

  // Try to zoom beyond maxZoom
  widget.handleZoom('default-view', 15, 1);
  expect(onZoom).toHaveBeenCalledWith({viewId: 'default-view', delta: 1, zoom: 12});

  onZoom.mockClear();

  // Try to zoom below minZoom
  widget.handleZoom('default-view', 1, -1);
  expect(onZoom).toHaveBeenCalledWith({viewId: 'default-view', delta: -1, zoom: 2});
});

// ---- CompassWidget ----

test('CompassWidget - onReset callback is called with correct params', () => {
  const onReset = vi.fn();
  const widget = new CompassWidget({onReset});
  expect(widget.props.onReset).toBe(onReset);
});

test('CompassWidget - default onReset is a no-op', () => {
  const widget = new CompassWidget();
  expect(() => widget.props.onReset({viewId: 'test', bearing: 0, pitch: 0})).not.toThrow();
});

// ---- GimbalWidget ----

test('GimbalWidget - onReset callback is stored in props', () => {
  const onReset = vi.fn();
  const widget = new GimbalWidget({onReset});
  expect(widget.props.onReset).toBe(onReset);
});

test('GimbalWidget - default onReset is a no-op', () => {
  const widget = new GimbalWidget();
  expect(() =>
    widget.props.onReset({viewId: 'test', rotationOrbit: 0, rotationX: 0})
  ).not.toThrow();
});

test('GimbalWidget - resetOrbitView calls onReset and sets view state', () => {
  const onReset = vi.fn();
  const widget = new GimbalWidget({onReset});

  vi.spyOn(widget, 'getViewState').mockReturnValue({rotationOrbit: 45, rotationX: 30});
  vi.spyOn(widget, 'setViewState').mockImplementation(() => {});

  widget.resetOrbitView();

  expect(onReset).toHaveBeenCalledWith({viewId: 'OrbitView', rotationOrbit: 0, rotationX: 0});
});

// ---- LoadingWidget ----

test('LoadingWidget - onLoadingChange callback is stored in props', () => {
  const onLoadingChange = vi.fn();
  const widget = new LoadingWidget({onLoadingChange});
  expect(widget.props.onLoadingChange).toBe(onLoadingChange);
});

test('LoadingWidget - default onLoadingChange is a no-op', () => {
  const widget = new LoadingWidget();
  expect(() => widget.props.onLoadingChange(true)).not.toThrow();
});

test('LoadingWidget - onRedraw calls onLoadingChange when loading state changes', () => {
  const onLoadingChange = vi.fn();
  const widget = new LoadingWidget({onLoadingChange});
  widget.loading = true;

  // Simulate all layers loaded
  widget.onRedraw({layers: [{isLoaded: true} as any]});
  expect(onLoadingChange).toHaveBeenCalledWith(false);
  expect(widget.loading).toBe(false);

  onLoadingChange.mockClear();

  // Simulate a layer loading
  widget.onRedraw({layers: [{isLoaded: false} as any]});
  expect(onLoadingChange).toHaveBeenCalledWith(true);
  expect(widget.loading).toBe(true);
});

test('LoadingWidget - onRedraw does not call callback when state unchanged', () => {
  const onLoadingChange = vi.fn();
  const widget = new LoadingWidget({onLoadingChange});
  widget.loading = true;

  // Still loading - no change
  widget.onRedraw({layers: [{isLoaded: false} as any]});
  expect(onLoadingChange).not.toHaveBeenCalled();
});

// ---- GeocoderWidget ----

test('GeocoderWidget - onGeocode callback is stored in props', () => {
  const onGeocode = vi.fn();
  const widget = new GeocoderWidget({onGeocode});
  expect(widget.props.onGeocode).toBe(onGeocode);
});

test('GeocoderWidget - default onGeocode is a no-op', () => {
  const widget = new GeocoderWidget();
  expect(() =>
    widget.props.onGeocode({viewId: 'test', coordinates: {longitude: -122, latitude: 37}})
  ).not.toThrow();
});

test('GeocoderWidget - flyTo calls onGeocode with coordinates', () => {
  const onGeocode = vi.fn();
  const widget = new GeocoderWidget({onGeocode});

  // Mock deck to provide view IDs
  (widget as any).deck = {
    getViews: () => [{id: 'default-view'}]
  };
  vi.spyOn(widget, 'getViewState').mockReturnValue({});
  vi.spyOn(widget, 'setViewState').mockImplementation(() => {});

  widget.flyTo({longitude: -122.4, latitude: 37.8, zoom: 12});

  expect(onGeocode).toHaveBeenCalledWith({
    viewId: 'default-view',
    coordinates: {longitude: -122.4, latitude: 37.8, zoom: 12}
  });
});

// ---- ResetViewWidget ----

test('ResetViewWidget - onReset callback is stored in props', () => {
  const onReset = vi.fn();
  const widget = new ResetViewWidget({onReset});
  expect(widget.props.onReset).toBe(onReset);
});

test('ResetViewWidget - default onReset is a no-op', () => {
  const widget = new ResetViewWidget();
  expect(() => widget.props.onReset({viewId: 'test', viewState: {}})).not.toThrow();
});

test('ResetViewWidget - resetViewState calls onReset for each view', () => {
  const onReset = vi.fn();
  const widget = new ResetViewWidget({onReset});

  // Mock deck to provide view IDs
  (widget as any).deck = {
    getViews: () => [{id: 'default-view'}]
  };
  vi.spyOn(widget, 'setViewState').mockImplementation(() => {});

  const initialViewState = {longitude: -122.4, latitude: 37.8, zoom: 11};
  widget.resetViewState(initialViewState as any);

  expect(onReset).toHaveBeenCalledWith({
    viewId: 'default-view',
    viewState: initialViewState
  });
});
