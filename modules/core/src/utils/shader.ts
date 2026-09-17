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

    // Apply module exclusions: when modules conflict (either declares excludes),
    // the one appearing later in the merge order takes precedence.
    // Process from end to beginning so later modules are evaluated first,
    // and only surviving modules' exclusions are honored.
    const toKeep = new Set(result.modules.map((_, moduleIndex) => moduleIndex));

    for (let currentIndex = result.modules.length - 1; currentIndex >= 0; currentIndex--) {
      if (!toKeep.has(currentIndex)) continue; // This module was already excluded

      const module = result.modules[currentIndex];
      if (module.excludes) {
        for (const excludedName of module.excludes) {
          // Find all occurrences of the excluded module
          for (let otherIndex = 0; otherIndex < result.modules.length; otherIndex++) {
            if (otherIndex !== currentIndex && toKeep.has(otherIndex) && result.modules[otherIndex].name === excludedName) {
              // Conflict found: keep the later one
              if (currentIndex > otherIndex) {
                toKeep.delete(otherIndex); // Remove the excluded module (earlier)
              } else {
                toKeep.delete(currentIndex); // Remove this module (earlier)
                break; // Exit exclusion loop - this module is gone
              }
            }
          }
          // If this module was removed, stop processing its remaining exclusions
          if (!toKeep.has(currentIndex)) break;
        }
      }
    }

    result.modules = result.modules.filter((_, moduleIndex) => toKeep.has(moduleIndex));
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
