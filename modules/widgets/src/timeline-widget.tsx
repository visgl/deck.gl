// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Widget, type WidgetPlacement, type WidgetProps} from '@deck.gl/core';
import {render} from 'preact';
import {IconButton} from './lib/components/icon-button';
import { RangeInput } from './lib/components/range-input';

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
  /** Start playing automatically */
  autoPlay?: boolean;
  /** Play interval in milliseconds. */
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
    timeRange: [0, 100],
    step: 1,
    initialTime: undefined!,
    onTimeChange: () => {},
    autoPlay: false,
    playInterval: 1000,
    formatLabel: String,
  };

  constructor(props: TimelineWidgetProps = {}) {
    super(props);
    this.currentTime = this.props.initialTime ?? this.props.timeRange[0];
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

    rootElement.dataset['placement'] = this.props.placement;

    render(
      <>
        <IconButton label={this.playing ? 'Pause' : 'Play'} onClick={this.handlePlayPause}>
          <div className="text">{this.playing ? '⏸' : '▶'}</div>
        </IconButton>
        <div style={{flexGrow: 1, height: 'var(--track-size)', position: 'relative'}}>
          <RangeInput
            min={timeRange[0]}
            max={timeRange[1]}
            thumbMinSize={10}
            orientation='horizontal'
            step={step}
            value={[currentTime, currentTime]}
            onChange={this.handleTimeChange}
            decorations={[
              {
                position: [currentTime, currentTime],
                element: <div className="deck-widget-timeline-label">{formatLabel(currentTime)}</div>}
            ]}
          />
        </div>
      </>,
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
    this.props.onTimeChange(value);
    this.updateHTML();
  };

  public play(): void {
    this.playing = true;
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
