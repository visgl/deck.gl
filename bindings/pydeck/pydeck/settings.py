settings = None


class Settings:
    """Global settings for pydeck

    custom_classes : list of dict
        List of dictionaries of the format {'ClassName': 'deck.gl class URL'}.
        For example, if there was a custom deck.gl Layer classed `TagmapLayer`
        bundled for distribution at the path `https://demourl.libpath/bundle.js`,
        one could load it into pydeck by doing the following:

        ```
        pydeck.settings.custom_classes = [{'TagmapLayer': 'https://demourl.libpath/bundle.js'}]
        layer = pydeck.Layer(
            'TagmapLayer',
            # <... kwargs here ...>
        )
        ```
    """

    def __init__(self, custom_classes=None):
        assert not settings, 'Cannot instantiate more than one Settings object'
        self.classes = custom_classes


if not settings:
    settings = Settings()
