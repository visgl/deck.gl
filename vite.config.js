import {defineConfig, mergeConfig} from 'vite';
import baseConfig from './node_modules/@vis.gl/dev-tools/dist/configuration/vite.config.js';
import jsonImportConfig from './vite.config.mjs';

function resolveConfig(config, env) {
  return typeof config === 'function' ? config(env) : config;
}

export default defineConfig(async env =>
  mergeConfig(
    await resolveConfig(baseConfig, env),
    await resolveConfig(jsonImportConfig, env)
  )
);
