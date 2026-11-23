// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {useAppStore} from '../stores/app';

/**
 * Search box. The list and the layer read the search through a deferred value (see
 * `useAirports`), so typing never replaces them with a loading fallback.
 */
export function SearchBox() {
  const search = useAppStore(state => state.search);
  const setSearch = useAppStore(state => state.setSearch);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
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
      </div>
    </div>
  );
}
