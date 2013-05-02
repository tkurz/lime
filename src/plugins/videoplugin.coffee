class window.VideoPlugin extends window.LimePlugin
  init: ->
    @name = 'VideoPlugin'
    console.info "Initialize #{@name}"
    for annotation in @lime.annotations
      if annotation.resource.value.indexOf("dbpedia.org/resource/Sledding") > 0
        @handleAnnotation annotation

  # Putting this into a function keeps the annotation in the context
  handleAnnotation: (annotation) ->
    # console.info "The annotation #{annotation.resource} looks interesting, get the whole entity so we can show it in a widget!", annotation
    annotation.entityPromise.done =>
      # console.info "entities for annotation #{annotation.resource} loaded, create a widget for it!", annotation
      nonConcept = annotation.getDescription()
      nonConcept = nonConcept.replace("No description found.","")
      if(nonConcept.length >= 3)
        widget = @lime.allocateWidgetSpace @,
          thumbnail: "img/youtube.png" # should go into CSS
          title: "#{annotation.getLabel()} Videos"
          type: "VideoWidget"
          sortBy: ->
            10000 * annotation.start + annotation.end

        # We're going to need the annotation for the widget's `activate` event
        widget.annotation = annotation
        # widget was activated, we show details now
        jQuery(widget).bind 'activate', (e) =>
          # @getModalContainer().html @showAbstractInModalWindow annotation
          @showAbstractInModalWindow annotation, @getModalContainer()
        # Hang the widget on the annotation
        annotation.widgets[@name] = widget

        jQuery(annotation).bind "becomeActive", (e) =>
          annotation.widgets[@name].setActive()

        jQuery(annotation).bind "becomeInactive", (e) =>
          annotation.widgets[@name].setInactive()
    @getLSIVideos annotation

  getLSIVideos: (annotation) ->
    @lime.cmf.getLSIVideosForTerm annotation.resource.value, (err, res) =>
      if err
        console.warn "Error getting LSI Video resources", err
      else
        console.info "LSI resources for", annotation, res
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

  # Widget-specific detail-rendering
  showAbstractInModalWindow: (annotation, outputElement) ->
    modalContent = $(outputElement)
    modalContent.css "width", "600px"
    modalContent.css "height", "auto"
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
             <div id="videoWidgetExpanded" style="border: 1px dotted lightgray; position: relative; width: 600px; height: 600px;">
                <div id="videoArea" style="left: 0px; top: 0px; width: 600px; position: relative; height: 450px; background-color: #f16f6f; float: left;">
                <iframe id="embededVideo" width="600" height="450" style="margin: 0 auto; display: block;" src="http://www.youtube.com/embed/#{url}" frameborder="0" allowfullscreen>
                <p>Your browser does not support iframes.</p>
                </iframe>
                </div>
                <div id="videoList" style="background-color: #0a0a0a; position: relative; float: left; width: 600px; height: 150px;">
                    <div id="video1" style="border: 1px solid black; position: relative; float: right; width: 148px; height: 148px; background-color: #9b9393; background-repeat: no-repeat; background-position: center center; background-size: cover; background-image: url('#{videoList[0].img}');">
                        <div id="expandedwidget-videoicon1" style="position: absolute; z-index: 900; width: 50px; height: 50px; bottom: 0px; left: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube_gr.png'); background-size: cover;" class="expandedwidget-videoicon"></div>
                    </div>
                    <div id="video2" style="border: 1px solid black; position: relative; float: right; width: 148px; height: 148px; background-color: #9b9393; background-image: url('#{videoList[1].img}'); background-repeat: no-repeat; background-position: center center; background-size: cover;">
                        <div id="expandedwidget-videoicon2" style="width: 50px; height: 50px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover; position: absolute; z-index: 900; left: 0px;" class="expandedwidget-videoicon"></div>
                    </div>
                    <div id="video3" style="border: 1px solid black; position: relative; float: right; width: 148px; height: 148px; background-color: #9b9393; background-repeat: no-repeat; background-position: center center; background-size: cover; background-image: url('#{videoList[2].img}');">
                        <div id="expandedwidget-videoicon3" style="width: 50px; height: 50px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover; position: absolute; z-index: 900; left: 0px;" class="expandedwidget-videoicon"></div>
                    </div>
                    <div id="video4" style="border: 1px solid black; position: relative; float: right; width: 148px; height: 148px; background-color: #9b9393; background-repeat: no-repeat; background-position: center center; background-size: cover; background-image: url('#{videoList[3].img}');">
                        <div id="expandedwidget-videoicon4" style="width: 50px; height: 50px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover; position: absolute; z-index: 900; left: 0px;" class="expandedwidget-videoicon"></div>
                    </div>
                </div>
             </div>
             """
    modalContent.append result

    $("#video1").click ->
      url = videoList[0].locator;
      url = url.split('=')[1];
      $("#embededVideo").empty()
      $("#embededVideo").attr 'src',"http://www.youtube.com/embed/#{url}"
      $(".expandedwidget-videoicon").css "background-image","url('img/youtube.png')"
      $("#expandedwidget-videoicon1").css "background-image","url('img/youtube_gr.png')"

    $("#video2").click ->
      url = videoList[1].locator;
      url = url.split('=')[1];
      $("#embededVideo").empty()
      $("#embededVideo").attr 'src',"http://www.youtube.com/embed/#{url}"
      $(".expandedwidget-videoicon").css "background-image","url('img/youtube.png')"
      $("#expandedwidget-videoicon2").css "background-image","url('img/youtube_gr.png')"

    $("#video3").click ->
      url = videoList[2].locator;
      url = url.split('=')[1];
      $("#embededVideo").empty()
      $("#embededVideo").attr 'src',"http://www.youtube.com/embed/#{url}"
      $(".expandedwidget-videoicon").css "background-image","url('img/youtube.png')"
      $("#expandedwidget-videoicon3").css "background-image","url('img/youtube_gr.png')"

    $("#video4").click ->
      url = videoList[3].locator;
      url = url.split('=')[1];
      $("#embededVideo").empty()
      $("#embededVideo").attr 'src',"http://www.youtube.com/embed/#{url}"
      $(".expandedwidget-videoicon").css "background-image","url('img/youtube.png')"
      $("#expandedwidget-videoicon4").css "background-image","url('img/youtube_gr.png')"

    console.log "videoList -", videoList
