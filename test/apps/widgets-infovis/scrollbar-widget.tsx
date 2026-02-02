import { OrthographicViewport, Widget } from '@deck.gl/core';

import type { Position, Viewport, WidgetPlacement, WidgetProps } from '@deck.gl/core';

export type ScrollbarOrientation = 'vertical' | 'horizontal';

export type ContentBounds = [min: Position, max: Position];

export type ScrollbarDecoration = {
  contentBounds: ContentBounds;
  color: string;
};

type DragState = {
  pointerId: number;
  startCoord: number;
  startScroll: number;
  trackSpan: number;
};

const clamp = (value: number, min: number, max: number) => {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
};

export type ScrollbarWidgetProps = WidgetProps & {
  contentBounds?: ContentBounds | null;
  placement?: WidgetPlacement;
  viewId?: string | null;
  orientation?: ScrollbarOrientation;
  stepSize?: number | null;
  pageSize?: number | null;
  thumbMinSize?: number;
  startButtonAriaLabel?: string;
  endButtonAriaLabel?: string;
  captureWheel?: boolean;
  decorations?: ScrollbarDecoration[];
};

type ScrollbarWidgetRequiredProps = Required<ScrollbarWidgetProps>;

/** A scrollbar widget to be used with OrthographicView */
export class ScrollbarWidget extends Widget<ScrollbarWidgetProps> {
  static override defaultProps: ScrollbarWidgetRequiredProps = {
    ...Widget.defaultProps,
    contentBounds: null,
    placement: 'top-right',
    viewId: null,
    orientation: 'vertical',
    stepSize: null,
    pageSize: null,
    thumbMinSize: 24,
    startButtonAriaLabel: '',
    endButtonAriaLabel: '',
    captureWheel: false,
    decorations: [],
  };

  override className = 'deck-widget-scrollbar';

  placement: WidgetPlacement;

  private initialized = false;
  private viewports: { [id: string]: OrthographicViewport } = {};
  private contentSize = 0;
  private viewportSize = 0;
  private scrollOffset = 0;
  private startButton?: HTMLButtonElement;
  private endButton?: HTMLButtonElement;
  private trackEl?: HTMLDivElement;
  private thumbEl?: HTMLDivElement;
  private decorationsEl?: HTMLDivElement;
  private dragState: DragState | null = null;
  private wheelListenerMode: 'global' | 'local' | null = null;
  private readonly wheelListenerOptions: AddEventListenerOptions = { passive: false };

  constructor(props: ScrollbarWidgetProps) {
    const resolved = {
      ...ScrollbarWidget.defaultProps,
      ...props,
    } as ScrollbarWidgetRequiredProps;
    super(resolved);
    this.placement = resolved.placement;
    this.viewId = resolved.viewId ?? null;
  }

  override onViewportChange(viewport: Viewport) {
    if (viewport instanceof OrthographicViewport) {
      this.viewports[viewport.id] = viewport;
      this.onRenderHTML();
    }
  }

  override onRenderHTML(): void {
    const element = this.rootElement;
    if (!element) {
      return;
    }

    this.ensureDom(element);
    this.updateViewport();
    this.updateAccessibility(element);
    this.updateOrientation();
    this.updateButtons();
    this.updateTrack();
    this.updateWheelListener();
  }

  override onRemove(): void {
    if (this.rootElement) {
      this.rootElement.removeEventListener('keydown', this.handleKeyDown);
    }
    this.startButton?.removeEventListener('click', this.handleStepNegative);
    this.endButton?.removeEventListener('click', this.handleStepPositive);
    this.trackEl?.removeEventListener('pointerdown', this.handleTrackPointerDown);
    this.thumbEl?.removeEventListener('pointerdown', this.handleThumbPointerDown);
    this.thumbEl?.removeEventListener('pointermove', this.handleThumbPointerMove);
    this.thumbEl?.removeEventListener('pointerup', this.handleThumbPointerUp);
    this.thumbEl?.removeEventListener('pointercancel', this.handleThumbPointerUp);
    this.dragState = null;
    this.teardownWheelListener();
    super.onRemove();
  }

