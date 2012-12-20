# Define source coffee files that will be merged into the target file
appFiles  = [
  'src/lime.coffee'
  'src/videojs-adapter.coffee'
  'src/cmf.coffee'
  'src/annotationoverlays.coffee'
  'src/plugins/ldplugin.coffee'
]
target = "lib/lime.js"

fs         = require 'fs'
{exec}     = require 'child_process'
util       = require 'util'

justchanged = null

task 'watch', 'Watch core and plugin source files and build on each change', ->
  # Initial build
  invoke 'build'

  invoke 'widgetwatch'
  util.log "Watching for changes in #{appFiles.join ', '}"

  for file in appFiles
    fs.watchFile file, (curr, prev) ->
      if curr.mtime isnt prev.mtime
        util.log "Saw change in #{file}"
        justchanged = file
        invoke 'build'

task 'build', 'Build single application file from source files', ->
  # invoke 'coffeeFiles'
  appContents = new Array remaining = appFiles.length

  # Build and combine all core files in a way that if one has a syntax error, the compiler will show the
  # error position in the source file
  for file, index in appFiles then do (file, index) ->
    fs.readFile file, 'utf8', (err, fileContents) ->
      throw err if err
      appContents[index] = fileContents
      process() if --remaining is 0
  process = ->
    fs.writeFile 'lib/tmp.coffee', appContents.join('\n\n'), 'utf8', (err) ->
      throw err if err
      cmd = 'coffee -c -o lib lib/tmp.coffee'
      util.log "executing #{cmd}"
      exec cmd, (err, stdout, stderr) ->
        if err
          fs.unlink 'lib/tmp.coffee', (err) ->
          justchanged = appFiles.join " " unless justchanged
          util.log "Error compiling coffee file. Last changed: #{justchanged}"
          exec "coffee --compile #{justchanged}", (err, stdout, stderr) ->
            if err
              util.error stderr
              fs.unlink file.replace /.coffee$/, ".js" for file in appFiles
              exec
        else
          util.log "compile ok"
          exec "mv lib/tmp.js #{target}", (err, stdout, stderr) ->
            fs.unlink 'lib/tmp.coffee', (err) ->
              if err
                util.log 'Couldn\'t delete the lib/tmp.coffee file/'
              util.log 'Done building coffee file.'
            # invoke 'doc'

task 'widgetwatch', 'Watch and compile widgets', ->
  spawn = require('child_process').spawn
  util.log "coffee -wc -o lib/plugins src/plugins/"
  p = spawn "coffee", ['-wc', '-o', 'lib/plugins', 'src/plugins/']
  p.stdout.on 'data', (data) ->
    console.log "#{data}"
  p.stderr.on 'data', (data) ->
    util.log "" + data

task 'settingswatch', 'Watch and compile widgets', ->
  spawn = require('child_process').spawn
  util.log "coffee -wc -o lib/settings src/settings/"
  p = spawn "coffee", ['-wc', '-o', 'lib/settings', 'src/settings/']
  p.stdout.on 'data', (data) ->
    console.log "#{data}"
  p.stderr.on 'data', (data) ->
    util.log "" + data

task 'doc', 'Build documentation', ->
  exec "docco-husky #{appFiles.join ' '} src/plugins/*.coffee", (err, stdout, stderr) ->
    util.error stderr if err
    util.log stdout if stdout
