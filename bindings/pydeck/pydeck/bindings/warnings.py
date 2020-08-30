import warnings


def warn_for_mapbox_key():
    warnings.warn(
        ("A Mapbox API key is not set, which will lead to a blank base map. "
         "If this is intentional, set map_provider=None. Otherwise, pass a Mapbox API key and "
         "consider setting this API key as an environment variable. "
         "See https://pydeck.gl/installation.html#getting-a-mapbox-api-key"), UserWarning,
    )
