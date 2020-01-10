import numpy as np

# from .type_checking import is_numpy_array

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


array_seralization = dict(to_json=array_to_binary, from_json=None)
