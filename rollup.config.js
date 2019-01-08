// jshint strict: false

import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import handlebars from 'rollup-plugin-handlebars-plus';
import scss from 'rollup-plugin-sass';
import { uglify } from 'rollup-plugin-uglify';
import gzip from 'rollup-plugin-gzip';
import autoprefixer from 'autoprefixer';
import postcss from 'postcss';

export default {
    entry: 'src/scripts/index.js',
    dest: (process.env.BUILD === 'production' ? 'build/js/typester.min.js' : 'build/js/typester.js'),
    format: 'umd',
    moduleName: 'Typester',
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
        }),
        (process.env.BUILD === 'production' && uglify()),
        (process.env.BUILD === 'production' && gzip())
    ]
};
