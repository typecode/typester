// jshint strict: false
const webpackConfig = require('./webpack.config');
delete webpackConfig.entry;
delete webpackConfig.output;

module.exports = function (config) {
    config.set({
        basePath: '',

        frameworks: ['jquery-2.0.0', 'jasmine'],

        files: [
            './test/unit/setup.js',
            {pattern: './test/unit/fixtures/**/*.html', included: false, served: true},
            'test/unit/**/*.spec.js'
        ],

        preprocessors: {
            './test/unit/setup.js': ['webpack'],
            './src/scripts/**/*.js': ['webpack'],
            'test/unit/**/*.spec.js': ['webpack']
        },

        webpack: Object.assign({}, webpackConfig, {
            output: {

            }
        }),

        webpackMiddleware: {
            noInfo: true
        },

        logLevel: config.LOG_DEBUG,
        reporters: ['spec'],
        coverageReporter: {
            type: 'html',
            dir: 'coverage/'
        },
        browsers: ['PhantomJS'],
        autoWatchBatchDelay: 3000
    });
};
