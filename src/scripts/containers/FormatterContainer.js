// jshint strict: false

import Container from '../core/Container';

import BaseFormatter from '../modules/BaseFormatter';
import BlockFormatter from '../modules/BlockFormatter';
import TextFormatter from '../modules/TextFormatter';
import ListFormatter from '../modules/ListFormatter';
import LinkFormatter from '../modules/LinkFormatter';
import Paste from '../modules/Paste';

const FormatterContainer = Container({
    name: 'FormatterContainer',
    modules: [
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
