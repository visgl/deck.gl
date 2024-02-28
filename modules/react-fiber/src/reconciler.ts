import {log} from '@deck.gl/core';
import {default as Reconciler} from 'react-reconciler';
import {DefaultEventPriority} from 'react-reconciler/constants';
import {catalogue} from './extend';
import {isFn, now} from './utils';
import type {Store} from './store';
import type {Instance} from './types';
import type {LayersList} from '@deck.gl/core';

const noop = () => {};

function handleTextInstance() {
  console.warn(
    'Text is not allowed in the DeckGL tree! This could be stray whitespace or characters.'
  );
}

function falseReturn() {
  return false;
}

function nullReturn() {
  return null;
}

const layerCache: Instance[] = [];

// TODO: tree structure for views and layers to auto filter
const viewCache = new Map<string, any>();
const filterCache = new Map<string, string[]>();

function toPascal(str: string) {
  return `${str[0].toUpperCase()}${str.slice(1)}`;
}

function isView(instance: Instance) {
  return instance && 'viewportInstance' in instance;
}

export type InstanceProps = {
  [key: string]: unknown;
};

function appendChild(parent: Instance, child: Instance) {
  log.info('appendChild');
  log.info('appendChild :: parent: %O', parent);
  log.info('appendChild :: child: %O', child);
  log.info('\n');

  // NOTE: on occasion we saw child coming in as null
  if (child && !isView(child)) {
    let viewId = isView(parent) ? parent.id : parent.__deckglfiber?.view;

    // If a layer is not a descendent of a View then we won't have a viewId.
    // We treat these orphans as belonging to the main View.
    if (!viewId) {
      // No declarative Views means no orphans :)
      if (viewCache.size > 0) {
        console.warn(
          `Layer: ${child.id} is not a child of a View. This will have unintended side effects.`
        );
      }

      const state = child.__deckglfiber.root.getState();
      const views = state.deckgl.getViews();

      viewId = views[0].id;
    }

    filterCache.set(viewId, [...(filterCache.get(viewId) ?? []), child.id]);
    child.__deckglfiber.view = viewId;

    layerCache.push(child);
  }
}

// TODO: logic for View components
function removeChild(parent: Instance, child: Instance) {
  log.info('removeChild');
  log.info('removeChild :: parent: %O', parent);
  log.info('removeChild :: child: %O', child);
  log.info('\n');

  // NOTE: on occasion we saw child coming in as null
  if (child) {
    const currentIndex = layerCache.findIndex(v => v.id === child.id);

    layerCache.splice(currentIndex, 1);
  }
}

// TODO: logic for View components
function insertBefore(parent: Instance, child: Instance, beforeChild: Instance) {
  log.info('insertBefore');
  log.info('insertBefore :: parent: %O', parent);
  log.info('insertBefore :: child: %O', child);
  log.info('insertBefore :: beforeChild: %O', beforeChild);
  log.info('\n');

  // NOTE: on occasion we saw child coming in as null
  if (child) {
    const beforeIndex = layerCache.findIndex(v => v.id === beforeChild.id);

    // TODO: double check this splice does what we think it does
    layerCache.splice(beforeIndex, 0, child);
  }
}

type HostConfig = {
  type: string;
  props: InstanceProps;
  container: Store;
  instance: Instance;
  textInstance: void;
  suspenseInstance: Instance;
  hydratableInstance: Instance;
  publicInstance: Instance;
  hostContext: never;
  updatePayload: boolean;
  childSet: never;
  timeoutHandle: number | undefined;
  noTimeout: -1;
};

export const reconciler = Reconciler<
  HostConfig['type'],
  HostConfig['props'],
  HostConfig['container'],
  HostConfig['instance'],
  HostConfig['textInstance'],
  HostConfig['suspenseInstance'],
  HostConfig['hydratableInstance'],
  HostConfig['publicInstance'],
  HostConfig['hostContext'],
  HostConfig['updatePayload'],
  HostConfig['childSet'],
  HostConfig['timeoutHandle'],
  HostConfig['noTimeout']
