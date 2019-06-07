/* eslint-disable */

const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: process.env.BUILD || "development", // "production" | "development" | "none"

    entry: './src/scripts/index.js',

    output: {
        path: path.resolve(__dirname, 'build/js/'),
        filename: process.env.BUILD === 'production' ? 'typester.min.js' : 'typester.js',
        library: 'Typester',
        libraryExport: "default",
        libraryTarget: 'umd'
    },

    resolve: {
        extensions: ['.js', '.html']
    },

    module: {
        rules: [
            {
                test: /\.js/,
                loader: 'babel-loader'
            },
            {
                test: /\.html/,
                loader: 'handlebars-loader'
            },
            {
                test: /\.scss/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            }
        ]
    },

    plugins: [
        new webpack.ProvidePlugin({
            Typester: ['Typester', 'default']
        })
    ],

    devServer: {
        contentBase: [path.resolve(__dirname, 'build/'), path.resolve(__dirname, 'test/server/')],
        host: '0.0.0.0',
        port: 9000,
        disableHostCheck: true,
        index: 'index.html',
        publicPath: '/js/'
    }
}