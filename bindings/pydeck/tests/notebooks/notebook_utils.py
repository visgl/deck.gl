import subprocess
import os


def nbconvert(notebook_path):
    if not os.path.exists(os.path.exists(notebook_path)):
        raise Exception('Invalid path %s' % notebook_path)
    CMD = 'jupyter nbconvert --to=html --execute {}'.format(notebook_path)
    status = subprocess.Popen(CMD, shell=True, check=True)
    if status != 0:
        raise Exception('Non-zero exit status during nbconvert for %s' % notebook_path)
    return True
