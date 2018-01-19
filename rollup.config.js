import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
    input: '_js/index.js',
    output: {
        file: 'assets/js/bundle.js',
        format: 'iife'
    },
    plugins: [
        nodeResolve({
            browser: true,
            jsnext: true
        }),
        commonjs(),
        buble({
            except: 'node_modules/**',
            objectAssign: 'Object.assign'
        })
    ]
};
