import fs from 'node:fs/promises';
import {extname} from 'node:path';
import {defineConfig} from 'vite';

const JSON_IMPORT_ATTRIBUTES_RE = /\s+with\s+\{\s*type:\s*['"]json['"]\s*\}/g;

function stripJsonImportAttributes(code) {
  return code.replace(JSON_IMPORT_ATTRIBUTES_RE, '');
}

function getEsbuildLoader(filePath) {
  switch (extname(filePath)) {
    case '.ts':
      return 'ts';
    case '.tsx':
      return 'tsx';
    case '.jsx':
      return 'jsx';
    case '.mjs':
    case '.cjs':
    case '.js':
    default:
      return 'js';
  }
}

const stripJsonImportAttributesPlugin = {
  name: 'strip-json-import-attributes',
  enforce: 'pre',
  transform(code, id) {
    if (!/\.[cm]?[jt]sx?$/.test(id) || !code.includes('with')) {
      return null;
    }

    return {
      code: stripJsonImportAttributes(code),
      map: null
    };
  }
};

const stripJsonImportAttributesEsbuildPlugin = {
  name: 'strip-json-import-attributes',
  setup(build) {
    build.onLoad({filter: /\.[cm]?[jt]sx?$/}, async args => {
      const code = await fs.readFile(args.path, 'utf8');
      if (!code.includes('with')) {
        return null;
      }

      return {
        contents: stripJsonImportAttributes(code),
        loader: getEsbuildLoader(args.path)
      };
    });
  }
};

export default defineConfig({
  plugins: [stripJsonImportAttributesPlugin],
  optimizeDeps: {
    esbuildOptions: {
      plugins: [stripJsonImportAttributesEsbuildPlugin]
    }
  }
});
