// jshint strict: false

module.exports = function (config) {
    config.set({
        basePath: '',

        frameworks: ['jasmine-jquery', 'jasmine'],

        files: [
            './test/unit/setup.js',
            // {pattern: './src/scripts/**/*.js', included: false},
            {pattern: './test/unit/fixtures/**/*.html', included: false, served: true},
            // {pattern: './test/helpers/**/*.js', included: false},
            './test/unit/**/*.spec.js'
        ],

        preprocessors: {
            './test/unit/setup.js': ['rollup'],
            './src/scripts/**/*.js': ['rollup', /*'sourcemap', 'coverage'*/],
            './test/unit/**/*.spec.js': ['rollup', /*'sourcemap'*/]
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
                    exclude: ['./test/unit/**/*.js', 'node_modules/**']
                }),
                require('rollup-plugin-babel')({
                    exclude: 'node_modules/**'
                })
            ],
            format: 'iife',
            moduleName: 'typester',
            sourceMap: 'inline'
        },
        logLevel: config.LOG_DEBUG,
        plugins: [
            'karma-rollup-preprocessor',
            'karma-jasmine',
            'karma-jasmine-jquery',
            'karma-spec-reporter',
            'karma-sourcemap-loader',
            'karma-coverage',
            'karma-phantomjs-launcher'
        ],
        reporters: ['spec'/*, 'coverage' */],
        coverageReporter: {
            type: 'html',
            dir: 'coverage/'
        },
        browsers: ['PhantomJS'],
        autoWatchBatchDelay: 3000
    });


    if (process.env.NODE_ENV === 'ci') {
        config.set({
            plugins: config.plugins.concat([
                'karma-junit-reporter',
                'karma-chrome-launcher',
                'karma-firefox-launcher'
            ]),
            reporters: ['junit'],
            autoWatch: false,
            browserDisconnectTolerance: 2,
            concurrency: 1,
            singleRun: true,
            junitReporter: {
                outputDir: 'coverage',
                outputFile: 'report.xml',
                suite: '',
                useBrowserName: true
            },
            customLaunchers: {
                'chrome': {
                    base: 'Chrome',
                    flags: ['--headless', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=9222'],
                    displayName: 'Typester-Chrome'
                },
                'firefox': {
                    base: 'Firefox',
                    flags: ['-headless'],
                    displayName: 'Typester-Firefox'
                },
                'phantom': {
                    base: 'PhantomJS',
                    displayName: 'Typester-PhantomJS'
                }
            },
            browsers: ['phantom', 'chrome', 'firefox']
        });
    }
};
