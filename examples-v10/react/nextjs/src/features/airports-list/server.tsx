// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import 'server-only';
import {airports} from '@/data-access/airports/server';
import {AirportsListClient} from './client';

interface AirportsListServerProps {
  search?: string;
}

/**
 * Server component that fetches airports data and passes to client list
 */
export async function AirportsListServer({search}: AirportsListServerProps) {
  const data = await airports({search});

  return <AirportsListClient data={data} />;
}
