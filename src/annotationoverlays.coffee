class window.AnnotationOverlays extends window.LimePlugin
  init: ->
    @initSpacialAnnotations()
    @initTimeAnnotations()
    @initConceptOverlay()

  initSpacialAnnotations: ->
    console.info "Initialize SpacialAnnotationOverlays"
    @lime.player.addComponent "SpacialAnnotationOverlaysComponent"
    #add separate VideoJS component that holds overlays
    @lime.player.SpacialAnnotationOverlaysComponent.show()
    container = jQuery ".spacial-annotation-overlays-wrapper", @lime.player.el

    #div created by the SpacialAnnotationOverlaysComponent component of VideoJS
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
          jQuery(domEl).data 'annotation', annotation

          #get the DOM element that holds the overlay
          domEl.mouseenter (e) => # hover behaviour
            annotation = jQuery(e.target).data().annotation
            mouseenterEvent = jQuery.Event "mouseenter"
            $(annotation).trigger mouseenterEvent, ['test']

            $(e.target).fadeOut 50
            $(e.target).fadeIn 50

          domEl.mouseleave (e) => # unhover behaviour
            mouseleaveEvent = jQuery.Event "mouseleave"
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

  initTimeAnnotations: ->
    console.info "Initialize TimeAnnotationOverlays"
    @lime.player.controlBar.progressControl.addComponent "TimeAnnotationOverlaysComponent"

    #add separate VideoJS component that holds overlays
    @lime.player.TimeAnnotationOverlaysComponent.show()
    # container is the DOM element for collecting the annotations on the timeline
    container = jQuery ".time-annotation-overlays-wrapper", @lime.player.controlBar.progressControl.el
    # place all annotations on the timeline
    fullLength = @lime.getLength()
    console.info 'length', fullLength
    for annotation in @lime.annotations
      leftPercent = annotation.start / fullLength * 100
      container.prepend "<div class='time-annotation' style='left:#{leftPercent}%;'>&nbsp;</div>"
      domEl = jQuery '.time-annotation:first', container
      jQuery(domEl).data 'annotation', annotation

      domEl.click (e) =>
        annotation = jQuery(e.target).data().annotation
        # Jump to the beginning of the fragment
        @lime.seek annotation.start
        @lime.play()

      domEl.bind 'mouseenter', (e) =>
        annotation = jQuery(e.target).data().annotation
        mouseenterEvent = jQuery.Event "mouseenter"
        $(annotation).trigger mouseenterEvent, ['test']
        @fillConceptOverlay @renderConceptOverlay annotation
        @showConceptOverlay()

      domEl.mouseleave (e) =>
        annotation = jQuery(e.target).data().annotation
        mouseleaveEvent = jQuery.Event "mouseleave"
        $(annotation).trigger mouseleaveEvent, ['test']
        @hideConceptOverlay()

  initConceptOverlay: ->
    @lime.player.addComponent "ConceptOverlayComponent"
    @lime.player.ConceptOverlayComponent.hide()
    @conceptOverlayEl = jQuery ".concept-overlay", @lime.player.el
    jQuery(@conceptOverlayEl).mouseenter =>
      @showConceptOverlay()
    jQuery(@conceptOverlayEl).mouseleave =>
      @hideConceptOverlay()

  showConceptOverlay: ->
    if @hideTimeoutHandle
      clearTimeout @hideTimeoutHandle
      @hideTimeoutHandle = undefined
    @lime.player.ConceptOverlayComponent.show()
    # @conceptOverlayEl.show()
  hideConceptOverlay: ->
    @hideTimeoutHandle = setTimeout =>
      @lime.player.ConceptOverlayComponent.hide()
      @hideTimeoutHandle
    , 2000
    # @conceptOverlayEl.hide()
  fillConceptOverlay: (content) ->
    jQuery(@conceptOverlayEl).html content

  renderConceptOverlay: (annotation) ->
    currentTime = annotation.start
    activeAnnotations = _.filter @lime.annotations, (ann) ->
      ann.start <= currentTime and ann.end > currentTime
    activeAnnotations = _(activeAnnotations).sortBy (ann) ->
      0 - ann.start
    res = ""
    for ann in activeAnnotations
      res += """
      <li>
        <span>#{ann.getLabel()}</span>
      </li>
      """
    res = jQuery """
      <ul class="navlist">#{res}</ul>
    """
    jQuery('li:first',res).addClass('active')
    res.html()

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


#SpacialAnnotationOverlaysComponent VideoJS component -  displays overlays on top of video
_V_.SpacialAnnotationOverlaysComponent = _V_.Component.extend
  options:
    loadEvent: "play"

  init: (player, options) ->
    @_super player, options
    @player.SpacialAnnotationOverlaysComponent = this


  #attach Component for sidebar annotations to player
  createElement: -> #we create a "spacial-annotation-overlays-wrapper" div which will hold the overlays written in via jQuery
    _V_.createElement "div",
      className: "spacial-annotation-overlays-wrapper"

  fadeIn: ->
    @_super()

  fadeOut: ->
    @_super()

  lockShowing: ->
    @el.style.opacity = "1"

#TimeAnnotationOverlaysComponent VideoJS component -  displays overlays on top of video
_V_.TimeAnnotationOverlaysComponent = _V_.Component.extend
  options:
    loadEvent: "play"

  init: (player, options) ->
    @_super player, options
    @player.TimeAnnotationOverlaysComponent = this


  #attach Component for sidebar annotations to player
  createElement: -> #we create a "annotation-overlays-wrapper" div which will hold the overlays written in via jQuery
    _V_.createElement "div",
      className: "time-annotation-overlays-wrapper"

  fadeIn: ->
    @_super()

  fadeOut: ->
    @_super()

  lockShowing: ->
    @el.style.opacity = "1"

_V_.ConceptOverlayComponent = _V_.Component.extend
  options:
    loadEvent: "play"

  init: (player, options) ->
    @_super player, options
    @player.ConceptOverlayComponent = this


  #attach Component for sidebar annotations to player
  createElement: -> #we create a "annotation-overlays-wrapper" div which will hold the overlays written in via jQuery
    domEl = _V_.createElement "div",
      className: "concept-overlay concept-list-overlay"
    jQuery(domEl).html """
      <div class="navcontainer">
        <ul class="navlist">
          <li class="active">
            <a href="#" class="current">Item one</a>
          </li>
          <li>
            <a href="#">Item two</a>
          </li>
          <li>
            <a href="#">Item three</a>
          </li>
          <li>
            <a href="#">Item four</a>
          </li>
          <li>
            <a href="#">Item five</a>
          </li>
        </ul>
      </div>
    """
    domEl

  fadeIn: ->
    @_super()

  fadeOut: ->
    @_super()

  lockShowing: ->
    @el.style.opacity = "1"
