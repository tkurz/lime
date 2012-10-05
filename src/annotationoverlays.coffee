class window.AnnotationOverlays extends window.LimePlugin
  init: ->
    console.info "Initialize AnnotationOverlays"
    @lime.player.addComponent "AnnotationOverlaysComponent"

    #add separate VideoJS component that holds overlays
    @lime.player.AnnotationOverlaysComponent.show()
    container = jQuery ".annotation-overlays-wrapper", @lime.player.el

    #div created by the AnnotationOverlaysComponent component of VideoJS
    limeplayer = @lime
    jQuery(@lime).bind "timeupdate", (e) ->

    for annotation in @lime.annotations
      # Annotation event listener
      jQuery(annotation).bind "becomeActive", (e) =>
        annotation = e.annotation
        if annotation.end is 5
          console.info annotation
        if annotation.isSpacial and (annotation.w > 0) and (annotation.h > 0)
          container.prepend @renderAnnotation annotation

          #display the overlay widget
          domEl = jQuery(".spatial_annotation:first", container)

          #get the DOM element that holds the overlay
          domEl.mouseenter (e) => # hover behaviour
            mouseenterEvent = jQuery.Event "mouseenter"
            debugger unless annotation
            $(annotation).trigger mouseenterEvent, ['test']

            $(e.target).fadeOut 50
            $(e.target).fadeIn 50

          domEl.mouseleave (e) => # unhover behaviour
            mouseleaveEvent = jQuery.Event "mouseleave"
            debugger unless annotation
            $(annotation).trigger mouseleaveEvent, ['test']

          domEl.click -> #click behaviour - highlight the related widgets by adding a class to them
            limeplayer.player.pause()
            for i of annotation.widgets
              unless i is "AnnotationOverlays"
                widgets = annotation.widgets[i]
                widgets.addClass("highlighted").delay(2000).queue (next) ->
                  $(@).removeClass "highlighted"
                  next()

          annotation.widgets.AnnotationOverlays = domEl
          domEl
      jQuery(annotation).bind "becomeInactive", (e) =>
        annotation = e.annotation
        if annotation.end is 5
          console.info annotation
        if annotation.isSpacial and (annotation.w > 0) and (annotation.h > 0)
          annotation.widgets.AnnotationOverlays.remove()
          delete annotation.widgets.AnnotationOverlays
        else
          false

  renderAnnotation: (annotation) ->
    #percent values for overlays
    #console.info("rendering", annotation);
    if annotation.ldLoaded
      props = annotation.entity[annotation.resource.value]
      label = _(props["http://www.w3.org/2000/01/rdf-schema#label"])
      .detect((labelObj) =>
        labelObj.lang is @lime.options.preferredLanguage
      ).value
    label = ""  if label is `undefined`

    #label will be put inside the spacial annotation
    unit = if annotation.isPercent then "%" else "px"
    "<div class='spatial_annotation' style='position: absolute; width: " + annotation.w + unit + "; height: " + annotation.h + unit + "; left: " + annotation.x + unit + "; top: " + annotation.y + unit + "'>" + label + "</div>"


#AnnotationOverlaysComponent VideoJS component -  displays overlays on top of video
_V_.AnnotationOverlaysComponent = _V_.Component.extend(
  options:
    loadEvent: "play"

  init: (player, options) ->
    @_super player, options
    @player.AnnotationOverlaysComponent = this


  #attach Component for sidebar annotations to player
  createElement: -> #we create a "annotation-overlays-wrapper" div which will hold the overlays written in via jQuery
    d = _V_.createElement("div",
      className: "annotation-overlays-wrapper"
    )
    d

  fadeIn: ->
    @_super()

  fadeOut: ->
    @_super()

  lockShowing: ->
    @el.style.opacity = "1"
)