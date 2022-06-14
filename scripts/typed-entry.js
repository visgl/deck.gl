/**
 * This script enables a temporary, opt-in only entry point in each module while TypeScript is being developed.
 */

const fs = require('fs');
const path = require('path');

const MODULES_DIR = path.resolve(__dirname, '../modules');
const IMPORT_PATTERN = /\bfrom ('|")(@deck.gl\/[\w\-]+)('|")/g;

for (const moduleName of fs.readdirSync(MODULES_DIR)) {
  if (!isDirectory(`${MODULES_DIR}/${moduleName}`)) {
    continue;
  }

  const distDir = `${MODULES_DIR}/${moduleName}/typed`;
  if (isDirectory(distDir)) {
    // Create package.json
    const entryPoint = {
      internal: true,
      main: "../dist/es5/index.js",
      module: "../dist/esm/index.js",
      types: "index.d.ts"
    };

    fs.writeFileSync(`${distDir}/package.json`, JSON.stringify(entryPoint, null, 2), 'utf8');

    // Update all internal imports
    const stats = updateImports(distDir);
    console.log(`${stats.fileCount} files updated in module ${moduleName}`)

  } else {
    console.log(`No types found for module ${moduleName}`);
  }
}

function isDirectory(path) {
  try {
    const stats = fs.lstatSync(path);
    return stats.isDirectory();
  } catch {
    // Does not exist
    return false;
  }
}

// Replace all internal imports (@deck.gl/*) with '@deck.gl/*/typed'
function updateImports(path, stats = {fileCount: 0}) {
  for (const item of fs.readdirSync(path)) {
    const subPath = `${path}/${item}`;
    if (item.endsWith('.d.ts')) {
      // find imports
      let fileContent = fs.readFileSync(subPath, 'utf8');
      if (IMPORT_PATTERN.test(fileContent)) {
        fileContent = fileContent.replace(IMPORT_PATTERN, (_, $1, $2) => `from '${$2}/typed'`);
        stats.fileCount++;
        fs.writeFileSync(subPath, fileContent, 'utf8');
      }
    } else if (isDirectory(subPath)) {
      updateImports(subPath, stats);
    }
  }
  return stats;
}
