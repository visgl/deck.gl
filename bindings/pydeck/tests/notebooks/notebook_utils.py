import subprocess
import os


def nbconvert(notebook_path):
    if not os.path.exists(os.path.exists(notebook_path)):
        raise Exception("Invalid path %s" % notebook_path)
    CMD = (
        "jupyter nbconvert --to=html --ExecutePreprocessor.timeout=600 "
        "--ExecutePreprocessor.kernel_name='python3' "
        "--ExecutePreprocessor.store_widget_state=True "
        "--execute '{}'"
    )
    cmd = CMD.format(notebook_path)
    status = subprocess.check_call(cmd, shell=True)
    return status == 0
