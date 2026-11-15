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
    // Convert the named targets of each descriptor to a plugin before the merge. A merge of two
    // `inject` maps cannot keep an `{injection, order}` entry and the order of the descriptors.
    const {plugin, rest} = splitLegacyInjections(source.inject, 'getShaders()', 'layer');
    if (plugin) {
      result.plugins = [...(result.plugins || []), plugin];
    }
    // luma.gl assembles the other keys (regular expressions) from the `inject` option
    const inject = {...target.inject};
    for (const key in rest) {
      const previous = inject[key];
      const next = rest[key];
      inject[key] =
        typeof previous === 'string' && typeof next === 'string' ? previous + next : next;
    }
    if (Object.keys(inject).length) {
      result.inject = inject;
    } else {
      delete result.inject;
    }
  }
  return result;
}

/**
 * luma.gl v10 assembles the injections of a shader module only from ShaderPlugins. A v9-style
 * `inject` field on a shader module has no effect there. Convert it to a GLSL plugin and warn,
 * so that an application sees the necessary migration.
 * Also convert the named targets of an `inject` field on the shader descriptor.
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
        const owner = `shader module "${module.name}"`;
        const {plugin, rest} = splitLegacyInjections(module.inject, owner, module.name);
        if (plugin) plugins.push(plugin);
        for (const key in rest) {
          warnOnce(`${owner}: injection "${key}" is not a named target and is ignored`);
        }
      }
    }
  };
  addModules(shaders.modules);
  if (!plugins.length && !('inject' in shaders)) {
    return shaders;
  }
  // mergeShaders converts the `inject` field of the descriptor
  const {inject, ...result} = shaders;
  return mergeShaders(result, {plugins, ...(inject && {inject})});
}

/**
 * Split a v9-style `inject` map into a GLSL plugin for the named targets and the other entries.
 */
function splitLegacyInjections(
  inject: LegacyInjections,
  owner: string,
  name: string
): {plugin: object | null; rest: LegacyInjections} {
  const rest: LegacyInjections = {};
  if (!inject) {
    return {plugin: null, rest};
  }
  warnOnce(
    `${owner}: "inject" is deprecated. Move the injections to a ShaderPlugin and pass it in "plugins"`
  );
  // Read the current contents on each call. An application can change an `inject` object
  // between two shader builds.
  const injections: object[] = [];
  for (const key in inject) {
    const match = INJECTION_KEY.exec(key);
    const value = inject[key];
    if (!match) {
      rest[key] = value;
      continue;
    }
    const {injection, order = 0} = typeof value === 'string' ? {injection: value} : value;
    injections.push({
      stage: match[1] === 'vs' ? 'vertex' : 'fragment',
      target: match[2],
      glsl: injection,
      order
    });
  }
  return {plugin: injections.length ? {name: `${name}-inject`, injections} : null, rest};
}
