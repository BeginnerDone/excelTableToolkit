import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { defineConfig, RollupOptions } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';

export default defineConfig([
  {
    input: 'src/index.ts',
    output: {
      dir: 'dist',
      format: 'es',
      sourcemap: true,
    },
    plugins: [
      vue({
        isProduction: true,
      }),
      esbuild({
        tsconfig: './tsconfig.json',
        minify: true,
        sourceMap: true,
        target: 'es2020',
      }),
    ],
    external: ['vue', '@vue/shared'],
  } as RollupOptions,
  {
    // 生成 .d.ts 类型声明文件
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
    external: ['vue', '@vue/shared'],
  } as RollupOptions,
]);