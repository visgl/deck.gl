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

  constructor(props: ThemeWidgetProps = {}) {
    super(props);
    this.themeMode = this._getInitialThemeMode();
    this.setProps(this.props);
  }

  // eslint-disable-next-line complexity
  setProps(props: Partial<ThemeWidgetProps>) {
    const {lightModeTheme, darkModeTheme, themeMode: prevThemeMode} = this.props;
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);

    const currentMode = this.getThemeMode();

    // Handle controlled mode - apply theme when controlled prop changes
    if (props.themeMode !== undefined && props.themeMode !== prevThemeMode) {
      this._applyTheme(props.themeMode);
      return;
    }

    switch (currentMode) {
      case 'light':
        if (props.lightModeTheme && !deepEqual(props.lightModeTheme, lightModeTheme, 1)) {
          this._applyTheme('light');
        }
        break;
      case 'dark':
        if (props.darkModeTheme && !deepEqual(props.darkModeTheme, darkModeTheme, 1)) {
          this._applyTheme('dark');
        }
        break;
      default:
        log.warn(`Invalid theme mode ${currentMode}`)();
    }
  }

  onRenderHTML(rootElement: HTMLElement): void {
    const {lightModeLabel, darkModeLabel} = this.props;
    const currentMode = this.getThemeMode();

    render(
      <IconButton
        onClick={this._handleClick.bind(this)}
        label={currentMode === 'dark' ? darkModeLabel : lightModeLabel}
        className={currentMode === 'dark' ? 'deck-widget-moon' : 'deck-widget-sun'}
      />,
      rootElement
    );
  }

  onAdd() {
    // Note: theme styling is applied in here onAdd() once DOM element is created
    this._applyTheme(this.getThemeMode());
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
      this._applyTheme(nextMode);
    }
    // In controlled mode, parent will update themeMode prop which triggers _applyTheme via setProps
  }

  /** Apply theme styling without changing internal state */
  _applyTheme(themeMode: 'light' | 'dark') {
    const container = this.rootElement?.closest<HTMLDivElement>('.deck-widget-container');
    if (container) {
      const themeStyle =
        themeMode === 'dark' ? this.props.darkModeTheme : this.props.lightModeTheme;
      applyStyles(container, themeStyle);

      const label = themeMode === 'dark' ? this.props.darkModeLabel : this.props.lightModeLabel;
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
