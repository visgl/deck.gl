import esbuild from 'esbuild';
import getConfig from './bundle.config.mjs';

// Parse command line arguments
const entryPoint = process.argv[2];
const env = {};

for (let i = 3; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (arg.startsWith('--')) {
    const tokens = arg.slice(2).split('=');
    env[tokens[0]] = tokens[1] || true;
  }
}

const buildConfig = getConfig({
  input: entryPoint,
  ...env
});

esbuild.build(buildConfig);
