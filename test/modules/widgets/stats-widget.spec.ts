// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterEach, test, expect, vi} from 'vitest';
import {Stats} from '@probe.gl/stats';
import {luma} from '@luma.gl/core';
import {_StatsWidget as StatsWidget} from '@deck.gl/widgets';
import {DEFAULT_FORMATTERS} from '../../../modules/widgets/src/stats-widget';
import {WidgetTester} from './common';

let testInstance: WidgetTester<any> | undefined;

afterEach(() => {
  testInstance?.destroy();
  testInstance = undefined;
});

test('StatsWidget - uncontrolled: initialExpanded sets starting state', () => {
  const widget = new StatsWidget({initialExpanded: true});
  expect(widget.getExpanded()).toBe(true);
});

test('StatsWidget - uncontrolled: defaults to collapsed', () => {
  const widget = new StatsWidget();
  expect(widget.getExpanded()).toBe(false);
});

test('StatsWidget - controlled: getExpanded returns expanded prop', () => {
  const widget = new StatsWidget({expanded: true});
  expect(widget.getExpanded()).toBe(true);
});

test('StatsWidget - controlled: toggleExpanded calls onExpandedChange but does not update internal state', () => {
  const onExpandedChange = vi.fn();
  const widget = new StatsWidget({expanded: true, onExpandedChange});

  (widget as any)._toggleExpanded();

  expect(onExpandedChange).toHaveBeenCalledWith(false);
  // Internal state unchanged (controlled mode)
  expect(widget.getExpanded()).toBe(true);
});

test('StatsWidget - uncontrolled: toggleExpanded updates internal state and calls callback', () => {
  const onExpandedChange = vi.fn();
  const widget = new StatsWidget({onExpandedChange});

  expect(widget.getExpanded()).toBe(false);
  (widget as any)._toggleExpanded();
  expect(widget.getExpanded()).toBe(true);
  expect(onExpandedChange).toHaveBeenCalledWith(true);
});

test('StatsWidget', async () => {
  testInstance = new WidgetTester({
    widgets: [new StatsWidget({id: 'stats', expanded: false})]
  });

  await testInstance.idle();
  const fpsBtn = testInstance.findElements('.deck-widget-button .text')[0] as HTMLDivElement;
  expect(fpsBtn).toBeTruthy();
  expect(fpsBtn.innerHTML).toContain('FPS');

  testInstance.setProps({
    widgets: [new StatsWidget({id: 'stats', expanded: true})]
  });
  await testInstance.idle();
  const contentDiv = testInstance.findElements('.deck-widget-stats-content')[0] as HTMLDivElement;
  expect(contentDiv).toBeTruthy();
  expect(contentDiv.innerHTML).toContain('setPropsTime');
});

test('StatsWidget#custom Stats', async () => {
  const stats = new Stats({id: 'Custom Stats'});
  const requestsStat = stats.get('Requests');
  requestsStat.addCount(7);

  const uploadTimeStat = stats.get('Upload Time');
  uploadTimeStat.time = 1500;
  vi.spyOn(uploadTimeStat, 'getAverageTime').mockReturnValue(12.34);

  const totalTimeStat = stats.get('Parsing Time');
  totalTimeStat.time = 1500;

  const frameRateStat = stats.get('Frame Rate', 'fps');
  vi.spyOn(frameRateStat, 'getHz').mockReturnValue(60);

  const memoryStat = stats.get('GPU Memory', 'memory');
  memoryStat.addCount(4200000);

  const widget = new StatsWidget({
    id: 'stats',
    type: 'custom',
    stats,
    expanded: true,
    title: '',
    formatters: {
      'Upload Time': 'averageTime',
      'Parsing Time': 'totalTime',
      'Frame Rate': 'fps',
      'GPU Memory': 'memory'
    }
  });

  testInstance = new WidgetTester({
    widgets: [widget]
  });

  await testInstance.idle();
  const statsContainer = testInstance.findElements(
    '.deck-widget-stats-container'
  )[0] as HTMLDivElement;
  expect(statsContainer).toBeTruthy();
  expect(statsContainer.innerHTML).toContain('Custom Stats');
  expect(statsContainer.innerHTML).toContain('Requests: 7');
  expect(statsContainer.innerHTML).toContain('Upload Time: 12.34ms');
  expect(statsContainer.innerHTML).toContain('Parsing Time: 1.50s');
  expect(statsContainer.innerHTML).toContain('Frame Rate: 60fps');
  expect(statsContainer.innerHTML).toContain('GPU Memory: 4.2 MB');
});

test('StatsWidget#type luma', async () => {
  const lumaStatsGroup = new Stats({id: 'Luma Stats'});
  const gpuMemoryStat = lumaStatsGroup.get('GPU Memory', 'memory');
  gpuMemoryStat.addCount(2100000);

  const originalStatsMap = luma.stats.stats;
  luma.stats.stats = new Map([['Luma Stats', lumaStatsGroup]]);

  try {
    testInstance = new WidgetTester({
      widgets: [new StatsWidget({id: 'stats', type: 'luma', expanded: true, title: ''})]
    });

    await testInstance.idle();
    const statsContainer = testInstance.findElements(
      '.deck-widget-stats-container'
    )[0] as HTMLDivElement;
    expect(statsContainer).toBeTruthy();
    expect(statsContainer.innerHTML).toContain('Luma Stats');
    expect(statsContainer.innerHTML).toContain('GPU Memory: 2.1 MB');
  } finally {
    luma.stats.stats = originalStatsMap;
  }
});

test('StatsWidget#type device', async () => {
  const deviceStatsGroup = new Stats({id: 'Device Stats'});
  const frameRateStat = deviceStatsGroup.get('Frame Rate', 'fps');
  vi.spyOn(frameRateStat, 'getHz').mockReturnValue(30);

  const widget = new StatsWidget({id: 'stats', type: 'device', expanded: true, title: ''});
  testInstance = new WidgetTester({
    widgets: [widget]
  });

  await testInstance.idle();
  (widget as any).deck.device = {
    type: 'webgl',
    statsManager: {
      stats: new Map([['Device Stats', deviceStatsGroup]])
    }
  };
  widget.updateHTML();
  await testInstance.idle();

  const statsContainer = testInstance.findElements(
    '.deck-widget-stats-container'
  )[0] as HTMLDivElement;
  expect(statsContainer).toBeTruthy();
  expect(statsContainer.innerHTML).toContain('Device Stats');
  expect(statsContainer.innerHTML).toContain('Frame Rate: 30fps');
  expect(statsContainer.innerHTML).toContain('WebGL');
});
