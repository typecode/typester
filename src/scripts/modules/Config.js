import Module from '../core/Module';
import toolbarConfig from '../config/toolbar';
import config from '../config/config';
import stylesConfig from '../config/styles';

const Config = Module({
    name: 'Config',
    props: {},
    acceptsConfigs: ['toolbar', 'styles'],

    handlers: {
        requests: {
            'config:toolbar:buttons' : 'getToolbarButtons',
            'config:toolbar:buttonConfig' : 'getToolbarButtonConfig',
            'config:toolbar:validTags' : 'getToolbarValidTags',
            'config:toolbar:blockTags' : 'getToolbarBlockTags',
            'config:toolbar:listTags' : 'getToolbarListTags',
            'config:toolbar:preventNewlineDefault' : 'getToolbarPreventNewlineDefault',
            'config:blockElementNames' : 'getConfigBlockElementNames',
            'config:defaultBlock' : 'getDefaultBlock',
            'config:styles': 'getStyles'
        }
    },

    methods: {
        setup () {},
        init () {},

        getToolbarButtons () {
            const { mediator, configs } = this;
            const contentEditableButtons = mediator.get('contenteditable:toolbar:buttons') || [];
            const configButtons = contentEditableButtons.length
                ? contentEditableButtons
                : configs.toolbar.buttons
                    ? configs.toolbar.buttons
                    : toolbarConfig.buttons;

            let buttons = [];
            configButtons.forEach((configKey) => {
                // NB This needs to be looked at
                if (configKey === 'anchor') {
                    configKey = 'link';
                }
                const buttonConfig = Object.assign({ configKey }, toolbarConfig.buttonConfigs[configKey]);
                buttons.push(buttonConfig);
            });

            return { buttons };
        },

        getToolbarButtonConfig (buttonConfigKey) {
            return toolbarConfig.buttonConfigs[buttonConfigKey];
        },

        getToolbarValidTags () {
            return toolbarConfig.getValidTags();
        },

        getToolbarBlockTags () {
            return toolbarConfig.getBlockTags();
        },

        getToolbarListTags () {
            return toolbarConfig.getListTags();
        },

        getToolbarPreventNewlineDefault () {
            return toolbarConfig.preventNewlineDefault;
        },

        getConfigBlockElementNames () {
            return config.blockElementNames;
        },

        getDefaultBlock () {
            return config.defaultBlock;
        },

        getStyles () {
            const { configs } = this;
            return {
                colors: Object.assign({}, stylesConfig.colors, configs.styles.colors)
            };
        }
    }
});

export default Config;
