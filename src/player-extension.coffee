# ConnectME annotation toggler button that shows/hides the annotations on Fullscreen
_V_.AnnotationToggle = _V_.Button.extend(
  buttonText: "Annotations On/Off"
  buildCSSClass: ->
    "vjs-annotationstoggler " + @_super()

  onClick: ->
    if LimePlayer.options.annotationsVisible is false
      $(".vjs-annotationstoggler").removeClass "annotationstoggler-off"
      LimePlayer.options.annotationsVisible = true
      LimePlayer.player.AnnotationOverlaysComponent.show()  if LimePlayer.player.AnnotationOverlaysComponent
      if @player.isFullScreen #show Annotations sidebars
        LimePlayer.player.AnnotationsSidebars.show()
      else #only show in fullscreen
        LimePlayer.player.AnnotationsSidebars.hide()
    else #toggle off Annotation overlays
      $(".vjs-annotationstoggler").addClass "annotationstoggler-off"
      LimePlayer.player.AnnotationsSidebars.hide()
      LimePlayer.player.AnnotationOverlaysComponent.hide()  if LimePlayer.player.AnnotationOverlaysComponent
      LimePlayer.options.annotationsVisible = false
    console.log "fullscreen " + @player.isFullScreen, "visible " + LimePlayer.options.annotationsVisible
)

# ConnectME Annotation Sidebars for fullscreen mode - displays 4 fixed regions (NWSE) as containers for widgets
_V_.AnnotationsSidebars = _V_.Component.extend( #for  annotations on the sidebars
  options:
    loadEvent: "play"

  init: (player, options) ->
    @_super player, options
    player.addEvent "fullscreenchange", @proxy(-> #for hiding overlay annotations when not in fullscreen
      @hide()  if @player.isFullScreen is false
    )
    player.addEvent "play", @proxy(->
      @fadeIn()
      @player.addEvent "mouseover", @proxy(@fadeIn)
    )

    # this.player.addEvent("mouseout", this.proxy(this.fadeOut));	//maybe we want to
    @player.AnnotationsSidebars = this #attach Component for sidebar annotations to player

  createElement: -> #we just attach and show the "annotation-wrapper" div created in the _initVideoPlayer method
    $(".annotation-wrapper", @el).show()[0]

  fadeIn: ->
    @_super()

  fadeOut: ->
    @_super()

  lockShowing: ->
    @el.style.opacity = "1"
)