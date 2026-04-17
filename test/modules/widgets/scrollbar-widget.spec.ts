// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterEach, test, expect, vi} from 'vitest';
import {OrthographicView, type OrthographicViewState} from '@deck.gl/core';
import {ScrollbarWidget} from '@deck.gl/widgets';
import {WidgetTester} from './common';

let testInstance: WidgetTester<any> | undefined;

afterEach(() => {
  testInstance?.destroy();
  testInstance = undefined;
});

test('ScrollbarWidget - slider placement#vertical', async () => {
  testInstance = new WidgetTester({
    views: new OrthographicView({id: 'ortho', controller: true}),
    initialViewState: {
      target: [0, 0],
      zoom: 0
    } satisfies OrthographicViewState,
    widgets: [
      new ScrollbarWidget({
        viewId: 'ortho',
        contentBounds: [
          [-50, -400],
          [50, 400]
        ],
        placement: 'bottom-right',
        orientation: 'vertical',
        startButtonAriaLabel: 'Scroll up',
        endButtonAriaLabel: 'Scroll down'
      })
    ]
  });

  await testInstance.idle();
  const widgetRoot = testInstance.findElements('.deck-widget-scrollbar')[0] as HTMLDivElement;
  const scrollbar = testInstance.findElements('.deck-widget-range--vertical')[0] as HTMLDivElement;
  const thumb = testInstance.findElements('.deck-widget-range__thumb')[0] as HTMLDivElement;

  expect(widgetRoot.dataset.placement).toBe('bottom-right');
  expect(scrollbar.getAttribute('aria-orientation')).toBe('vertical');
  expect(scrollbar.getAttribute('aria-valuenow')).toBe('200');
  expect(thumb.style.height).toBe('50%');
  expect(thumb.style.top).toBe('25%');
});

test('ScrollbarWidget - slider placement#horizontal', async () => {
  testInstance = new WidgetTester({
    views: new OrthographicView({id: 'ortho', controller: true}),
    initialViewState: {
      target: [0, 0],
      zoom: 0
    } satisfies OrthographicViewState,
    widgets: [
      new ScrollbarWidget({
        viewId: 'ortho',
        contentBounds: [
          [-500, -50],
          [500, 50]
        ],
        placement: 'top-left',
        orientation: 'horizontal',
        startButtonAriaLabel: 'Scroll left',
        endButtonAriaLabel: 'Scroll right'
      })
    ]
  });

  await testInstance.idle();
  const widgetRoot = testInstance.findElements('.deck-widget-scrollbar')[0] as HTMLDivElement;
  const scrollbar = testInstance.findElements(
    '.deck-widget-range--horizontal'
  )[0] as HTMLDivElement;
  const thumb = testInstance.findElements('.deck-widget-range__thumb')[0] as HTMLDivElement;

  expect(widgetRoot.dataset.placement).toBe('top-left');
  expect(scrollbar.getAttribute('aria-orientation')).toBe('horizontal');
  expect(scrollbar.getAttribute('aria-valuenow')).toBe('200');
  expect(thumb.style.width).toBe('60%');
  expect(thumb.style.left).toBe('20%');
});

test('ScrollbarWidget - step button and wheel events', async () => {
  let viewState: OrthographicViewState = {
    target: [0, 0],
    zoom: 0
  };
  testInstance = new WidgetTester({
    views: new OrthographicView({id: 'ortho', controller: true}),
    initialViewState: viewState,
    onViewStateChange: ({viewState: nextViewState}: {viewState: OrthographicViewState}) => {
      viewState = nextViewState;
    },
    widgets: [
      new ScrollbarWidget({
        viewId: 'ortho',
        contentBounds: [
          [-500, -50],
          [500, 50]
        ],
        placement: 'top-left',
        orientation: 'horizontal',
        stepSize: 50,
        startButtonAriaLabel: 'Scroll left',
        endButtonAriaLabel: 'Scroll right'
      })
    ]
  });

  await testInstance.idle();
  const scrollbar = testInstance.findElements(
    '.deck-widget-range--horizontal'
  )[0] as HTMLDivElement;
  const thumb = testInstance.findElements('.deck-widget-range__thumb')[0] as HTMLDivElement;

  expect(scrollbar.getAttribute('aria-valuenow')).toBe('200');
  expect(thumb.style.width).toBe('60%');
  expect(thumb.style.left).toBe('20%');

  testInstance.click('.deck-widget-range__button--end');
  await testInstance.idle();

  expect(scrollbar.getAttribute('aria-valuenow')).toBe('250');
  expect(viewState.target).not.toEqual([0, 0]);

  scrollbar.dispatchEvent(
    new WheelEvent('wheel', {
      deltaY: 25,
      bubbles: true,
      cancelable: true
    })
  );
  await testInstance.idle();

  expect(scrollbar.getAttribute('aria-valuenow')).toBe('275');
});

test('ScrollbarWidget - decorations', async () => {
  const onDecorationClick = vi.fn(() => true);
  testInstance = new WidgetTester({
    views: new OrthographicView({id: 'ortho', controller: true}),
    initialViewState: {
      target: [0, 0],
      zoom: 0
    } satisfies OrthographicViewState,
    widgets: [
      new ScrollbarWidget({
        viewId: 'ortho',
        contentBounds: [
          [-500, -50],
          [500, 50]
        ],
        placement: 'top-left',
        orientation: 'horizontal',
        decorations: [
          {
            contentBounds: [
              [-300, -50],
              [-100, 50]
            ],
            color: 'rgb(255, 255, 0)',
            title: 'Highlight',
            onClick: onDecorationClick
          }
        ]
      })
    ]
  });

  await testInstance.idle();

  const scrollbar = testInstance.findElements(
    '.deck-widget-range--horizontal'
  )[0] as HTMLDivElement;
  const decoration = testInstance.findElements(
    '.deck-widget-range__decoration'
  )[0] as HTMLDivElement;
  const decorationContent = decoration.firstElementChild as HTMLDivElement;

  expect(decoration).toBeTruthy();
  expect(decoration.style.left).toBe('20%');
  expect(decoration.style.width).toBe('20%');
  expect(decorationContent.title).toBe('Highlight');
  expect(decorationContent.style.backgroundColor).toBe('rgb(255, 255, 0)');
  expect(scrollbar.getAttribute('aria-valuenow')).toBe('200');

  decorationContent.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true
    })
  );
  await testInstance.idle();

  expect(onDecorationClick).toHaveBeenCalledOnce();
  expect(scrollbar.getAttribute('aria-valuenow')).toBe('200');
});
