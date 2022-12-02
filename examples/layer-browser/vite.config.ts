import { defineConfig } from 'vite';
import fs from 'fs';

/** Run against local source */
const getAliases = async (frameworkName, frameworkRootDir) => {
  const modules = await fs.promises.readdir(`${frameworkRootDir}/modules`)
  return modules.reduce<Record<string, string>>((aliases, module) => {
    aliases[`${frameworkName}/${module}`] = `${frameworkRootDir}/modules/${module}/src`;
    return aliases;
  }, {});
}

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  resolve: {alias: await getAliases('@deck.gl', `${__dirname}/../..`)},
  server: {open: true},
  optimizeDeps: {esbuildOptions: {target: 'es2020'}},
  build: {target: 'es2020'}
}));
