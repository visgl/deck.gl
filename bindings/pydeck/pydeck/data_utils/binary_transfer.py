import numpy as np

# Grafted from
# https://github.com/maartenbreddels/ipyvolume/blob/d13828dfd8b57739004d5daf7a1d93ad0839ed0f/ipyvolume/serialize.py#L219
def array_to_binary(ar, obj=None, force_contiguous=True):
    if ar is None:
        return None
    if ar.dtype.kind not in ["u", "i", "f"]:  # ints and floats
        raise ValueError("unsupported dtype: %s" % (ar.dtype))
    # WebGL does not support float64, case it here
    if ar.dtype == np.float64:
        ar = ar.astype(np.float32)
    # JS does not support int64
    if ar.dtype == np.int64:
        ar = ar.astype(np.int32)
    # make sure it's contiguous
    if force_contiguous and not ar.flags["C_CONTIGUOUS"]:
        ar = np.ascontiguousarray(ar)
    return {"data": memoryview(ar), "dtype": str(ar.dtype), "shape": ar.shape}


def serialize_columns(data_set_cols, obj=None):
    if data_set_cols is None:
        return None
    payload = {'payload': []}
    for col in data_set_cols:
        bin_data = array_to_binary(col["np_data"])
        payload['payload'].append({
            "layer_id": col["layer_id"],
            "column_name": col["column_name"],
            "accessor": col["accessor"],
            "matrix": bin_data,
        })
    return payload


data_buffer_serialization = dict(
    to_json=serialize_columns, from_json=None
)
