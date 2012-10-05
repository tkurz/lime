class window.AnnotationOverlays extends window.LimePlugin
  init: ->
    annotation = undefined
    _i = undefined
    _len = undefined
    _ref = undefined
    _results = undefined
    _this = this
    container = undefined
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
        #console.info(e.annotation, 'became active');
        if e.annotation.isSpacial and (e.annotation.w > 0) and (e.annotation.h > 0)
          annotation = e.annotation
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
            for i of e.annotation.widgets
              unless i is "AnnotationOverlays"
                widgets = e.annotation.widgets[i]
                widgets.addClass("lime-widget-highlighted").delay(2000).queue (next) ->
                  $(this).removeClass "lime-widget-highlighted"
                  next()


          e.annotation.widgets.AnnotationOverlays = domEl
          domEl
        else
          # debugger
          jQuery(annotation).bind "becomeInactive", (e) ->
            if e.annotation.isSpacial and (e.annotation.w > 0) and (e.annotation.h > 0)
              e.annotation.widgets.AnnotationOverlays.remove()
              delete e.annotation.widgets.AnnotationOverlays
            else
              false

  renderAnnotation: (annotation) ->
    depiction = undefined
    label = undefined
    page = undefined
    props = undefined
    _ref = undefined
    _ref1 = undefined
    percentpixel = "px"
    percentpixel = "%"  if annotation.isPercent

    #percent values for overlays
    #console.info("rendering", annotation);
    if annotation.ldLoaded
      props = annotation.entity[annotation.resource.value]
      label = _(props["http://www.w3.org/2000/01/rdf-schema#label"]).detect((labelObj) ->
        labelObj.lang is "en"
      ).value
    label = ""  if label is `undefined`

    #label will be put inside the spacial annotation
    "<div class='spatial_annotation' style='position: absolute; width: " + annotation.w + percentpixel + "; height: " + annotation.h + percentpixel + "; left: " + annotation.x + percentpixel + "; top: " + annotation.y + percentpixel + "'>" + label + "</div>"


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