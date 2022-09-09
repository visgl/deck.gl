from ._version import __version__
from .layer import register_carto_layer
from .carto_auth.auth import CartoAuth, CredentialsError
from .carto_auth.layer_validator import is_valid_carto_layer
from .styles import color_bins, color_categories, color_continuous
from .error import notify_error

__all__ = [
    "__version__",
    "register_carto_layer",
    "CartoAuth",
    "CredentialsError",
    "is_valid_carto_layer",
    "color_bins",
    "color_categories",
    "color_continuous",
    "notify_error",
]
