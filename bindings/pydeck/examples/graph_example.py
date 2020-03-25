"""Making network graphs in pydeck"""
import pydeck

import pandas as pd


EDGES_URL = "https://raw.githubusercontent.com/ajduberstein/geo_datasets/master/social_edges.csv"
NODES_URL = "https://raw.githubusercontent.com/ajduberstein/geo_datasets/master/social_nodes.csv"


def generate_graph_data(num_nodes, random_seed):
    """Generates a graph of 10k nodes with a 3D force layout

    This function is unused and merely serves as an example of how the data in
    this visualization was generated
    """
    import networkx as nx  # noqa

    g = nx.random_internet_as_graph(num_nodes, random_seed)
    node_positions = nx.fruchterman_reingold_layout(g, dim=3)
    edge_df = pd.DataFrame(list(g.edges.data(False)))
    edge_df.columns = ["u", "v"]

    force_layout_df = pd.DataFrame.from_records(node_positions).transpose()
    force_layout_df["group"] = [d[1]["type"] for d in g.nodes.data()]
    force_layout_df.columns = ["x", "y", "z", "group"]
    return force_layout_df, edge_df


def make_renderer(nodes, edges, use_binary_transport=False):
    """Creates the pydeck visualization for rendering"""
    view_state = pydeck.ViewState(
        offset=[0, 0], latitude=None, longitude=None, bearing=None, pitch=None, zoom=1,
    )

    views = [pydeck.View(type="OrbitView", controller=True)]

    nodes_layer = pydeck.Layer(
        "PointCloudLayer",
        nodes,
        get_position="position",
        get_normal=[10, 100, 10],
        get_color="color",
        pickable=True,
        use_binary_transport=use_binary_transport,
        auto_highlight=True,
        highlight_color=[255, 255, 0],
        radius=50
    )

    edges_layer = pydeck.Layer(
        "PathLayer",
        edges,
        get_path="path",
        get_width=1,
        rounded=True,
        use_binary_transport=use_binary_transport,
        width_units='"pixels"',
        width_max_pixels=2,
        get_color=[40, 40, 40, 110],
    )

    r = pydeck.Deck(
        layers=[nodes_layer, edges_layer],
        initial_view_state=view_state,
        views=views,
        map_style=None,
    )
    return r


def get_path(datum, nodes):
    """Converts source/origin identifiers to coordinates"""
    u = nodes.iloc[[datum["u"]]]
    v = nodes.iloc[[datum["v"]]]
    path = [[float(u.x), float(u.y), float(u.z)], [float(v.x), float(v.y), float(v.z)]]
    return path


r = None

def generate_vis(notebook_display=False):
    global r
    edges = pd.read_csv(EDGES_URL)
    nodes = pd.read_csv(NODES_URL)

    colors = pydeck.data_utils.assign_random_colors(nodes["group"])
    nodes["color"] = nodes.apply(lambda row: [c / 255 for c in colors.get(row["group"])], axis=1)
    nodes["position"] = nodes.apply(lambda row: [row['x'], row['y'], row['z']], axis=1)

    edges["path"] = edges.apply(lambda d: get_path(d, nodes), axis=1)

    del nodes["x"]
    del nodes["y"]
    del nodes["z"]
    del nodes["group"]
    del edges["u"]
    del edges["v"]

    if not notebook_display:
        r = make_renderer(nodes, edges, use_binary_transport=False)
        r.to_html("graph_example.html", notebook_display=notebook_display)
    else:
        display(edges)  # noqa
        r = make_renderer(nodes, edges, use_binary_transport=True)
        display(r.show())  # noqa


if __name__ == "__main__":
    generate_vis()
