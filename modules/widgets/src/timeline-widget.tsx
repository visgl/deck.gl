// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
import type {Deck, Widget} from '@deck.gl/core';
import {render} from 'preact';

export type TimelineWidgetProps = {
  /**
   * Widget id
   */
  id?: string;
  /**
   * CSS inline style overrides.
   */
  style?: Partial<CSSStyleDeclaration>;
  /**
   * Additional CSS class.
   */
  className?: string;
  /**
   * Slider domain [min, max].
   */
  domain?: [number, number];
  /**
   * Slider step.
   */
  step?: number;
  /**
   * Current slider value.
   */
  value?: number;
  /**
   * Callback when value changes.
   */
  onTimeChange?: (value: number) => void;
  /**
   * Play interval in milliseconds.
   */
  playInterval?: number;
};

export class TimelineWidget implements Widget<TimelineWidgetProps> {
  id = 'timeline';
  props: Required<TimelineWidgetProps>;
  deck?: Deck<any>;
  element?: HTMLDivElement;
  private playing = false;
  private timerId: number | null = null;

  static defaultProps: Required<TimelineWidgetProps> = {
    id: 'timeline',
    style: {},
    className: undefined!,
    domain: [0, 100],
    step: 1,
    value: 0,
    onTimeChange: () => {},
    playInterval: 1000
  };

  constructor(props: TimelineWidgetProps = {}) {
    this.id = props.id ?? this.id;
    this.props = {...TimelineWidget.defaultProps, ...props};
  }

  onAdd({deck}: {deck: Deck<any>}): HTMLDivElement {
    this.deck = deck;
    const el = document.createElement('div');
    el.classList.add('deck-widget', 'deck-widget-timeline');
    if (this.props.className) {
      el.classList.add(this.props.className);
    }
    Object.assign(el.style, this.props.style);
    this.element = el;
    this.renderUI();
    return el;
  }

  onRemove(): void {
    this.stop();
    this.deck = undefined;
    this.element = undefined;
  }

  setProps(props: Partial<TimelineWidgetProps>): void {
    Object.assign(this.props, props);
    if (this.element) {
      // update className
      this.element.className = ['deck-widget', 'deck-widget-timeline', this.props.className]
        .filter(Boolean)
        .join(' ');
      // update style
      if (props.style) {
        Object.assign(this.element.style, this.props.style);
      }
    }
    this.renderUI();
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
    this.props.value = val;
    this.props.onTimeChange(val);
    this.renderUI();
  };

  private start(): void {
    this.playing = true;
    this.renderUI();
    this.tick();
  }

  private stop(): void {
    this.playing = false;
    if (this.timerId != null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.renderUI();
  }

  private tick = (): void => {
    const [min, max] = this.props.domain;
    let next = this.props.value + this.props.step;
    if (next > max) {
      next = min;
    }
    this.props.value = next;
    this.props.onTimeChange(next);
    this.renderUI();
    if (this.playing) {
      this.timerId = window.setTimeout(this.tick, this.props.playInterval);
    }
  };

  private renderUI(): void {
    const el = this.element;
    if (!el) {
      return;
    }
    const ui = (
      <div style={{display: 'flex', alignItems: 'center', pointerEvents: 'auto'}}>
        <button
          type="button"
          onClick={this.handlePlayPause}
          className="timeline-play-pause"
          title={this.playing ? 'Pause' : 'Play'}
        >
          {this.playing ? '⏸' : '▶'}
        </button>
        <input
          type="range"
          min={this.props.domain[0]}
          max={this.props.domain[1]}
          step={this.props.step}
          value={this.props.value}
          onInput={this.handleSliderChange}
          className="timeline-slider"
        />
      </div>
    );
    render(ui, el);
  }
}
