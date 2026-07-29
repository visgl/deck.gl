# Gesture Timing Test App

Interactive tool for measuring deck.gl event handling delays, specifically the ~300ms click latency introduced by the `doubleClickZoom` controller option.

## Run

```bash
cd test/apps/gesture-timing
npm run start-local
```

## Reading the Event Log

Each row in the event timeline shows:

| Column | Meaning |
|--------|---------|
| **Event type** | The recognized gesture or picking event |
| **Delta (ms)** | Latency measurement (see below) |
| **Timestamp** | Wall-clock time |

### Color coding

- **Green (<50ms)** — Immediate response, no recognizer delay
- **Yellow (50–200ms)** — Noticeable but sub-threshold delay
- **Red (>300ms)** — Significant delay (typically the dblclick `requireFailure` timeout)

### What delta means per event type

| Event pattern | Delta measures |
|---------------|----------------|
| `click`, `dblclick`, `pick:click(tap=N)` | **Recognizer delay** — time from `pointerup` to recognized event. This is the ~0ms vs ~300ms this PR addresses. |
| `panstart`, `pinchstart`, `dblclickdragstart` | **Activation delay** — time from `pointerdown` to gesture recognition (usually just the movement threshold). |
| `panmove`, `pinchmove`, `dblclickdragmove` | **Frame interval** — time between consecutive move events (~16ms at 60fps). |
| `panend`, `pinchend`, `dblclickdragend` | **Gesture duration** — total time from start to end of the gesture. |
| `wheel`, `keydown` | **Processing delay** — time from raw DOM event to EventManager dispatch (~0ms, no recognizer). |
| `pick:dragstart`, `pick:dragend` | **Picking callback delay** — time from `pointerdown`/`pointerup` to layer callback. |

### Key things to observe

1. **Click with `doubleClickZoom: true` (default)** — click events show ~300ms (red). The Tap recognizer waits to see if a double-click follows.

2. **Click with `doubleClickZoom: false`** — click events show ~1-5ms (green). No `requireFailure` delay.

3. **`pick:click(tap=2)` only appears when `doubleClickZoom` is on** — the dblclick recognizer must be active for the picking system to receive double-click events (PR #9629).

4. **Runtime toggling** — use the checkboxes or preset buttons to toggle `doubleClickZoom` at runtime and see the click delay change immediately.

## Click Latency Stats

The stats panel at the top shows running avg/min/max of the last 20 `click` events. Use preset buttons to quickly compare Default (~300ms avg) vs Fast Clicks (~3ms avg).
