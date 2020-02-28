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


def make_renderer(nodes, edges):
    """Creates the pydeck visualization for rendering"""
    view_state = pydeck.ViewState(
        offset=[0, 0], latitude=None, longitude=None, bearing=None, pitch=None, zoom=1,
    )

    views = [pydeck.View(type="OrbitView", controller=True)]

    nodes_layer = pydeck.Layer(
        "PointCloudLayer",
        nodes,
        get_position=["x", "y", "z"],
        get_normal=[10, 100, 10],
        get_color="color",
        pickable=True,
        auto_highlight=True,
        highlight_color=[255, 255, 0],
        radius=5
    )

    edges_layer = pydeck.Layer(
        "PathLayer",
        edges,
        get_path="path",
        get_width=1,
        rounded=True,
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


def generate_vis(notebook_display=False):
    edges = pd.read_csv(EDGES_URL).head(2000)
    nodes = pd.read_csv(NODES_URL)

    edges["path"] = edges.apply(lambda d: get_path(d, nodes), axis=1)

    colors = pydeck.data_utils.assign_random_colors(nodes["group"])
    nodes["color"] = nodes.apply(lambda row: colors.get(row["group"]), axis=1)
    r = make_renderer(nodes, edges)
    if not notebook_display:
        r.to_html("graph_example.html", notebook_display=notebook_display)
    else:
        r.layers[0].use_binary_transport = True
        r.layers[1].use_binary_transport = True
        r.show()


if __name__ == "__main__":
    generate_vis()
