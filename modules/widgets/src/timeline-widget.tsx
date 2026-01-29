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
  /** Initial slider value. */
  initialTime?: number;
  /** Callback when value changes. */
  onTimeChange?: (value: number) => void;
  /** Play interval in milliseconds. */
  playInterval?: number;
};

export class TimelineWidget extends Widget<TimelineWidgetProps> {
  id = 'timeline';
  className = 'deck-widget-timeline';
  placement: WidgetPlacement = 'bottom-left';

  private playing = false;
  private timerId: number | null = null;
  currentTime: number;

  static defaultProps: Required<TimelineWidgetProps> = {
    ...Widget.defaultProps,
    id: 'timeline',
    placement: 'bottom-left',
    viewId: null,
    timeRange: [0, 100],
    step: 1,
    initialTime: undefined!,
    onTimeChange: () => {},
    playInterval: 1000
  };

  constructor(props: TimelineWidgetProps = {}) {
    super(props);
    this.currentTime = this.props.initialTime ?? this.props.timeRange[0];
    this.setProps(this.props);
  }

  setProps(props: Partial<TimelineWidgetProps>): void {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }

  onAdd(): void {
    this.playing = false;
    this.timerId = null;
  }

  onRemove(): void {
    this.stop();
  }

  onRenderHTML(rootElement: HTMLElement): void {
    render(
      <div style={{display: 'flex', alignItems: 'center', pointerEvents: 'auto'}}>
        <IconButton label={this.playing ? 'Pause' : 'Play'} onClick={this.handlePlayPause}>
          <div className="text">{this.playing ? '⏸' : '▶'}</div>
        </IconButton>
        <input
          type="range"
          className="timeline-slider"
          min={this.props.timeRange[0]}
          max={this.props.timeRange[1]}
          step={this.props.step}
          value={this.currentTime}
          onInput={this.handleSliderChange}
        />
      </div>,
      rootElement
    );
  }

  private handlePlayPause = (): void => {
    if (this.playing) {
      this.stop();
    } else {
      this.start();
    }
  };

  private handleSliderChange = (e: Event): void => {
    const input = e.target as HTMLInputElement;
    const val = Number(input.value);
    this.currentTime = val;
    this.props.onTimeChange(val);
    this.updateHTML();
  };

  private start(): void {
    this.playing = true;
    this.updateHTML();
    this.tick();
  }

  private stop(): void {
    this.playing = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.updateHTML();
  }

  private tick = (): void => {
    const [min, max] = this.props.timeRange;
    let next = this.currentTime + this.props.step;
    if (next > max) {
      next = min;
    }
    this.currentTime = next;
    this.props.onTimeChange(next);
    this.updateHTML();
    if (this.playing) {
      this.timerId = window.setTimeout(this.tick, this.props.playInterval);
    }
  };
}
