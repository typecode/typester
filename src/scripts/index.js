// jshint strict: false
/* eslint-disable no-alert, no-console */

import './polyfills';
import AppContainer from './containers/AppContainer';

/**
 * Tyester - Public interface to instatiate a Typester instance bound to a
 * dom element
 *
 * @access public
 * @param  {object} opts={} - instance options
 * @param  {object} opts.dom - The dom components used by Typester
 * @param  {element} opts.dom.el - The dom element to be the canvas for Typester
 * @param  {object} opts.config - Additional instanced config
 * @return {appContainer} AppContainer instance
 *
 * @example
 * new Typester({
 *   dom: {
 *     el: domElement
 *   }
 * });
 */
const Typester = function (opts={}) {
    return new AppContainer({
        dom: {el: opts.el },
        configs: opts.configs
    });
};

export default Typester;
