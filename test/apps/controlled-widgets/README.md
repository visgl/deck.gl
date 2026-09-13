# Controlled Widgets Test App

Manual testing app for verifying controlled/uncontrolled widget state and callbacks.

## Run

```bash
cd test/apps/controlled-widgets
npm run start-local
```

## Test Matrix

Unit tests cover getter/setter logic, callback invocation, internal state guards, and timer lifecycle. The following behaviors require manual verification in this app.

### Map Widgets Demo

| # | Widget | Test | Steps | Expected |
|---|--------|------|-------|----------|
| 1 | ThemeWidget | Controlled toggle | Click theme button | `themeMode` flips between `light`/`dark` in panel; map visuals update |
| 2 | ThemeWidget | Re-render cycle | Click rapidly several times | No stale state, no flicker, panel always matches visual theme |
| 3 | StatsWidget | Controlled expand/collapse | Click stats header | `statsExpanded` toggles in panel; content expands/collapses with animation |
| 4 | StatsWidget | Content display | Expand stats | Renders actual FPS/GPU stats from the deck instance |
| 5 | TimelineWidget | Controlled slider drag | Drag timeline slider | `timelineTime` in panel updates in real-time; slider position matches |
| 6 | TimelineWidget | Controlled play/pause | Click play button | `timelinePlaying` becomes `true`; `timelineTime` increments; slider moves |
| 7 | TimelineWidget | Play reaches end | Let play run to 100 | `timelinePlaying` becomes `false`; playback stops at 100 |
| 8 | TimelineWidget | Play restart | Click play when time=100 | App resets time to 0 via `onPlayingChange` handler; starts playing again |
| 9 | CompassWidget | Callback fires | Rotate map (right-click drag), then click compass | `lastCallback` shows `CompassWidget.onReset(bearing=0, pitch=0)`; map resets north |
| 10 | CompassWidget | Visual rotation | Right-click drag to change bearing/pitch | Compass icon rotates to match current bearing/pitch |
| 11 | ZoomWidget | Callback fires | Click +/- buttons | `lastCallback` shows `ZoomWidget.onZoom(...)` with correct delta and zoom |
| 12 | ZoomWidget | View actually zooms | Click + then - | Map zoom level changes; `viewState.zoom` in panel updates |
| 13 | ResetViewWidget | Callback fires | Pan/zoom away, then click reset | `lastCallback` shows `ResetViewWidget.onReset`; map returns to initial position |
| 14 | FullscreenWidget | Pseudo-fullscreen | Click fullscreen button | Container fills viewport; `lastCallback` shows `onFullscreenChange(true)` |
| 15 | FullscreenWidget | Exit fullscreen | Click again or press Escape | Returns to normal; `lastCallback` shows `onFullscreenChange(false)` |
| 16 | LoadingWidget | Loading state | Reload page | `loading` shows `true` then transitions to `false` after GeoJSON loads |
| 17 | LoadingWidget | Spinner visibility | Watch on reload | Spinner icon visible during load, disappears when done |

### Splitter Demo

| # | Widget | Test | Steps | Expected |
|---|--------|------|-------|----------|
| 18 | SplitterWidget | Initial render | Switch to "Splitter" tab | Two map views appear (SF left, NYC right) |
| 19 | SplitterWidget | Drag handle | Drag the splitter divider left/right | View sizes change; `viewCount` stays 2 in panel |
| 20 | SplitterWidget | Independent panning | Pan each view separately | `leftZoom` and `rightZoom` update independently in panel |
| 21 | SplitterWidget | onChange produces valid views | Drag handle | Views array fed back to DeckGL renders without errors |

### Cross-cutting

| # | Area | Test | Steps | Expected |
|---|------|------|-------|----------|
| 22 | Multi-widget | No interference | Use several widgets in sequence | Each widget functions independently; no stale state bleed |
| 23 | Demo switch | Cleanup | Toggle between Map/Splitter demos | No orphaned DOM, no console errors, state resets cleanly |
| 24 | Console errors | Clean console | Open DevTools, use all widgets | Zero errors or warnings related to widget state |
