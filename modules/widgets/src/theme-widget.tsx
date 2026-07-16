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
  /** Initial theme mode for uncontrolled usage. 'auto' reads the browser default setting */
  initialThemeMode?: 'auto' | 'light' | 'dark';
  /**
   * Controlled theme mode. When provided, the widget is in controlled mode
   * and this prop determines the current theme.
   */
  themeMode?: 'light' | 'dark';
  /**
   * Callback when the user clicks the theme toggle button.
   * In controlled mode, use this to update the themeMode prop.
   * In uncontrolled mode, this is called after the internal state updates.
   */
  onThemeModeChange?: (newMode: 'light' | 'dark') => void;
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
    initialThemeMode: 'auto',
    themeMode: undefined!,
    onThemeModeChange: () => {}
  };

  className = 'deck-widget-theme';
  placement: WidgetPlacement = 'top-left';
  themeMode: 'light' | 'dark' = 'dark';
  appliedTheme: DeckWidgetTheme = {};

  constructor(props: ThemeWidgetProps = {}) {
    super(props);
    this.themeMode = this._getInitialThemeMode();
    this.setProps(this.props);
  }

  // eslint-disable-next-line complexity
  setProps(props: Partial<ThemeWidgetProps>) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }

  onRenderHTML(rootElement: HTMLElement): void {
    const {lightModeLabel, darkModeLabel} = this.props;
    const currentMode = this.getThemeMode();
    this._applyTheme(currentMode, rootElement);

    render(
      <IconButton
        onClick={this._handleClick.bind(this)}
        label={currentMode === 'dark' ? darkModeLabel : lightModeLabel}
        className={currentMode === 'dark' ? 'deck-widget-moon' : 'deck-widget-sun'}
      />,
      rootElement
    );
  }

  /**
   * Returns the current theme mode.
   * In controlled mode, returns the themeMode prop.
   * In uncontrolled mode, returns the internal state.
   */
  getThemeMode(): 'light' | 'dark' {
    return this.props.themeMode ?? this.themeMode;
  }

  _handleClick() {
    const currentMode = this.getThemeMode();
    const nextMode = currentMode === 'dark' ? 'light' : 'dark';

    // Always call callback if provided
    this.props.onThemeModeChange?.(nextMode);

    // Only update internal state if uncontrolled
    if (this.props.themeMode === undefined) {
      this.themeMode = nextMode;
      this.updateHTML();
    }
    // In controlled mode, parent will update themeMode prop which triggers _applyTheme via setProps
  }

  /** Apply theme styling without changing internal state */
  _applyTheme(themeMode: 'light' | 'dark', rootElement: HTMLElement) {
    const themeStyle = themeMode === 'dark' ? this.props.darkModeTheme : this.props.lightModeTheme;
    if (deepEqual(themeStyle, this.appliedTheme, 1)) {
      return;
    }
    const container = rootElement.closest<HTMLDivElement>('.deck-widget-container');
    if (!container) return;

    applyStyles(container, themeStyle);
    this.appliedTheme = themeStyle;

    const label = themeMode === 'dark' ? this.props.darkModeLabel : this.props.lightModeLabel;
    log.log(1, `Switched theme to ${label}`, themeStyle)();
  }

  /** Read browser preference */
  _getInitialThemeMode(): 'light' | 'dark' {
    const {initialThemeMode} = this.props;
    if (initialThemeMode !== 'auto') {
      return initialThemeMode;
    }
    if (typeof window === 'undefined') {
      return 'light';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
