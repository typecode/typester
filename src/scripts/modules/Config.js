import Module from '../core/Module';
import toolbarConfig from '../config/toolbar';

const Config = Module({
    name: 'Config',
    props: {},
    acceptsConfigs: ['toolbar'],


    handlers: {
        requests: {
            'config:toolbar:buttons' : 'getToolbarButtons',
            'config:toolbar:buttonConfig' : 'getToolbarButtonConfig'
        }
    },

    methods: {
        setup () {},
        init () {},

        getToolbarButtons () {
            const { mediator, configs } = this;
            const contentEditableButtons = mediator.get('contenteditable:toolbar:buttons') || [];
            const configButtons = contentEditableButtons.length ? contentEditableButtons :
                                  configs.toolbar.buttons ? configs.toolbar.buttons :
                                  toolbarConfig.buttons;

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
        }
    }
});

export default Config;
