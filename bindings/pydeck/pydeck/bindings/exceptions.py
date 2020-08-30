class IPythonEnvironmentException(Exception):
    MESSAGE = (
        '.show() cannot be called outside of an IPython-backed environment, like JupyterLab. '
        'Consider using .to_html(), https://pydeck.gl/deck.html?highlight=to_html#pydeck.bindings.deck.Deck.to_html'
    )

    def __init__(self):
        super().__init__(self.MESSAGE)


class WidgetNotEnabledException(Exception):
    MESSAGE = (
        'Jupyter widget is not enabled in this environment. '
        'For instructions, see https://pydeck.gl/installation.html#enabling-pydeck-for-jupyter '
        ' or use .to_html(), https://pydeck.gl/deck.html?highlight=to_html#pydeck.bindings.deck.Deck.to_html'
    )

    def __init__(self):
        super().__init__(self.MESSAGE)
