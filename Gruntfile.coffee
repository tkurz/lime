module.exports = ->
  banner = """/* Lime Player <%= pkg.version %> - Linked Media Player
           by Szaby Gruenwald, Cristian Bara and the ConnectMe Project.
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
          'lib/lime-core.js': [
            'src/lime.coffee'
            'src/annotation.coffee'
            'src/plugin.coffee'
            'src/widget.coffee'
            'src/videojs-adapter.coffee'
            'src/cmf.coffee'
            'src/annotationoverlays.coffee'
            'src/plugins/ldplugin.coffee'
            'src/jquery.scrollTo.coffee'
            'src/settings/usersettings.coffee'
          ]
          'lib/lime.js': [
            'src/lime.coffee'
            'src/annotation.coffee'
            'src/plugin.coffee'
            'src/widget.coffee'
            'src/videojs-adapter.coffee'
            'src/cmf.coffee'
            'src/annotationoverlays.coffee'
            'src/jquery.scrollTo.coffee'
            'src/plugins/*.coffee'
            'src/settings/*.coffee'
          ]

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
      deps:
        files:
          'lib/lime-deps.min.js': ['lib/lime-deps.js']

    concat:
      # core is the lime player without extra plugins
      core:
        src: ['lib/lime-core.js','lib/utils.js']
        dest: 'lib/lime-core.js'
      # full is the lime player with all plugins
      full:
        src:['lib/lime.js','lib/utils.js']
        dest: 'lib/lime.js'
      # deps is the dependencies without the player itself.
      deps:
        src:['lib/underscoreJS/underscore.min.js', 'lib/backboneJS/backbone.js', 'lib/rdfquery/latest/jquery.rdfquery.debug.js', 'lib/vie/vie.js'],
        dest: 'lib/lime-deps.js'

          # Add short info in front of the produced file
    usebanner:
      coffee:
        options:
          position: 'top' || 'bottom'
          banner: banner
        files:
          src: [ 'lib/lime.js', 'lib/lime-core.js' ]

    docco_husky:
        project_name: "LIME - Linked Media Player"
        # show_timestamp: false
        files: [
          'src/lime.coffee'
          'src/annotation.coffee'
          'src/plugin.coffee'
          'src/widget.coffee'
          'src/videojs-adapter.coffee'
          'src/cmf.coffee'
          'src/annotationoverlays.coffee'
          'src/jquery.scrollTo.coffee'
          'src/plugins/*.coffee'
          'src/settings/*.coffee'
        ]

    # Automated recompilation and testing when developing
    watch:
      # Files to watch
      files: [
        'src/*.coffee'
        'src/**/*.coffee'
      ]
      # Tasks to run on change
      tasks: ['build']

  # Build dependencies
  @loadNpmTasks 'grunt-contrib-coffee'
  @loadNpmTasks 'grunt-contrib-concat'
  @loadNpmTasks 'grunt-contrib-uglify'
  @loadNpmTasks 'grunt-banner'
  @loadNpmTasks 'grunt-docco-husky'

  # Testing dependencies
#  @loadNpmTasks 'grunt-contrib-jshint'
#  @loadNpmTasks 'grunt-contrib-qunit'
#  @loadNpmTasks 'grunt-contrib-nodeunit'
  @loadNpmTasks 'grunt-contrib-watch'

  # Local tasks
  @registerTask 'build', ["coffee", "concat", "usebanner", "uglify"]
  @registerTask 'default', 'build'

  @registerTask 'doc', =>
    @task.run "docco_husky"