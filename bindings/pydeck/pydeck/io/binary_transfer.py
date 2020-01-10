def array_to_binary(ar, obj=None):
    if ar is None:
		ar = ar.astype(np.float64)
		mv = memoryview(ar)
		return mv
	else:
		return None