  private ensureDom(element: HTMLDivElement): void {
    if (this.initialized) {
      return;
    }

    element.tabIndex = 0;

    element.addEventListener('keydown', this.handleKeyDown);

    const startButton = document.createElement('button');
    startButton.type = 'button';
    startButton.classList.add('deck-scrollbar__button', 'deck-scrollbar__button--start');
    startButton.addEventListener('click', this.handleStepNegative);
    element.append(startButton);
    const startButtonIcon = document.createElement('span');
    startButtonIcon.classList.add('deck-widget-icon');
    startButton.append(startButtonIcon);

    const track = document.createElement('div');
    track.classList.add('deck-scrollbar__track');
    track.addEventListener('pointerdown', this.handleTrackPointerDown);
    element.append(track);

    const decorations = document.createElement('div');
    decorations.classList.add('deck-scrollbar__decorations');
    track.append(decorations);

    const thumb = document.createElement('div');
    thumb.dataset['scrollbarThumb'] = 'true';
    thumb.classList.add('deck-scrollbar__thumb');
    thumb.addEventListener('pointerdown', this.handleThumbPointerDown);
    thumb.addEventListener('pointermove', this.handleThumbPointerMove);
    thumb.addEventListener('pointerup', this.handleThumbPointerUp);
    thumb.addEventListener('pointercancel', this.handleThumbPointerUp);
    track.append(thumb);

    const endButton = document.createElement('button');
    endButton.type = 'button';
    endButton.classList.add('deck-scrollbar__button', 'deck-scrollbar__button--end');
    endButton.addEventListener('click', this.handleStepPositive);
    element.append(endButton);
    const endButtonIcon = document.createElement('span');
    endButtonIcon.classList.add('deck-widget-icon');
    endButton.append(endButtonIcon);

    this.startButton = startButton;
    this.endButton = endButton;
    this.trackEl = track;
    this.thumbEl = thumb;
    this.decorationsEl = decorations;
    this.initialized = true;
  }

  private updateViewport(): void {
    const viewport = this.getViewport();
    if (!viewport) {
      return;
    }

    const { contentBounds } = this.props;
    const isVertical = this.isVertical();
    const projectedBounds = contentBounds
      ? projectBounds(contentBounds, viewport, isVertical)
      : ([0, 0] as [number, number]);

    this.contentSize = projectedBounds[1] - projectedBounds[0];
    this.scrollOffset = -projectedBounds[0];
    this.viewportSize = isVertical ? viewport.height : viewport.width;
    this.rootElement?.style.setProperty('--viewport-size', this.viewportSize + 'px');
    this.rootElement?.classList.toggle(
      'deck-widget-scrollbar--disabled',
      this.getMaxScroll() === 0,
    );
  }

  private updateAccessibility(element: HTMLDivElement): void {
    const maxScroll = this.getMaxScroll();
    const clampedOffset = this.getClampedOffset();
    element.setAttribute('role', 'scrollbar');
    element.setAttribute('aria-valuemin', '0');
    element.setAttribute('aria-valuemax', String(maxScroll));
    element.setAttribute('aria-valuenow', String(clampedOffset));
    element.setAttribute('aria-orientation', this.isVertical() ? 'vertical' : 'horizontal');
  }

  private updateOrientation(): void {
    const element = this.rootElement;
    const track = this.trackEl;
    const thumb = this.thumbEl;
    if (!element || !track || !thumb) {
      return;
    }
    const vertical = this.isVertical();

    element.classList.toggle('deck-widget-scrollbar--vertical', vertical);
    element.classList.toggle('deck-widget-scrollbar--horizontal', !vertical);
  }

