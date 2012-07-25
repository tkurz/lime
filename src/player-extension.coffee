_V_.AnnotationToggle = _V_.Button.extend(
  buttonText: "Annotations On/Off"
  buildCSSClass: ->
    "vjs-annotationstoggler " + @_super()

  onClick: ->
    if LimePlayer.AnnotationsVisible is false
      LimePlayer.AnnotationsVisible = true
      if @player.isFullScreen
        @player.addComponent "Annotations"
      else
    else
      @player.Annotations.fadeOut()  if @player.Annotations
      LimePlayer.AnnotationsVisible = false
)

_V_.FullscreenToggle = _V_.Button.extend(
  buttonText: "Fullscreen"
  buildCSSClass: ->
    "vjs-fullscreen-control " + @_super()

  onClick: ->
    unless @player.isFullScreen
      @player.requestFullScreen()
      @player.addComponent "Annotations"  if LimePlayer.AnnotationsVisible is true
    else
      @player.cancelFullScreen()
      @player.Annotations.hide()
)

_V_.ControlBar = _V_.Component.extend(
  options:
    loadEvent: "play"
    components:
      playToggle: {}
      fullscreenToggle: {}
      AnnotationToggle: {}
      currentTimeDisplay: {}
      durationDisplay: {}
      remainingTimeDisplay: {}
      progressControl: {}
      volumeControl: {}
      muteToggle: {}

  init: (player, options) ->
    @_super player, options
    player.addEvent "play", @proxy(->
      @fadeIn()
      @player.addEvent "mouseover", @proxy(@fadeIn)
      @player.addEvent "mouseout", @proxy(@fadeOut)
    )

  createElement: ->
    _V_.createElement "div",
      className: "vjs-controls"

  fadeIn: ->
    @_super()
    @player.triggerEvent "controlsvisible"

  fadeOut: ->
    @_super()
    @player.triggerEvent "controlshidden"

  lockShowing: ->
    @el.style.opacity = "1"
)

_V_.Annotations = _V_.Component.extend(
  options:
    loadEvent: "play"
    AnnotWest: true
    AnnotEast: true
    AnnotNorth: true
    AnnotSouth: true

  init: (player, options) ->
    player.addEvent "fullscreenchange", =>
      @hide()  if @player.isFullScreen is false

    player.addEvent "play", =>
      @fadeIn()
      @player.addEvent "mouseover", @proxy(@fadeIn)

    LimePlayer.AnnotationsVisible = true
  # @player.Annotations = this

  createElement: ->
    $('.annotation-wrapper',@el).show()[0]

  lockShowing: ->
    @el.style.opacity = "1"
)
