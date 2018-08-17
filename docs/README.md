## Typester Development

### TOC
* [Deep Dive Articles](#deep-dive-articles)
* [Project Architecture](#project-architecture)
* [Core Concepts](#core-concepts)
    - [Containers](#core-concepts-containers)
    - [Mediators](#core-concepts-mediators)
    - [Modules](#core-concepts-modules)
    - [The Canvas](#core-concepts-the-canvas)
    - [Formatters](#core-concepts-formatters)

---
<a id='deep-dive-articles'></a>
## Deep Dive Articles
For a deeper understanding of how the system is pieced together check out these articles:
- [The Typester Series: Core](https://medium.com/typecode/the-typester-series-core-abc63affaef0)
- [The Typester Series: Formatters](https://medium.com/typecode/the-typester-series-formatters-c9ed8f78424e)

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
### Containers *(core/Container.js)*

Containers serve two purposes:
1. Instantiate a mediator, with any provided `mediatorOpts`, and, if a parent mediator is provided, link it.
2. Group and instantiate related modules passing the `mediator` instance and a root `dom` collection

**Example**
```javascript
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


<br/><a id='core-concepts-mediators'></a>
### Mediators *(core/Mediator.js)*

Mediators serve as the primary way for Containers and Modules to interface with each other.
This is done using call strings which are mapped to methods at the Container / Module level.

Call strings take the format of `modulename:method:name`.

There are 3 types of message handling:
1. Commands - One-to-one message with no response.
2. Requests - One-to-one message with a response.
3. Events - One-to-many message with no response.

When declaring a Module or a Container adding a handlers object formatted as follows,
will result in the mediator registering and mapping the call string to the named method.
```javascript
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
    reactToEvent () { ... }
}
```
**Note** Modules declared via a Container will automatically receive the Container's mediator instance


<br/><a id='core-concepts-modules'></a>
### Modules *(core/Module.js)*

Modules are the workhorses of this architecture. Any code that does anything of value should be placed here.
The underlying structure of a module is:

```javascript
import Module from '../core/Module';

const MyModule = Module({
    // required
    name: 'MyModule',

    /**
     * An enumerable collection of properties that will be accessable
     * via this.prop
     */
    props: {
        foo: 'bar',
        ping: 'pong',
        maxCount: 0
    },

    /**
     * Describe which DOM elements need to be found, and cached, from
     * inside the root element.
     */
    dom: {
        'moduleElem' : '.module-elem' // Accessable with this.dom.moduleElem
    },

    /**
     * The handlers available from this module that will be registered
     * with the provided mediator
     */
    handlers: {
        commands: {
            'mymodule:do:something' : 'doSomething'
        },
        requests: {
            'mymodule:get:something' : 'getSomething'
        },
        events: {
            'anothermodule:did:something' : 'reactToSomething'
        },

        /**
         * These are bound directly to the DOM elements related to
         * the module
         */
        domEvents: {
            'click' : 'rootClick', // Bound to dom.el[0],
            'click @moduleElem' : 'moduleElemClick' // Bound to dom.moduleElem
        }
    },

    /**
     * This modules methods.
     */
    methods: {
        /**
         * A hook that will be called when the module is ready for
         * initialization
         */
        setup () {...},

        /**
         * A hook that will be called once the module has been initialized
         */
        init () {},

        /**
         * The rest is up to you to declare
         */
        doSomething () { ... },
        getSomething () { return 'something'; },
        reactToSomething () { ... },
        rootClick (evnt) { ... }, // evnt is the DOM event
        moduleElemClick (evnt) { ... }

    }
});

new MyModule({ el: document.querySelector('.my-module'), mediator: /* a mediator instance */});
```

When working in the module methods you can access the module properties and methods
off of the `this` context of the method. The example module above's context
will be structured as follows:
```javascript
{
    props: {
        foo: 'bar',
        ping: 'pong',
        maxCount: 0
    },
    dom: {
        el: [<domnode>], // the el options provided when instantiating the module
        moduleElem: [<domnode>]
    },
    mediator: mediator, // the mediator instance provided when instantiating the module
    setup () {},
    init () {},
    doSomthing () {},
    reactToSomething () {},
    rootClick () {},
    moduleElemClick () {}
}
```

You are then able to destructure what you need from the context.
```javascript
methods: {
    doSomething () {
        const { dom, props } = this;
        dom.moduleElem.innerText = props.maxCount;
    }
}
```

<br/><a id='core-concepts-the-canvas'></a>
### The Canvas
Typester uses an `<iframe>` as a sandboxed DOM canvas inside which the
formatters can work on the content in isolation without poluting the
edit (undo/redo) history of the editor.

It also frees the formatters to use a combination of documentExec and direct
DOM manipulation to get the desired results.

Once the formatting is complete the canvas body's innerHTML is copied and
pasted into the editor, resulting in only a single edit history item
being logged.

<br/><a id='core-concepts-formatters'></a>
### Formatters
*(core/BaseFormatter.js)* - Common formatting logic<br/>
*(core/BlockFormatter.js)* - Formatting logic for block level element formatting (H1, H2, Blockquote, etc.)<br/>
*(core/LinkFormatter.js)* - Formattting  logic for creating/updating/removing links<br/>
*(core/ListFormatter.js)* - Formatting logic for creating/updating/removing lists<br/>
*(core/TextFormatter.js)* - Formatting logic for inline/text formatting (bold, italic, etc.)

The formatters use a combination of:
1. **Pre-processing** - Exporting the selection to the canvas and manipulating it in preparation for formatting
2. **Processing** - Using a combination of documentExec commands and some DOM manipulation to get the desired formatting output, all done inside the canvas.
3. **Post-processing** - Cleaning up and standardizing the processed output to iron out browser quirks.
4. **Commiting** - Exporting the formatted content from the canvas and updating the content in the editor.

A typical formatting flow is as follows:
1. **Export to canvas**
    1. Inject selection hooks before and after the editor's content
    2. Calculate the selection range coordinates, used by the canvas to
    clone the selection range.
    3. Clone all the nodes in the editor
    4. Export the cloned nodes to the canvas
    5. Set the selection range using the range coordinates calculated earlier
2. **Apply the formatting**
    - This can vary formatter to fomatter. See the formatter specific docs for
    more details
3. **Import the formatted content back from the canvas**
    1. Cache the selection range, as it may be altered or lost during the next
    couple of steps
    2. Clean the formatted content inside the canvas
    3. If an additional importFilter has been provided, call it with the canvasBody
    element as the argument
    4. Re-apply the cached selection range
    5. Calculate the selection range coordinates inside the canvas
    6. Import the canvas HTML into the editor
    7. Set the selection range inside the editor using the coordinates
    calculated earlier
    8. Emit a complete event
