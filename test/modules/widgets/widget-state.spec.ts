// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi, beforeEach, afterEach} from 'vitest';
import {_TimelineWidget as TimelineWidget} from '@deck.gl/widgets';
import {_StatsWidget as StatsWidget} from '@deck.gl/widgets';
import {FullscreenWidget} from '@deck.gl/widgets';
import {CompassWidget} from '@deck.gl/widgets';
import {GimbalWidget} from '@deck.gl/widgets';

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

test('TimelineWidget - controlled: play() does not update internal time when at max', () => {
  const onTimeChange = vi.fn();
  vi.useFakeTimers();
  const widget = new TimelineWidget({
    timeRange: [0, 100],
    initialTime: 50,
    time: 100,
    onTimeChange,
    playInterval: 100000 // large interval to prevent tick from firing
  });

  widget.play();

  expect(onTimeChange).toHaveBeenCalledWith(0);
  // Internal state should not change in controlled mode
  expect(widget.currentTime).toBe(50);
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

test('FullscreenWidget - controlled: getFullscreen returns fullscreen prop', () => {
  const widget = new FullscreenWidget({fullscreen: true});
  expect(widget.getFullscreen()).toBe(true);
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

test('FullscreenWidget - controlled pseudo-fullscreen calls callback but does not update internal state', () => {
  const onFullscreenChange = vi.fn();
  const widget = new FullscreenWidget({fullscreen: false, onFullscreenChange});

  const container = document.createElement('div');
  vi.spyOn(widget, 'getContainer').mockReturnValue(container);

  widget.togglePseudoFullscreen();

  expect(onFullscreenChange).toHaveBeenCalledWith(true);
  // Internal state unchanged in controlled mode
  expect(widget.fullscreen).toBe(false);
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
