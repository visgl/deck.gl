"""
Binary Transport
================

Example of binary transport in pydeck. This notebook renders 10k points via the web sockets within
a Jupyter notebook if you run with ``generate_vis(notebook_display=True)``

Since binary transfer relies on Jupyter's kernel communication,
note that the .html in the pydeck documentation does not use binary transfer
and is just for illustration.
"""
import pydeck as pdk

import pandas as pd


NODES_URL = "https://raw.githubusercontent.com/ajduberstein/geo_datasets/master/social_nodes.csv"


def generate_graph_data(num_nodes, random_seed):
    """Generates a graph of 10k nodes with a 3D force layout

    This function is unused but serves as an example of how the data in
    this visualization was generated
    """
    import networkx as nx  # noqa

    g = nx.random_internet_as_graph(num_nodes, random_seed)
    node_positions = nx.fruchterman_reingold_layout(g, dim=3)

    force_layout_df = pd.DataFrame.from_records(node_positions).transpose()
    force_layout_df["group"] = [d[1]["type"] for d in g.nodes.data()]
    force_layout_df.columns = ["x", "y", "z", "group"]
    return force_layout_df


def make_renderer(nodes: pd.DataFrame, use_binary_transport: bool = False) -> pdk.Deck:
    """Creates the pydeck visualization for rendering"""
    view_state = pdk.ViewState(
        offset=[0, 0],
        target=[0, 0, 0],
        latitude=None,
        longitude=None,
        bearing=None,
        pitch=None,
        zoom=10,
    )

    views = [pdk.View(type="OrbitView", controller=True)]

    nodes_layer = pdk.Layer(
        "PointCloudLayer",
        nodes,
        get_position="position",
        get_normal=[10, 100, 10],
        get_color="color",
        pickable=True,
        # Set use_binary_transport to `True`
        use_binary_transport=use_binary_transport,
        auto_highlight=True,
        highlight_color=[255, 255, 0],
        radius=50,
    )

    return pdk.Deck(layers=[nodes_layer], initial_view_state=view_state, views=views, map_provider=None)


r = None


def generate_vis(notebook_display: bool = False):
    global r
    nodes = pd.read_csv(NODES_URL)

    colors = pdk.data_utils.assign_random_colors(nodes["group"])
    # Divide by 255 to normalize the colors
    # Specify positions and colors as columns of lists
    nodes["color"] = nodes.apply(
        lambda row: [c / 255 if notebook_display else c for c in colors.get(row["group"])], axis=1
    )
    nodes["position"] = nodes.apply(lambda row: [row["x"], row["y"], row["z"]], axis=1)

    # Remove all unused columns
    del nodes["x"]
    del nodes["y"]
    del nodes["z"]
    del nodes["group"]

    if not notebook_display:
        r = make_renderer(nodes, use_binary_transport=False)
        r.to_html("binary_transport.html", css_background_color="charcoal", notebook_display=notebook_display)
    else:
        r = make_renderer(nodes, use_binary_transport=True)
        display(r.show())  # noqa


if __name__ == "__main__":
    generate_vis()
