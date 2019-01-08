// jshint strict: false

import Mediator from '../../../src/scripts/core/Mediator';
import Config from '../../../src/scripts/modules/Config';

import toolbarConfig from '../../../src/scripts/config/toolbar';

describe('modules/Config', function () {
    let mediator;
    const toolbarConfigsKeysStrings = function (config, source) {
        const configKeysString = JSON.stringify(config.buttons.map((buttonConfig) => buttonConfig.configKey));
        const sourceKeysString = JSON.stringify(source);
        return [
            config.buttons.length,
            source.length,
            configKeysString,
            sourceKeysString
        ];
    };

    beforeEach(() => {
        mediator = new Mediator();
    });

    afterEach(() => {
        mediator = null;
    });

    it('should return toolbar buttons from default toolbar config', () => {
        new Config({ mediator });
        const toolbarButtons = mediator.get('config:toolbar:buttons');
        const [
            configLength,
            sourceLength,
            configKeysString,
            sourceKeysString
        ] = toolbarConfigsKeysStrings(toolbarButtons, toolbarConfig.buttons);

        expect(configLength).toBe(sourceLength);
        expect(configKeysString).toBe(sourceKeysString);
    });

    it('should return toolbar buttons from given custom config', () => {
        const customToolbarConfig = ['bold', 'h1', 'link'];
        new Config({
            mediator,
            configs: {
                toolbar: {
                    buttons: customToolbarConfig
                }
            }
        });
        const toolbarButtons = mediator.get('config:toolbar:buttons');
        const [
            configLength,
            sourceLength,
            configKeysString,
            sourceKeysString
        ] = toolbarConfigsKeysStrings(toolbarButtons, customToolbarConfig);

        expect(configLength).toBe(sourceLength);
        expect(configKeysString).toBe(sourceKeysString);
    });
});
