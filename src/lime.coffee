# # Linked Media Player

# * handles the VideoJS player instance
# * fetches the annotations from the `options.annotFrameworkURL` SPARQL endpoint
# * Instantiate Plugins

# ## Usage
#
#     LimePlayer = new LIMEPlayer({
#       video:[ "http://connectme.salzburgresearch.at/data/tourism_video.webm",
#         "http://connectme.salzburgresearch.at/data/tourism_video.ogv",
#         "https://s3-eu-west-1.amazonaws.com/yoo.120/connectme/6306_519_20120508125738_standard.mp4"],
#       containerDiv:"mainwrapper",
#       annotFrameworkURL:"http://labs.newmedialab.at/SKOS/",
#       plugins:[TestPlugin, LDPlugin, AnnotationOverlays],
#       widgetContainers:[
#         {element:jQuery('#widget-container-1'), orientation:'vertical'},
#         {element:jQuery('#widget-container-2'), orientation:'horizontal'}
#       ],
#     });
#
class window.LIMEPlayer
  ### maybe later...
  SCROLLING_LIST: 'scrolling-list'
  ACTIVE_ONLY: 'active-only'
  DELAYER_HIDE: 'delayed-hide'
  ###
  constructor: (opts) ->
    cmf = new CMF "http://connectme.salzburgresearch.at/CMF"
    # Define the default options.
    # Override any of these options when instantiating the player.
    options =
      # The container DOM element id to use
      containerDiv: "mainwrapper"

      # Dimensions for the player
      videoPlayerSize: {"width": 640, "height": 360}

      # The preferred user language
      preferredLanguage: "en"

      # Array of Annotation instances
      annotations: []

      # LMF URL
      annotFrameworkURL: "http://labs.newmedialab.at/SKOS/"

      # list of allowed widgets TODO Add possibility for defining configuration
      plugins: {
        TestPlugin: {}
      }

      # Define the array of widget types to be shown. Default: `null` means, everything is shown.
      # `[]` (empty array) means nothing is shown
      activeWidgetTypes: null

      # autodetecting
      platform: "web"

      # toggle true/false
      fullscreen: false

      # Set the way the player shows widgets
      # The `widgetVisibility` options are: 'scrolling-list', 'active-only', 'delayed-hide'
      # - 'scrolling-list': The player shows the full list of widgets for the entire video.
      #   It highlights the active ones and scrolls to them during playback.
      # - 'active-only': The player renders/shows the active widgets and hides them when the annotation becomes inactive
      # - 'delayed-hide': The player renders/shows the active widgets, Marks them as inactive when the annotation becomes
      #   inactive and hides them `hidingDelay` milliseconds later.
      widgetVisibility: 'scrolling-list'
      hidingDelay: 2000

      # how big should be the annotation areas surrounding the video
      fullscreenLayout: "AnnotationNorth": 50, "AnnotationWest": 300, "AnnotationSouth": 50, "AnnotationEast": 300
      widgetContainers: [{element: jQuery('#widget-container-1'), orientation: 'vertical'}]
      # space used by annotations TODO: Why is this an option? Shouldn't it be a state (simply an instance variable) [Szaby]
      usedSpaceNWSE: "north": 0, "west": 0, "south": 0, "east": 0
      annotationsVisible : true
      debug: false
      local: false
      builtinPlugins:
        AnnotationOverlays: {}
        LDPlugin: {}
      widget: {}
    @options = $.extend options, opts

    @widgets = []

    @widgetContainers = @options.widgetContainers

    # Run initialisation functions, depending on each other:
    # * Initialize the DOM for the player and set up VideoJS
    @_initVideoPlayer =>
      # * Load basic annotation list
      @_loadAnnotations =>
        # * Initialize plugins
        @_initPlugins =>
          # * Startup timeupdate event handler
          @_startScheduler()

  _startScheduler: ->
    ### handle becomeActive and becomeInactive events ###
    jQuery(@).bind 'timeupdate', (e) =>
      for annotation in @annotations
        currentTime = e.currentTime
        currentSrc = @player.currentSource()
        if currentSrc.indexOf(@_getFilename(annotation.fragment.value)) isnt -1
          if annotation.state is 'inactive' and annotation.start < currentTime and annotation.end + 1 > currentTime
            # has to be activated
            annotation.state = 'active'
            jQuery(annotation).trigger jQuery.Event "becomeActive", annotation: annotation #signal to a particular annotation to become active
          if annotation.state is 'active' and (annotation.start > currentTime or annotation.end + 1 < currentTime)
            annotation.state = 'inactive'
            jQuery(annotation).trigger jQuery.Event "becomeInactive", annotation: annotation #signal to a particular annotation to become inactive

  # Initialize the video player
  _initVideoPlayer: (cb) ->
    # Source locators
    displaysrc=''
    for locator, i in @options.video
      displaysrc = displaysrc + "<source src='#{locator.source}' type='#{locator.type}' />"

    # create center div with player, <video> id is 'videoplayer' - this gets passed to the VideoJS initializer
    $("##{@options.containerDiv}").append """
      <div class='videowrapper' id='videowrapper'>
        <video id='video_player' class='video-js vjs-default-skin' controls preload='metadata' width='#{@options.videoPlayerSize["width"]}' height='#{@options.videoPlayerSize["height"]}' poster='img/connectme-video-poster.jpg'>
          #{displaysrc}
        </video>
      </div>
    """
    ###
      <div class="annotation-wrapper" id="annotation-wrapper" style="display: none;">
        <div class="north fullscreen-annotation" style="height: #{@options.fullscreenLayout.AnnotationNorth}px"></div>
        <div class="west  fullscreen-annotation" style="height: #{@options.fullscreenLayout.AnnotationSouth}px"></div>
        <div class="east  fullscreen-annotation" style="height: #{@options.fullscreenLayout.AnnotationEast}px"></div>
        <div class="south fullscreen-annotation" style="height: #{@options.fullscreenLayout.AnnotationNorth}px"></div>
      </div>
    """
    ###

    # width="' + options.VideoPlayerSize.width+'" height="' + options.VideoPlayerSize.height + '"
    window.LIMEPlayer.VideoPlayerInit 'video_player', {}, (err, playerInstance) =>
      if err
        alert err
        return
      @player = playerInstance
      @_initEventListeners()

      # Create one container for widget in the fullscreen mode
      @fullscreenWidgetContainer = jQuery("<div class='fullscreen-annotation-wrapper'></div>")
      @player.videoOverlay.append @fullscreenWidgetContainer
      cb()

  _initEventListeners: ->
    jQuery(@player).bind 'timeupdate', (playerEvent) =>
      e = jQuery.Event "timeupdate", currentTime: @player.currentTime()
      jQuery(@).trigger e
    jQuery(@player).bind 'fullscreenchange', (e) =>
      @_moveWidgets e.isFullScreen

  # Call lime.filterVisibleWidgets([array active widget types]) to filter the widgets by type
  filterVisibleWidgets: (typeArray) ->
    # Remember the types
    @options.activeWidgetTypes = typeArray
    for plugin in @plugins
      for widget in plugin.widgets
        if widget.isActive
          @options.widgetVisibility()

  # Widget states are changed, update the display of them
  updateWidgetsList: _.throttle ->
    console.info "updateWidgetsList: scroll, hide, etc."
    # Sort widgets by starting and ending times
    widgetsSorted = _.sortBy @widgets, (widget) =>
      widget.options.sortBy()
    # Sort the widget's DOM elements
    # scroll to the first active widget
    for container in @widgetContainers
      unless jQuery(container).data().sorted
        widgetsEls = jQuery(container).find('.lime-widget')
        widgetsSorted = _.sortBy @widgets, (widgetEl) =>
          jQuery(widgetEl).data().widget?.options.sortBy()
        console.info "sorting", container
        for el in widgetsSorted
          jQuery(container).prepend el
        jQuery(container).data 'sorted', true

      if @options.widgetVisibility is 'scrolling-list'
        first = _.detect jQuery(container.element).children(), (widgetElement) =>
          widget = jQuery(widgetElement).data().widget
          widget?.isActive()
        if first
          console.info "First active widget found, scrollto", first, jQuery(first).position(), jQuery(first).position().top
          $(first).parent().scrollTo first
      else
        for widgetElement in jQuery(container.element).children()
          widget = jQuery(widgetElement).data().widget
          unless widget.isActive()
            widget.hide()
          # if @options.widgetVisibility is 'delayed-hide'

  , 100

  # according to options.widgetVisibility and the widget's isActive state.
  _isWidgetToBeShown: (widget) ->
    switch @options.widgetVisibility
      when 'scrolling-list'
        return yes
      when 'active-only', 'delayed-hide'
        if widget.isActive
          return yes
        else
          return no

    if @options.activeWidgetTypes is null then return yes
    return _.contains @options.activeWidgetTypes, widget.type

  _loadAnnotations: (cb) ->
    console.info "Loading annotations from LMF"
    src = @player.currentSource()
    @annotations = _.filter @options.annotations, (ann) =>
      src.indexOf(@_getFilename(ann.fragment.value)) isnt -1
    console.info "Relevant annotations:", @annotations
    cb()
  _moveWidgets: (isFullscreen) ->
    # added SORIN - toggle the annotations between fullscreen and normal screen
    console.log("fullscreen", isFullscreen, ", Visible "+LimePlayer.options.annotationsVisible);
    if isFullscreen and LimePlayer.options.annotationsVisible		# entering fullscreen, switching to 4 fixed annotation areas
      # remember for all widget containers which widgets belong to them and move the widgets into the
      # fullscreen widget container
      for widgetContainer in @widgetContainers
        widgetList = []
        for widgetEl in widgetContainer.element.find '.lime-widget'
          widgetList.push widgetEl
          @fullscreenWidgetContainer.append widgetEl
        widgetContainer.widgetList = widgetList

    else # restoring non-fullscreen view, using originally declared containers
      for widgetContainer in @widgetContainers
        widgetContainer.element.html ""
        # The widget container has the list of its widgets before changing to fullscreen mode
        for widgetEl in widgetContainer.widgetList
          # for widgetEl in widgetContainer.element.children()
          widgetContainer.element.append widgetEl
        widgetContainer.element.append '&nbsp;'
        jQuery(widgetContainer).data 'widgetList', null

      # The rest that's still in the fullscreen widget container goes where?
      ###
      for widgetEl in @fullscreenWidgetContainer.children()
        @fullscreenWidgetContainer.append widgetEl
      ###

    for annotation in LimePlayer.annotations # retrigger becomeActive event on each active annotation to force plugins to redraw
      if annotation.state is 'active' # to avoid duplicate display, we inactivate first, then reactivate them
        jQuery(annotation).trigger(jQuery.Event("becomeInactive", annotation: annotation))
        jQuery(annotation).trigger(jQuery.Event("becomeActive", annotation: annotation))
    # end added SORIN
    console.info "_moveWidgets", isFullscreen

  _initPlugins: (cb) ->
    @plugins = []
    for pluginClass, options of @options.builtinPlugins
      @plugins.push new window[pluginClass] @, options
    for pluginClass, options of @options.plugins
      @plugins.push new window[pluginClass] @, options
    cb()

  # options.preferredContainer can contain a widget container
  allocateWidgetSpace: (plugin, options) -> # creates DOM elements for widgets
    # Make sure the widget can keep track of the plugin
    unless plugin instanceof window.LimePlugin
      console.error "allocateWidgetSpace needs the first parameter to be the plugin itself requesting for the widget."

    container = null
    # Try to create the widget in the preferred container
    if options and options.preferredContainer and @_hasFreeSpace options.preferredContainer, options
      container = options.preferredContainer
      console.log("widget container" + container)
    else
      container = _(@widgetContainers).detect (cont) =>
        @_hasFreeSpace cont, options
      console.log("widget container" + container);
    unless container
      sorted = _.sortBy @widgetContainers, (cont) =>
        cont.element.height()
      container = sorted[0]
    if container
      container.element.prepend "<div class='lime-widget'></div>"
      domEl = jQuery ".lime-widget:first", container.element
      # console.info 'widgetspace allocated', domEl[0]
      opts = _(@options.widget).extend options
      res = new LimeWidget plugin, domEl, opts
      _.defer =>
        if @options.widgetVisibility is 'scrolling-list' and @_isWidgetToBeShown res
          res.render()
          @widgets.push res
          res.show()
          res.setInactive()
          @updateWidgetsList()
      return res
    else
      console.error "There's not enough space for a widget to be shown!"
      if @options.debug
        debugger
      return false
    ###
    container = _(@widgetContainers).detect (cont) =>
      @_hasFreeSpace cont, options
    if container
      container.element.prepend "<div class='lime-widget'>123</div>"
      jQuery('.lime-widget:first', container.element)
    else
      no
    ###
  _hasFreeSpace: (container, options) ->
    currentHeight = container.element.height()
    if(currentHeight >0)
       return true
    else
       return false

  play: ->
    @player.play()
  pause: ->
    @player.pause()
  seek: (pos) ->
    @player.seek(pos)

  _getFilename: (uri) ->
    regexp = new RegExp(/\/([^\/#]*)(#.*)?$/)
    uri.match(regexp)?[1]

(($) ->
  $.fn.goTo = ->
    $(this).parent().scrollTo this
    this # for chaining...
) jQuery