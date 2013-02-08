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


  # Create and give back a container element for rendering a detailed widget content in it.
  getModalContainer: ->
    modalContainer = @lime.modalContainer
    mask = @lime.modalMask

    # If not yet created, create them now
    unless modalContainer
      # Depending on fullscreen mode or not, put the modal container into the video overlay or into the body element
      if @lime.player.isFullscreen()
        @lime.player.videoOverlay.append("""<!-- Mask to cover the whole screen --><div id="lime-mask"></div>""")
        @lime.modalMask = jQuery('#lime-mask')

        @lime.player.videoOverlay.append """<div class="modal-container"></div>"""
        @lime.modalContainer = jQuery '.modal-container', @lime.player.videoOverlay
      else
        jQuery('body').append("""<!-- Mask to cover the whole screen --><div id="lime-mask"></div>""")
        @lime.modalMask = jQuery('#lime-mask')

        jQuery('body').append """<div class="modal-container"></div>"""
        @lime.modalContainer = jQuery 'body .modal-container'

      modalContainer = @lime.modalContainer
      mask = @lime.modalMask

      # Resize the modal container
      modalContainer.css
        height: "70%"
        "max-height": "500px"
        "max-width": "100%"

      #if mask is clicked
      mask.click (e) =>
        mask.hide()
        modalContainer.hide()
        modalContainer.empty()

      # when fullscreen state changes, the mask and the modal container has to be moved into the corresponding DOM element.
      jQuery(@lime.player).bind 'fullscreenchange', (e) =>
        if e.isFullScreen
          @lime.player.videoOverlay.append mask
          @lime.player.videoOverlay.append modalContainer
        else
          jQuery('body').append mask
          jQuery('body').append modalContainer

    mask = jQuery('#lime-mask')
    # Empty the modal container
    modalContainer.empty()
    modalContainer.show()
    mask.show()

    # Create contetn holders within the modal container
    modalContainer.append "<a href=\"#\" class=\"close\" role=\"button\"><img src=\"img/close-icon.png\" style=\"width: 22px; height: 22px;\"/></a>"
    modalContainer.append "<div class=\"modalContent\" style=\"height: 95%; width: 100%; position: relative; margin: 0 auto;\">"
    modalContainer.append "</div>"

    #Get the screen height and width
    maskHeight = jQuery(window).height()
    maskWidth = jQuery(window).width()

    #Set heigth and width to mask to fill up the whole screen
    mask.css
      width: maskWidth
      height: maskHeight


    #transition effect
    mask.fadeIn 100
    mask.fadeTo "fast", 0.8

    #Get the window height and width
    winH = jQuery(window).height()
    winW = jQuery(window).width()

    #Set the popup window to center
    modalContainer.css "top", winH / 2 - modalContainer.height() / 2
    modalContainer.css "left", winW / 2 - modalContainer.width() / 2

    #transition effect
    modalContainer.fadeIn 100

    #if close button is clicked
    jQuery(".close", modalContainer).click (e) =>

      #Cancel the link behavior
      e.preventDefault()
      mask.hide()
      modalContainer.hide()
      modalContainer.empty()

    jQuery(window).resize (e) =>

      #Get the screen height and width
      maskHeight = jQuery(document).height()
      maskWidth = jQuery(document).width()

      #Set height and width to mask to fill up the whole screen
      mask.css
        width: maskWidth
        height: maskHeight


      #Get the window height and width
      winH = jQuery(window).height()
      winW = jQuery(window).width()

      #Set the popup window to center
      modalContainer.css "top", winH / 2 - modalContainer.height() / 2
      modalContainer.css "left", winW / 2 - modalContainer.width() / 2
    return jQuery '.modalContent', modalContainer

# # Simple reference Lime plugin called TestPlugin
# This plugin listens for annotations becoming active and inactive and
class window.TestPlugin extends window.LimePlugin
  # The init method is called right after the initialisation of the player
  init: ->
    @name = 'TestPlugin'
    console.info "Initialize #{@name}"
    for annotation in @lime.annotations
      @handleAnnotation annotation

  # Putting this into a function keeps the annotation in the context
  handleAnnotation: (annotation) ->
    # console.info "The annotation #{annotation.resource} looks interesting, get the whole entity so we can show it in a widget!", annotation
    annotation.entityPromise.done (entities) =>
      widget = @lime.allocateWidgetSpace @,
        thumbnail: "img/info.png" # should go into CSS
        title: "#{annotation.getLabel()} Info"
        type: "DbpediaInfoWidget"
        sortBy: ->
          10000 * annotation.start + annotation.end

      # We're going to need the annotation for the widget's `activate` event
      widget.annotation = annotation
      # widget was activated, we show details now
      jQuery(widget).bind 'activate', (e) =>
        @getModalContainer().html @renderAnnotation annotation

      # Hang the widget on the annotation
      annotation.widgets[@name] = widget

      jQuery(annotation).bind "becomeActive", (e) =>
        annotation.widgets[@name].setActive()

      jQuery(annotation).bind "becomeInactive", (e) =>
        annotation.widgets[@name].setInactive()

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
