// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Widget, type WidgetPlacement, type WidgetProps} from '@deck.gl/core';
import type {Timeline} from '@luma.gl/engine';
import {render} from 'preact';
import {IconButton} from './lib/components/icon-button';
import {RangeInput} from './lib/components/range-input';

export type TimelineWidgetProps = WidgetProps & {
  /** Widget positioning within the view. Default 'bottom-left'. */
  placement?: WidgetPlacement;
  /** View to attach to and interact with. Required when using multiple views. */
  viewId?: string | null;
  /** Timeline instance to manipulate. */
  timeline?: Timeline | null;
  /** Slider timeRange [min, max]. */
  timeRange?: [number, number];
  /** Slider step.
   * @default 1
   */
  step?: number;
  /** Initial slider value for uncontrolled usage.
   * @default `timeRange[0]`
   */
  initialTime?: number;
  /**
   * Controlled time value. When provided, the widget is in controlled mode
   * for the time slider.
   */
  time?: number;
  /** Callback when time value changes (via slider or playback). */
  onTimeChange?: (value: number) => void;
  /** Start playing automatically
   * @default false
   */
  autoPlay?: boolean;
  /** Start from the beginning whentime reaches the end
   * @default false
   */
  loop?: boolean;
  /** Play interval in milliseconds.
   * @default 1000
   */
  playInterval?: number;
  /**
   * Controlled playing state. When provided, the widget is in controlled mode
   * for play/pause.
   */
  playing?: boolean;
  /**
   * Callback when play/pause button is clicked.
   * In controlled mode, use this to update the playing prop.
   */
  onPlayingChange?: (playing: boolean) => void;
  /** Callback to get label from time value */
  formatLabel?: (value: number) => string;
};

export class TimelineWidget extends Widget<TimelineWidgetProps> {
  id = 'timeline';
  className = 'deck-widget-timeline';
  placement: WidgetPlacement = 'fill';

  private _playing = false;
  private timerId: number | null = null;
  currentTime: number;

  /**
   * Returns the current time value.
   * In controlled mode, returns the time prop.
   * In uncontrolled mode, returns the internal state.
   */
  getTime(): number {
    return this.props.time ?? this.currentTime;
  }

  /**
   * Returns the current playing state.
   * In controlled mode, returns the playing prop.
   * In uncontrolled mode, returns the internal state.
   */
  getPlaying(): boolean {
    return this.props.playing ?? this._playing;
  }

  static defaultProps: Required<TimelineWidgetProps> = {
    ...Widget.defaultProps,
    id: 'timeline',
    placement: 'bottom-left',
    viewId: null,
    timeline: null,
    timeRange: [0, 100],
    step: 1,
    initialTime: undefined!,
    time: undefined!,
    onTimeChange: () => {},
    autoPlay: false,
    loop: false,
    playInterval: 1000,
    playing: undefined!,
    onPlayingChange: () => {},
    formatLabel: String
  };

  constructor(props: TimelineWidgetProps = {}) {
    super(props);
    this.currentTime = this.props.initialTime ?? this.props.timeRange[0];
    // In controlled mode, sync Timeline to the controlled time prop
    const syncTime = this.props.time ?? this.currentTime;
    this.props.timeline?.setTime(syncTime);
    this.setProps(this.props);
  }

  setProps(props: Partial<TimelineWidgetProps>): void {
    const {playing: prevPlaying, time: prevTime} = this.props;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);

    // Sync Timeline object when controlled time prop changes
    if (props.time !== undefined && props.time !== prevTime) {
      this.props.timeline?.setTime(props.time);
    }

    // Handle controlled playing state changes
    if (props.playing !== undefined && props.playing !== prevPlaying) {
      if (props.playing && !this._playing) {
        this._startTimer();
      } else if (!props.playing && this._playing) {
        this._stopTimer();
      }
    }
  }

  onAdd(): void {
    this._playing = false;
    this.timerId = null;
    if (this.props.autoPlay) {
      if (this.props.playing !== undefined) {
        // In controlled mode, notify parent instead of starting directly
        this.props.onPlayingChange?.(true);
      } else {
        this.play();
      }
    }
  }

  onRemove(): void {
    this.stop();
  }

  onRenderHTML(rootElement: HTMLElement): void {
    const {timeRange, step, formatLabel} = this.props;
    const isPlaying = this.getPlaying();
    const currentTime = this.getTime();

    rootElement.dataset.placement = this.props.placement;

    render(
      <div className="deck-widget-button-group">
        {isPlaying ? (
          <IconButton
            label="Pause"
            className="deck-widget-timeline-pause"
            onClick={this.handlePlayPause}
          />
        ) : (
          <IconButton
            label="Play"
            className="deck-widget-timeline-play"
            onClick={this.handlePlayPause}
          />
        )}
        <RangeInput
          min={timeRange[0]}
          max={timeRange[1]}
          orientation="horizontal"
          step={step}
          value={[currentTime, currentTime]}
          onChange={this.handleTimeChange}
          decorations={[
            {
              position: [currentTime, currentTime + step],
              element: (
                <div className="deck-widget-timeline-label deck-widget-timeline-label--current">
                  {formatLabel(currentTime)}
                </div>
              )
            }
          ]}
        />
      </div>,
      rootElement
    );
  }

  private handlePlayPause = (): void => {
    const isPlaying = this.getPlaying();
    const nextPlaying = !isPlaying;

    // Always call callback if provided
    this.props.onPlayingChange?.(nextPlaying);

    // Only update internal state if uncontrolled
    if (this.props.playing === undefined) {
      if (nextPlaying) {
        this.play();
      } else {
        this.stop();
      }
    }
    // In controlled mode, parent will update playing prop which triggers start/stop via setProps
  };

  private handleTimeChange = ([value]: [number, number]): void => {
    // Always call callback
    this.props.onTimeChange(value);

    // Only update internal state if uncontrolled
    if (this.props.time === undefined) {
      this.currentTime = value;
      this.props.timeline?.setTime(value);
      this.updateHTML();
    }
    // In controlled mode, parent will update time prop which triggers updateHTML via setProps
  };

  public play(): void {
    this._playing = true;
    const {
      timeRange: [min, max]
    } = this.props;
    // In uncontrolled mode, reset to start if at end
    if (this.props.time === undefined && this.getTime() >= max) {
      this.currentTime = min;
      this.props.onTimeChange(min);
      this.props.timeline?.setTime(min);
    }
    this.updateHTML();
    this.tick();
  }

  public stop(): void {
    this._stopTimer();
    this.updateHTML();
  }

  /** Start the playback timer (used internally) */
  private _startTimer(): void {
    this._playing = true;
    this.tick();
  }

  /** Stop the playback timer (used internally) */
  private _stopTimer(): void {
    this._playing = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private tick = (): void => {
    const {
      timeRange: [min, max],
      step,
      loop
    } = this.props;
    if (step > 0) {
      const currentTime = this.getTime();
      let next = Math.round(currentTime / step) * step + step;
      if (next > max) {
        if (currentTime < max) {
          next = max;
        } else if (loop) {
          next = min;
        } else {
          next = max;
          this._playing = false;
          this.props.onPlayingChange?.(false);
        }
      }

      // Always call callback
      this.props.onTimeChange(next);

      // Only update internal state if uncontrolled
      if (this.props.time === undefined) {
        this.currentTime = next;
        this.props.timeline?.setTime(next);
      }
      this.updateHTML();
    }
    if (this._playing) {
      this.timerId = window.setTimeout(this.tick, this.props.playInterval);
    } else {
      this.timerId = null;
    }
  };
}
