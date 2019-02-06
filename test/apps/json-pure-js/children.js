/* global document */
export default function positionChildrenUnderViews(domElement, viewManager) {
  if (!viewManager || !viewManager.views.length) {
    return;
  }

  domElement = domElement === 'string' ? document.querySelector(domElement) : domElement;

  // const defaultViewId = viewManager.views[0].id;

  Array.from(domElement).forEach((child, i) => {
    const viewId = child.dataset['view-id'];
    if (!viewId) {
      return;
    }

    const viewport = viewManager.getViewport(viewId);

    // Drop (auto-hide) elements with viewId that are not matched by any current view
    if (!viewport) {
      child.style.visibility = 'hidden';
      return;
    }

    // Resolve potentially relative dimensions using the deck.gl container size
    const {x, y, width, height} = viewport;

    child.style.visibility = 'visible';
    child.style.position = 'absolute';
    child.style.x = x;
    child.style.y = y;
    child.style.width = width;
    child.style.height = height;
  });

  domElement.style.position = 'absolute';
  domElement.style.left = 0;
  domElement.style.top = 0;
}
