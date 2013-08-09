class window.VideoPlugin extends window.LimePlugin
  init: ->
    @name = 'VideoPlugin'
    console.info "Initialize #{@name}"
    for annotation in @lime.annotations
      if annotation.resource.value.indexOf("dbpedia.org") > 0 and annotation.relation.value in ['http://connectme.at/ontology#explicitlyShows', 'http://connectme.at/ontology#explicitlyMentions', 'http://connectme.at/ontology#implicitlyShows' , 'http://connectme.at/ontology#implicitlyMentions']
        @handleAnnotation annotation

  # Putting this into a function keeps the annotation in the context
  handleAnnotation: (annotation) ->
    # console.info "The annotation #{annotation.resource} looks interesting, get the whole entity so we can show it in a widget!", annotation
    annotation.entityPromise.done =>
      # console.info "entities for annotation #{annotation.resource} loaded, create a widget for it!", annotation
      nonConcept = annotation.getDescription()
      nonConcept = nonConcept.replace("No description found.","")
      if(nonConcept.length >= 3)
        #if(@getLSIVideos annotation)
        console.log "++++++ I should render a LSI video widget"
        widget = @lime.allocateWidgetSpace @,
          thumbnail: "img/youtube.png" # should go into CSS
          title: "#{annotation.getLabel()} Videos"
          type: "VideoWidget"
          sortBy: ->
            10000 * annotation.start + annotation.end

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
          # @getModalContainer().html @showAbstractInModalWindow annotation
          @showAbstractInModalWindow annotation, @getModalContainer()

        # Hang the widget on the annotation
        annotation.widgets[@name] = widget

        jQuery(annotation).bind "becomeActive", (e) =>
          if (annotation.lsiVideoResources)
              if(annotation.lsiVideoResources.length > 0)
                #attached gogle analytics stack push for active annotation
                try
                  eventActiveLabel = e.target.widgets[@name].options.title
                  eventCategory = @name
                  _gaq.push ['_trackEvent',eventCategory,'becameActive',eventActiveLabel]
                catch error
                annotation.widgets[@name].setActive()

        jQuery(annotation).bind "becomeInactive", (e) =>
          #attached gogle analytics stack push for inactive annotation
          try
            eventActiveLabel = e.target.widgets[@name].options.title
            eventCategory = @name
            _gaq.push ['_trackEvent',eventCategory,'becomeInactive',eventActiveLabel]
          catch error
          annotation.widgets[@name].setInactive()




        jQuery(widget).bind "leftarrow", (e) =>
          @videotabsiterator = if @videotabs.length is @videotabsiterator + 1 then 0 else @videotabsiterator + 1

          if (@videotabsiterator == 0)
            $("#video1").trigger 'click'

          if (@videotabsiterator == 1)
            $("#video2").trigger 'click'
            #$("#video2").addClass 'selected'
          if (@videotabsiterator == 2)
            $("#video3").trigger 'click'
            #$("#video3").addClass 'selected'
          if (@videotabsiterator == 3)
            $("#video4").trigger 'click'
            #$("#video4").addClass 'selected'

        jQuery(widget).bind "rightarrow", (e) =>
          @videotabsiterator = if @videotabsiterator is 0 then @videotabs.length - 1  else @videotabsiterator - 1
          $('.videotab.selected').removeClass 'selected'
          if (@videotabsiterator == 0)
            $("#video1").trigger 'click'
            #$("#video1").addClass 'selected'
          if (@videotabsiterator == 1)
            $("#video2").trigger 'click'
            #$("#video2").addClass 'selected'
          if (@videotabsiterator == 2)
            $("#video3").trigger 'click'
            #$("#video3").addClass 'selected'
          if (@videotabsiterator == 3)
            $("#video4").trigger 'click'
            #$("#video4").addClass 'selected'

  getLSIVideos: (annotation) ->
    @lime.cmf.getLSIVideosForTerm annotation.resource.value, (err, res) =>
      if err
        console.warn "Error getting LSI Video resources", err
      else
        console.info "LSI resources for", annotation, res
        annotation.lsiVideoResources = _(res).map (resultset) ->
          entity =
            title: resultset.title.value
            #description: resultset.description.value
            #duration: Number(resultset.duration.value)
            locator: resultset.locator.value
            img: resultset.img.value
            video: resultset.video.value
          entity

        annotation.getLsiVideoResources = ->
          @lsiVideoResources



  # Widget-specific detail-rendering
  showAbstractInModalWindow: (annotation, outputElement) ->
    modalContent = $(outputElement)
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
    #url = url.split('=')[1]
    url = url.split('v=')[1];
    url = url.split('&')[0];
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

    $("#video1").click ->
      $('.videotab.selected').removeClass 'selected'
      url = videoList[0].locator;
      url = url.split('v=')[1];
      url = url.split('&')[0];
      $("#embededVideo").empty()
      $("#embededVideo").attr 'src',"http://www.youtube.com/embed/#{url}?autoplay=1"
      $(".expandedwidget-videoicon").css "background-image","url('img/youtube.png')"
      $("#expandedwidget-videoicon1").css "background-image","url('img/youtube_gr.png')"
      $("#video1").addClass 'selected'

    $("#video2").click ->
      $('.videotab.selected').removeClass 'selected'
      url = videoList[1].locator;
      url = url.split('=')[1];
      $("#embededVideo").empty()
      $("#embededVideo").attr 'src',"http://www.youtube.com/embed/#{url}?autoplay=1"
      $(".expandedwidget-videoicon").css "background-image","url('img/youtube.png')"
      $("#expandedwidget-videoicon2").css "background-image","url('img/youtube_gr.png')"
      $("#video2").addClass 'selected'

    $("#video3").click ->
      $('.videotab.selected').removeClass 'selected'
      url = videoList[2].locator;
      url = url.split('=')[1];
      $("#embededVideo").empty()
      $("#embededVideo").attr 'src',"http://www.youtube.com/embed/#{url}?autoplay=1"
      $(".expandedwidget-videoicon").css "background-image","url('img/youtube.png')"
      $("#expandedwidget-videoicon3").css "background-image","url('img/youtube_gr.png')"
      $("#video3").addClass 'selected'

    $("#video4").click ->
      $('.videotab.selected').removeClass 'selected'
      url = videoList[3].locator;
      url = url.split('=')[1];
      $("#embededVideo").empty()
      $("#embededVideo").attr 'src',"http://www.youtube.com/embed/#{url}?autoplay=1"
      $(".expandedwidget-videoicon").css "background-image","url('img/youtube.png')"
      $("#expandedwidget-videoicon4").css "background-image","url('img/youtube_gr.png')"
      $("#video4").addClass 'selected'

    $("#video1").trigger "click"

    console.log "videoList -", videoList
