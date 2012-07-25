### Linked Media Player

* handles the VideoJS player instance
* fetches the annotations from the `options.annotFrameworkURL` SPARQL endpoint
* Instantiate Plugins

###
class window.LIMEPlayer
  constructor: (opts) ->
    options = # default values
      containerDiv: "mainwrapper"
      videoPlayerSize: {"width": 640, "height": 360}
      vPlayer: "VideoJS"
      annotFrameworkURL: "http://labs.newmedialab.at/SKOS/" # LMF URL
      plugins: [TestPlugin] # list of allowed widgets
      platform: "web" # autodetecting
      fullscreen: "false" # toggle true/false
      fullscreenLayout: "AnnotationNorth": 50, "AnnotationWest": 300, "AnnotationSouth": 50, "AnnotationEast": 300 # how big should be the annotation areas surrounding the video
      widgetContainers: [{element: jQuery('#widget-container-1'), orientation: 'vertical'}]
      usedSpaceNWSE: "north": 0, "west": 0, "south": 0, "east": 0 # space used by annotations
      annotationsVisible : true
      timeInterval: 1000
    @options = $.extend options, opts

    @_prepareWidgetContainers()

    @_initVideoPlayer =>
      @_loadAnnotations =>
        @_initPlugins =>
          @_startScheduler()

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
    for source, i in @options.video
      displaysrc = displaysrc + "<source src=#{source} type='video/#{source.match(/.([a-z|A-Z|0-9]*)$/)[1]}' />"
    # create center div with player, <video> id is 'videoplayer' - this gets passed to the VideoJS initializer
    $("##{@options.containerDiv}").append """
      <div class='videowrapper' id='videowrapper'>
        <video id='video_player' class='video-js vjs-default-skin' controls preload='none' width='640' height='360' poster='img/connectme-video-poster.jpg'>
          #{displaysrc}
        </video>
        <div class="annotation-wrapper" id="annotation-wrapper" style="display:none;">
          <div class="north fullscreen-annotation"></div>
          <div class="south fullscreen-annotation"></div>
          <div class="east fullscreen-annotation"></div>
          <div class="west fullscreen-annotation"></div>
        </div>
      </div>
    """
    # width="' + options.VideoPlayerSize.width+'" height="' + options.VideoPlayerSize.height + '"
    _.defer =>
      @player = _V_('video_player', flash: iFrameMode: true)
      # _V_.options.flash.iFrameMode = true;  //fixes fullscreen issue for the Flash player - http://help.videojs.com/discussions/problems/1550-flash-version-fullscreen-doesnt-resume-at-current-timestamp
      @player.addEvent "loadedmetadata", =>
        # @player.addComponent 'Annotations', player: @player
        @_initEventListeners()
        cb()
      @player.ready =>
        @player.play()
        console.info "Setting up VideoJS Player", @player

  _initEventListeners: ->
    @player.addEvent 'timeupdate', (playerEvent) =>
      # console.info playerEvent
      e = jQuery.Event "timeupdate", currentTime: @player.currentTime()
      jQuery(@).trigger e
    @player.addEvent 'fullscreenchange', (e) =>
      console.info 'fullscreenchange', e
      @_moveWidgets @player.isFullScreen


  _loadAnnotations: (cb) ->
    console.info "Loading annotations from LMF"
    @annotations = []
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
    $.getJSON @options.annotFrameworkURL + "sparql/select?query=" + encodeURIComponent(query) + "&output=json", (data) =>
      list = data.results.bindings
      for i, annotation of list
        @annotations.push new Annotation annotation
      cb()
  _moveWidgets: (isFullscreen) ->
    console.info "_moveWidgets", isFullscreen

  _initPlugins: (cb) ->
    @plugins = []
    for pluginClass in @options.plugins
      @plugins.push new pluginClass @
    cb()


  _prepareWidgetContainers: ->
    @widgetContainers = @options.widgetContainers

  allocateWidgetSpace: (options) -> # creates DOM elements for widgets
    container = _(@widgetContainers).detect (cont) =>
      @_hasFreeSpace cont, options
    if container
      container.element.prepend "<div class='lime-widget'>123</div>"
      jQuery('.lime-widget:first', container.element)
    else
      no

  _hasFreeSpace: (container, options) ->
    true

  getAnnotationsFor: (uri, cb) ->

class Annotation
  constructor: (hash) ->
    @annotation = hash.annotation.value
    # default start and end
    @start = 0
    @end = -1 # -1 means end of movie
    @state = 'inactive'
    @widgets = {} #stores what plugins use this annotation; hash of plugin: [widgets]
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

### Abstract Lime Plugin ###
class window.LimePlugin
  constructor: (@lime) ->
    @init()
  init: ->
    console.error "All Lime plugins have to implement the init method!"

# Simple reference Lime plugin
class window.TestPlugin extends window.LimePlugin
  init: ->
    console.info "Initialize TestPlugin"
    console.info "annotations", @lime.annotations
    jQuery(@lime).bind 'timeupdate', (e) =>  # timeupdate event is triggered by the VideoJS -> $(LimePlayer)
      # console.info 'plugin timeupdate event', e.currentTime
    for annotation in @lime.annotations
      # annotation
      jQuery(annotation).bind 'becomeActive', (e) =>
        console.info e.annotation, 'became active'
        domEl = @lime.allocateWidgetSpace()
        if domEl
          domEl.html "<a href='#{e.annotation.resource}'>#{e.annotation.resource}</a>"
          if e.annotation.ldLoaded
            domEl.html @renderAnnotation e.annotation
          else
            jQuery(e.annotation).bind 'ldloaded', (e2) =>
              domEl.html @renderAnnotation e.annotation
          e.annotation.widgets.TestPlugin = domEl
        else
          debugger
      jQuery(annotation).bind "becomeInactive", (e) =>
        console.info e.annotation, 'became inactive'
        e.annotation.widgets.TestPlugin.remove()
        delete e.annotation.widgets.TestPlugin
        # TODO implement release-space / kill a widget

  renderAnnotation: (annotation) ->
    console.info "rendering", annotation
    props = annotation.entity[annotation.resource.value]
    console.info props
    label = _(props['http://www.w3.org/2000/01/rdf-schema#label'])
    .detect (labelObj) ->
      labelObj.lang is 'en'
    .value

    depiction = props['http://xmlns.com/foaf/0.1/depiction']?[0].value
    # depiction = props['http://dbpedia.org/ontology/thumbnail']?[0].value
    page = props['http://xmlns.com/foaf/0.1/page']?[0].value
    console.info label, depiction
    """
        <p>
          <a href="#{page}" target="_blank">#{label}</a>
        </p>
        <p>
          <img src="#{depiction}" width="200"/>
        </p>
    """