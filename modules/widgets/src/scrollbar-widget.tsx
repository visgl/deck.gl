import {Widget} from '@deck.gl/core';
import type {Position, Viewport, WidgetPlacement, WidgetProps} from '@deck.gl/core';
import {render} from 'preact';
import {RangeInput, type RangeInputDecoration} from './lib/components/range-input';

export type ScrollbarOrientation = 'vertical' | 'horizontal';

export type ContentBounds = [min: Position, max: Position];

export type ScrollbarDecoration = {
  contentBounds: ContentBounds;
  color: string;
  title?: string;
  /** Callback when the decoration is clicked. Return `true` to mark the event as handled, and prevent the default behavior. */
  onClick?: (evt: MouseEvent) => boolean;
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
  /** The full extent of the scrollable content, in world coordinates.
   * The widget relies on this value to calculate the position and size of the slider button and track.
   * If not supplied, the scrollbar will always be hidden.
   */
  contentBounds?: ContentBounds | null;
  placement?: WidgetPlacement;
  viewId?: string | null;
  /** Direction of the scrollbar. `'horizontal'` scrolls the camera along the X axis, and `'vertical'` scrolls the camera along the Y axis.
   * @default 'vertical'
   */
  orientation?: ScrollbarOrientation;
  /* Pixels scrolled when clicked on the step buttons.
   * @default 1/10 of the viewport size
   */
  stepSize?: number | null;
  /* Pixels scrolled when clicked on the track.
   * @default 100% of the viewport size
   */
  pageSize?: number | null;
  /** Label of the step button at the start.
   * @default 'Scroll left' | 'Scroll up'
   */
  startButtonAriaLabel?: string;
  /** Label of the end button at the start.
   * @default 'Scroll right' | 'Scroll down'
   */
  endButtonAriaLabel?: string;
  /** If `true`, mouse wheel events over the canvas will be intercepted by this scrollbar.
   * Useful when simulating the native scrollbar's behavior.
   * @default false
   */
  captureWheel?: boolean;
  /** Custom markers to overlay on the track. */
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
    startButtonAriaLabel: '',
    endButtonAriaLabel: '',
    captureWheel: false,
    decorations: []
  };

  override className = 'deck-widget-scrollbar';

  placement: WidgetPlacement = 'fill';

  private viewport?: Viewport;
  private contentSize = 0;
  private viewportSize = 0;
  private scrollOffset = 0;

  constructor(props: ScrollbarWidgetProps) {
    const resolved = {
      ...ScrollbarWidget.defaultProps,
      ...props
    } as ScrollbarWidgetRequiredProps;
    super(resolved);
    this.viewId = resolved.viewId ?? null;
  }

  override onViewportChange(viewport: Viewport) {
    this.viewport = viewport;
    this.onRenderHTML();
  }

  override onRenderHTML(): void {
    const element = this.rootElement;
    if (!element) {
      return;
    }

    element.dataset.placement = this.props.placement;
    const viewport = this.viewport;
    this.updateViewport(viewport);

    const clampedOffset = this.getClampedOffset();
    const wheelTarget = this.getWheelEventTarget(this.props.captureWheel ? 'global' : 'local');
    const decorations = this.getDecorations(viewport);
    const isVertical = this.isVertical();
    const startLabel =
      this.props.startButtonAriaLabel ?? (isVertical ? 'Scroll up' : 'Scroll left');
    const endLabel = this.props.endButtonAriaLabel ?? (isVertical ? 'Scroll down' : 'Scroll right');

    const ui = (
      <RangeInput
        min={0}
        max={Math.max(0, this.contentSize)}
        step={this.getEffectiveStep()}
        pageSize={this.getEffectivePage()}
        value={[clampedOffset, clampedOffset + this.viewportSize]}
        orientation={this.props.orientation}
        stepButtons
        startButtonAriaLabel={startLabel}
        endButtonAriaLabel={endLabel}
        eventTarget={wheelTarget}
        decorations={decorations}
        onChange={this.handleRangeChange}
      />
    );

    render(ui, element);
  }

  override onRemove(): void {
    if (this.rootElement) {
      render(null, this.rootElement);
    }
    super.onRemove();
  }

  private updateViewport(viewport?: Viewport): void {
    if (!viewport) {
      this.contentSize = 0;
      this.scrollOffset = 0;
      this.viewportSize = 0;
      return;
    }

    const {contentBounds} = this.props;
    const isVertical = this.isVertical();
    const projectedBounds = contentBounds
      ? projectBounds(contentBounds, viewport, isVertical)
      : ([0, 0] as [number, number]);

    this.contentSize = projectedBounds[1] - projectedBounds[0];
    this.scrollOffset = -projectedBounds[0];
    this.viewportSize = isVertical ? viewport.height : viewport.width;
  }

  private getDecorations(viewport?: Viewport): RangeInputDecoration[] {
    const {decorations = [], contentBounds} = this.props;
    if (!viewport || !contentBounds || decorations.length === 0) {
      return [];
    }

    const isVertical = this.isVertical();
    const [contentStart] = projectBounds(contentBounds, viewport, isVertical);

    return decorations.map(decoration => {
      const [start, end] = projectBounds(decoration.contentBounds, viewport, isVertical);
      const onClick = decoration.onClick
        ? (e: MouseEvent) => {
            const handled = decoration.onClick?.(e);
            if (handled) {
              e.stopPropagation();
              e.preventDefault();
            }
          }
        : undefined;
      return {
        position: [start - contentStart, end - contentStart],
        element: (
          <div
            style={{
              pointerEvents: onClick ? 'all' : 'none',
              width: '100%',
              height: '100%',
              backgroundColor: decoration.color
            }}
            title={decoration.title}
            onClick={onClick}
          />
        )
      };
    });
  }

  private getWheelEventTarget(mode: 'global' | 'local' | null) {
    if (mode === null) return null;
    if (mode === 'local') return this.rootElement;

    return this.deck?.props.parent || this.deck?.getCanvas()?.parentElement || this.rootElement;
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

  private emitScroll(next: number): void {
    const maxScroll = this.getMaxScroll();
    const target = clamp(Math.round(next), 0, maxScroll);
    const viewport = this.viewport;
    if (viewport && target !== this.getClampedOffset()) {
      const pixel = viewport.project(viewport.position) as [number, number];
      if (this.isVertical()) {
        pixel[1] -= target - this.scrollOffset;
      } else {
        pixel[0] -= target - this.scrollOffset;
      }
      const {target: newTarget} = viewport.panByPosition(viewport.position, pixel);

      // @ts-expect-error Using private method temporary until there's a public one
      this.deck._onViewStateChange({
        viewId: viewport.id,
        viewState: {
          ...this.getViewState(viewport.id),
          target: newTarget
        },
        interactionState: {}
      });
    }
  }

  private handleRangeChange = (nextValue: [number, number]) => {
    this.emitScroll(nextValue[0]);
  };
}

function projectBounds(
  bounds: ContentBounds,
  viewport: Viewport,
  isVertical: boolean
): [min: number, max: number] {
  return bounds
    .map(([x, y]) => viewport.project([x, y, 0]))
    .reduce(
      (range: [number, number], [x, y]) => {
        const value = isVertical ? y : x;
        range[0] = Math.min(range[0], value);
        range[1] = Math.max(range[1], value);
        return range;
      },
      [Infinity, -Infinity]
    );
}
