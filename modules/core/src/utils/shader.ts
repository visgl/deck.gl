// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import log from './log';

type LegacyInjection = string | {injection: string; order?: number};
type LegacyInjections = Record<string, LegacyInjection>;

const INJECTION_KEY = /^(vs|fs):(#(?:decl|main-start|main-end)|[A-Za-z_][A-Za-z0-9_]*)$/;
// Messages already logged. Each deprecation message is logged one time.
const warnedMessages = new Set<string>();

function warnOnce(message: string): void {
  if (!warnedMessages.has(message)) {
    warnedMessages.add(message);
    log.warn(message)();
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

    // Hack: prject32 and project64 cannot co-exist
    if (source.modules.some(module => module.name === 'project64')) {
      const index = result.modules.findIndex(module => module.name === 'project32');
      if (index >= 0) {
        result.modules.splice(index, 1);
      }
    }
  }
  if ('plugins' in source) {
    result.plugins = [...new Set([...(target.plugins || []), ...(source.plugins || [])])];
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

/**
 * luma.gl v10 assembles injections from ShaderPlugins only. A v9-style `inject` field on a
 * shader descriptor or on a shader module has no effect there. Convert each one to a
 * GLSL plugin and warn, so that an application sees the necessary migration.
 */
export function convertLegacyInjections(shaders) {
  const plugins: object[] = [];
  const visited = new Set<object>();
  const addModules = modules => {
    for (const module of modules || []) {
      if (!module || visited.has(module)) continue;
      visited.add(module);
      addModules(module.dependencies);
      if (module.inject) {
        const plugin = getLegacyPlugin(
          module.inject,
          `shader module "${module.name}"`,
          module.name
        );
        if (plugin) plugins.push(plugin);
      }
    }
  };
  addModules(shaders.modules);
  if (shaders.inject) {
    const plugin = getLegacyPlugin(shaders.inject, 'getShaders()', 'layer');
    if (plugin) plugins.push(plugin);
  }
  if (!plugins.length && !('inject' in shaders)) {
    return shaders;
  }
  const {inject, ...result} = shaders;
  return plugins.length ? mergeShaders(result, {plugins}) : result;
}

function getLegacyPlugin(inject: LegacyInjections, owner: string, name: string): object | null {
  warnOnce(
    `${owner}: "inject" is deprecated. Move the injections to a ShaderPlugin and pass it in "plugins"`
  );
  // Read the current contents on each call. An application can change an `inject` object
  // between two shader builds.
  const injections: object[] = [];
  for (const key in inject) {
    const match = INJECTION_KEY.exec(key);
    if (!match) {
      warnOnce(`${owner}: injection "${key}" is not a named target and is ignored`);
      continue;
    }
    const value = inject[key];
    const {injection, order = 0} = typeof value === 'string' ? {injection: value} : value;
    injections.push({
      stage: match[1] === 'vs' ? 'vertex' : 'fragment',
      target: match[2],
      glsl: injection,
      order
    });
  }
  return injections.length ? {name: `${name}-inject`, injections} : null;
}