  private updateButtons(): void {
    const vertical = this.isVertical();
    const startLabel = this.props.startButtonAriaLabel ?? (vertical ? 'Scroll up' : 'Scroll left');
    const endLabel = this.props.endButtonAriaLabel ?? (vertical ? 'Scroll down' : 'Scroll right');
    if (this.startButton) {
      this.startButton.setAttribute('aria-label', startLabel);
      this.startButton.disabled = this.scrollOffset <= 0;
    }
    if (this.endButton) {
      this.endButton.setAttribute('aria-label', endLabel);
      this.endButton.disabled = this.scrollOffset >= this.getMaxScroll();
    }
  }

  private getWheelEventTarget(mode: 'global' | 'local' | null) {
    if (mode === null) return null;
    if (mode === 'local') return this.rootElement;

    // @ts-expect-error protected member
    return (this.deck && this.deck.parent) || this.deck.canvas.parentNode;
  }

  private updateWheelListener(): void {
    const wheelMode = this.props.captureWheel ? 'global' : 'local';

    if (this.wheelListenerMode !== wheelMode) {
      this.teardownWheelListener();

      const element = this.getWheelEventTarget(wheelMode);
      if (!element) return;

      element.addEventListener('wheel', this.handleWheel, this.wheelListenerOptions);
      this.wheelListenerMode = wheelMode;
    }
  }

  private teardownWheelListener(): void {
    const element = this.getWheelEventTarget(this.wheelListenerMode);
    if (!element) return;

    element.removeEventListener('wheel', this.handleWheel, this.wheelListenerOptions);
    this.wheelListenerMode = null;
  }

  private updateTrack(): void {
    const track = this.trackEl;
    const thumb = this.thumbEl;
    if (!track || !thumb) {
      return;
    }
    const trackLength = this.getTrackLength(track);
    const { thumbLength, thumbOffset } = this.computeThumbMetrics(trackLength);
    this.renderDecorations();
    const vertical = this.isVertical();
    if (vertical) {
      thumb.style.height = `${thumbLength}px`;
      thumb.style.top = `${thumbOffset}px`;
    } else {
      thumb.style.width = `${thumbLength}px`;
      thumb.style.left = `${thumbOffset}px`;
    }
  }

  private renderDecorations(): void {
    const container = this.decorationsEl;
    if (!container) {
      return;
    }

    const viewport = this.getViewport();
    const { decorations = [], contentBounds } = this.props;
    if (!viewport || !contentBounds) {
      return;
    }

    const isVertical = this.isVertical();
    const [contentStart, contentEnd] = projectBounds(contentBounds, viewport, isVertical);

    let i = 0;
    for (const decoration of decorations) {
      const [start, end] = projectBounds(decoration.contentBounds, viewport, isVertical);
      const startRatio = (start - contentStart) / (contentEnd - contentStart);
      const endRatio = (end - contentStart) / (contentEnd - contentStart);
      const offsetPct = Math.round(startRatio * 1000) / 10;
      const sizePct = Math.max(0, Math.round((endRatio - startRatio) * 1000) / 10);

      let segment = container.children[i++] as HTMLDivElement;
      if (!segment) {
        segment = document.createElement('div');
        segment.classList.add('deck-scrollbar__decoration');
        container.append(segment);
      }
      segment.style.backgroundColor = decoration.color;

      if (isVertical) {
        segment.style.left = '0';
        segment.style.width = '100%';
        segment.style.top = `${offsetPct}%`;
        segment.style.height = `${sizePct}%`;
      } else {
        segment.style.top = '0';
        segment.style.height = '100%';
        segment.style.left = `${offsetPct}%`;
        segment.style.width = `${sizePct}%`;
      }
    }
    while (container.children.length > decorations.length) {
      container.removeChild(container.lastChild!);
    }
  }

