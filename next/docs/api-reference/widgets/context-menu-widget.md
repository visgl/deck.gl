# ContextMenuWidget

![from v9.2](https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square)

<!-- -->

Displays a context menu on right-click events with customizable menu items based on picked objects.

* JavaScript
* TypeScript
* React

```
import {Deck} from '@deck.gl/core';

import {ScatterplotLayer} from '@deck.gl/layers';

import {ContextMenuWidget} from '@deck.gl/widgets';

import '@deck.gl/widgets/stylesheet.css';



let points = [[-122.4, 37.78]];



const renderLayer = () =>

  new ScatterplotLayer({

    id: 'points',

    data: points,

    getPosition: d => d,

    getRadius: 5000,

    getFillColor: [200, 0, 80],

    pickable: true

  });



const deck = new Deck({

  initialViewState: {

    longitude: -122.4,

    latitude: 37.78,

    zoom: 10

  },

  controller: true,

  layers: [renderLayer()],

  widgets: [

    new ContextMenuWidget({

      getMenuItems: info => {

        if (info.layer?.id === 'points') {

          return [

            {

              value: 'delete',

              label: 'Delete point',

              onSelect: () => {

                points = points.filter((_, index) => index !== info.index);

                deck.setProps({layers: [renderLayer()]});

              }

            }

          ];

        } else {

          return [

            {

              value: 'add',

              label: 'Add point',

              onSelect: () => {

                points = points.concat([info.coordinate]);

                deck.setProps({layers: [renderLayer()]});

              }

            }

          ];

        }

      }

    })

  ]

});
```

```
import {Deck, type PickingInfo} from '@deck.gl/core';

import {ScatterplotLayer} from '@deck.gl/layers';

import {ContextMenuWidget} from '@deck.gl/widgets';

import '@deck.gl/widgets/stylesheet.css';



type Point = [longitude: number, latitude: number];



let points: Point[] = [[-122.4, 37.78]];



const renderLayer = () =>

  new ScatterplotLayer<Point>({

    id: 'points',

    data: points,

    getPosition: d => d,

    getRadius: 5000,

    getFillColor: [200, 0, 80],

    pickable: true

  });



const deck = new Deck({

  initialViewState: {

    longitude: -122.4,

    latitude: 37.78,

    zoom: 10

  },

  controller: true,

  layers: [renderLayer()],

  widgets: [

    new ContextMenuWidget({

      getMenuItems: (info: PickingInfo<Point>) => {

        if (info.layer?.id === 'points') {

          return [

            {

              value: 'delete',

              label: 'Delete point',

              onSelect: () => {

                points = points.filter((_, index) => index !== info.index);

                deck.setProps({layers: [renderLayer()]});

              }

            }

          ];

        } else {

          return [

            {

              value: 'add',

              label: 'Add point',

              onSelect: () => {

                points = points.concat([info.coordinate as Point]);

                deck.setProps({layers: [renderLayer()]});

              }

            }

          ];

        }

      }

    })

  ]

});
```

```
import React, {useState, useCallback} from 'react';

import DeckGL, {ContextMenuWidget} from '@deck.gl/react';

import {ScatterplotLayer} from '@deck.gl/layers';

import type {PickingInfo} from '@deck.gl/core';

import '@deck.gl/widgets/stylesheet.css';



type Point = [longitude: number, latitude: number];



function App() {

  const [points, setPoints] = useState<Point[]>([[-122.4, 37.78]]);



  const getMenuItems = useCallback(getMenuItems: (info: PickingInfo<Point>) => {

    if (info.layer?.id === 'points') {

      return [

        {

          value: 'delete',

          label: 'Delete point',

          onSelect: () => {

            points = points.filter((_, index) => index !== info.index);

            deck.setProps({layers: [renderLayer()]});

          }

        }

      ];

    } else {

      return [

        {

          value: 'add',

          label: 'Add point',

          onSelect: () => {

            points = points.concat([info.coordinate as Point]);

            deck.setProps({layers: [renderLayer()]});

          }

        }

      ];

    }

  }, []);



  return (

    <DeckGL

      initialViewState={{

        longitude: -122.4,

        latitude: 37.78,

        zoom: 10

      }}

      controller

      layers={[

        new ScatterplotLayer<Point>({

          id: 'points',

          data: points,

          getPosition: d => d,

          getRadius: 5000,

          getFillColor: [200, 0, 80],

          pickable: true

        })

      ]}

    >

      <ContextMenuWidget getMenuItems={getMenuItems} />

    </DeckGL>

  );

}
```

## Constructor[​](#constructor "Direct link to Constructor")

```
import {ContextMenuWidget, type ContextMenuWidgetProps} from '@deck.gl/widgets';

new ContextMenuWidget({} satisfies ContextMenuWidgetProps);
```

## Types[​](#types "Direct link to Types")

### `ContextMenuWidgetProps`[​](#contextmenuwidgetprops "Direct link to contextmenuwidgetprops")

The `ContextMenuWidget` accepts the generic [`WidgetProps`](https://deck.gl/next/docs/api-reference/core/widget.md#widgetprops) and:

#### menuItems (ContextWidgetMenuItem\[], optional)[​](#menuitems-contextwidgetmenuitem-optional "Direct link to menuItems (ContextWidgetMenuItem\[], optional)")

Items to display in the context menu. See [ContextWidgetMenuItem](#contextwidgetmenuitem).

#### getMenuItems (Function, optional)[​](#getmenuitems-function-optional "Direct link to getMenuItems (Function, optional)")

Function that returns menu items based on the picked object. Receives the following parameters:

* `pickInfo` ([PickingInfo](https://deck.gl/next/docs/developer-guide/interactivity.md#picking)) - descriptor of what's under the pointer

Expected to return an array of [ContextWidgetMenuItem](#contextwidgetmenuitem) objects, or `null` if no menu should be displayed.

Overrides `menuItems` if supplied.

#### onMenuItemSelected (Function, optional)[​](#onmenuitemselected-function-optional "Direct link to onMenuItemSelected (Function, optional)")

Callback invoked when a menu item is selected. Receives the following parameters:

* `value` (string) - the value of the selected menu item
* `pickInfo` ([PickingInfo](https://deck.gl/next/docs/developer-guide/interactivity.md#picking)) - descriptor of what's under the pointer

#### placement (string, optional)[​](#placement "Direct link to placement (string, optional)")

Position content relative to the anchor. One of `bottom` | `left` | `right` | `top` | `bottom-start` | `bottom-end` | `left-start` | `left-end` | `right-start` | `right-end` | `top-start` | `top-end`

* Default: `'right'`

#### offset (number)[​](#offset "Direct link to offset (number)")

Pixel offset from the anchor

* Default: `10`

#### arrow (false | number | \[number, number])[​](#arrow "Direct link to arrow (false | number | \[number, number])")

Show an arrow pointing at the anchor. Value can be one of the following:

* `false` - do not display an arrow

* `number` - pixel size of the arrow

* `[width: number, height: number]` - pixel size of the arrow

* Default: `10`

### `ContextWidgetMenuItem`[​](#contextwidgetmenuitem "Direct link to contextwidgetmenuitem")

Menu item definition:

* `label` (string) - Display text for the menu item
* `value` (string, optional) - Unique identifier for the menu item. If not supplied, then the item is not interactive.
* `icon` (string, optional) - Data url of an icon that should be displayed with the menu item
* `onSelect` (function, optional) - Callback when this item is selected

## Source[​](#source "Direct link to Source")

[modules/widgets/src/context-menu-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/context-menu-widget.tsx)
