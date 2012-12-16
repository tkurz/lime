class window.AnnotationOverlays extends window.LimePlugin
  init: ->
    @initSpacialAnnotations()
    @initTimeAnnotations()
    @initConceptOverlay()

  initSpacialAnnotations: ->
    console.info "Initialize SpacialAnnotationOverlays"
    # @lime.player.addComponent "SpacialAnnotationOverlaysComponent"
    @spacialAnnotationOverlay = jQuery "<div class='spacial-annotation-overlays-wrapper'></div>"
    @lime.player.videoOverlay.append @spacialAnnotationOverlay
    #add separate VideoJS component that holds overlays
    # @lime.player.SpacialAnnotationOverlaysComponent.show()
    container = jQuery ".spacial-annotation-overlays-wrapper", @lime.player.el

    #div created by the SpacialAnnotationOverlaysComponent component of VideoJS
    limeplayer = @lime
    jQuery(@lime.player).bind "timeupdate", (e) ->

    for annotation in @lime.annotations
      # Annotation event listener
      jQuery(annotation).bind "becomeActive", (e) =>
        annotation = e.annotation
        # console.info 'active', annotation
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
                widget = annotation.widgets[i]
                widget.addClass("highlighted").delay(2000).queue (next) ->
                  $(@).removeClass "highlighted"
                  next()

          annotation.widgets.AnnotationOverlays = domEl
          domEl
      jQuery(annotation).bind "becomeInactive", (e) =>
        annotation = e.annotation
        # console.info 'inactive', annotation
        if annotation.end is 5
          console.info annotation
        if annotation.isSpacial and (annotation.w > 0) and (annotation.h > 0)
          annotation.widgets.AnnotationOverlays.remove()
          delete annotation.widgets.AnnotationOverlays
        else
          false

  initTimeAnnotations: ->
    console.info "Initialize TimeAnnotationOverlays"
    # @lime.player.controlBar.progressControl.addComponent "TimeAnnotationOverlaysComponent"

    container = @lime.player.timelineOverlay

    # container is the DOM element for collecting the annotations on the timeline
    # container = jQuery ".time-annotation-overlays-wrapper", @lime.player.controlBar.progressControl.el
    # place all annotations on the timeline

    fullLength = @lime.player.getLength()
    console.info 'length', fullLength

    for annotation in @lime.annotations
      leftPercent = annotation.start / fullLength * 100
      container.prepend "<div class='time-annotation' style='left:#{leftPercent}%;'>&nbsp;</div>"
      domEl = jQuery '.time-annotation:first', container
      jQuery(domEl).data 'annotation', annotation

      domEl.click (e) =>
        annotation = jQuery(e.target).data().annotation
        # Jump to the beginning of the fragment
        @lime.player.seek annotation.start
        @lime.player.play()

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
    @conceptOverlayEl = jQuery "<div class='concept-overlay concept-list-overlay'></div>"
    @lime.player.videoOverlay.append @conceptOverlayEl
    @conceptOverlayEl.hide()
    jQuery(@conceptOverlayEl).mouseenter =>
      @showConceptOverlay()
    jQuery(@conceptOverlayEl).mouseleave =>
      @hideConceptOverlay()

  showConceptOverlay: ->
    if @hideTimeoutHandle
      clearTimeout @hideTimeoutHandle
      @hideTimeoutHandle = undefined
    @conceptOverlayEl.show()
    # @conceptOverlayEl.show()
  hideConceptOverlay: ->
    @hideTimeoutHandle = setTimeout =>
      @conceptOverlayEl.hide()
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
      res += "<tr><td class='icon'>"
      res += "<img src='#{ann.getDepiction()}' style='height:20px;' />" if ann.getDepiction()
      res += """
        </td>
        <td class='timeframe'>
          #{@timeformat(ann.start)} - #{@timeformat(ann.end)}
        </td>
        <td class='label'>
      """
      if ann.getPage
        res += "<a href='#{ann.getPage()}'>#{ann.getLabel()}</a>"
      else
        res += "<span>#{ann.getLabel?() or ann}</span>"
      res += "</td></tr>"
    res = jQuery """
      <table class="navlist">#{res}</table>
    """
    jQuery('li:first',res).addClass('active')
    res.html()
  timeformat: (s) ->
    x = s
    s = x % 60
    x = (x - s) / 60
    m = x % 60
    h = (x - m) / 60
    res = ""
    res += "#{h}:" if h
    res += "#{m}:#{s}"



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
