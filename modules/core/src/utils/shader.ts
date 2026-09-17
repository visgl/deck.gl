// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

declare module '@luma.gl/shadertools' {
  interface ShaderModule {
    /**
     * Names of modules that cannot co-exist with this module.
     * When multiple mutually exclusive modules are present, the one appearing
     * later in the merge order takes precedence.
     */
    excludes?: string[];
  }
}

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

    // Apply module exclusions: when modules are mutually exclusive,
    // the one appearing later in the merge order takes precedence
    const lastIndexMap = new Map<string, number>();
    for (let i = 0; i < result.modules.length; i++) {
      lastIndexMap.set(result.modules[i].name, i);
    }

    const namesToExclude = new Set<string>();
    for (let i = result.modules.length - 1; i >= 0; i--) {
      const module = result.modules[i];
      if (module.excludes) {
        for (const excludedName of module.excludes) {
          const excludedLastIndex = lastIndexMap.get(excludedName);
          if (excludedLastIndex !== undefined && excludedLastIndex < i) {
            namesToExclude.add(excludedName);
          }
        }
      }
    }

    result.modules = result.modules.filter(module => !namesToExclude.has(module.name));
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
