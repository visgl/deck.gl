// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterEach, test, expect, vi} from 'vitest';
import {_TimelineWidget as TimelineWidget} from '@deck.gl/widgets';
import {WidgetTester} from './common';

let testInstance: WidgetTester<any> | undefined;

afterEach(() => {
  testInstance?.destroy();
  testInstance = undefined;
});

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

  widget.stop();
  expect(widget.getPlaying()).toBe(false);

  vi.useRealTimers();
});

test('TimelineWidget', async () => {
  const onPlayingChange = vi.fn();
  const onTimeChange = vi.fn();
  const widget = new TimelineWidget({
    timeRange: [0, 100],
    playInterval: 10,
    onPlayingChange,
    onTimeChange
  });
  testInstance = new WidgetTester({
    widgets: [widget]
  });

  await testInstance.idle();
  testInstance.click('.deck-widget-timeline-play');
  expect(onPlayingChange).toHaveBeenCalledWith(true);

  await vi.waitFor(() => {
    expect(onTimeChange).toHaveBeenCalledWith(4);
  });

  testInstance.click('.deck-widget-timeline-pause');
  expect(onPlayingChange).toHaveBeenCalledWith(false);
});
