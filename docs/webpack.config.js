/*global require __dirname module*/

const path = require('path');
console.log(path.resolve(__dirname, 'src/index.js'));
module.exports = {
    entry: path.resolve(__dirname, 'src/index.js'),
    output: {
        path: path.resolve(__dirname, 'src/'),
        filename: 'build.js'
    },
    devServer: {
        contentBase: path.resolve(__dirname, 'site/'),
        host: '0.0.0.0',
        port: 9001,
        disableHostCheck: true,
        index: 'index.html'
    }
};