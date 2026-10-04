import re
import warnings
from urllib.parse import quote

from .frontend_semver import DECKGL_SEMVER

settings = None

# Packages bundled into the pydeck frontend, which ES modules loaded with ``register_library(npm=...)``
# import by name and share. Keep in sync with SHARED_MODULES in
# modules/jupyter-widget/src/playground/shared-modules.js; the CDN keeps their subpaths external too.
SHARED_PACKAGES = (
    "@deck.gl/core",
    "@deck.gl/layers",
    "@deck.gl/extensions",
    "@deck.gl/aggregation-layers",
    "@deck.gl/geo-layers",
    "@deck.gl/mesh-layers",
    "@deck.gl/widgets",
    "@luma.gl/core",
    "@luma.gl/engine",
    "@luma.gl/shadertools",
    "@luma.gl/webgl",
    "@loaders.gl/core",
    "@math.gl/core",
)

# deck.gl-community packages follow deck.gl's major and minor version
COMMUNITY_SCOPE = "@deck.gl-community/"
# The first major.minor in a version range, for example "9.4" in "~9.4.*" or "^9.4.1"
MAJOR_MINOR = re.compile(r"\D*(\d+\.\d+)")
DECKGL_MINOR = MAJOR_MINOR.match(DECKGL_SEMVER).group(1)


def _split_npm_spec(spec):
    """Splits ``"@scope/name@range"`` or ``"name@range"`` into the package name and the range (or None)"""
    at = spec.find("@", 1)
    if at == -1:
        return spec, None
    return spec[:at], spec[at + 1 :]


class Settings:
    """Global settings for pydeck

    Parameters
    ----------
    custom_libraries : list
        List of dictionaries of the format ``{'libraryName': 'LibraryName', 'resourceUri': 'deck.gl class URL'}``.
        For example, if there was a custom deck.gl Layer classed `TagmapLayer`
        bundled for distribution at the path `https://demourl.libpath/bundle.js`,
        one could load it into pydeck by doing the following:

        ```
        pydeck.settings.custom_libraries = [
            {
                'libraryName': 'tagmapLibrary',
                'resourceUri': 'https://demourl.libpath/bundle.js'
            }
        ]
        layer = pydeck.Layer(
            'TagmapLayer',  # Assumes that tagmapLibrary exports TagmapLayer
            # <... kwargs here ...>
        )
        ```

        A classic script bundle must assign ``window[libraryName]`` itself. To load an ES module instead,
        add ``'module': True`` to the entry: pydeck imports the module and exposes its namespace as
        ``window[libraryName]``. Either way, the library's uppercase-named exports become available as
        ``@@type`` values. See `Custom layers <custom_layers.html>`__.
    configuration : str
    default_layer_attributes : dict

    Attributes
    ----------
    esm_cdn : str, default ``"https://esm.sh"``
        CDN that ``register_library(npm=...)`` loads packages from. It must build npm packages as ES modules and
        support esm.sh's ``?external=`` parameter, for example a self-hosted esm.sh. Set it before registering.
    """

    def __init__(self, custom_libraries: list = None, configuration: str = None, default_layer_attributes: dict = None):
        assert not settings, "Cannot instantiate more than one Settings object"
        self.custom_libraries = custom_libraries or []
        self.configuration = configuration
        self.default_layer_attributes = default_layer_attributes
        self.esm_cdn = "https://esm.sh"

    def register_library(self, name=None, uri=None, module=False, npm=None):
        """Registers a JavaScript library to load into the pydeck frontend.

        Parameters
        ----------
        name : str, default None
            Global name under which the library is exposed (``window[name]``). Required with ``uri``. With
            ``npm``, defaults to the package name.
        uri : str, default None
            URL of the script bundle or ES module.
        module : bool, default False
            If ``True``, ``uri`` is loaded as an ES module and its exports are exposed as ``window[name]``.
            Otherwise ``uri`` must be a classic script that assigns ``window[name]`` itself.
        npm : str, default None
            Experimental. An npm package to load as an ES module from :attr:`esm_cdn` instead of ``uri``, with
            an optional version range, for example ``"@deck.gl-community/layers"`` or ``"my-layers@^1.2"``.
            The package uses pydeck's copies of deck.gl, luma.gl, loaders.gl and math.gl. A
            ``@deck.gl-community`` package without a version loads the release matching pydeck's deck.gl
            version. See `Custom layers <custom_layers.html>`__.
        """
        if (uri is None) == (npm is None):
            raise ValueError("register_library takes either uri or npm")
        if npm is not None:
            package, version = _split_npm_spec(npm)
            if package.startswith(COMMUNITY_SCOPE):
                if version is None:
                    version = f"~{DECKGL_MINOR}"
                else:
                    pinned = MAJOR_MINOR.match(version)
                    if pinned and pinned.group(1) != DECKGL_MINOR:
                        warnings.warn(
                            f"{package}@{version} targets deck.gl {pinned.group(1)}, "
                            f"but pydeck loads deck.gl {DECKGL_MINOR}",
                            stacklevel=2,
                        )
            spec = package if version is None else f"{package}@{version}"
            external = ",".join(SHARED_PACKAGES)
            uri = f"{self.esm_cdn.rstrip('/')}/{quote(spec, safe='@/~^.*')}?external={external}"
            name = name or package
            module = True
        elif name is None:
            raise ValueError("register_library needs a name with uri")
        entry = {"libraryName": name, "resourceUri": uri}
        if module:
            entry["module"] = True
        self.custom_libraries.append(entry)


if not settings:
    settings = Settings()
