import typescript from 'rollup-plugin-typescript';
import { terser } from 'rollup-plugin-terser';

const external = ['stream'];

/** @type {import('rollup').RollupOptions} */
const esm = {
    plugins: [typescript(), terser()],
    input: 'src/index.ts',
    external,
    output: {
        file: 'lib/index.mjs',
        format: 'esm',
        sourcemap: true,
    },
};

/** @type {import('rollup').RollupOptions} */
const cjs = {
    plugins: [typescript(), terser()],
    input: 'src/index.ts',
    external,
    output: {
        file: 'lib/index.js',
        format: 'cjs',
        sourcemap: true,
    },
};

/** @type {import('rollup').RollupOptions} */
const bin = {
    plugins: [typescript(), terser()],
    input: 'src/bin.ts',
    external: ['./index', 'fs'],
    output: {
        file: 'lib/bin.js',
        format: 'cjs',
        sourcemap: true,
    },
};

export default [esm, cjs, bin];
