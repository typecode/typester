## Typester Development

### TOC
* [Project Architecture](#project-architecture)
* [Core Concepts](#core-concepts)
    - [Containers](#core-concepts-containers)
    - [Mediators](#core-concepts-mediators)
    - [Modules](#core-concepts-modules)
    - [The Canvas](#core-concepts-the-canvas)
    - [Formatters](#core-concepts-formatters)

---
<a id='project-architecture'></a>
## Project Architecture
![Architecture Overview](https://typecode.github.io/typester/assets/images/architecture-overview.svg)

Typester uses a combination of Containers, Modules, that interact via Mediators.

The architecture layout is:
- **AppContainer** *(/containers/AppContainer.js)*
    - **Mediator**
    - Modules:
        - **ContentEditable** *(/modules/ContentEditable.js)*
        - **Selection** *(/modules/Selection.js)*
- **UIContainer** *(/containers/UIContainer.js)* :: [singleton]
    - **Mediator** &#8644; *AppContainer.Mediator*
    - Modules:
        - **Flyout** *(/modules/Flyout.js)*
        - **Toolbar** *(/modules/Toolbar.js)*
        - **Mouse** *(/modules/Mouse.js)*
- **FormatterContainer** *(/containers/FormatterContainer.js)* :: [singleton]
    - **Mediator** &#8644; *AppContainer.Mediator*
    - Modules:
        - **BaseFormatter** *(/modules/BaseFormatter.js)*
        - **BlockFormatter** *(/modules/BlockFormatter.js)*
        - **TextFormatter** *(/modules/TextFormatter.js)*
        - **ListFormatter** *(/modules/ListFormatter.js)*
        - **LinkFormatter** *(/modules/LinkFormatter.js)*
        - **Paste** *(/modules/Paste.js)*
- **CanvasContainer** *(/containers/CanvasContainer.js)* :: [singleton]
    - **Mediator** &#8644; *AppContainer.Mediator*
    - Modules:
        - **Selection** *(/modules/Selection.js)*
        - **Canvas** *(/modules/Canvas.js)*

---
<a id='core-concepts'></a>
## Core Concepts

<a id='core-concepts-containers'></a>
### Containers
Containers serve two purposes:
1. Instantiate a mediator, with any provided `mediatorOpts`, and, if a parent mediator is provided, link it.
2. Group and instantiate related modules passing the `mediator` instance and a root `dom` collection

**Example**
```
import Selection from '../modules/Selection';
import Canvas from '../modules/Canvas';

const CanvasContainer = Container({
    name: 'CanvasContainer',

    modules: [
        { class: Selection },
        { class: Canvas }
    ],

    /**
     * @prop {object} mediatorOpts - Container specific mediator options. For the
     * CanvasContainer the mediator is set to conceal, and not propagate, any messages
     * from the selection module. This is to avoid cross contamination with the selection
     * module used on the page.
     */
    mediatorOpts: {
        conceal: [
            /selection:.*?/
        ]
    },

    handlers: {
        events: {
            'canvas:created' : 'handleCanvasCreated'
        }
    },

    methods: {
        init () {
        },

        handleCanvasCreated () {
            const { mediator } = this;
            const canvasWin = mediator.get('canvas:window');
            const canvasDoc = mediator.get('canvas:document');
            const canvasBody = mediator.get('canvas:body');

            mediator.exec('selection:set:contextWindow', canvasWin);
            mediator.exec('selection:set:contextDocument', canvasDoc);
            mediator.exec('selection:set:el', canvasBody);
        }
    }
});
```

<a id='core-concepts-mediators'></a>
### Mediators
Mediators serve as the primary way for Containers and Modules to interface with each other.
This is done using call strings which are mapped to methods at the Container / Module level.

Call strings take the format of `modulename:method:name`.

There are 3 types of message handling:
1. Commands - One-to-one message with no response.
2. Requests - One-to-one message with a response.
3. Events - One-to-many message with no response.

When declaring a Module or a Container adding a handlers object formatted as follows,
will result in the mediator registering and mapping the call string to the named method.
```
    handlers: {
        commands: {
            'methodname:do:something' : 'doSomething'
        },
        requests: {
            'methodname:get:something' : 'getSomething'
        },
        events: {
            'othermethodname:event:name' : 'reactToEvent'
        }
    },

    methods: {
        doSomething () { ... },
        getSomething () { ...; return ...; },
        reactToEvent () { --- }
    }
```
