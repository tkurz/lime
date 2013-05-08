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
#         {element:$('#widget-container-1'), orientation:'vertical'},
#         {element:$('#widget-container-2'), orientation:'horizontal'}
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
      annotFrameworkURL: "http://connectme.salzburgresearch.at/CMF/"

      # list of allowed widgets TODO Add possibility for defining configuration
      plugins: {
        TestPlugin: {}
      }

      # Define the array of widget types to be shown. Default: `null` means, everything is shown.
      # `[]` (empty array) means nothing is shown
      activeWidgetTypes: null

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

      widgetContainers: [{element: $('#widget-container-1'), options: null}]
      annotationsVisible : true
      debug: false
      local: false
      builtinPlugins:
        AnnotationOverlays: {}
        LDPlugin: {}
      widget: {}
    @options = $.extend options, opts

    if typeof @options.containerDiv is "string"
      @el = $ "#" + @options.containerDiv
    else
      @el = $(@options.containerDiv)

    unless @el.length is 1
      console.error "LIMEPlayer options.containerDiv has to be a DOM element or the ID of a DOM element.", @options.containerDiv
      return

    @widgets = []
    @widgetContainers = @options.widgetContainers

    @cmf = new CMF @options.annotFrameworkURL

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
    $(@).bind 'timeupdate', (e) =>
      currentTime = e.currentTime or @player.currentTime()
      currentSrc = @player.currentSource()
      for annotation in @annotations
        if currentSrc.indexOf(@_getFilename(annotation.fragment.value)) isnt -1
          if annotation.state is 'inactive' and annotation.start <= currentTime and annotation.end + 1 > currentTime
            # has to be activated
            annotation.state = 'active'
            $(annotation).trigger $.Event "becomeActive", annotation: annotation #signal to a particular annotation to become active
          if annotation.state is 'active' and (annotation.start > currentTime or annotation.end + 1 < currentTime)
            annotation.state = 'inactive'
            $(annotation).trigger $.Event "becomeInactive", annotation: annotation #signal to a particular annotation to become inactive


  # Initialize the video player
  _initVideoPlayer: (cb) ->
    # Source locators
    displaysrc=''
    for locator, i in @options.video
      displaysrc = displaysrc + "<source src='#{locator.source}' type='#{locator.type}' />"
    console.log "dysplaysrc = ", displaysrc
    # create center div with player, <video> id is 'videoplayer' - this gets passed to the VideoJS initializer
    @el.append """
      <div class='videowrapper' id='videowrapper'>
        <video id='video_player' class='video-js vjs-default-skin' controls preload='metadata' width='#{@options.videoPlayerSize.width}' height='#{@options.videoPlayerSize.height}' poster='img/connectme-video-poster.jpg'>
          #{displaysrc}
        </video>
      </div>
    """
    @videoEl = $ 'video', @el
    console.info "Initializing the player"
    window.LIMEPlayer.VideoPlayerInit @videoEl[0], {}, (err, playerInstance) =>
      if err
        alert err
        return
      console.info "Player initialized"
      @player = playerInstance
      @_initEventListeners()

      # Create one container for widget in the fullscreen mode
      @fullscreenWidgetContainer = $("<div class='fullscreen-annotation-wrapper'></div>")
      @player.videoOverlay.append @fullscreenWidgetContainer
      cb()

  _initEventListeners: ->
    $(@player).bind 'timeupdate', (playerEvent) =>
      e = $.Event "timeupdate", currentTime: @player.currentTime()
      $(@).trigger e
    $(@player).bind 'fullscreenchange', (e) =>
      @_moveWidgets e.isFullScreen
    @initKeyEventsHandlers()

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
      unless $(container).data().sorted
        widgetsEls = $(container).find('.lime-widget')
        widgetsSorted = _.sortBy @widgets, (widgetEl) =>
          $(widgetEl).data().widget?.options.sortBy()
        console.info "sorting", container
        for el in widgetsSorted
          $(container).prepend el
        $(container).data 'sorted', true

      if @options.widgetVisibility is 'scrolling-list'
        first = _.detect $(container.element).children(), (widgetElement) =>
          widget = $(widgetElement).data().widget
          widget?.isActive()
        if first
          console.info "First active widget found, scrollto", first, $(first).position(), $(first).position().top
          $(first).parent().scrollTo first
          $('.nav-selected').removeClass 'nav-selected'
          $(first).addClass 'nav-selected'
      else
        for widgetElement in $(container.element).children()
          widget = $(widgetElement).data().widget
          unless widget.isActive()
            widget.hide()
          # if @options.widgetVisibility is 'delayed-hide'

  , 100

  # Initialize navigation key events.
  initKeyEventsHandlers: ->
    $(window).keydown (e) =>
      if @activeWidget
        event = null
        switch e.keyCode
          when 37
            event = $.Event 'leftarrow'
          when 38
            event = $.Event 'uparrow'
          when 39
            event = $.Event 'rightarrow'
          when 40
            event = $.Event 'downarrow'
          when 13
            event = $.Event 'select'
          when 178
            event = $.Event 'stop'
          when 179, 32
            event = $.Event 'playpause'
        if event
          $(@activeWidget).trigger event
        $(@activeWidget).trigger e
        if e.keyCode is 27
          if @modalContainer?.is(':visible')
            if history.pushState
              history.back()
            else
              @modalContainer.trigger $.Event 'close'


    # When loading the video, the player has to process all key events so navigation between widgets is possible.
    @claimKeyEvents @

    $(window).bind 'popstate', (event) =>
      console.log('pop: ' + event.originalEvent.state)
      if @modalContainer?.is(':visible')
        @modalContainer.trigger $.Event 'close'

    # If the down arrow was pressed, find the next or first active widget and make it active.
    $(@).bind 'downarrow', (e) =>
      console.info 'lime is the active widget and down arrow was pressed'
      activeWidgets = $('.lime-widget:not(.inactive)')
      activeWidget = activeWidgets.filter('.nav-selected')
      nrOfWidgets = activeWidgets.length
      index = activeWidgets.index(activeWidget)
      newIndex = if nrOfWidgets is index + 1 then 0 else index + 1
      activeWidget = $(activeWidgets[newIndex])
      @navActivateWidget activeWidget

    # If the up arrow was pressed, find the previous or first active widget and make it active.
    $(@).bind 'uparrow', (e) =>
      console.info 'lime is the active widget and up arrow was pressed', $('.lime-widget:not(.inactive)')
      activeWidgets = $('.lime-widget:not(.inactive)')
      activeWidget = activeWidgets.filter('.nav-selected')
      nrOfWidgets = activeWidgets.length
      index = activeWidgets.index(activeWidget)
      newIndex = if index is 0 then nrOfWidgets - 1 else index - 1
      activeWidget = $(activeWidgets[newIndex])
      @navActivateWidget activeWidget

    # If the select button was pressed, trigger a click event on it, this will extend its state.
    $(@).bind 'select', (e) =>
      console.info 'lime is the active widget and select was pressed', $('.lime-widget:not(.inactive)')
      activeWidgets = $('.lime-widget:not(.inactive)')
      activeWidget = activeWidgets.filter('.nav-selected')
      activeWidget.trigger 'click'

    $(@).bind 'playpause', (e) =>
      if @player.paused()
        @player.play()
      else
        @player.pause()

    $(@).bind 'rightarrow', (e) =>
      currentTime = @player.currentTime()
      futureAnnotations = _(@annotations).filter (ann) =>
        ann.start > currentTime
      firstFutureAnnotation = _(futureAnnotations).min (ann) =>
        ann.start
      @player.seek firstFutureAnnotation.start
      $(@player).trigger 'timeupdate'

    $(@).bind 'leftarrow', (e) =>
      currentTime = @player.currentTime()
      pastAnnotations = _(@annotations).filter (ann) =>
        ann.start < currentTime
      if pastAnnotations.length
        latestPastAnnotation = _(pastAnnotations).max (ann) =>
          ann.start
        @player.seek latestPastAnnotation.start
      else
        @player.seek 0
      $(@player).trigger 'timeupdate'

  # Arrow key events are processed by one component. If a widget is extended, then the widget. If not, the player.
  claimKeyEvents: (widget) ->
    @activeWidget = widget

  navActivateWidget: (widgetEl) ->
    $('.nav-selected').removeClass 'nav-selected'
    widgetEl.addClass 'nav-selected'

  # according to options.widgetVisibility and the widget's isActive state.
  _isWidgetToBeShown: (widget) ->
    if @options.activeWidgetTypes and not _(@options.activeWidgetTypes).contains(widget.options.type)
      return no
    switch @options.widgetVisibility
      when 'scrolling-list'
        return yes
      when 'active-only', 'delayed-hide'
        if widget.isActive
          return yes
        else
          return no

  _loadAnnotations: (cb) ->
    console.info "Loading annotations from LMF"
    src = @player.currentSource()
    @annotations = @options.annotations
    @annotations = _.filter @options.annotations, (ann) =>
      src.indexOf(@_getFilename(ann.fragment.value)) isnt -1
    @annotations = _.uniq @annotations,false, (item) =>
      [item.hash.resource.value, item.hash.fragment.value]

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
        $(widgetContainer).data 'widgetList', null

      # The rest that's still in the fullscreen widget container goes where?
      ###
      for widgetEl in @fullscreenWidgetContainer.children()
        @fullscreenWidgetContainer.append widgetEl
      ###

    for annotation in LimePlayer.annotations # retrigger becomeActive event on each active annotation to force plugins to redraw
      if annotation.state is 'active' # to avoid duplicate display, we inactivate first, then reactivate them
        # $(annotation).trigger($.Event("becomeInactive", annotation: annotation))
        $(annotation).trigger($.Event("becomeActive", annotation: annotation))
    # end added SORIN
    console.info "_moveWidgets", isFullscreen

  _initPlugins: (cb) ->
    @plugins = []
    for pluginClass, options of @options.builtinPlugins
      # @plugins.push new window[pluginClass] @, options
      @plugins.push new window[pluginClass] @, (@options[pluginClass] or {})
    for pluginClass, options of @options.plugins
      @plugins.push new window[pluginClass] @, options
    cb()

  # options.preferredContainer can contain a widget container
  allocateWidgetSpace: (plugin, options) -> # creates DOM elements for widgets
    # Make sure the widget can keep track of the plugin
    unless plugin instanceof window.LimePlugin
      console.error "allocateWidgetSpace needs the first parameter to be the plugin itself requesting for the widget."

    containers = []
    # Try to create the widget in the preferred container
    if options and plugin.options.preferredContainer and @_hasFreeSpace plugin.options.preferredContainer, options
      containers = [plugin.options.preferredContainer]
    else
      # no preferred container, then we'll see which ones have space
      containers = _(@widgetContainers).filter (cont) =>
        @_hasFreeSpace cont, options
    console.log("widget container", container);
    # If no container had space, we force to take space from one of the containers.
    unless containers.length
      containers = @widgetContainers

    # If at this point there are several containers, we chose the one that has the least widgets inside.
    containers = _.sortBy containers, (cont) =>
      cont.element.children().length
    container = containers[0]

    # We have our cwidget container, create the widget element
    if container.element
      container = container.element
    container.prepend "<div class='lime-widget'></div>"
    domEl = $ ".lime-widget:first", container
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

# Tools...

(($) ->
  $.fn.goTo = ->
    $(this).parent().scrollTo this
    this # for chaining...
) $