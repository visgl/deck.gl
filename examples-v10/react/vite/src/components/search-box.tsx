// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {useTransition} from 'react';
import {useAppStore} from '../stores/app';

/**
 * Search box component with deferred value and transition indicator
 */
export function SearchBox() {
  const search = useAppStore(state => state.search);
  const setSearch = useAppStore(state => state.setSearch);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    startTransition(() => {
      setSearch(e.target.value);
    });
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
          value={search}
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
