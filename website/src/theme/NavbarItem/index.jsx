// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useEffect} from 'react';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import NavbarItem from '@theme-original/NavbarItem';

let openExamplesSidebar = false;

/** Opens the v10 sidebar after a mobile navbar click, including across layout changes. */
export function RestoreExamplesSidebar() {
  const {shouldRender, shown, toggle} = useNavbarMobileSidebar();
  useEffect(() => {
    if (shouldRender && openExamplesSidebar) {
      openExamplesSidebar = false;
      if (!shown) {
        toggle();
      }
    }
  }, [shouldRender, shown, toggle]);
  return null;
}

/** Remembers a mobile navigation into the v10 examples catalog. */
export default function NavbarItemWrapper({mobile, onClick, to, ...props}) {
  return (
    <NavbarItem
      {...props}
      mobile={mobile}
      to={to}
      onClick={
        mobile && to === '/examples-v10'
          ? event => {
              if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
                openExamplesSidebar = true;
              }
              onClick?.(event);
            }
          : onClick
      }
    />
  );
}
