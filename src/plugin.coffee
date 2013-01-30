# ## Abstract Lime Plugin
class window.LimePlugin
  constructor: (@lime, options) ->
    @options = jQuery.extend {}, @defaults, options
    @init()
  defaults:
    # The preferredContainer is going to be used for allocating the widget space.
    preferredContainer: null
  widgets: []
  # The init method has to be overwritten by each plugin.
  init: ->
    console.error "All Lime plugins have to implement the init method!"

# # Simple reference Lime plugin called TestPlugin
# This plugin listens for annotations becoming active and inactive and
class window.TestPlugin extends window.LimePlugin
# The init method is called right after initialisation of the player
  init: ->
    console.info "Initialize TestPlugin"
    jQuery(@lime).bind 'timeupdate', (e) =>  # timeupdate event is triggered by the VideoJS -> $(LimePlayer)
      # console.info 'plugin timeupdate event', e.currentTime
    for annotation in @lime.annotations
      jQuery(annotation).bind 'becomeActive', (e) =>
        annotation = e.target
        console.info annotation, 'became active'
        domEl = @lime.allocateWidgetSpace()
        if domEl
          domEl.html "<a href='#{annotation.resource}' target='_blank'>#{annotation.resource}</a>"
          if annotation.ldLoaded
            domEl.html @renderAnnotation annotation
            jQuery(domEl).slideDown 500
          else
            jQuery(annotation).bind 'ldloaded', (e2) =>
              annotation = e2.target
              domEl.html @renderAnnotation annotation
              jQuery(domEl).slideDown 500
          annotation.widgets.TestPlugin = domEl
        else
          # debugger
      jQuery(annotation).bind "becomeInactive", (e) =>
        annotation = e.target
        console.info annotation, 'became inactive'
        annotation.widgets.TestPlugin.remove()
        if annotation.widgets
          delete annotation.widgets.TestPlugin
        else
          debugger

  renderAnnotation: (annotation) ->
    # console.info "rendering", annotation
    props = annotation.entity # [annotation.resource.value]
    label = annotation.getLabel()

    depiction = annotation.getDepiction()
    page = annotation.getPage()
    # console.info label, depiction
    """
    <p>
    <a href="#{page}" target="_blank">#{label}</a>
    </p>
    <p>
    <img src="#{depiction}" width="200"/>
    </p>
    """
