class window.UserSettingsPlugin extends window.LimePlugin
  init: ->
    @name = 'UserSettingsPlugin'
    console.info "Initialize #{@name}"
    @lime.player.bind 'pause', (e) =>
      console.info 'getAllTypes', @getAllTypes()


  defaults:
    unhidable: []
  getAllTypes: ->
    res = _(@lime.widgets).chain()
      .map (widget) ->
        widget.options.type
    .uniq()
    .sort()
    .value()
    res