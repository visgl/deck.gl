// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import assert from '../utils/assert';
import {DEFAULT_CANVAS_ID} from './view-manager';

import type {Device, PresentationContext} from '@luma.gl/core';
import type {EventManager} from 'mjolnir.js';

/**
 * Runtime state for a single presentation canvas in multi-canvas mode.
 * @internal
 */
export type CanvasTarget = {
  id: string;
  canvas: HTMLCanvasElement;
  eventRoot: HTMLElement;
  presentationContext: PresentationContext;
  eventManager: EventManager;
  width: number;
  height: number;
};

/**
 * Tracks presentation canvases, their {@link PresentationContext}s and their per-canvas
 * {@link EventManager}s for Deck's multi-canvas mode.
 * @internal
 */
export default class CanvasManager {
  private _createEventManager: (root: HTMLElement) => EventManager;
  private _targets: Record<string, CanvasTarget> = {};
  private _order: string[] = [];
  private _eventRootToCanvasId = new WeakMap<HTMLElement, string>();

  constructor(props: {createEventManager: (root: HTMLElement) => EventManager}) {
    this._createEventManager = props.createEventManager;
  }

  /** The active canvas target registry keyed by canvas id. */
  get targets(): Record<string, CanvasTarget> {
    return this._targets;
  }

  /** Canvas ids in presentation order. */
  get order(): string[] {
    return this._order;
  }

  /** The default canvas id used for views and picks that do not specify one. */
  get defaultCanvasId(): string {
    return this._order[0] || DEFAULT_CANVAS_ID;
  }

  /** The default presentation canvas, if any. */
  get canvas(): HTMLCanvasElement | null {
    return this._targets[this.defaultCanvasId]?.canvas || null;
  }

  /** The default event manager, if any. */
  get eventManager(): EventManager | null {
    return this.eventManagers[this.defaultCanvasId] || null;
  }

  /** Event managers keyed by canvas id. */
  get eventManagers(): Record<string, EventManager> {
    return Object.fromEntries(
      Object.entries(this._targets).map(([id, target]) => [id, target.eventManager])
    );
  }

  /** Destroy all presentation contexts and event managers. */
  finalize(): void {
    for (const target of Object.values(this._targets)) {
      target.eventManager.destroy();
      target.presentationContext.destroy();
    }
    this._targets = {};
    this._order = [];
    this._eventRootToCanvasId = new WeakMap();
  }

  /**
   * Diff the configured presentation canvases against the current registry and create, reuse,
   * or destroy canvas targets as needed.
   */
  sync(props: {
    device: Device;
    canvases?: (string | HTMLCanvasElement)[];
    useDevicePixels: number | boolean;
  }): void {
    const normalizedCanvases = this._normalizeCanvasList(props.canvases);
    const nextTargets: Record<string, CanvasTarget> = {};
    const nextOrder: string[] = [];

    for (const {id, canvas} of normalizedCanvases) {
      const eventRoot = this._getCanvasEventRoot(canvas);
      let target = this._targets[id];
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
          eventManager: this._createEventManager(eventRoot),
          width: canvas.clientWidth || canvas.width,
          height: canvas.clientHeight || canvas.height
        };
      }

      this._eventRootToCanvasId.set(eventRoot, id);
      this._eventRootToCanvasId.set(canvas, id);
      nextTargets[id] = target;
      nextOrder.push(id);
    }

    for (const [id, target] of Object.entries(this._targets)) {
      if (!nextTargets[id]) {
        target.eventManager.destroy();
        target.presentationContext.destroy();
      }
    }

    this._targets = nextTargets;
    this._order = nextOrder;
  }

  /** Resolve the presentation canvas id that produced a DOM event. */
  getCanvasIdFromEvent(rootElement?: HTMLElement | null): string | undefined {
    return rootElement ? this._eventRootToCanvasId.get(rootElement) : undefined;
  }

  /** Look up a canvas target by id, defaulting to the first configured canvas. */
  getTarget(canvasId?: string): CanvasTarget | null {
    return this._targets[canvasId || this.defaultCanvasId] || null;
  }

  /** Return CSS pixel sizes for each active presentation canvas. */
  getMetrics(width: number, height: number): Record<string, {width: number; height: number}> {
    const metrics: Record<string, {width: number; height: number}> = {};
    if (!this._order.length) {
      metrics[this.defaultCanvasId] = {width, height};
      return metrics;
    }

    for (const [id, target] of Object.entries(this._targets)) {
      metrics[id] = {width: target.width, height: target.height};
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

  private _getCanvasEventRoot(canvas: HTMLCanvasElement): HTMLElement {
    const eventRoot = canvas.parentElement;
    return eventRoot?.dataset.deckCanvasRoot === 'true' ? eventRoot : canvas;
  }
}
