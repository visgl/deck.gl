import {defineConfig} from 'vite';

const deckAliases = {
  '@deck.gl/core': `${__dirname}/../../../modules/core/src`,
  '@deck.gl/layers': `${__dirname}/../../../modules/layers/src`
};

export default defineConfig({
  plugins: [
    {
      name: 'luma-beta-shader-assembler-compatibility',
      enforce: 'pre',
      transform(code, id) {
        if (id.endsWith('/modules/core/src/shaderlib/index.ts')) {
          return code.replace(
            'ShaderAssembler.getDefaultShaderAssembler()',
            'ShaderAssembler.getDefaultShaderAssembler(language)'
          );
        }
        return null;
      }
    }
  ],
  resolve: {
    alias: deckAliases,
    dedupe: [
      '@luma.gl/core',
      '@luma.gl/engine',
      '@luma.gl/gpgpu',
      '@luma.gl/shadertools',
      '@luma.gl/webgl',
      '@luma.gl/webgpu'
    ]
  },
  optimizeDeps: {
    exclude: Object.keys(deckAliases)
  },
  server: {open: true}
});
