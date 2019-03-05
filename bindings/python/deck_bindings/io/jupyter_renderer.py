from IPython.utils import capture


try:
    Out = Out  # noqa
except NameError:
    raise Exception("No history variable detected. Are you executing this code in a Jupyter notebook?")


def get_max_cell():
    """Get the last cell executed in a Jupyter notebook"""
    return max(Out.keys())



def store_and_print(exec_func):
    """Stores a 
    with capture.capture_output() as cap:
        def wrapper_func(*args, **kwargs):
            exec_func(*args, **kwargs)
        if cap.stdout:
            print(cap.stdout)
        if cap.stderr:
            print(cap.stderr)
    history = get_or_instantiate_history()
    history.merge({
        'cell_index': get_max_cell() + 1,
        'output': cap.stdout})
    cap.stdout


def embed_in_cell(json):
    pass
