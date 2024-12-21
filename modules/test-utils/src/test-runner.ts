// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global window, console, setTimeout */
/* eslint-disable no-console */
import {Deck, DeckProps, MapView} from '@deck.gl/core';
import type {Device} from '@luma.gl/core';

const DEFAULT_DECK_PROPS: DeckProps<any> = {
  ...Deck.defaultProps,
  id: 'deckgl-render-test',
  width: 800,
  height: 450,
  style: {position: 'absolute', left: '0px', top: '0px'},
  views: [new MapView({})],
  useDevicePixels: false,
  debug: true
};

export type TestCase = {
  name: string;
  /** milliseconds to wait before aborting */
  timeout?: number;
};

type TestOptions<TestCaseT extends TestCase, ResultT> = {
  /** Called when a test case starts */
  onTestStart: (testCase: TestCaseT) => void;
  /** Called when a test case passes */
  onTestPass: (testCase: TestCaseT, result: ResultT) => void;
  /** Called when a test case fails */
  onTestFail: (testCase: TestCaseT, result: ResultT | {error: string}) => void;

  /** milliseconds to wait for each test case before aborting */
  timeout: number;
};

const DEFAULT_TEST_OPTIONS: TestOptions<TestCase, unknown> = {
  // test lifecycle callback
  onTestStart: testCase => console.log(`# ${testCase.name}`),
  onTestPass: testCase => console.log(`ok ${testCase.name} passed`),
  onTestFail: testCase => console.log(`not ok ${testCase.name} failed`),

  // milliseconds to wait for each test case before aborting
  timeout: 2000
};

export abstract class TestRunner<TestCaseT extends TestCase, ResultT, ExtraOptions = {}> {
  deck: Deck<any> | null = null;
  props: DeckProps<any>;
  isHeadless: boolean;
  isRunning: boolean = false;
  testOptions: TestOptions<TestCaseT, ResultT> & ExtraOptions;
  gpuVendor?: string;

  private _testCases: TestCaseT[] = [];
  private _currentTestCase: TestCaseT | null = null;
  private _testCaseData: unknown = null;

  /**
   * props
   *   Deck props
   */
  constructor(props: DeckProps = {}, options: ExtraOptions) {
    this.props = {...DEFAULT_DECK_PROPS, ...props};

    // @ts-ignore browserTestDriver_isHeadless is injected by @probe.gl/test-utils if running in headless browser
    this.isHeadless = Boolean(window.browserTestDriver_isHeadless);

    this.testOptions = {...DEFAULT_TEST_OPTIONS, ...options};
  }

  get defaultTestCase(): TestCaseT {
    throw new Error('Not implemented');
  }

  /**
   * Add testCase(s)
   */
  add(testCases: TestCaseT[]): this {
    if (!Array.isArray(testCases)) {
      testCases = [testCases];
    }
    for (const testCase of testCases) {
      this._testCases.push(testCase);
    }
    return this;
  }

  /**
   * Returns a promise that resolves when all the test cases are done
   */
  run(options: Partial<TestOptions<TestCaseT, ResultT> & ExtraOptions> = {}): Promise<void> {
    Object.assign(this.testOptions, options);

    return new Promise<void>((resolve, reject) => {
      this.deck = new Deck({
        ...this.props,
        onDeviceInitialized: this._onDeviceInitialized.bind(this),
        onLoad: resolve
      });

      this.isRunning = true;
      this._currentTestCase = null;
    })
      .then(() => {
        let promise = Promise.resolve();
        // chain test case promises
        this._testCases.forEach(testCase => {
          promise = promise.then(() => this._runTest(testCase));
        });
        return promise;
      })
      .catch((error: unknown) => {
        this.fail({error: (error as Error).message});
      })
      .finally(() => {
        this.deck!.finalize();
        this.deck = null;
      });
  }

  /* Lifecycle methods for subclassing */

  initTestCase(testCase: TestCaseT) {
    for (const key in this.defaultTestCase) {
      if (!(key in testCase)) {
        testCase[key] = this.defaultTestCase[key];
      }
    }
    this.testOptions.onTestStart(testCase);
  }

  /** Execute the test case. Fails if takes longer than options.timeout */
  abstract runTestCase(testCase: TestCaseT): Promise<void>;
  /** Check the result of the test case. Calls pass() or fail() */
  abstract assert(testCase: TestCaseT): Promise<void>;

  /* Utilities */

  protected pass(result: ResultT) {
    this.testOptions.onTestPass(this._currentTestCase!, result);
  }

  protected fail(result: ResultT | {error: string}) {
    this.testOptions.onTestFail(this._currentTestCase!, result);
  }

  /* Private Methods */

  private _onDeviceInitialized(device: Device) {
    this.gpuVendor = device.info.vendor;
  }

  private async _runTest(testCase: TestCaseT) {
    this._currentTestCase = testCase;

    // normalize test case
    this.initTestCase(testCase);

    const timeout = testCase.timeout || this.testOptions.timeout;
    const task = this.runTestCase(testCase);
    const timeoutTask = new Promise((_, reject) => {
      setTimeout(() => {
        reject('Timeout');
      }, timeout);
    });

    try {
      await Promise.race([task, timeoutTask]);
      await this.assert(testCase);
    } catch (err: unknown) {
      if (err === 'Timeout') {
        this.fail({error: 'Timeout'});
      }
    }
  }
}
