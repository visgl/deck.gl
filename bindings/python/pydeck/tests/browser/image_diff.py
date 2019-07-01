from PIL import Image


def diff_images(golden_file_path, new_file_path):
    """Calculates the percentage difference between two images"""
    im_1 = Image.open(golden_file_path)
    im_2 = Image.open(new_file_path)
    assert im_1.mode == im_2.mode, "Different kinds of images"
    assert im_1.size == im_2.size, "Different sizes"
    pairs = zip(im_1.getdata(), im_2.getdata())
    diff = sum(abs(c1 - c2) for p1, p2 in pairs for c1, c2 in zip(p1, p2))
    n_components = im_1.size[0] * im_2.size[1] * 3
    return (diff / 255.0 * 100) / n_components
