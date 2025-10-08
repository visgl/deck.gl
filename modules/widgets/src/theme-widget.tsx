// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {log, _deepEqual as deepEqual, _applyStyles as applyStyles} from '@deck.gl/core';
import {Widget, type WidgetProps, type WidgetPlacement} from '@deck.gl/core';
import {render} from 'preact';
// import {useCallback} from 'preact/hooks';
import {IconButton} from './lib/components/icon-button';
import type {DeckWidgetTheme} from './themes';
import {LightGlassTheme, DarkGlassTheme} from './themes';

export type ThemeWidgetProps = WidgetProps & {
  /** Widget positioning within the view. Default 'top-left'. */
  placement?: WidgetPlacement;
  /** View to attach to and interact with. Required when using multiple views. */
  viewId?: string | null;
  /** Tooltip message when dark mode is selected. */
  lightModeLabel?: string;
  /** Styles for light mode theme */
  lightModeTheme?: DeckWidgetTheme;
  /** Tooltip message when light mode is selected. */
  darkModeLabel?: string;
  /** Styles for dark mode theme */
  darkModeTheme?: DeckWidgetTheme;
  /** Initial theme mode. 'auto' reads the browser default setting */
  initialThemeMode?: 'auto' | 'light' | 'dark';
};

export class ThemeWidget extends Widget<ThemeWidgetProps> {
  static defaultProps: Required<ThemeWidgetProps> = {
    ...Widget.defaultProps,
    id: 'theme',
    placement: 'top-left',
    viewId: null,
    lightModeLabel: 'Light Mode',
    lightModeTheme: LightGlassTheme,
    darkModeLabel: 'Dark Mode',
    darkModeTheme: DarkGlassTheme,
    initialThemeMode: 'auto'
  };

  className = 'deck-widget-theme';
  placement: WidgetPlacement = 'top-left';
  themeMode: 'light' | 'dark' = 'dark';

  constructor(props: ThemeWidgetProps = {}) {
    super(props);
    this.themeMode = this._getInitialThemeMode();
    this.setProps(this.props);
  }

  // eslint-disable-next-line complexity
  setProps(props: Partial<ThemeWidgetProps>) {
    const {lightModeTheme, darkModeTheme} = this.props;
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);

    switch (this.themeMode) {
      case 'light':
        if (props.lightModeTheme && !deepEqual(props.lightModeTheme, lightModeTheme, 1)) {
          this._setThemeMode('light');
        }
        break;
      case 'dark':
        if (props.darkModeTheme && !deepEqual(props.darkModeTheme, darkModeTheme, 1)) {
          this._setThemeMode('dark');
        }
        break;
      default:
        log.warn(`Invalid theme mode ${this.themeMode}`)();
    }
  }

  onRenderHTML(rootElement: HTMLElement): void {
    const {lightModeLabel, darkModeLabel} = this.props;
    // const onClick = useCallback(this._handleClick.bind(this), [this._handleClick]);

    render(
      <IconButton
        onClick={this._handleClick.bind(this)}
        label={this.themeMode === 'dark' ? darkModeLabel : lightModeLabel}
        className={this.themeMode === 'dark' ? 'deck-widget-moon' : 'deck-widget-sun'}
      />,
      rootElement
    );
  }

  onAdd() {
    // Note: theme styling is applied in here onAdd() once DOM element is created
    this._setThemeMode(this.themeMode);
  }

  _handleClick() {
    const newThemeMode = this.themeMode === 'dark' ? 'light' : 'dark';
    this._setThemeMode(newThemeMode);
  }

  _setThemeMode(themeMode: 'light' | 'dark') {
    this.themeMode = themeMode;
    const container = this.rootElement?.closest<HTMLDivElement>('.deck-widget-container');
    if (container) {
      const themeStyle =
        themeMode === 'dark' ? this.props.darkModeTheme : this.props.lightModeTheme;
      applyStyles(container, themeStyle);

      const label =
        this.themeMode === 'dark' ? this.props.darkModeLabel : this.props.lightModeLabel;
      log.log(1, `Switched theme to ${label}`, themeStyle)();

      this.updateHTML();
    }
  }

  /** Read browser preference */
  _getInitialThemeMode(): 'light' | 'dark' {
    const {initialThemeMode} = this.props;
    return initialThemeMode === 'auto'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : initialThemeMode;
  }
}
