// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Every widget class that @deck.gl/widgets exports, as a component that takes the widget's props.
import type {View} from '@deck.gl/core';
import {
  _LegendWidget as DeckColorScaleWidget,
  CompassWidget as DeckCompassWidget,
  ContextMenuWidget as DeckContextMenuWidget,
  FullscreenWidget as DeckFullscreenWidget,
  _GeocoderWidget as DeckGeocoderWidget,
  GimbalWidget as DeckGimbalWidget,
  IconWidget as DeckIconWidget,
  InfoWidget as DeckInfoWidget,
  LoadingWidget as DeckLoadingWidget,
  PopupWidget as DeckPopupWidget,
  ResetViewWidget as DeckResetViewWidget,
  _ScaleWidget as DeckScaleWidget,
  ScreenshotWidget as DeckScreenshotWidget,
  ScrollbarWidget as DeckScrollbarWidget,
  SelectorWidget as DeckSelectorWidget,
  _SplitterWidget as DeckSplitterWidget,
  _StatsWidget as DeckStatsWidget,
  ThemeWidget as DeckThemeWidget,
  _TimelineWidget as DeckTimelineWidget,
  ToggleWidget as DeckToggleWidget,
  ZoomWidget as DeckZoomWidget
} from '@deck.gl/widgets';
import type {
  ColorScaleWidgetProps,
  CompassWidgetProps,
  ContextMenuWidgetProps,
  FullscreenWidgetProps,
  GeocoderWidgetProps,
  GimbalWidgetProps,
  IconWidgetProps,
  InfoWidgetProps,
  LoadingWidgetProps,
  PopupWidgetProps,
  ResetViewWidgetProps,
  ScaleWidgetProps,
  ScreenshotWidgetProps,
  ScrollbarWidgetProps,
  SelectorWidgetProps,
  SplitterWidgetProps,
  StatsWidgetProps,
  ThemeWidgetProps,
  TimelineWidgetProps,
  ToggleWidgetProps,
  ZoomWidgetProps
} from '@deck.gl/widgets';
import type {ReactElement} from 'react';

import {renderWidget} from './factories';

/** Renders `_LegendWidget` from `@deck.gl/widgets`; takes the widget's props. */
export function _LegendWidget(props: ColorScaleWidgetProps): ReactElement {
  return renderWidget(new DeckColorScaleWidget(props));
}

/** Renders `CompassWidget` from `@deck.gl/widgets`; takes the widget's props. */
export function CompassWidget(props: CompassWidgetProps): ReactElement {
  return renderWidget(new DeckCompassWidget(props));
}

/** Renders `ContextMenuWidget` from `@deck.gl/widgets`; takes the widget's props. */
export function ContextMenuWidget(props: ContextMenuWidgetProps): ReactElement {
  return renderWidget(new DeckContextMenuWidget(props));
}

/** Renders `FullscreenWidget` from `@deck.gl/widgets`; takes the widget's props. */
export function FullscreenWidget(props: FullscreenWidgetProps): ReactElement {
  return renderWidget(new DeckFullscreenWidget(props));
}

/** Renders `_GeocoderWidget` from `@deck.gl/widgets`; takes the widget's props. */
export function _GeocoderWidget(props: GeocoderWidgetProps): ReactElement {
  return renderWidget(new DeckGeocoderWidget(props));
}

/** Renders `GimbalWidget` from `@deck.gl/widgets`; takes the widget's props. */
export function GimbalWidget(props: GimbalWidgetProps): ReactElement {
  return renderWidget(new DeckGimbalWidget(props));
}

/** Renders `IconWidget` from `@deck.gl/widgets`; takes the widget's props. */
export function IconWidget(props: IconWidgetProps): ReactElement {
  return renderWidget(new DeckIconWidget(props));
}

/** Renders `InfoWidget` from `@deck.gl/widgets`; takes the widget's props. */
export function InfoWidget(props: InfoWidgetProps): ReactElement {
  return renderWidget(new DeckInfoWidget(props));
}

/** Renders `LoadingWidget` from `@deck.gl/widgets`; takes the widget's props. */
export function LoadingWidget(props: LoadingWidgetProps): ReactElement {
  return renderWidget(new DeckLoadingWidget(props));
}

/** Renders `PopupWidget` from `@deck.gl/widgets`; takes the widget's props. */
export function PopupWidget(props: PopupWidgetProps): ReactElement {
  return renderWidget(new DeckPopupWidget(props));
}

/** Renders `ResetViewWidget` from `@deck.gl/widgets`; takes the widget's props. */
export function ResetViewWidget<ViewsT extends View | View[] | null = null>(
  props: ResetViewWidgetProps<ViewsT>
): ReactElement {
  return renderWidget(new DeckResetViewWidget(props));
}

/** Renders `_ScaleWidget` from `@deck.gl/widgets`; takes the widget's props. */
export function _ScaleWidget(props: ScaleWidgetProps): ReactElement {
  return renderWidget(new DeckScaleWidget(props));
}

/** Renders `ScreenshotWidget` from `@deck.gl/widgets`; takes the widget's props. */
export function ScreenshotWidget(props: ScreenshotWidgetProps): ReactElement {
  return renderWidget(new DeckScreenshotWidget(props));
}

/** Renders `ScrollbarWidget` from `@deck.gl/widgets`; takes the widget's props. */
export function ScrollbarWidget(props: ScrollbarWidgetProps): ReactElement {
  return renderWidget(new DeckScrollbarWidget(props));
}

/** Renders `SelectorWidget` from `@deck.gl/widgets`; takes the widget's props. */
export function SelectorWidget<ValueT = string>(props: SelectorWidgetProps<ValueT>): ReactElement {
  return renderWidget(new DeckSelectorWidget(props));
}

/** Renders `_SplitterWidget` from `@deck.gl/widgets`; takes the widget's props. */
export function _SplitterWidget<ViewsT extends View[] = View[]>(
  props: SplitterWidgetProps<ViewsT>
): ReactElement {
  return renderWidget(new DeckSplitterWidget(props));
}

/** Renders `_StatsWidget` from `@deck.gl/widgets`; takes the widget's props. */
export function _StatsWidget(props: StatsWidgetProps): ReactElement {
  return renderWidget(new DeckStatsWidget(props));
}

/** Renders `ThemeWidget` from `@deck.gl/widgets`; takes the widget's props. */
export function ThemeWidget(props: ThemeWidgetProps): ReactElement {
  return renderWidget(new DeckThemeWidget(props));
}

/** Renders `_TimelineWidget` from `@deck.gl/widgets`; takes the widget's props. */
export function _TimelineWidget(props: TimelineWidgetProps): ReactElement {
  return renderWidget(new DeckTimelineWidget(props));
}

/** Renders `ToggleWidget` from `@deck.gl/widgets`; takes the widget's props. */
export function ToggleWidget(props: ToggleWidgetProps): ReactElement {
  return renderWidget(new DeckToggleWidget(props));
}

/** Renders `ZoomWidget` from `@deck.gl/widgets`; takes the widget's props. */
export function ZoomWidget(props: ZoomWidgetProps): ReactElement {
  return renderWidget(new DeckZoomWidget(props));
}

export {_LegendWidget as _ColorScaleWidget};
