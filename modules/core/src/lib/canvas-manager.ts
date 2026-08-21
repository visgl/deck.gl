// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import assert from '../utils/assert';
import {DEFAULT_CANVAS_ID} from './view-manager';

import type {Device, PresentationContext} from '@luma.gl/core';
import type {EventManager} from 'mjolnir.js';

/**
 * Runtime state for one canvas in a `Deck._canvases` configuration.
 * @internal
 */
export type CanvasEntry = {
  /** Stable id used to route views, input events, and picking to this canvas. */
  id: string;
  /** Device that owns this target's presentation context. */
  device: Device;
  /** Existing HTML canvas receiving the rendered presentation. */
  canvas: HTMLCanvasElement;
  /** Custom `.deck-events-root` ancestor or canvas used for event handling. */
  eventRoot: HTMLElement;
  /** Luma context responsible for presenting and tracking this canvas's dimensions. */
  presentationContext: PresentationContext;
  /** Event manager bound exclusively to this canvas's event root. */
  eventManager: EventManager;
};

/**
 * Owns resources derived from a `Deck._canvases` configuration.
 *
 * The existing single-canvas path stays in Deck. This class only reconciles presentation
 * canvases, their {@link PresentationContext}s and per-canvas {@link EventManager}s, and answers
 * geometry queries for those targets.
 * @internal
 */
export default class CanvasManager {
  /** Construct event managers using Deck's existing recognizer configuration. */
  private _createEventManager: (root: HTMLElement) => EventManager;
  /** Resolve each canvas's existing custom event root before binding listeners. */
  private _getEventRoot: (canvas: HTMLCanvasElement) => HTMLElement;
  /** Active canvas entries keyed by canvas id. */
  targets: Record<string, CanvasEntry> = {};
  /** Canvas ids in presentation order. */
  order: string[] = [];
  /** Event managers keyed by canvas id. */
  eventManagers: Record<string, EventManager> = {};
  /** Associate event roots and canvas elements with their presentation canvas id. */
  private _eventRootToCanvasId = new WeakMap<HTMLElement, string>();

  /** Configure event-manager creation and root lookup supplied by the owning Deck instance. */
  constructor(props: {
    /** Create an event manager bound to a single presentation-canvas event root. */
    createEventManager: (root: HTMLElement) => EventManager;
    /** Resolve the custom event root associated with an existing presentation canvas. */
    getEventRoot: (canvas: HTMLCanvasElement) => HTMLElement;
  }) {
    this._createEventManager = props.createEventManager;
    this._getEventRoot = props.getEventRoot;
  }

  /** Destroy all presentation contexts and event managers. */
  finalize(): void {
    for (const target of Object.values(this.targets)) {
      target.eventManager.destroy();
      target.presentationContext.destroy();
    }
    this.targets = {};
    this.order = [];
    this.eventManagers = {};
    this._eventRootToCanvasId = new WeakMap();
  }

  /**
   * Diff the configured presentation canvases against the current registry and create, reuse,
   * or destroy canvas targets as needed.
   */
  syncCanvasEntries(props: {
    /** Shared device used to create presentation contexts. */
    device: Device;
    /** Existing presentation canvases, supplied as elements or DOM element ids. */
    canvases?: (string | HTMLCanvasElement)[];
    /** Device-pixel ratio policy forwarded to each presentation context. */
    useDevicePixels: number | boolean;
  }): void {
    const normalizedCanvases = this._normalizeCanvasList(props.canvases);
    const nextTargets: Record<string, CanvasEntry> = {};
    const nextOrder: string[] = [];
    const eventRootCounts = new Map<HTMLElement, number>();

    for (const {canvas} of normalizedCanvases) {
      const eventRoot = this._getEventRoot(canvas);
      eventRootCounts.set(eventRoot, (eventRootCounts.get(eventRoot) || 0) + 1);
    }

    for (const {id, canvas} of normalizedCanvases) {
      const resolvedEventRoot = this._getEventRoot(canvas);
      // A shared event root would dispatch every event to every target's controller. In that
      // ambiguous case, listen directly on each canvas to keep input local to its target.
      const eventRoot =
        eventRootCounts.get(resolvedEventRoot) === 1 ? resolvedEventRoot : canvas;
      let target = this.targets[id];
      if (
        !target ||
        target.device !== props.device ||
        target.canvas !== canvas ||
        target.eventRoot !== eventRoot
      ) {
        target?.eventManager.destroy();
        target?.presentationContext.destroy();

        const presentationContext = props.device.createPresentationContext({
          id,
          canvas,
          useDevicePixels: props.useDevicePixels,
          autoResize: true
        });
        target = {
          id,
          device: props.device,
          canvas,
          eventRoot,
          presentationContext,
          eventManager: this._createEventManager(eventRoot)
        };
      }

      this._eventRootToCanvasId.set(eventRoot, id);
      this._eventRootToCanvasId.set(canvas, id);
      nextTargets[id] = target;
      nextOrder.push(id);
    }

    for (const [id, target] of Object.entries(this.targets)) {
      if (!nextTargets[id]) {
        target.eventManager.destroy();
        target.presentationContext.destroy();
      }
    }

    this.targets = nextTargets;
    this.order = nextOrder;
    const nextEventManagers = Object.fromEntries(
      Object.entries(nextTargets).map(([id, target]) => [id, target.eventManager])
    );
    if (!this._haveSameEventManagers(nextEventManagers)) {
      this.eventManagers = nextEventManagers;
    }
  }

  /** Resolve the presentation canvas id that produced a DOM event. */
  getCanvasIdFromEvent(rootElement?: HTMLElement | null): string | undefined {
    return rootElement ? this._eventRootToCanvasId.get(rootElement) : undefined;
  }

  /** Look up a canvas target by id, defaulting to the first configured canvas. */
  getTarget(canvasId?: string): CanvasEntry | null {
    return this.targets[canvasId || this.order[0] || DEFAULT_CANVAS_ID] || null;
  }

  /** Resolve DOM element ids and reject duplicate presentation-canvas ids. */
  private _normalizeCanvasList(
    canvases: (string | HTMLCanvasElement)[] = []
  ): {id: string; canvas: HTMLCanvasElement}[] {
    const ids = new Set<string>();
    return canvases.map((canvasLike, index) => {
      let canvas: HTMLCanvasElement | null;
      let id: string;

      if (typeof canvasLike === 'string') {
        canvas = document.getElementById(canvasLike) as HTMLCanvasElement | null;
        assert(canvas, `Canvas with id ${canvasLike} not found`);
        id = canvasLike;
      } else {
        canvas = canvasLike;
        id = canvas.id || `deckgl-canvas-${index}`;
      }

      assert(!ids.has(id), `Duplicate canvas id ${id}`);
      ids.add(id);

      return {id, canvas};
    });
  }

  /** Preserve manager-map identity when an update retains the same event managers. */
  private _haveSameEventManagers(eventManagers: Record<string, EventManager>): boolean {
    const eventManagerIds = Object.keys(eventManagers);
    const previousEventManagerIds = Object.keys(this.eventManagers);
    return (
      eventManagerIds.length === previousEventManagerIds.length &&
      eventManagerIds.every(id => eventManagers[id] === this.eventManagers[id])
    );
  }
}
