# Typester ([typecode.github.io/typester](https://typecode.github.io/typester))
A simple to use WYSIWYG text editor inspired by Medium and Medium Editor that gives you clean and predictable HTML from your user's input.

- **Single file import (batteries included):**
   No need to import separate stylesheets and additional dependencies. Typester comes with everything it needs rolled into one JS file.
- **Engineered for modern JS modules**
   Typester has been created using ES6+ JavaScript module patterns which means you need only import it and instantiate it. If you still prefer &lt;script&gt; imports that's fine too Typester will bind itself to the global scope allowing you to `new window.Typester({ /* options */ })`.
- **Minimal DOM footprint**
   It wont clutter your beautifully laid out markup with multiple DOM injections for each editor instance. Need multiple editors on a single page? No problem, typester will inject single instances of its DOM requirements which will be shared between the editors.
- **Pure XSS-free DOM powered by [DOMPurify](https://github.com/cure53/DOMPurify)**
   Typester, thanks to the awesome power of DOMPurify, will make sure that the HTML you receive is sanitized against XSS exploits.

---
#### Try out the [DEMO](https://typecode.github.io/typester/#demo)
---

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

### License
Typester is released under the MIT license.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.



---



# Contributing
If you want to contribute to this project we welcome your input.

You can either:
- Submit an issue / feature request which would help us greatly in figuring out what all this package needs to do
- Resolve an already listed issue
- Submit a tweak or new feature

### Submit an issue / feature request
Please feel free to head over the our [Issues page](https://github.com/typecode/typester/issues)
and submit your issue / feature request.

### Resolve an issue / submit a tweak or new feature
1. Fork this repo
    1. See below for instructions on how to setup local dev
2. Create your feature branch (`git checkout -b new-awesome-feature`)
3. Make sure all tests pass
    1. If you have added a new feature, make sure there is a test for it
    2. Run the following:
       `~> yarn test` (for unit tests) & `~>yarn test_e2e` (end-to-end tests)
    3. If you have changed the codebase in a way that requires the tests to be updated
       please do so.
4. Update the documentation if you've added any publicly accessible methods or options.
5. Commit your changes as you would usually (`git add -i`, add changes, `git commit -m "Succinct description of change"`)
6. Push to your feature branch (`git push origin new-awesome-feature`)
7. Create a new pull request.

### Setup local dev environment
Install all the node moudles
```
~> yarn
~> cd test/e2e/test && yarn
```
### Run build scripts
For a one time build
```
~> yarn build
```
For a continuous reactive build that watches for changes
```
~> yarn watch
```

### Run the local server
You will need to have [Docker](https://docs.docker.com/install/) and [Docker Compose](https://docs.docker.com/compose/install/) installed firstly.

Then:
```
~> yarn local_server
```
You should then be able to navigate your browser to:
```
http://localhost:4848
```

### Run the tests
**Make sure you build first**
Once again, you will need to have [Docker](https://docs.docker.com/install/) and [Docker Compose](https://docs.docker.com/compose/install/) installed.

Then:

Unit tests (Karma & Jasmine)
```
~> yarn test
```

e2e tests (nightwatch)
```
~> yarn test_e2e
```

### Build and read the developer docs
For a once off build:
```
~> yarn docs
```

For a continuous file change reactive build
```
~> yarn docs_watch
```

Then, to read the docs:
```
~> yarn docs_server
```

And point you browser to:
```
http://localhost:4849
```
