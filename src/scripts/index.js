// jshint strict: false
/* eslint-disable no-alert, no-console */

import './polyfills';
import AppContainer from './containers/AppContainer';

const Typester = function (opts={}) {
    return new AppContainer({ dom: {el: opts.el }});
};

export default Typester;
