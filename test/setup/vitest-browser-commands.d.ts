// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/**
 * Type declarations for custom Vitest browser commands.
 * These augment the vitest/browser module so TypeScript
 * knows about our custom commands when importing `commands`.
 */

// Types matching browser-commands.ts
interface DiffOptions {
  goldenImage: string;
  region?: {x: number; y: number; width: number; height: number};
  saveOnFail?: boolean;
  saveAs?: string;
  threshold?: number;
  createDiffImage?: boolean;
  tolerance?: number;
  includeAA?: boolean;
  includeEmpty?: boolean;
  platform?: string;
}

interface DiffResult {
  headless: boolean;
  match: number;
  matchPercentage: string;
  success: boolean;
  error: string | null;
}

interface BrowserDiagnostic {
  level: string;
  text: string;
}

interface InputEvent {
  type: 'click' | 'dblclick' | 'drag' | 'mousemove' | 'keypress';
  x?: number;
  y?: number;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  steps?: number;
  key?: string;
  shiftKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
}

declare module 'vitest/browser' {
  interface BrowserCommands {
    /**
     * Captures a screenshot and compares it with a golden image.
     * Replaces browserTestDriver_captureAndDiffScreen from @probe.gl/test-utils
     */
    captureAndDiffScreen(options: DiffOptions): Promise<DiffResult>;

    /**
     * Emulates user input events for interaction testing.
     * Replaces browserTestDriver_emulateInput from @probe.gl/test-utils
     */
    emulateInput(event: InputEvent): Promise<void>;

    /**
     * Returns whether running in headless mode.
     * Replaces browserTestDriver_isHeadless from @probe.gl/test-utils
     */
    isHeadless(): Promise<boolean>;

    /**
     * Clears buffered browser diagnostics for the current page.
     */
    resetBrowserDiagnostics(): Promise<void>;

    /**
     * Returns buffered browser diagnostics for the current page and clears them.
     */
    consumeBrowserDiagnostics(): Promise<BrowserDiagnostic[]>;
  }
}

export {};
