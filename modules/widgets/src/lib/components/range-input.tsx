// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import type {JSX} from 'preact';
import {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'preact/hooks';

export type RangeInputDecoration = {
  position: [start: number, end: number];
  element: JSX.Element;
};

export type RangeInputProps = {
  className?: string;
  min: number;
  max: number;
  step: number;
  value: [start: number, end: number];
  orientation: 'horizontal' | 'vertical';
  pageSize?: number;
  /** Show step buttons at ends */
  stepButtons?: boolean;
  startButtonAriaLabel?: string;
  endButtonAriaLabel?: string;
  /** Target element for wheel and keyboard events.
   * If not supplied, falls back to the root element of the input.
   */
  eventTarget?: HTMLElement | null;
  decorations?: RangeInputDecoration[];
  onChange?: (nextValue: [start: number, end: number]) => void;
};

type DragState = {
  pointerId: number;
  startCoord: number;
  startRatio: number;
  min: number;
  max: number;
  maxStart: number;
};

const wheelListenerOptions: AddEventListenerOptions = {passive: false};

const clamp = (value: number, min: number, max: number) => {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
};

const getTrackDimension = (track: HTMLDivElement | null, vertical: boolean) => {
  if (!track || !track.firstElementChild) {
    return [0, 0];
  }
  const rect = track.firstElementChild.getBoundingClientRect();
  if (vertical) {
    return [rect.top, rect.height];
  }
  return vertical ? [rect.top, rect.height] : [rect.left, rect.width];
};

const getEffectiveStep = (step: number, range: number) => {
  if (typeof step === 'number' && !Number.isNaN(step) && step > 0) {
    return step;
  }
  return Math.max(1, range / 10 || 1);
};

const getEffectivePage = (pageSize: number | undefined, rangeSize: number) => {
  if (typeof pageSize === 'number' && !Number.isNaN(pageSize) && pageSize > 0) {
    return pageSize;
  }
  return Math.max(1, rangeSize || 1);
};

export function RangeInput(props: RangeInputProps) {
  const {
    className = '',
    min,
    max,
    step,
    value,
    orientation,
    pageSize,
    stepButtons = false,
    startButtonAriaLabel,
    endButtonAriaLabel,
    eventTarget,
    decorations = [],
    onChange
  } = props;

  const vertical = orientation !== 'horizontal';
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const [trackLength, setTrackLength] = useState(0);

  const range = max - min;
  const rangeSize = Math.max(0, value[1] - value[0]);
  const maxStart = Math.max(0, range - rangeSize);
  const clampedStart = clamp(value[0], min, min + maxStart);

  const {thumbLength, thumbOffset} = useMemo(() => {
    if (trackLength <= 0 || range <= 0) {
      return {thumbLength: 0, thumbOffset: 0};
    }

    if (range <= rangeSize) {
      return {thumbLength: 1, thumbOffset: 0};
    }

    const nextThumbLength = rangeSize / range;
    const travel = Math.max(0, 1 - nextThumbLength);
    const ratio = maxStart <= 0 ? 0 : clamp((clampedStart - min) / maxStart, 0, 1);

    return {
      thumbLength: Math.max(0, Math.min(nextThumbLength, 1)),
      thumbOffset: travel * ratio
    };
  }, [trackLength, range, rangeSize, maxStart, clampedStart, min]);

  const emitRange = useCallback(
    (nextStart: number) => {
      if (!onChange) {
        return;
      }
      const clamped = clamp(nextStart, min, min + maxStart);
      onChange([clamped, clamped + rangeSize]);
    },
    [onChange, min, maxStart, rangeSize]
  );

  const handleStepNegative = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      emitRange(clampedStart - getEffectiveStep(step, range));
    },
    [emitRange, clampedStart, step, range]
  );

  const handleStepPositive = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      emitRange(clampedStart + getEffectiveStep(step, range));
    },
    [emitRange, clampedStart, step, range]
  );

  const handleTrackClick = useCallback(
    (event: MouseEvent) => {
      if (event.button !== 0) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target?.dataset.scrollbarThumb === 'true') {
        return;
      }

      const track = trackRef.current;
      if (!track) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const [trackStart] = getTrackDimension(track, vertical);
      const coordinate = vertical ? event.clientY - trackStart : event.clientX - trackStart;
      const span = Math.max(1, 1 - thumbLength) * trackLength;
      const thumbCenter = (thumbLength / 2) * trackLength;
      const ratio = span <= 0 ? 0 : clamp((coordinate - thumbCenter) / span, 0, 1);
      emitRange(min + ratio * maxStart);
    },
    [vertical, trackLength, thumbLength, emitRange, min, maxStart]
  );

  const handleThumbPointerDown = (event: PointerEvent) => {
    if (event.button !== 0) {
      return;
    }
    const track = trackRef.current;
    if (!track) {
      return;
    }

    dragStateRef.current = {
      pointerId: event.pointerId,
      startCoord: vertical ? event.clientY : event.clientX,
      startRatio: thumbOffset,
      min,
      max,
      maxStart
    };

    (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
    event.preventDefault();
    event.stopPropagation();
  };

  const handleThumbPointerMove = useCallback(
    (event: PointerEvent) => {
      const state = dragStateRef.current;
      if (!state || state.pointerId !== event.pointerId) {
        return;
      }

      const [trackStart, trackLength] = getTrackDimension(trackRef.current, vertical);
      const coordinate = vertical ? event.clientY : event.clientX;
      const delta = coordinate - state.startCoord;

      const ratio = state.startRatio + delta / trackLength;

      const nextStart = clamp(ratio * (state.max - state.min), 0, state.maxStart) + state.min;
      emitRange(nextStart);
      event.preventDefault();
    },
    [emitRange, vertical]
  );

  const handleThumbPointerUp = useCallback((event: PointerEvent) => {
    const state = dragStateRef.current;
    if (state && state.pointerId === event.pointerId) {
      dragStateRef.current = null;
      thumbRef.current?.releasePointerCapture(event.pointerId);
      event.preventDefault();
    }
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
          if ((vertical && event.key === 'ArrowUp') || (!vertical && event.key === 'ArrowLeft')) {
            emitRange(clampedStart - getEffectiveStep(step, range));
            event.preventDefault();
          }
          break;
        case 'ArrowDown':
        case 'ArrowRight':
          if (
            (vertical && event.key === 'ArrowDown') ||
            (!vertical && event.key === 'ArrowRight')
          ) {
            emitRange(clampedStart + getEffectiveStep(step, range));
            event.preventDefault();
          }
          break;
        case 'PageUp':
          emitRange(clampedStart - getEffectivePage(pageSize, rangeSize));
          event.preventDefault();
          break;
        case 'PageDown':
          emitRange(clampedStart + getEffectivePage(pageSize, rangeSize));
          event.preventDefault();
          break;
        case 'Home':
          emitRange(min);
          event.preventDefault();
          break;
        case 'End':
          emitRange(min + maxStart);
          event.preventDefault();
          break;
        default:
          break;
      }
    },
    [vertical, emitRange, clampedStart, step, range, pageSize, rangeSize, min, maxStart]
  );

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (maxStart === 0) {
        return;
      }

      let delta = vertical ? event.deltaY : event.deltaX;
      if (!vertical && delta === 0) {
        delta = event.deltaY;
      }

      if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
        delta *= getEffectiveStep(step, range);
      } else if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
        delta *= getEffectivePage(pageSize, rangeSize);
      }

      if (delta === 0) {
        return;
      }

      emitRange(clampedStart + delta);
    },
    [emitRange, clampedStart, maxStart, vertical, step, range, pageSize, rangeSize]
  );

  useLayoutEffect(() => {
    setTrackLength(getTrackDimension(trackRef.current, vertical)[1]);
  }, [vertical]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return undefined;
    }

    const update = () => {
      setTrackLength(getTrackDimension(track, vertical)[1]);
    };

    update();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(update);
      observer.observe(track);
      return () => observer.disconnect();
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }

    return undefined;
  }, [vertical]);

  useEffect(() => {
    const eventRoot = eventTarget ?? rootRef.current;
    if (!eventRoot) return undefined;

    eventRoot.addEventListener('keydown', handleKeyDown);
    eventRoot.addEventListener('wheel', handleWheel, wheelListenerOptions);
    return () => {
      eventRoot.removeEventListener('keydown', handleKeyDown);
      eventRoot.removeEventListener('wheel', handleWheel, wheelListenerOptions);
    };
  }, [eventTarget, handleKeyDown, handleWheel]);

  const decorationElements = useMemo(() => {
    if (!decorations.length || range <= 0) {
      return [];
    }

    return decorations.map((decoration, index) => {
      const [start, end] = decoration.position;
      const startRatio = (start - min) / range;
      const endRatio = (end - min) / range;
      const offsetPct = Math.round(startRatio * 1000) / 10;
      const sizePct = Math.max(0, Math.round((endRatio - startRatio) * 1000) / 10);
      const style = vertical
        ? {
            left: '0',
            width: '100%',
            top: `${offsetPct}%`,
            height: `${sizePct}%`
          }
        : {
            top: '0',
            height: '100%',
            left: `${offsetPct}%`,
            width: `${sizePct}%`
          };

      return (
        <div key={`decoration-${index}`} className="deck-widget-range__decoration" style={style}>
          {decoration.element}
        </div>
      );
    });
  }, [decorations, range, min, vertical]);

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      role="scrollbar"
      aria-valuemin={min}
      aria-valuemax={min + maxStart}
      aria-valuenow={clampedStart}
      aria-orientation={orientation}
      className={`${className} deck-widget-range deck-widget-range--${orientation} ${maxStart === 0 ? 'deck-widget-range--disabled' : ''}`}
    >
      {stepButtons && (
        <button
          type="button"
          className="deck-widget-range__button deck-widget-range__button--start"
          aria-label={startButtonAriaLabel}
          disabled={clampedStart <= min}
          onClick={handleStepNegative}
        >
          <span className="deck-widget-icon" />
        </button>
      )}
      <div className="deck-widget-range__track" ref={trackRef} onClick={handleTrackClick}>
        <div className="deck-widget-range__decorations">{decorationElements}</div>
        <div
          className="deck-widget-range__thumb"
          data-scrollbar-thumb="true"
          ref={thumbRef}
          style={
            vertical
              ? {height: `${thumbLength * 100}%`, top: `${thumbOffset * 100}%`}
              : {width: `${thumbLength * 100}%`, left: `${thumbOffset * 100}%`}
          }
          onPointerDown={handleThumbPointerDown}
          onPointerMove={handleThumbPointerMove}
          onPointerUp={handleThumbPointerUp}
          onPointerCancel={handleThumbPointerUp}
        />
      </div>
      {stepButtons && (
        <button
          type="button"
          className="deck-widget-range__button deck-widget-range__button--end"
          aria-label={endButtonAriaLabel}
          disabled={clampedStart >= min + maxStart}
          onClick={handleStepPositive}
        >
          <span className="deck-widget-icon" />
        </button>
      )}
    </div>
  );
}
