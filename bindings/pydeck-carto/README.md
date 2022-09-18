# pydeck-carto

Pydeck wrapper for use with CARTO

## Install

```bash
pip install pydeck-carto
```

This also ensures [pydeck](https://pydeck.gl/) is installed. If you haven't previously enabled pydeck to be used with Jupyter, follow [its instructions](https://pydeck.gl/installation.html) to install.

### Installing from source

```bash
git clone https://github.com/visgl/deck.gl
cd deck.gl/bindings/pydeck-carto
pip install .
```

## Usage

```py
import pydeck as pdk
from carto_auth import CartoAuth
from pydeck_carto import register_carto_layer, get_layer_credentials, notify_error
from pydeck_carto.layer import MapType, CartoConnection

# Authentication with CARTO
carto_auth = CartoAuth.from_oauth()

# Register CartoLayer in pydeck
register_carto_layer()

# Render CartoLayer in pydeck
layer = pdk.Layer(
    "CartoLayer",
    data="SELECT geom, name FROM carto-demo-data.demo_tables.airports",
    type_=MapType.QUERY,
    connection=CartoConnection.CARTO_DW,
    credentials=get_layer_credentials(carto_auth),
    get_fill_color=[238, 77, 90],
    point_radius_min_pixels=2.5,
    pickable=True,
    on_data_error=notify_error(),
)
view_state = pdk.ViewState(latitude=0, longitude=0, zoom=1)
pdk.Deck(layer, map_style=pdk.map_styles.ROAD, initial_view_state=view_state)
```

For more information, check the [examples](./examples) section.

## Development

Make commands:

- init: create the environment and install dependencies
- lint: run linter (black + flake8)
- test: run tests (pytest)
- publish-pypi: publish package in pypi.org
- publish-test-pypi: publish package in test.pypi.org
- clean: remove the environment
