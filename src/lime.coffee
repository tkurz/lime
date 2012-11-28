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
  constructor: (opts) ->
    cmf = new CMF "http://connectme.salzburgresearch.at/CMF"
    # Define the default options
    options =
      # The container DOM element to use
      containerDiv: "mainwrapper"
      # Dimensions for the player
      videoPlayerSize: {"width": 640, "height": 360}
      # Array of Annotation instances
      annotations: []
      # LMF URL
      annotFrameworkURL: "http://labs.newmedialab.at/SKOS/"
      # list of allowed widgets TODO Add possibility for defining configuration
      plugins: {
        TestPlugin: {}
      },
      # autodetecting
      platform: "web"
      # toggle true/false
      fullscreen: false
      # how big should be the annotation areas surrounding the video
      fullscreenLayout: "AnnotationNorth": 50, "AnnotationWest": 300, "AnnotationSouth": 50, "AnnotationEast": 300
      widgetContainers: [{element: jQuery('#widget-container-1'), orientation: 'vertical'}]
      # space used by annotations TODO: Why is this an option? Shouldn't it be a state (simply an instance variable) [Szaby]
      usedSpaceNWSE: "north": 0, "west": 0, "south": 0, "east": 0
      annotationsVisible : true
      debug: false
      preferredLanguage: "en"
      builtinPlugins:
        AnnotationOverlays: {}
        LDPlugin: {}
    @options = $.extend options, opts

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

  getLength: ->
    @player.duration()

  seek: (pos) ->
    if pos isnt undefined
      @player.currentTime pos

  currentTime: ->
    @player.currentTime()
  play: ->
    @player.play()

  _startScheduler: ->
    ### handle becomeActive and becomeInactive events ###
    jQuery(@).bind 'timeupdate', (e) ->
      for annotation in @annotations
        currentTime = e.currentTime
        if annotation.state is 'inactive' and annotation.start < currentTime and annotation.end + 1 > currentTime
          # has to be activated
          annotation.state = 'active'
          jQuery(annotation).trigger jQuery.Event "becomeActive", annotation: annotation #signal to a particular annotation to become active
        if annotation.state is 'active' and (annotation.start > currentTime or annotation.end + 1 < currentTime)
          annotation.state = 'inactive'
          jQuery(annotation).trigger jQuery.Event "becomeInactive", annotation: annotation #signal to a particular annotation to become inactive

  _initVideoPlayer: (cb) ->
    displaysrc=''
    for locator, i in @options.video
      displaysrc = displaysrc + "<source src=#{locator.source} type='#{locator.type}' />"
    # create center div with player, <video> id is 'videoplayer' - this gets passed to the VideoJS initializer
    $("##{@options.containerDiv}").append """
      <div class='videowrapper' id='videowrapper'>
        <video id='video_player' class='video-js vjs-default-skin' controls preload='none' width='640' height='360' poster='img/connectme-video-poster.jpg'>
          #{displaysrc}
        </video>
      </div>
      <div class="annotation-wrapper" id="annotation-wrapper" style="display: none;">
      <div class="north fullscreen-annotation" style="height: #{@options.fullscreenLayout.AnnotationNorth}px"></div>
        <div class="west fullscreen-annotation" style="height: #{@options.fullscreenLayout.AnnotationSouth}px"></div>
        <div class="east fullscreen-annotation" style="height: #{@options.fullscreenLayout.AnnotationEast}px"></div>
        <div class="south fullscreen-annotation" style="height: #{@options.fullscreenLayout.AnnotationNorth}px"></div>
      </div>
    """

    # width="' + options.VideoPlayerSize.width+'" height="' + options.VideoPlayerSize.height + '"
    _.defer =>
      @player = _V_ 'video_player',
        flash: iFrameMode: true
        swf: "lib/videojs/video-js.swf"	# SORIN - added to fix flash fallback bug
      @player.addEvent "loadedmetadata", =>
        # @player.addComponent 'Annotations', player: @player
        @_initEventListeners()
        cb()
      @player.ready =>
        # SORIN - adding Sidebars component to VideoJS, as well as the annotation toggler
        @player.isFullScreen = @options.fullscreen
        @_nonfullscreen_containers = LimePlayer.widgetContainers
        @player.addComponent("AnnotationsSidebars")  # add component to display 4 regions of annotations
        @player.controlBar.addComponent("AnnotationToggle")	# add button to toggle annotations on/off in the control bar
        if(!@player.isFullScreen)
          @player.AnnotationsSidebars.hide()
        else
          _this.player.AnnotationsSidebars.show()
        # END added SORIN
        @player.play()
        console.info "Setting up VideoJS Player", @player

  _initEventListeners: ->
    @player.addEvent 'timeupdate', (playerEvent) =>
      # console.info playerEvent
      e = jQuery.Event "timeupdate", currentTime: @player.currentTime()
      jQuery(@).trigger e
    @player.addEvent 'fullscreenchange', (e) =>
      fsce = jQuery.Event 'fullscreenchange', isFullScreen: @player.isFullScreen
      jQuery(@player).trigger fsce
      @_moveWidgets @player.isFullScreen


  _loadAnnotations: (cb) ->
    console.info "Loading annotations from LMF"
    @annotations = @options.annotations
    cb()
    ###
    query = """
      PREFIX oac: <http://www.openannotation.org/ns/>
      PREFIX ma: <http://www.w3.org/ns/ma-ont#>
      SELECT ?annotation ?fragment ?resource ?relation
      WHERE { <#{@options.video[0]}>  ma:hasFragment ?f.
         ?f ma:locator ?fragment.
         ?annotation oac:target ?f.
         ?annotation oac:body ?resource.
         ?f ?relation ?resource.
      }
    """
    uri = "#{@options.annotFrameworkURL}sparql/select?query=#{encodeURIComponent(query)}&output=json"
    $.getJSON uri, (data) =>
      # $.getJSON "annotations.json", (data) =>
      list = data.results.bindings
      # list = _.filter list, (el) ->
        # el.annotation.value in ["http://connectme.at/annotation/f06b99c2fd576042facae4225cb9fed2", "http://connectme.at/annotation/577e5d16435dfc2a0d24223926477f82"]
      for i, annotation of list
        @annotations.push new Annotation annotation
      console.info "Annotations loaded from", uri, @annotations
      cb()
    ###
  _moveWidgets: (isFullscreen) ->
    # added SORIN - toggle the annotations between fullscreen and normal screen
    console.log("fullscreen", isFullscreen, ", Visible "+LimePlayer.options.annotationsVisible);
    if isFullscreen and LimePlayer.options.annotationsVisible		# entering fullscreen, switching to 4 fixed annotation areas
      LimePlayer.widgetContainers = [
        {element:jQuery('.west'), orientation:'vertical'}
        {element:jQuery('.north'), orientation:'horizontal'}
        {element:jQuery('.east'), orientation:'vertical'}
        {element:jQuery('.south'), orientation:'horizontal'}
      ]
      LimePlayer.player.AnnotationsSidebars.show() # show annotation sidebars as overlays
    else # restoring non-fullscreen view, using originally declared containers
      LimePlayer.widgetContainers = @_nonfullscreen_containers
      LimePlayer.player.AnnotationsSidebars.hide() # hiding sidebars
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
  allocateWidgetSpace: (options) -> # creates DOM elements for widgets
    if options and options.preferredContainer and @_hasFreeSpace options.preferredContainer, options
      container = options.preferredContainer
    else
      container = _(@widgetContainers).detect (cont) =>
        #console.log("widget container" + _this._hasFreeSpace(cont, options));
        @_hasFreeSpace cont, options
    if container
      container.element.prepend "<div class='lime-widget'></div>"
      res = jQuery ".lime-widget:first", container.element
      console.info 'widgetspace allocated', res[0]
      res
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
    maxHeight = parseInt (container.element.css("max-height"))
    # console.log(maxHeight,currentHeight, $(window).height());
    if (not maxHeight) || (maxHeight is NaN)
      maxHeight = $(window).height() - 300
    # if(LIMEPlayer.player.isFullScreen) maxHeight =
    # console.log(maxHeight,currentHeight);
    if maxHeight - currentHeight < 200
      return false
    # console.log(container.element.children().height());
    else
      return true

  getAnnotationsFor: (uri, cb) ->

