module.exports = ->
  banner = """/* Lime Player <%= pkg.version %> - Linked Media Player
           by Szaby Grünwald, Cristian Bara and the ConnectMe Project.
           Available under the Apache License, Version 2.0
           See http://connectme.sti2.org/ for more information.
           */"""

  # Project configuration
  @initConfig
    pkg: @file.readJSON 'package.json'

  # Build setup: concatenate source files
    coffee:
      compile:
        files:
          'lib/lime-core.js': ['src/*.coffee', 'src/plugins/ldplugin.coffee', 'src/settings/usersettings.coffee']
          'lib/lime.js': ['src/*.coffee', 'src/plugins/*.coffee', 'src/settings/*.coffee']

  # JavaScript minification
    uglify:
      options:
        banner: banner
        report: 'min'
      full:
        files:
          'lib/lime.min.js': ['lib/lime.js']
      core:
        files:
          'lib/lime-core.min.js': ['lib/lime-core.js']

  # Coding standards verification
    coffeelint:
      app: ['src/*.coffee', 'src/**/*.coffee']

    jshint:
      all: ['src/*.js', 'src/**/*.js']

  # Unit tests
#    qunit:
#      all: ['test/*.html']
#
#    nodeunit:
#      all: ['test/nodejs/*.js']

  # Automated recompilation and testing when developing
    watch:
      files: [
        'src/*.coffee'
        'src/**/*.coffee'
      ]
      tasks: ['build']

  # Build dependencies
  @loadNpmTasks 'grunt-contrib-coffee'
  @loadNpmTasks 'grunt-contrib-concat'
  @loadNpmTasks 'grunt-contrib-uglify'
  @loadNpmTasks 'grunt-coffeelint'

  # Testing dependencies
  @loadNpmTasks 'grunt-contrib-jshint'
#  @loadNpmTasks 'grunt-contrib-qunit'
#  @loadNpmTasks 'grunt-contrib-nodeunit'
  @loadNpmTasks 'grunt-contrib-watch'

  # Local tasks
  @registerTask 'build', =>
    @task.run "coffee"
    @task.run "uglify"
  # @registerTask 'test', ['jshint', 'build']