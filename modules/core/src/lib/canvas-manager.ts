// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import assert from '../utils/assert';
import {DEFAULT_CANVAS_ID} from './view-manager';

import type {Device, PresentationContext} from '@luma.gl/core';
import type {EventManager} from 'mjolnir.js';

/**
 * Runtime state for one canvas in an array-valued `Deck.canvas` configuration.
 * @internal
 */
export type CanvasEntry = {
  id: string;
  canvas: HTMLCanvasElement;
  eventRoot: HTMLElement;
  presentationContext: PresentationContext;
  eventManager: EventManager;
};

/**
 * Owns resources derived from an array-valued `Deck.canvas` configuration.
 *
 * The existing single-canvas path stays in Deck. This class only reconciles presentation
 * canvases, their {@link PresentationContext}s and per-canvas {@link EventManager}s, and answers
 * geometry queries for those targets.
 * @internal
 */
export default class CanvasManager {
  private _createEventManager: (root: HTMLElement) => EventManager;
  private _getEventRoot: (canvas: HTMLCanvasElement) => HTMLElement;
  /** Active canvas entries keyed by canvas id. */
  targets: Record<string, CanvasEntry> = {};
  /** Canvas ids in presentation order. */
  order: string[] = [];
  /** Event managers keyed by canvas id. */
  eventManagers: Record<string, EventManager> = {};
  private _eventRootToCanvasId = new WeakMap<HTMLElement, string>();

  constructor(props: {
    createEventManager: (root: HTMLElement) => EventManager;
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
    device: Device;
    canvases?: (string | HTMLCanvasElement)[];
    useDevicePixels: number | boolean;
  }): void {
    const normalizedCanvases = this._normalizeCanvasList(props.canvases);
    const nextTargets: Record<string, CanvasEntry> = {};
    const nextOrder: string[] = [];

    for (const {id, canvas} of normalizedCanvases) {
      const eventRoot = this._getEventRoot(canvas);
      let target = this.targets[id];
      if (!target || target.canvas !== canvas || target.eventRoot !== eventRoot) {
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

  /** Return CSS pixel sizes for each active presentation canvas. */
  getMetrics(
    defaultWidth: number,
    defaultHeight: number
  ): Record<string, {width: number; height: number}> {
    const metrics: Record<string, {width: number; height: number}> = {};
    if (!this.order.length) {
      metrics[DEFAULT_CANVAS_ID] = {width: defaultWidth, height: defaultHeight};
      return metrics;
    }

    for (const [id, target] of Object.entries(this.targets)) {
      const [width, height] = target.presentationContext.getCSSSize();
      metrics[id] = {width, height};
    }
    return metrics;
  }

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

  private _haveSameEventManagers(eventManagers: Record<string, EventManager>): boolean {
    const eventManagerIds = Object.keys(eventManagers);
    const previousEventManagerIds = Object.keys(this.eventManagers);
    return (
      eventManagerIds.length === previousEventManagerIds.length &&
      eventManagerIds.every(id => eventManagers[id] === this.eventManagers[id])
    );
  }
}
