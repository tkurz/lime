class window.MediaPlugin extends window.LimePlugin
  init: ->
    @name = 'MediaPlugin'
    console.info "Initialize #{@name}"
    for annotation in @lime.annotations
      if annotation.resource.value.indexOf("dbpedia") > 0
        @handleAnnotation annotation

  defaults:
    activityTypes: [
      '<http://dbpedia.org/page/Category:Sledding>'
      '<http://dbpedia.org/page/Category:Winter_sports>'
      '<http://dbpedia.org/page/Category:Racing_sports>'
      '<http://dbpedia.org/class/yago/LeisureActivities>'
      '<http://dbpedia.org/page/Category:Leisure_activities>'
      '<http://dbpedia.org/page/Category:Mountain_biking>'
      '<http://dbpedia.org/page/Category:Rock_climbing>'
      '<http://dbpedia.org/page/Category:Paragliding>'
      '<http://dbpedia.org/page/Category:Archery>'
      '<http://dbpedia.org/page/Category:Olympic_sports>'
      '<http://dbpedia.org/class/yago/ActorsFromCalifornia>'
      '<http://dbpedia.org/class/yago/WhitewaterSports>'
      '<http://dbpedia.org/page/Category:Whitewater_sports>'
      '<http://dbpedia.org/page/Category:Rafting>'
    ]

  # Putting this into a function keeps the annotation in the context
  handleAnnotation: (annotation) ->
    # console.info "The annotation #{annotation.resource} looks interesting, get the whole entity so we can show it in a widget!", annotation
    annotation.entityPromise.done =>
      unless @vie
        @vie = annotation.vie
        @vie.namespaces.add
          umbel: 'http://umbel.org/umbel/rc/'
        @vie.use new @vie.DBPediaService
      if annotation.resource.value.indexOf('dbpedia') isnt -1
        entity = @vie.entities.get annotation.resource.value
        @_loadFullDbpediaEntity entity, (fullEntity) =>
          #console.log fullEntity
          # @processAnnotation annotation, fullEntity.attributes['@type']
          @processAnnotation annotation, fullEntity

  processAnnotation: (annotation, fullEntity) ->
    #console.log "mediaplugin - ", fullEntity
    if _.intersection(fullEntity.attributes['@type'], @options.activityTypes).length or _.intersection(fullEntity.attributes['dcterms:subject'], @options.activityTypes).length
      # There's at least one type in common
      console.info 'Render Media widget'
      widgetType = 'MediaWidget'
      widget = @_initWidget annotation, fullEntity, widgetType, @renderMedia,
        thumbnail: "img/youtube.png" # should go into CSS
        title: "#{annotation.getLabel()}"
        type: widgetType
        sortBy: ->
          10000 * annotation.start + annotation.end


  renderMedia: (annotation, fullEntity, container) =>
    modalContent = jQuery(container)
    modalContent.css "width", "600px"
    modalContent.css "height", "auto"
    startTime = new Date().getTime()
    ###
    -- added 29.apr.2013

    the videoList represents a result of a quary like this to the CMF:
            PREFIX mao: <http://www.w3.org/ns/ma-ont#>
            SELECT DISTINCT ?video
            WHERE {
              ?video a <http://www.w3.org/ns/ma-ont#VideoTrack> .
              ?video mao:description ?text .
              ?video mao:locator ?url .
              ?video mao:hasKeyword <http://dbpedia.org/resource/Sledding> .
            }
            ORDER BY ?video
    it should have the followind object structure:
    videoList = [
                    {
                      description: "text description", [string]
                      duration: 95.0, [flaot]
                      locator: "https://www.youtube.com/watch?v=tzBRpNI1Mck", [string]
                      title: "Nachtrodeln Schladming - Rohrmoos Hochwurzen Schlittenfahren", [string]
                      img: "http://i.ytimg.com/vi/tzBRpNI1Mck/0.jpg", [string]
                      kasKeyword: {"http://dbpedia.org/resource/Sledding", "http://dbpedia.org/resource/Schladming", "http://dbpedia.org/resource/Planai"} [array of string]
                    },
                    {
                      description: "Hochwurzen 1850 m.",
                      duration: "596.0",
                      locator: "https://www.youtube.com/watch?v=AXgZ98Z9EFw",
                      title: "Schladming- rodeln-Puzanje 2012.AVI",
                      img: "http://i.ytimg.com/vi/AXgZ98Z9EFw/0.jpg",
                      kasKeyword: {"http://dbpedia.org/resource/Sledding", "http://dbpedia.org/resource/Schladming", "http://dbpedia.org/resource/Hochwurzen"}
                    },
                    ...
                  ]

    ###

    videoList = [{
    description: "Nachtrodeln auf der ca. 6,3 km langen Rodelbahn von der Bergstation der Hochwurzen Gipfelbahn bis zur Talstation in Rohrmoos. Mit 4 sch??nen urigen H??tten - H...",
    duration: "95.0",
    locator: "https://www.youtube.com/watch?v=tzBRpNI1Mck",
    title: "Nachtrodeln Schladming - Rohrmoos Hochwurzen Schlittenfahren",
    img: "http://i.ytimg.com/vi/tzBRpNI1Mck/0.jpg",
    kasKeyword: {"http://dbpedia.org/resource/Sledding", "http://dbpedia.org/resource/Schladming", "http://dbpedia.org/resource/Planai"}
    },
      {
      description: "Hochwurzen 1850 m.",
      duration: "596.0",
      locator: "https://www.youtube.com/watch?v=AXgZ98Z9EFw",
      title: "Schladming- rodeln-Puzanje 2012.AVI",
      img: "http://i.ytimg.com/vi/AXgZ98Z9EFw/0.jpg",
      kasKeyword: {"http://dbpedia.org/resource/Sledding", "http://dbpedia.org/resource/Schladming", "http://dbpedia.org/resource/Hochwurzen"}

      },
      {
      description: "Rodeln vom Feinsten auf der Hochwurzen ( Planai / Schladming). Musste Video leider auf 10min k??rzen. Fahrt dauerte 12min!",
      duration: "600.0",
      locator: "https://www.youtube.com/watch?v=zOzeGapneoY",
      title: "Rodeln Hochwurzen",
      img: "http://i.ytimg.com/vi/zOzeGapneoY/0.jpg",
      kasKeyword: {"http://dbpedia.org/resource/Sledding", "http://dbpedia.org/resource/Hochwurzen"}
      },
      {
      description: "Ein Ausschnitt aus der Helmkamera vom Rodeln im J??nner 2013. Kamerafahrt wurde nicht von mir gemacht...Ich bin der gefilmte =) Musik: Ski or die - Snowboard ...",
      duration: "55.0",
      locator: "https://www.youtube.com/watch?v=AWK9lkChVpA",
      title: "Rodelbahn Hochwurzen, Sturz (Helmkamera)",
      img: "http://i.ytimg.com/vi/AWK9lkChVpA/0.jpg",
      kasKeyword: {"http://dbpedia.org/resource/Sledding"}
      }
    ]
    videoList = annotation.getLsiVideoResources()
    url = videoList[0].locator
    url = url.split('=')[1]
    ###
     -- added 29.apr.2013
      UI handles the first 4 videoList items for now.
    ###

    result = """
             <div id="videoWidgetExpanded" style="border-top: 1px dotted lightgray; position: relative; width: 600px; height: auto;">
             <div id="videoArea" style="left: 0px; top: 0px; width: 600px; position: relative; height: 450px; background-color: #f16f6f; float: left;">
             <iframe id="embededVideo" width="600" height="450" style="margin: 0 auto; display: block;" src="http://www.youtube.com/embed/#{url}?autoplay=1" frameborder="0" allowfullscreen>
             <p>Your browser does not support iframes.</p>
             </iframe>
             </div>
             """
    if (videoList.length == 2)
      result +="""<div id="videoList" style="background-color: #0a0a0a; position: relative; float: left; width: 600px; height: 150px;">
               <div id="video1" class="videotab" style="border: 1px solid black; position: relative; float: right; width: 298px; height: 148px; background-color: #9b9393; background-repeat: no-repeat; background-position: center center; background-size: cover; background-image: url('#{videoList[0].img}');">
               <div id="expandedwidget-videoicon1" style="position: absolute; z-index: 900; width: 50px; height: 50px; bottom: 0px; left: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover;" class="expandedwidget-videoicon"></div>
               </div>
               <div id="video2" class="videotab" style="border: 1px solid black; position: relative; float: right; width: 298px; height: 148px; background-color: #9b9393; background-image: url('#{videoList[1].img}'); background-repeat: no-repeat; background-position: center center; background-size: cover;">
               <div id="expandedwidget-videoicon2" style="width: 50px; height: 50px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover; position: absolute; z-index: 900; left: 0px;" class="expandedwidget-videoicon"></div>
               </div>
               <div id="video3" class="videotab disabled" style="display:none; border: 1px solid black; position: relative; float: right; width: 198px; height: 148px; background-color: #9b9393; background-repeat: no-repeat; background-position: center center; background-size: cover; background-image: url('#{videoList[2].img}');">
               <div id="expandedwidget-videoicon3" style="width: 50px; height: 50px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover; position: absolute; z-index: 900; left: 0px;" class="expandedwidget-videoicon"></div>
               </div>
               <div id="video4" class="videotab disabled" style="display: none; border: 1px solid black; position: relative; float: right; width: 148px; height: 148px; background-color: #9b9393; background-repeat: no-repeat; background-position: center center; background-size: cover; background-image: url('#{videoList[3].img}');">
               <div id="expandedwidget-videoicon4" style="width: 50px; height: 50px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover; position: absolute; z-index: 900; left: 0px;" class="expandedwidget-videoicon"></div>
               </div>
               </div>
               """
    if (videoList.length == 3)
      result +="""<div id="videoList" style="background-color: #0a0a0a; position: relative; float: left; width: 600px; height: 150px;">
               <div id="video1" class="videotab" style="border: 1px solid black; position: relative; float: right; width: 198px; height: 148px; background-color: #9b9393; background-repeat: no-repeat; background-position: center center; background-size: cover; background-image: url('#{videoList[0].img}');">
               <div id="expandedwidget-videoicon1" style="position: absolute; z-index: 900; width: 50px; height: 50px; bottom: 0px; left: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover;" class="expandedwidget-videoicon"></div>
               </div>
               <div id="video2" class="videotab" style="border: 1px solid black; position: relative; float: right; width: 198px; height: 148px; background-color: #9b9393; background-image: url('#{videoList[1].img}'); background-repeat: no-repeat; background-position: center center; background-size: cover;">
               <div id="expandedwidget-videoicon2" style="width: 50px; height: 50px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover; position: absolute; z-index: 900; left: 0px;" class="expandedwidget-videoicon"></div>
               </div>
               <div id="video3" class="videotab" style="border: 1px solid black; position: relative; float: right; width: 198px; height: 148px; background-color: #9b9393; background-repeat: no-repeat; background-position: center center; background-size: cover; background-image: url('#{videoList[2].img}');">
               <div id="expandedwidget-videoicon3" style="width: 50px; height: 50px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover; position: absolute; z-index: 900; left: 0px;" class="expandedwidget-videoicon"></div>
               </div>
               <div id="video4" class="videotab disabled" style="display: none; border: 1px solid black; position: relative; float: right; width: 148px; height: 148px; background-color: #9b9393; background-repeat: no-repeat; background-position: center center; background-size: cover; background-image: url('#{videoList[3].img}');">
               <div id="expandedwidget-videoicon4" style="width: 50px; height: 50px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover; position: absolute; z-index: 900; left: 0px;" class="expandedwidget-videoicon"></div>
               </div>
               </div>
               """
    if (videoList.length >= 4)
      result +="""<div id="videoList" style="background-color: #0a0a0a; position: relative; float: left; width: 600px; height: 150px; ">
               <div id="video1" class="videotab" style="border: 1px solid black; position: relative; float: right; width: 147px; height: 148px; background-color: #9b9393; background-repeat: no-repeat; background-position: center center; background-size: cover; background-image: url('#{videoList[0].img}');">
               <div id="expandedwidget-videoicon1" style="position: absolute; z-index: 900; width: 50px; height: 50px; bottom: 0px; left: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover;" class="expandedwidget-videoicon"></div>
               </div>
               <div id="video2" class="videotab" style="border: 1px solid black; position: relative; float: right; width: 147px; height: 148px; background-color: #9b9393; background-image: url('#{videoList[1].img}'); background-repeat: no-repeat; background-position: center center; background-size: cover;">
               <div id="expandedwidget-videoicon2" style="width: 50px; height: 50px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover; position: absolute; z-index: 900; left: 0px;" class="expandedwidget-videoicon"></div>
               </div>
               <div id="video3" class="videotab" style="border: 1px solid black; position: relative; float: right; width: 147px; height: 148px; background-color: #9b9393; background-repeat: no-repeat; background-position: center center; background-size: cover; background-image: url('#{videoList[2].img}');">
               <div id="expandedwidget-videoicon3" style="width: 50px; height: 50px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover; position: absolute; z-index: 900; left: 0px;" class="expandedwidget-videoicon"></div>
               </div>
               <div id="video4" class="videotab" style=" border: 1px solid black; position: relative; float: right; width: 147px; height: 148px; background-color: #9b9393; background-repeat: no-repeat; background-position: center center; background-size: cover; background-image: url('#{videoList[3].img}');">
               <div id="expandedwidget-videoicon4" style="width: 50px; height: 50px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover; position: absolute; z-index: 900; left: 0px;" class="expandedwidget-videoicon"></div>
               </div>
               </div>
               """

    result +=""" </div>
             """
    modalContent.append result

    #widget controls
    $(".close").click (e) =>
      endTime = new Date().getTime()
      timeSpent = endTime - startTime
      eventLabel = annotation.widgets[@name].options.title
      try
        _gaq.push ['_trackEvent', @name, 'viewed', eventLabel, timeSpent]
        _gaq.push ['_trackTiming', @name, eventLabel, timeSpent, 'viewed']
      catch error

    $('#mask').click (e) =>
      endTime = new Date().getTime()
      timeSpent = endTime - startTime
      eventLabel = annotation.widgets[@name].options.title
      try
        _gaq.push ['_trackEvent', @name, 'viewed', eventLabel, timeSpent]
        _gaq.push ['_trackTiming', @name, eventLabel, timeSpent, 'viewed']
      catch error

    #count the video tabs and init the iterator
    @videotabs = $('.videotab:not(.disabled)')
    @videotabsiterator = 0

    jQuery("#video1").click ->
      jQuery('.videotab.selected').removeClass 'selected'
      url = videoList[0].locator;
      url = url.split('=')[1];
      jQuery("#embededVideo").empty()
      jQuery("#embededVideo").attr 'src',"http://www.youtube.com/embed/#{url}?autoplay=1"
      jQuery(".expandedwidget-videoicon").css "background-image","url('img/youtube.png')"
      jQuery("#expandedwidget-videoicon1").css "background-image","url('img/youtube_gr.png')"
      jQuery("#video1").addClass 'selected'

    jQuery("#video2").click ->
      jQuery('.videotab.selected').removeClass 'selected'
      url = videoList[1].locator;
      url = url.split('=')[1];
      jQuery("#embededVideo").empty()
      jQuery("#embededVideo").attr 'src',"http://www.youtube.com/embed/#{url}?autoplay=1"
      jQuery(".expandedwidget-videoicon").css "background-image","url('img/youtube.png')"
      jQuery("#expandedwidget-videoicon2").css "background-image","url('img/youtube_gr.png')"
      jQuery("#video2").addClass 'selected'

    jQuery("#video3").click ->
      jQuery('.videotab.selected').removeClass 'selected'
      url = videoList[2].locator;
      url = url.split('=')[1];
      jQuery("#embededVideo").empty()
      jQuery("#embededVideo").attr 'src',"http://www.youtube.com/embed/#{url}?autoplay=1"
      jQuery(".expandedwidget-videoicon").css "background-image","url('img/youtube.png')"
      jQuery("#expandedwidget-videoicon3").css "background-image","url('img/youtube_gr.png')"
      jQuery("#video3").addClass 'selected'

    jQuery("#video4").click ->
      jQuery('.videotab.selected').removeClass 'selected'
      url = videoList[3].locator;
      url = url.split('=')[1];
      jQuery("#embededVideo").empty()
      jQuery("#embededVideo").attr 'src',"http://www.youtube.com/embed/#{url}?autoplay=1"
      jQuery(".expandedwidget-videoicon").css "background-image","url('img/youtube.png')"
      jQuery("#expandedwidget-videoicon4").css "background-image","url('img/youtube_gr.png')"
      jQuery("#video4").addClass 'selected'

    jQuery("#video1").trigger "click"

    #console.log "videoList -", videoList

  getLSIVideos: (annotation) ->
    @lime.cmf.getLSIVideosForTerm annotation.resource.value, (err, res) =>
      if err
        console.warn "Error getting LSI Video resources", err
      else
        #console.info "LSI resources for", annotation, res
        annotation.lsiVideoResources = _(res).map (resultset) ->
          entity =
            title: resultset.title.value
            description: resultset.description.value
            duration: Number(resultset.duration.value)
            locator: resultset.locator.value
            img: resultset.img.value
            video: resultset.video.value
          entity

        annotation.getLsiVideoResources = ->
          @lsiVideoResources

  _loadFullDbpediaEntity: (entity, callback) =>
    @vie.load(entity: entity.getSubject()).using('dbpedia').execute()
      .success (fullEntity) =>
        entity.set fullEntity
        callback fullEntity

  _getStarringList: (dbpediaResourceURI, callback) =>
    result = []
    query = """
            PREFIX foaf: <http://xmlns.com/foaf/0.1/>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX dcterms: <http://purl.org/dc/terms/>
            PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>
            PREFIX dbprop: <http://dbpedia.org/property/>
            PREFIX dbcat: <http://dbpedia.org/resource/Category:>
            PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
            SELECT DISTINCT ?show ?date WHERE {
            ?show dbprop:starring <#{dbpediaResourceURI}> .
            ?show <http://dbpedia.org/ontology/releaseDate> ?date .
            } ORDER BY DESC(?date)
            LIMIT 5
            """
    url = "http://dbpedia.org/sparql?query=" + escape(query) + "&format=json"
    $.getJSON url, callback
    return result


  _initWidget: (annotation, fullEntity, widgetType, renderMethod, widgetOptions) ->
    widget = @lime.allocateWidgetSpace @, widgetOptions

    @getLSIVideos annotation

    # We're going to need the annotation for the widget's `activate` event
    widget.annotation = annotation
    # widget was activated, we show details now
    jQuery(widget).bind 'activate', (e) =>
      try
        eventClickedLabel = e.target.options.title
        eventCategory = @name
        _gaq.push ['_trackEvent',eventCategory, 'clicked',eventClickedLabel]
      catch error
      renderMethod annotation,fullEntity , @getModalContainer()

    # Hang the widget on the annotation
    annotation.widgets[widgetType] = widget

    jQuery(annotation).bind "becomeActive", (e) =>
      if (annotation.lsiVideoResources)
        if(annotation.lsiVideoResources.length > 0)
          #attached gogle analytics stack push for active annotation
          try
            eventActiveLabel = e.target.widgets[@name].options.title
            eventCategory = @name
            _gaq.push ['_trackEvent',eventCategory,'becameActive',eventActiveLabel]
          catch error
          annotation.widgets[widgetType].setActive()

    jQuery(annotation).bind "becomeInactive", (e) =>
      #attached gogle analytics stack push for inactive annotation
      try
        eventActiveLabel = e.target.widgets[@name].options.title
        eventCategory = @name
        _gaq.push ['_trackEvent',eventCategory,'becomeInactive',eventActiveLabel]
      catch error
      annotation.widgets[widgetType].setInactive()

    jQuery(widget).bind "leftarrow", (e) =>
      @videotabsiterator = if @videotabs.length is @videotabsiterator + 1 then 0 else @videotabsiterator + 1

      if (@videotabsiterator == 0)
        jQuery("#video1").trigger 'click'

      if (@videotabsiterator == 1)
        jQuery("#video2").trigger 'click'
        #jQuery("#video2").addClass 'selected'
      if (@videotabsiterator == 2)
        jQuery("#video3").trigger 'click'
        #jQuery("#video3").addClass 'selected'
      if (@videotabsiterator == 3)
        jQuery("#video4").trigger 'click'
        #jQuery("#video4").addClass 'selected'

    jQuery(widget).bind "rightarrow", (e) =>
      @videotabsiterator = if @videotabsiterator is 0 then @videotabs.length - 1  else @videotabsiterator - 1
      jQuery('.videotab.selected').removeClass 'selected'
      if (@videotabsiterator == 0)
        jQuery("#video1").trigger 'click'
        #jQuery("#video1").addClass 'selected'
      if (@videotabsiterator == 1)
        jQuery("#video2").trigger 'click'
        #jQuery("#video2").addClass 'selected'
      if (@videotabsiterator == 2)
        jQuery("#video3").trigger 'click'
        #jQuery("#video3").addClass 'selected'
      if (@videotabsiterator == 3)
        jQuery("#video4").trigger 'click'
        #jQuery("#video4").addClass 'selected'