  private computeThumbMetrics(trackLength: number): { thumbLength: number; thumbOffset: number } {
    const { thumbMinSize } = this.props;
    const { contentSize, viewportSize } = this;
    const maxScroll = this.getMaxScroll();
    const clampedOffset = this.getClampedOffset();

    if (trackLength <= 0 || contentSize <= 0) {
      return { thumbLength: 0, thumbOffset: 0 };
    }

    if (maxScroll === 0) {
      return { thumbLength: trackLength, thumbOffset: 0 };
    }

    const idealLength = (viewportSize / contentSize) * trackLength;
    const thumbLength = Math.max(thumbMinSize ?? 0, idealLength);
    const travel = Math.max(0, trackLength - thumbLength);
    const ratio = travel <= 0 ? 0 : clampedOffset / maxScroll;
    return {
      thumbLength: Math.max(0, Math.min(thumbLength, trackLength)),
      thumbOffset: travel * ratio,
    };
  }

  private getViewport(): Viewport | undefined {
    const viewId = this.viewId || Object.values(this.viewports)[0]?.id || 'default-view';
    return this.viewports[viewId];
  }

  private getViewState(viewId: string) {
    // @ts-expect-error protected
    const viewManager = this.deck?.viewManager;
    if (!viewManager) {
      throw new Error('wigdet must be added to a deck instance');
    }
    const viewState = (viewId && viewManager.getViewState(viewId)) || viewManager.viewState;
    return viewState;
  }

  private getMaxScroll(): number {
    return Math.max(0, this.contentSize - this.viewportSize);
  }

  private getClampedOffset(): number {
    const maxScroll = this.getMaxScroll();
    return clamp(this.scrollOffset, 0, maxScroll);
  }

  private isVertical(): boolean {
    return this.props.orientation !== 'horizontal';
  }

  private getEffectiveStep(): number {
    if (typeof this.props.stepSize === 'number' && !Number.isNaN(this.props.stepSize)) {
      return this.props.stepSize;
    }
    return Math.max(1, this.viewportSize / 10 || 1);
  }

  private getEffectivePage(): number {
    if (typeof this.props.pageSize === 'number' && !Number.isNaN(this.props.pageSize)) {
      return this.props.pageSize;
    }
    return this.viewportSize;
  }

  private getTrackLength(track: HTMLDivElement): number {
    const rect = track.getBoundingClientRect();
    return this.isVertical() ? rect.height : rect.width;
  }

  private emitScroll(next: number): void {
    const maxScroll = this.getMaxScroll();
    const target = clamp(Math.round(next), 0, maxScroll);
    const viewport = this.getViewport();
    if (viewport && target !== this.getClampedOffset()) {
      const pixel = viewport.project(viewport.position) as [number, number];
      if (this.isVertical()) {
        pixel[1] -= target - this.scrollOffset;
      } else {
        pixel[0] -= target - this.scrollOffset;
      }
      const { target: newTarget } = viewport.panByPosition(viewport.position, pixel);

      // @ts-expect-error Using private method temporary until there's a public one
      this.deck._onViewStateChange({
        viewId: viewport.id,
        viewState: {
          ...this.getViewState(viewport.id),
          target: newTarget,
        },
        interactionState: {},
      });
    }
  }

  private handleStepNegative = (event: MouseEvent) => {
    event.stopPropagation();
    this.emitScroll(this.getClampedOffset() - this.getEffectiveStep());
  };

  private handleStepPositive = (event: MouseEvent) => {
    event.stopPropagation();
    this.emitScroll(this.getClampedOffset() + this.getEffectiveStep());
  };

  private handleTrackPointerDown = (event: PointerEvent) => {
    if (event.button !== 0) {
      return;
    }
    const target = event.target as HTMLElement | null;
    if (target?.dataset['scrollbarThumb'] === 'true') {
      return;
    }
    const track = this.trackEl;
    if (!track) {
      return;
    }
    const trackRect = track.getBoundingClientRect();
    const coordinate = this.isVertical()
      ? event.clientY - trackRect.top
      : event.clientX - trackRect.left;
    const trackLength = this.getTrackLength(track);
    const { thumbLength } = this.computeThumbMetrics(trackLength);
    const span = Math.max(1, trackLength - thumbLength);
    const thumbCenter = thumbLength / 2;
    const ratio = span <= 0 ? 0 : clamp((coordinate - thumbCenter) / span, 0, 1);
    const targetScroll = ratio * this.getMaxScroll();
    this.emitScroll(targetScroll);
    event.preventDefault();
    event.stopPropagation();
  };

