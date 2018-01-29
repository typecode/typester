# Typester
A simple to use WYSIWYG text editor inspired by Medium and Medium Editor that gives you clean and predictable HTML from your user's input.

- *Single file import (batteries included):*   
   No need to import separate stylesheets and additional dependencies. Typester comes with everything it needs rolled into one JS file.

## Local Server
Coming soon!

## Setup
Install all the node modules
```
~> yarn
~> cd test/e2e/test && yarn
```

## Build
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
