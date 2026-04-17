// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {ThemeWidget} from '@deck.gl/widgets';

test('ThemeWidget - uncontrolled: initialThemeMode sets starting state', () => {
  const widget = new ThemeWidget({initialThemeMode: 'light'});
  expect(widget.getThemeMode()).toBe('light');
});

test('ThemeWidget - uncontrolled: initialThemeMode dark', () => {
  const widget = new ThemeWidget({initialThemeMode: 'dark'});
  expect(widget.getThemeMode()).toBe('dark');
});

test('ThemeWidget - controlled: getThemeMode returns themeMode prop', () => {
  const widget = new ThemeWidget({themeMode: 'light'});
  expect(widget.getThemeMode()).toBe('light');

  widget.setProps({themeMode: 'dark'});
  expect(widget.getThemeMode()).toBe('dark');
});

test('ThemeWidget - controlled: _handleClick calls onThemeModeChange but does not update internal state', () => {
  const onThemeModeChange = vi.fn();
  const widget = new ThemeWidget({themeMode: 'dark', onThemeModeChange});
  const internalBefore = widget.themeMode;

  (widget as any)._handleClick();

  expect(onThemeModeChange).toHaveBeenCalledWith('light');
  expect(widget.themeMode).toBe(internalBefore);
  expect(widget.getThemeMode()).toBe('dark');
});

test('ThemeWidget - uncontrolled: _handleClick updates internal state and calls callback', () => {
  const onThemeModeChange = vi.fn();
  const widget = new ThemeWidget({initialThemeMode: 'dark', onThemeModeChange});

  expect(widget.getThemeMode()).toBe('dark');
  (widget as any)._handleClick();

  expect(onThemeModeChange).toHaveBeenCalledWith('light');
  expect(widget.themeMode).toBe('light');
});
