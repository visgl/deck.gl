// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Merge two luma.gl shader descriptors
export function mergeShaders(target, source) {
  if (!source) {
    return target;
  }
  const result = {...target, ...source};

  if ('defines' in source) {
    result.defines = {...target.defines, ...source.defines};
  }
  if ('modules' in source) {
    result.modules = (target.modules || []).concat(source.modules);

    // Hack: prject32 and project64 cannot co-exist
    if (source.modules.some(module => module.name === 'project64')) {
      const index = result.modules.findIndex(module => module.name === 'project32');
      if (index >= 0) {
        result.modules.splice(index, 1);
      }
    }
  }
  if ('inject' in source) {
    if (!target.inject) {
      result.inject = source.inject;
    } else {
      const mergedInjection = {...target.inject};
      for (const key in source.inject) {
        mergedInjection[key] = (mergedInjection[key] || '') + source.inject[key];
      }
      result.inject = mergedInjection;
    }
  }
  return result;
}
