// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {log, _deepEqual as deepEqual, _applyStyles as applyStyles} from '@deck.gl/core';
import {Widget, WidgetProps, WidgetPlacement} from '@deck.gl/core';
import {render} from 'preact';
import {IconButton} from './lib/components';
import type {DeckWidgetTheme} from './themes';
import {LightGlassTheme, DarkGlassTheme} from './themes';

export type ThemeWidgetProps = WidgetProps & {
  /** Widget positioning within the view. Default 'top-left'. */
  placement?: WidgetPlacement;
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

export class ThemeWidget extends Widget<ThemeWidgetProps> {
  className = 'deck-widget-theme';

  placement: WidgetPlacement = 'top-left';
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
    super(props, ThemeWidget.defaultProps);
    this.placement = props.placement ?? this.placement;
    this.themeMode = this._getInitialMode();
  }

  // eslint-disable-next-line complexity
  setProps(props: Partial<ThemeWidgetProps>) {
    const oldProps = this.props;
    const {lightModeTheme, darkModeTheme, placement} = props;
    this.placement = placement ?? this.placement;
    if (
      this.themeMode === 'light' &&
      lightModeTheme &&
      !deepEqual(oldProps.lightModeTheme, lightModeTheme, 1)
    ) {
      this._setTheme(lightModeTheme);
    } else if (darkModeTheme && !deepEqual(oldProps.darkModeTheme, darkModeTheme, 1)) {
      this._setTheme(darkModeTheme);
    }

    super.setProps(props);
  }

  onRenderHTML(rootElement: HTMLElement): void {
    const {lightModeLabel, darkModeLabel} = this.props;
    const ui = (
      <IconButton
        onClick={this.handleClick.bind(this)}
        label={this.themeMode === 'dark' ? darkModeLabel : lightModeLabel}
        className={this.themeMode === 'dark' ? 'deck-widget-moon' : 'deck-widget-sun'}
      />
    );
    render(ui, rootElement);
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
    this._setTheme(themeStyle);

    this.updateHTML();
  }

  _getInitialMode() {
    const {initialTheme} = this.props;
    if (initialTheme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return initialTheme;
  }

  _setTheme(themeStyle: DeckWidgetTheme) {
    const el = this.rootElement;
    if (el) {
      const container = el.closest<HTMLDivElement>('.deck-widget-container');
      if (container) {
        applyStyles(container, themeStyle);
      }
    }
  }
}
