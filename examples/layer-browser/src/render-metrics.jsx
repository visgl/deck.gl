import React from 'react';

const kB = 1024;
const MB = 1024 * 1024;
const GB = 1024 * 1024 * 1024;

export function RenderMetrics(props) {
  const metrics = props.metrics;

  if (!metrics) {
    return null;
  }

  return (
    <div>
      <div>FPS: {Math.round(metrics.fps)}</div>
      <div>
        GPU Frame Time: {metrics.gpuTimePerFrame.toFixed(2)}
        ms
      </div>
      <div>
        CPU Frame Time: {metrics.cpuTimePerFrame.toFixed(2)}
        ms
      </div>
      <div>GPU Memory: {formatMemory(metrics.gpuMemory)}</div>
    </div>
  );
}

function formatMemory(mem) {
  let unit;
  let val;

  if (mem < kB) {
    val = mem;
    unit = ' bytes';
  } else if (mem < MB) {
    val = mem / kB;
    unit = 'kB';
  } else if (mem < GB) {
    val = mem / MB;
    unit = 'MB';
  } else {
    val = mem / GB;
    unit = 'GB';
  }

  return `${val.toFixed(2)}${unit}`;
}
