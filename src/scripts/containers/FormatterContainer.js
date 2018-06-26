// jshint strict: false

/**
 * FormatterContainer - Initializes and bootstraps all the formatter modules.
 * It requires only a mediator instance to delegate events to.
 *
 * @access protected
 * @module containers/FormatterContainer
 *
 * @requires core/Container
 * @requires modules/BaseFormatter
 * @requires modules/BlockFormatter
 * @requires modules/TextFormatter
 * @requires modules/ListFormatter
 * @requires modules/LinkFormatter
 * @requires modules/Paste
 *
 * @example
 * new FormatterContainer({ mediator: mediatorInstance });
 */
import Container from '../core/Container';
import BaseFormatter from '../modules/BaseFormatter';
import BlockFormatter from '../modules/BlockFormatter';
import TextFormatter from '../modules/TextFormatter';
import ListFormatter from '../modules/ListFormatter';
import LinkFormatter from '../modules/LinkFormatter';
import Commands from '../modules/Commands';
import Paste from '../modules/Paste';

/**
 * @constructor FormatterContainer
 * @param {object} opts={} - container options
 * @param {mediator} opts.mediator - The mediator to delegate events up to
 * @return {container} CanvasContainer instance
 */
const FormatterContainer = Container({
    name: 'FormatterContainer',

    /**
     * Child Modules: [{@link modules/BaseFormatter}, {@link modules/BlockFormatter},
     * {@link modules/TextFormatter}, {@link modules/TextFormatter}, {@link modules/LinkFormatter},
     * {@link modules/Paste}]
     * @enum {Array<{class:Module}>} modules
     */
    modules: [
        {
            class: Commands
        },
        {
            class: BaseFormatter
        },
        {
            class: BlockFormatter
        },
        {
            class: TextFormatter
        },
        {
            class: ListFormatter
        },
        {
            class: LinkFormatter
        },
        {
            class: Paste
        }
    ]
});

export default FormatterContainer;