class window.Annotation
  constructor: (hash) ->
    @annotation = hash.annotation.value
    # default start and end
    @start = 0
    @end = -1 # -1 means end of movie
    @state = 'inactive'
    @widgets = {} #stores what plugins use this annotation; hash of plugin: [widgets]
    jQuery(@).bind "mouseenter", (e) =>
      for widgetname, widget of @widgets
        jQuery(widget).addClass "hover"
    jQuery(@).bind "mouseleave", (e) =>
      for widgetname, widget of @widgets
        jQuery(widget).removeClass "hover"
    if hash.fragment.type = 'uri'
      @fragment = new URI hash.fragment.value
      fragmentHash = @fragment.hash
      t = fragmentHash.match /t=([0-9,]*)/
      if t
        # t= "2,5" or "2"
        t = t[1]
        # startEnd = ["2,5", "2", "5"] or ["2", "2"]
        startEnd = t.match /([0-9]{1,})/g
        if startEnd
          @start = Number startEnd[0]
          @end = Number(startEnd[1]) || -1

      xywh = fragmentHash.match /xywh=([a-z0-9,:]*)/
      if xywh
        @isPercent = xywh[1].indexOf('percent') isnt -1
        # convert the matches to numbers
        [@x,@y,@w,@h] = _(xywh[1].match(/([0-9]{1,})/g)).map (n) -> Number n
    @isSpacial = @x isnt undefined or (@x is @y is @w is @h is 0)

    @resource = new URI hash.resource.value
    @relation = new URI hash.relation.value
  toString: ->
    @resource.value

class URI
  constructor: (uri) ->
    @value = decodeURIComponent uri
    hash = uri.match(/^.*?#([a-zA-Z0-9,&=:]*)$/)
    if hash
      @hash = hash[1]
    else
      @hash = ''
    @type = 'uri'
  toString: ->
    @value

# ## Abstract Lime Plugin
class window.LimePlugin
  constructor: (@lime, options) ->
    @options = jQuery.extend options, @defaults
    @init()
  defaults: {}
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
      # annotation
      jQuery(annotation).bind 'becomeActive', (e) =>
        console.info e.target, 'became active'
        domEl = @lime.allocateWidgetSpace()
        if domEl
          domEl.html "<a href='#{e.target.resource}' target='_blank'>#{e.target.resource}</a>"
          if e.target.ldLoaded
            domEl.html @renderAnnotation e.target
          else
            jQuery(e.target).bind 'ldloaded', (e2) =>
              domEl.html @renderAnnotation e2.target
          e.target.widgets.TestPlugin = domEl
        else
          # debugger
      jQuery(annotation).bind "becomeInactive", (e) =>
        console.info e.target, 'became inactive'
        e.target.widgets.TestPlugin.remove()
        if e.target.widgets
          delete e.target.widgets.TestPlugin
        else
          debugger
        # TODO implement release-space / kill a widget

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