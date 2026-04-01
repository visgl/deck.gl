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
  /** Initial slider value.
   * @default `timeRange[0]`
   */
  initialTime?: number;
  /** Callback when value changes. */
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
  /** Callback to get label from time value */
  formatLabel?: (value: number) => string;
};

export class TimelineWidget extends Widget<TimelineWidgetProps> {
  id = 'timeline';
  className = 'deck-widget-timeline';
  placement: WidgetPlacement = 'fill';

  private playing = false;
  private timerId: number | null = null;
  currentTime: number;

  static defaultProps: Required<TimelineWidgetProps> = {
    ...Widget.defaultProps,
    id: 'timeline',
    placement: 'bottom-left',
    viewId: null,
    timeline: null,
    timeRange: [0, 100],
    step: 1,
    initialTime: undefined!,
    onTimeChange: () => {},
    autoPlay: false,
    loop: false,
    playInterval: 1000,
    formatLabel: String
  };

  constructor(props: TimelineWidgetProps = {}) {
    super(props);
    this.currentTime = this.props.initialTime ?? this.props.timeRange[0];
    this.props.timeline?.setTime(this.currentTime);
    this.setProps(this.props);
  }

  setProps(props: Partial<TimelineWidgetProps>): void {
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }

  onAdd(): void {
    this.playing = false;
    this.timerId = null;
    if (this.props.autoPlay) this.play();
  }

  onRemove(): void {
    this.stop();
  }

  onRenderHTML(rootElement: HTMLElement): void {
    const {timeRange, step, formatLabel} = this.props;
    const currentTime = this.currentTime;

    rootElement.dataset.placement = this.props.placement;

    render(
      <div className="deck-widget-button-group">
        {this.playing ? (
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
    if (this.playing) {
      this.stop();
    } else {
      this.play();
    }
  };

  private handleTimeChange = ([value]: [number, number]): void => {
    this.currentTime = value;
    this.props.timeline?.setTime(value);
    this.props.onTimeChange(value);
    this.updateHTML();
  };

  public play(): void {
    this.playing = true;
    const {
      timeRange: [min, max]
    } = this.props;
    if (this.currentTime >= max) {
      this.currentTime = min;
      this.props.onTimeChange(min);
    }
    this.updateHTML();
    this.tick();
  }

  public stop(): void {
    this.playing = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.updateHTML();
  }

  private tick = (): void => {
    const {
      timeRange: [min, max],
      step,
      loop
    } = this.props;
    if (step > 0) {
      let next = Math.round(this.currentTime / step) * step + step;
      if (next > max) {
        if (this.currentTime < max) {
          next = max;
        } else if (loop) {
          next = min;
        } else {
          next = max;
          this.playing = false;
        }
      }
      this.currentTime = next;
      this.props.onTimeChange(next);
      this.updateHTML();
    }
    if (this.playing) {
      this.timerId = window.setTimeout(this.tick, this.props.playInterval);
    } else {
      this.timerId = null;
    }
  };
}
