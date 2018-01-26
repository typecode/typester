# Setup
To run this you are going to need:
- Ruby
- Bundler
- Node with Yarn (or npm)

See RVM for a solution to installing ruby: [RVM](https://rvm.io/rvm/install)

Then
```
$ gem install bundler
```

Then in the project folder install the necessary dependencies:
```
$ bundle install
$ yarn install
```

# Run the dev server
You can either use bundler or yarn
```
$ yarn dev_server
```
or
```
$ bundle exec jekyll serve --host 0.0.0.0 --livereload
```

# Run the JS build process
```
$ yarn watch
```