  private handleThumbPointerDown = (event: PointerEvent) => {
    if (event.button !== 0) {
      return;
    }
    const track = this.trackEl;
    const thumb = this.thumbEl;
    if (!track || !thumb) {
      return;
    }
    const trackLength = this.getTrackLength(track);
    const { thumbLength } = this.computeThumbMetrics(trackLength);
    const span = Math.max(1, trackLength - thumbLength);
    this.dragState = {
      pointerId: event.pointerId,
      startCoord: this.isVertical() ? event.clientY : event.clientX,
      startScroll: this.getClampedOffset(),
      trackSpan: span,
    };
    thumb.setPointerCapture(event.pointerId);
    event.preventDefault();
    event.stopPropagation();
  };

  private handleThumbPointerMove = (event: PointerEvent) => {
    const state = this.dragState;
    if (!state || state.pointerId !== event.pointerId) {
      return;
    }
    const coordinate = this.isVertical() ? event.clientY : event.clientX;
    const delta = coordinate - state.startCoord;
    const ratio = state.trackSpan === 0 ? 0 : delta / state.trackSpan;
    const next = state.startScroll + ratio * this.getMaxScroll();
    this.emitScroll(next);
    event.preventDefault();
  };

  private handleThumbPointerUp = (event: PointerEvent) => {
    const state = this.dragState;
    if (state && state.pointerId === event.pointerId) {
      this.dragState = null;
      this.thumbEl?.releasePointerCapture(event.pointerId);
      event.preventDefault();
    }
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        if (
          (this.isVertical() && event.key === 'ArrowUp') ||
          (!this.isVertical() && event.key === 'ArrowLeft')
        ) {
          this.emitScroll(this.getClampedOffset() - this.getEffectiveStep());
          event.preventDefault();
        }
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        if (
          (this.isVertical() && event.key === 'ArrowDown') ||
          (!this.isVertical() && event.key === 'ArrowRight')
        ) {
          this.emitScroll(this.getClampedOffset() + this.getEffectiveStep());
          event.preventDefault();
        }
        break;
      case 'PageUp':
        this.emitScroll(this.getClampedOffset() - this.getEffectivePage());
        event.preventDefault();
        break;
      case 'PageDown':
        this.emitScroll(this.getClampedOffset() + this.getEffectivePage());
        event.preventDefault();
        break;
      case 'Home':
        this.emitScroll(0);
        event.preventDefault();
        break;
      case 'End':
        this.emitScroll(this.getMaxScroll());
        event.preventDefault();
        break;
      default:
        break;
    }
  };

  private handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const maxScroll = this.getMaxScroll();
    if (maxScroll === 0) {
      return;
    }

    let delta = this.isVertical() ? event.deltaY : event.deltaX;
    if (!this.isVertical() && delta === 0) {
      delta = event.deltaY;
    }

    if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
      delta *= this.getEffectiveStep();
    } else if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
      delta *= this.getEffectivePage();
    }

    if (delta === 0) {
      return;
    }

    this.emitScroll(this.getClampedOffset() + delta);
  };
}

function projectBounds(
  bounds: ContentBounds,
  viewport: Viewport,
  isVertical: boolean,
): [min: number, max: number] {
  return bounds
    .map(([x, y]) => viewport.project([x!, y!, 0]))
    .reduce(
      (range: [number, number], [x, y]) => {
        const value = isVertical ? y : x;
        range[0] = Math.min(range[0], value!);
        range[1] = Math.max(range[1], value!);
        return range;
      },
      [Infinity, -Infinity],
    );
}
