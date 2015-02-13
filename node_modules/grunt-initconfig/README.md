# grunt-initconfig

> Seperate your long configuration. It conventionally init your configurations.

## Getting Started

Install the module with: `npm install grunt-initconfig --save-dev`

Then add this line to your project's `Gruntfile.js` gruntfile:

```javascript
grunt.loadNpmTasks('grunt-initconfig');
```

You can run initconfig task:

```
grunt.task.run('initconfig');

grunt.registerTask('dev', 'lint server watch');
grunt.registerTask('prod', 'lint test');
```

Otherwise:

```
grunt.registerTask('dev', 'initconfig lint server watch');
grunt.registerTask('prod', 'initconfig lint test');
```

## Documentation

`grunt-initconfig` support a lot of formats. Choose your favorate:

* `.yaml`: yaml
* `.json`: json
* `.js`: JavaScript
* `.cson`: [cson][]
* `.coffee`: CoffeeScript
* `.md`: [mdconf][]

[cson]: https://github.com/bevry/cson
[mdconf]: https://github.com/visionmedia/mdconf

Put your configuration files in `.initconfig`. `grunt-initconfig` automatically load and initialize configurations in `.initconfig` directory. Let's see examples:

```
$ tree -a
.
└── .initconfig
    ├── clean.json
    ├── coffee
    │   ├── tasks.coffee
    │   └── test.coffee
    ├── coffeelint.coffee
    ├── copy.yaml
    ├── jshint.js
    ├── simplemocha.md
    └── watch.cson
```

All of configuration will be injected into 'grunt config'.

In `.initconfig`, directory is a namespace. Next two examples is the same.

`.initconfig/coffee-tasks.coffee`:

```coffee
module.exports = (grunt)->
  coffee:
    tasks:
      expand: true
      cwd: 'src/tasks/'
      src: ['**/*.coffee']
      dest: 'tasks/'
      ext: '.js'
```

`.initconfig/coffee/tasks.coffee`:

```coffee
module.exports = (grunt)->
  tasks:
    expand: true
    cwd: 'src/tasks/'
    src: ['**/*.coffee']
    dest: 'tasks/'
    ext: '.js'
```

## Examples

`.yaml`:

```yaml
copy:
  tasks:
    files:
      - expand: true
        cwd: src/tasks
        src:
          - '**/*.js'
        dest: tasks/
  test:
    files:
      - expand: true
        cwd: src/test
        src:
          - '**/*.js'
        dest: out/test
```

`.json`:

```js
{
  "clean": [
    "out/",
    "tasks/",
    "*.js",
    "*.js.map",
    "src/**/*.js",
    "src/**/*.js.map"
  ]
}
```

`.js`:

```js
module.exports = function(grunt) {
  return {
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      tasks: {
        src: ['src/tasks/**/*.js']
      },
      test: {
        src: ['src/test/**/*.js']
      }
    }
  };
};
```

`.cson`:

```coffee
{
  watch:
    gruntfile:
      files: '<%= coffeelint.gruntfile.src %>'
      tasks: [
        'coffeelint:gruntfile'
      ]
    jsTasks:
      files: '<%= jshint.tasks.src %>'
      tasks: [
        'jshint:tasks'
        'test'
      ]
    jsTest:
      files: '<%= jshint.test.src %>'
      tasks: [
        'jshint:test'
        'test'
      ]
    coffeeTasks:
      files: '<%= coffeelint.tasks.src %>'
      tasks: [
        'coffeelint:tasks'
        'coffee:tasks'
        'test'
      ]
    coffeeTest:
      files: '<%= coffeelint.test.src %>'
      tasks: [
        'coffeelint:test'
        'coffee:test'
        'test'
      ]
}
```

`.coffee`:

```
module.exports = (grunt)->
  coffeelint:
    gruntfile:
      src: 'Gruntfile.coffee'
    tasks:
      src: ['src/tasks/*.coffee']
    test:
      src: ['src/test/*.coffee']
    options:
      no_trailing_whitespace:
        level: 'error'
      max_line_length:
        level: 'warn'
```

`.md`:

```markdown
# simplemocha

## options

Blur Blur Blur

- timeout: 3000
- ignoreLeaks: false
- ui: bdd
- reporter: spec

### globals
  - should

## test

`test` is target

### src

[mocha]() requires these files like `--require` options

- node_modules/should/lib/should.js
- out/test/**/*.js
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

* 2013-08-25 v0.0.1 Release grunt-initconfig

## License
Copyright (c) 2013 Changwoo Park
Licensed under the MIT license.
