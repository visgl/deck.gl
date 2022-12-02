import { defineConfig } from 'vite';
import fs from 'fs';

const ROOTDIR = `${__dirname}/../../../..`;

/** Run against local source */
const getAliases = async (frameworkName) => {
  const modules = await fs.promises.readdir(`${ROOTDIR}/modules`)
  return modules.reduce<Record<string, string>>((aliases, module) => {
    aliases[`${frameworkName}/${module}`] = `${ROOTDIR}/modules/${module}/src`;
    return aliases;
  }, {});
}

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  resolve: {alias: await getAliases('@deck.gl')},
  server: {open: true}
}));
