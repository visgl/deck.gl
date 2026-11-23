// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

'use client';

import {useTransition} from 'react';
import {useSearch} from '@/hooks/use-search';

/**
 * Search box with a pending indicator. nuqs takes `startTransition` as an option: the input's
 * state updates at once, and only the server re-render for the new search runs in the
 * transition. Wrapping the setter in `startTransition` instead would hold the input at its old
 * value until the server answers, and drop keystrokes.
 */
export function SearchBox() {
  const [search, setSearch] = useSearch();
  const [isPending, startTransition] = useTransition();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    void setSearch(e.target.value, {startTransition});
  };

  return (
    <div
      style={{
        left: '50%',
        position: 'absolute',
        top: 20,
        transform: 'translateX(-50%)',
        zIndex: 1
      }}
    >
      <div style={{position: 'relative'}}>
        <input
          type="search"
          value={search ?? ''}
          onChange={handleChange}
          placeholder="Search airports..."
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ddd',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            fontSize: '1em',
            outline: 'none',
            padding: '10px 16px',
            width: 300
          }}
        />
        {isPending && (
          <div
            style={{
              color: '#666',
              fontSize: '0.85em',
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          >
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}