>({
  // NOTE: this is fired during a hot reload
  createInstance(type, props, root) {
    log.info('createInstance');
    log.info('createInstance :: type: %s', type);
    log.info('createInstance :: props: %O', props);
    log.info('\n');

    const name = toPascal(type);

    if (!catalogue[name]) {
      throw new Error(`Unsupported element type: ${type}`);
    }

    const instance: Instance = new catalogue[name](props);

    if (isView(instance)) {
      viewCache.set(instance.id, instance);
      filterCache.set(instance.id, []);

      const state = root.getState();

      // Set view immediately so we can use during layer appends
      state.deckgl.setProps({
        views: Array.from(viewCache.values())
      });
    } else {
      // NOTE: View classes cannot be extended and or have properties added to it
      instance.__deckglfiber = {
        root,
        view: undefined
      };
    }

    return instance;
  },

  appendChild,

  appendInitialChild: appendChild,

  // @ts-expect-error "parent" type doesn't matter
  appendChildToContainer: appendChild,

  removeChild,

  // @ts-expect-error "parent" type doesn't matter
  removeChildFromContainer: removeChild,

  insertBefore,

  // @ts-expect-error "parent" type doesn't matter
  insertInContainerBefore: insertBefore,

  finalizeInitialChildren: falseReturn,

  // TODO: we could look at cleaning up deckgl here with the caveat that
  // deck.finalize() is already called in the React component cleanup.
  clearContainer: falseReturn,

  // NOTE: may need to attach handlers here
  commitMount: noop,

  // NOTE: this fires per instance, since deckgl cannot update individual layers
  // atomically we skip doing any work in this function
  commitUpdate: noop,

  // NOTE: since deck.gl already does extensive diffing, we just need to construct
  // a new object to replace the prior. "prepareUpdate" appears to fire twice in strict mode.
  prepareUpdate(oldInstance, type, oldProps, newProps) {
    log.info('prepareUpdate');
    log.info('createInstance :: oldInstance: %O', oldInstance);
    log.info('createInstance :: type: %s', type);
    log.info('createInstance :: oldProps: %O', oldProps);
    log.info('createInstance :: newProps: %O', newProps);
    log.info('\n');

    const name = toPascal(type);
    const instance: Instance = new catalogue[name](newProps);
    const currentIndex = layerCache.findIndex(v => v.id === instance.id);

    layerCache[currentIndex] = instance;

    return true;
  },

  prepareForCommit: nullReturn,

  resetAfterCommit(container: Store) {
    log.info('resetAfterCommit');

    const state = container.getState();

    /**
     * TODO: implicit view/layer filter logic
     * const existingLayerFilter = state.deckgl.props.layerFilter;
     * const hasDeclarativeViews = viewCache.size > 0;
     */

    state.deckgl.setProps({
      // TODO: investigate why we need to spread the array here for deckgl to pick up layer changes
      layers: [...layerCache] as unknown as LayersList
    });

    log.info('resetAfterCommit :: layers: %O', layerCache);
    log.info('\n');
  },

  getRootHostContext: nullReturn,

  getChildHostContext(parentHostContext) {
    return parentHostContext;
  },

  // @ts-expect-error react typing is goofy
  getPublicInstance(instance) {
    return instance;
  },

  scheduleTimeout: (isFn(setTimeout) ? setTimeout : undefined) as any,

  cancelTimeout: (isFn(clearTimeout) ? clearTimeout : undefined) as any,

  // TODO
  hideInstance: noop,

  // TODO
  unhideInstance: noop,

  // TODO: look at if we need to tie into different priorities
  getCurrentEventPriority() {
    return DefaultEventPriority;
  },

  preparePortalMount: noop,

  shouldSetTextContent: falseReturn,

  resetTextContent: handleTextInstance,

  createTextInstance: handleTextInstance,

  commitTextUpdate: handleTextInstance,

  hideTextInstance: handleTextInstance,

  unhideTextInstance: handleTextInstance,

  beforeActiveInstanceBlur: noop,

  afterActiveInstanceBlur: noop,

  detachDeletedInstance: noop,

  now,

  supportsMutation: true,

  isPrimaryRenderer: false,

  supportsPersistence: false,

  supportsHydration: false,

  noTimeout: -1
});
