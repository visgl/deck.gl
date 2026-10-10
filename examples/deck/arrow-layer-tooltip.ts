// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {PickingInfo} from '@deck.gl/core';
import type {ArrowLayerPickingInfo} from '@deck.gl-community/arrow-layers';

/** Returns a compact tooltip for picked Arrow layer rows. */
export function getArrowLayerTooltip(info: PickingInfo): string | null {
  if (!info.picked || !info.layer) {
    return null;
  }
  const rowIndex = Math.max(info.index, 0);
  const arrowInfo = (info as ArrowLayerPickingInfo).arrow;
  const batchLabel = arrowInfo
    ? `\nbatch ${(arrowInfo.batchIndex + 1).toLocaleString()} / batch row ${arrowInfo.batchRowIndex.toLocaleString()}`
    : '';
  return `${info.layer.id}\nrow ${rowIndex.toLocaleString()}${batchLabel}`;
}
