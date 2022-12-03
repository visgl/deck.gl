import { defineConfig } from 'vite';
import fs from 'fs';

const frameworkRootDir = `${__dirname}/../../..`;

/** Run against local source */
const getAliases = async (frameworkName) => {
  const modules = await fs.promises.readdir(`${frameworkRootDir}/modules`)
  return modules.reduce<Record<string, string>>((aliases, module) => {
    aliases[`${frameworkName}/${module}`] = `${frameworkRootDir}/modules/${module}/src`;
    return aliases;
  }, {});
}

/** https://vitejs.dev/config/ */
export default defineConfig(async () => ({
  resolve: {alias: await getAliases('@deck.gl',)},
  server: {open: true},
  optimizeDeps: {esbuildOptions: {target: 'es2020'}},
  build: {target: 'es2020'}
}));
