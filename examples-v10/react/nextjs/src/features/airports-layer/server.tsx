// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import 'server-only';
import {airports} from '@/data-access/airports/server';
import {AirportsLayerClient} from './client';

interface AirportsLayerServerProps {
  search?: string;
}

/**
 * Server component that fetches airports data and passes to client layer
 */
export async function AirportsLayerServer({search}: AirportsLayerServerProps) {
  const data = await airports({search});

  return <AirportsLayerClient data={data} />;
}
