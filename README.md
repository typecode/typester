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

# Seeing it in your browser
If you're working form local host then:
```
http://localhost:4000/typester/
```

If you're running from another environment:
```
http://192.168.1.123:4000/typester/
```
Where 192.168.1.123 is the ip address of the other environment
