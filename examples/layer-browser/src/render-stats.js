import React from 'react';

const kB = 1024;
const MB = 1024 * 1024;
const GB = 1024 * 1024 * 1024;

export function RenderStats(props) {
  const stats = props.stats;

  if (!stats) {
    return null;
  }

  return (
    <div>
      <div>FPS: {Math.round(stats.fps)}</div>
      <div>
        GPU Frame Time: {stats.gpuTimePerFrame.toFixed(2)}
        ms
      </div>
      <div>
        CPU Frame Time: {stats.cpuTimePerFrame.toFixed(2)}
        ms
      </div>
      <div>GPU Memory: {formatMemory(stats.gpuMemory)}</div>
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
