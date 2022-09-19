import pydeck as pdk


def get_error_notifier():
    """Helper function to get the layer error notifier callback."""
    return pdk.types.Function("notifyError")
