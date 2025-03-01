// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
import {
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
  /** Tooltip message when out of fullscreen. */
  lightModeLabel?: string;
  /** Styles for light mode theme */
  lightModeTheme?: DeckWidgetTheme;
  /** Tooltip message when fullscreen. */
  darkModeLabel?: string;
  /** Styles for dark mode theme */
  darkModeTheme?: DeckWidgetTheme;
  /** Initial theme setting */
  initialTheme?: 'auto' | 'light' | 'dark' | 'none';
};

export class ThemeWidget implements Widget<ThemeWidgetProps> {
  id = 'fullscreen';
  props: ThemeWidgetProps;
  placement: WidgetPlacement = 'top-left';

  deck?: Deck<any>;
  element?: HTMLDivElement;

  darkMode: boolean = false;

  static defaultProps: Required<ThemeWidgetProps> = {
    id: 'widget',
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

    this.darkMode = false; // this.getInitialMode();
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
        label={this.darkMode ? darkModeLabel : lightModeLabel}
        className={this.darkMode ? 'deck-widget-moon' : 'deck-widget-sun'}
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

    this.deck?.setProps({
      style: this.darkMode ? this.props.darkModeTheme : this.props.lightModeTheme
    });
  }

  async handleClick() {
    this.darkMode = !this.darkMode;
    const themeStyle = this.darkMode ? this.props.darkModeTheme : this.props.lightModeTheme;
    console.log(
      `Switching to ${this.darkMode ? this.props.darkModeLabel : this.props.lightModeLabel}`,
      themeStyle
    );
    // Note: deck does not support updating the style property
    // this.deck?.setProps({
    //   style: themeStyle
    // });
    const elements = document.querySelectorAll('.deck-theme')!;
    elements.forEach(root => {
      const canvasStyle = root.style;
      if (canvasStyle) {
        // Object.assign(canvasStyle, themeStyle);
        for (const [variable, value] of Object.entries(themeStyle!)) {
          if (variable.startsWith('--')) {
            canvasStyle.setProperty(variable, value);
          }
        }
      }
    });
    this.update();
  }

  getInitialMode(): boolean {
    // TODO - consider initial prop
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
