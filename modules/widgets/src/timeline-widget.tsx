// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Widget, type WidgetPlacement, type WidgetProps} from '@deck.gl/core';
import {render} from 'preact';
import {IconButton} from './lib/components/icon-button';

export type TimelineWidgetProps = WidgetProps & {
  /** Widget positioning within the view. Default 'bottom-left'. */
  placement?: WidgetPlacement;
  /** View to attach to and interact with. Required when using multiple views. */
  viewId?: string | null;
  /** Slider timeRange [min, max]. */
  timeRange?: [number, number];
  /** Slider step. */
  step?: number;
  /** Initial slider value for uncontrolled usage. */
  initialTime?: number;
  /**
   * Controlled time value. When provided, the widget is in controlled mode
   * for the time slider.
   */
  time?: number;
  /** Callback when time value changes (via slider or playback). */
  onTimeChange?: (value: number) => void;
  /** Play interval in milliseconds. */
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
};

export class TimelineWidget extends Widget<TimelineWidgetProps> {
  id = 'timeline';
  className = 'deck-widget-timeline';
  placement: WidgetPlacement = 'bottom-left';

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
    timeRange: [0, 100],
    step: 1,
    initialTime: undefined!,
    time: undefined!,
    onTimeChange: () => {},
    playInterval: 1000,
    playing: undefined!,
    onPlayingChange: () => {}
  };

  constructor(props: TimelineWidgetProps = {}) {
    super(props);
    this.currentTime = this.props.initialTime ?? this.props.timeRange[0];
    this.setProps(this.props);
  }

  setProps(props: Partial<TimelineWidgetProps>): void {
    const {time: prevTime, playing: prevPlaying} = this.props;
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);

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
  }

  onRemove(): void {
    this.stop();
  }

  onRenderHTML(rootElement: HTMLElement): void {
    const isPlaying = this.getPlaying();
    const currentTime = this.getTime();
    render(
      <div style={{display: 'flex', alignItems: 'center', pointerEvents: 'auto'}}>
        <IconButton label={isPlaying ? 'Pause' : 'Play'} onClick={this.handlePlayPause}>
          <div className="text">{isPlaying ? '⏸' : '▶'}</div>
        </IconButton>
        <input
          type="range"
          className="timeline-slider"
          min={this.props.timeRange[0]}
          max={this.props.timeRange[1]}
          step={this.props.step}
          value={currentTime}
          onInput={this.handleSliderChange}
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
        this.start();
      } else {
        this.stop();
      }
    }
    // In controlled mode, parent will update playing prop which triggers start/stop via setProps
  };

  private handleSliderChange = (e: Event): void => {
    const input = e.target as HTMLInputElement;
    const val = Number(input.value);

    // Always call callback
    this.props.onTimeChange(val);

    // Only update internal state if uncontrolled
    if (this.props.time === undefined) {
      this.currentTime = val;
      this.updateHTML();
    }
    // In controlled mode, parent will update time prop which triggers updateHTML via setProps
  };

  private start(): void {
    this._startTimer();
    this.updateHTML();
  }

  private stop(): void {
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
    const [min, max] = this.props.timeRange;
    const currentTime = this.getTime();
    let next = currentTime + this.props.step;
    if (next > max) {
      next = min;
    }

    // Always call callback
    this.props.onTimeChange(next);

    // Only update internal state if uncontrolled
    if (this.props.time === undefined) {
      this.currentTime = next;
    }

    this.updateHTML();

    // Continue if still playing
    if (this.getPlaying()) {
      this.timerId = window.setTimeout(this.tick, this.props.playInterval);
    }
  };
}
