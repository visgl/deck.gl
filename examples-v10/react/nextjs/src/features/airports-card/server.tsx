// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import 'server-only';
import {airportById} from '@/data-access/airports/server';
import {AirportsCardClient} from './client';

interface AirportsCardServerProps {
  id: string;
}

/**
 * Server component that fetches single airport by ID and passes to client card
 */
export async function AirportsCardServer({id}: AirportsCardServerProps) {
  const airport = await airportById(id);

  if (!airport) {
    return null;
  }

  return <AirportsCardClient airport={airport} />;
}
