// jshint strict: false

module.exports = function (config) {
    config.set({
        basePath: '',

        frameworks: ['jasmine-jquery', 'jasmine'],

        files: [
            './test/setup.js',
            // {pattern: './src/scripts/**/*.js', included: false},
            {pattern: './test/fixtures/**/*.html', included: false, served: true},
            // {pattern: './test/helpers/**/*.js', included: false},
            './test/**/*.spec.js'
        ],

        preprocessors: {
            './test/setup.js': ['rollup'],
            './src/scripts/**/*.js': ['rollup', 'sourcemap', 'coverage'],
            './test/**/*.spec.js': ['rollup', 'sourcemap']
        },

        rollupPreprocessor: {
            plugins: [
                require('rollup-plugin-node-resolve')({
                    jsnext: true,
                    main: true,
                    browser: true
                }),
                require('rollup-plugin-sass')({
                    output: false,
                    processor(css) {
                        return require('postcss')([require('autoprefixer')]).process(css)
                            .then(result => result.css);
                    }

                }),
                require('rollup-plugin-handlebars-plus')({
                    templateExtension: '.html'
                }),
                require('rollup-plugin-commonjs')(),
                require('rollup-plugin-istanbul')({
                    exclude: ['./test/**/*.js', 'node_modules/**']
                }),
                require('rollup-plugin-babel')({
                    exclude: 'node_modules/**'
                })
            ],
            format: 'iife',
            moduleName: 'typester',
            sourceMap: 'inline'
        },
        // logLevel: config.LOG_DEBUG,
        plugins: [
            'karma-rollup-preprocessor',
            'karma-jasmine',
            'karma-jasmine-jquery',
            'karma-phantomjs-launcher',
            'karma-spec-reporter',
            'karma-sourcemap-loader',
            'karma-coverage'
        ],
        reporters: ['spec'],
        coverageReporter: {
            type: 'html',
            dir: 'coverage/'
        },
        browsers: ['PhantomJS'],
        autoWatchBatchDelay: 3000
    });
};
