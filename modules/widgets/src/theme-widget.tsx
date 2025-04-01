// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
import {
  log,
  _deepEqual as deepEqual,
  _applyStyles as applyStyles,
  _removeStyles as removeStyles
} from '@deck.gl/core';
import type {Deck, Widget, WidgetPlacement} from '@deck.gl/core';
import {render} from 'preact';
import {IconButton} from './components';
import type {DeckWidgetTheme} from './themes';
import {LightGlassTheme, DarkGlassTheme} from './themes';

export type ThemeWidgetProps = {
  id?: string;
  /** Widget positioning within the view. Default 'top-left'. */
  placement?: WidgetPlacement;
  /** CSS inline style overrides. */
  style?: Partial<CSSStyleDeclaration>;
  /** Additional CSS class. */
  className?: string;
  /** Tooltip message when dark mode is selected. */
  lightModeLabel?: string;
  /** Styles for light mode theme */
  lightModeTheme?: DeckWidgetTheme;
  /** Tooltip message when light mode is selected. */
  darkModeLabel?: string;
  /** Styles for dark mode theme */
  darkModeTheme?: DeckWidgetTheme;
  /** Initial theme setting */
  initialTheme?: 'auto' | 'light' | 'dark';
};

export class ThemeWidget implements Widget<ThemeWidgetProps> {
  id = 'theme';
  props: Required<ThemeWidgetProps>;
  placement: WidgetPlacement = 'top-left';

  deck?: Deck<any>;
  element?: HTMLDivElement;

  themeMode: 'light' | 'dark' = 'dark';

  static defaultProps: Required<ThemeWidgetProps> = {
    id: 'theme',
    placement: 'top-left',
    className: '',
    style: {},
    lightModeLabel: 'Light Mode',
    lightModeTheme: LightGlassTheme,
    darkModeLabel: 'Dark Mode',
    darkModeTheme: DarkGlassTheme,
    initialTheme: 'auto'
  };

  constructor(props: ThemeWidgetProps = {}) {
    this.id = props.id ?? this.id;
    this.placement = props.placement ?? this.placement;

    this.props = {
      ...ThemeWidget.defaultProps,
      ...props
    };

    this.themeMode = this.getInitialMode();
  }

  onAdd({deck}: {deck: Deck<any>}): HTMLDivElement {
    const {style, className} = this.props;
    const el = document.createElement('div');
    el.classList.add('deck-widget', 'deck-widget-theme');
    if (className) el.classList.add(className);
    applyStyles(el, style);
    this.deck = deck;
    this.element = el;
    this.update();
    return el;
  }

  onRemove() {
    this.deck = undefined;
    this.element = undefined;
  }

  private update() {
    const {lightModeLabel, darkModeLabel} = this.props;
    const element = this.element;
    if (!element) {
      return;
    }

    const ui = (
      <IconButton
        onClick={this.handleClick.bind(this)}
        label={this.themeMode === 'dark' ? darkModeLabel : lightModeLabel}
        className={this.themeMode === 'dark' ? 'deck-widget-moon' : 'deck-widget-sun'}
      />
    );
    render(ui, element);
  }

  setProps(props: Partial<ThemeWidgetProps>) {
    this.placement = props.placement ?? this.placement;
    const oldProps = this.props;
    const el = this.element;
    if (el) {
      if (oldProps.className !== props.className) {
        if (oldProps.className) el.classList.remove(oldProps.className);
        if (props.className) el.classList.add(props.className);
      }

      if (!deepEqual(oldProps.style, props.style, 1)) {
        removeStyles(el, oldProps.style);
        applyStyles(el, props.style);
      }
    }

    Object.assign(this.props, props);
    this.update();
  }

  async handleClick() {
    this.themeMode = this.themeMode === 'dark' ? 'light' : 'dark';
    const themeStyle =
      this.themeMode === 'dark' ? this.props.darkModeTheme : this.props.lightModeTheme;
    log.log(
      1,
      `Switching to ${this.themeMode === 'dark' ? this.props.darkModeLabel : this.props.lightModeLabel}`,
      themeStyle
    );

    const el = this.element;
    if (el) {
      const container = el.closest('.deck-widget-container');
      if (container) {
        applyStyles(container, themeStyle);
      }
    }

    this.update();
  }

  getInitialMode() {
    const {initialTheme} = this.props;
    if (initialTheme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return initialTheme;
  }
}
