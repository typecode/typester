// jshint strict: false

import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import handlebars from 'rollup-plugin-handlebars-plus';
import scss from 'rollup-plugin-sass';
import autoprefixer from 'autoprefixer';
import postcss from 'postcss';

export default {
    entry: 'src/scripts/index.js',
    dest: 'build/js/typester.js',
    format: 'umd',
    moduleName: 'typester',
    sourceMap: true,
    plugins: [
        resolve({
            jsnext: true,
            main: true,
            browser: true
        }),
        scss({
            output: false,
            processor(css) {
                return postcss([autoprefixer]).process(css)
                    .then(result => result.css);
            }
        }),
        handlebars({
            templateExtension: '.html'
        }),
        commonjs(),
        eslint({
            exclude: [
                'src/templates/**',
                'src/styles/**'
            ]
        }),
        babel({
            exclude: 'node_modules/**'
        })
    ]
};
