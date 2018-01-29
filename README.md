# Typester
A simple to use WYSIWYG text editor inspired by Medium and Medium Editor that gives you clean and predictable HTML from your user's input.

- **Single file import (batteries included):**
   No need to import separate stylesheets and additional dependencies. Typester comes with everything it needs rolled into one JS file.
- **Engineered for modern JS modules**
   Typester has been created using ES6+ JavaScript module patterns which means you need only import it and instantiate it. If you still prefer <script> imports that's fine too Typester will bind itself to the global scope allowing you to `new window.Typester({ /* options */ })`.
- **Minimal DOM footprint**
   It wont clutter your beautifully laid out markup with multiple DOM injections for each editor instance. Need multiple editors on a single page? No problem, typester will inject single instances of its DOM requirements which will be shared between the editors.
- **Pure XSS-free DOM powered by [DOMPurify](https://github.com/cure53/DOMPurify)**
   Typester, thanks to the awesome power of DOMPurify, will make sure that the HTML you receive is sanitized against XSS exploits.

#### Try out the [DEMO](http://rigel:4000/typester/#demo)

### Installation
Right now Typester is only available via npm. We may look into offering CDN hosted options and/or downloadable and self-hostable options. But, for now, you can:
```
npm install typester-editor
```
or for the yarn folks:
```
yarn add typester-editor --save
```

### Usage
Setting up Typester on your page is as easy as:
```
import Typester from 'typester-editor'

new Typester({ el: document.querySelector('[contenteditable]') }) // Where document.querySelector(...) is a single DOM element.
```

## Contributing

### Local Server
Coming soon!

### Setup
Install all the node modules
```
~> yarn
~> cd test/e2e/test && yarn
```

### Build
Build this thing (driven by rollup)
```
~> yarn build
```

### Test
**Make sure you build first**

Unit tests (Karma & Jasmine)
```
~> yarn test
```

e2e tests (nightwatch)
```
~> yarn test_e2e
```
