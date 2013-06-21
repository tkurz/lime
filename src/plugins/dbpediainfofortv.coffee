class window.DBPediaInfoForTVPlugin extends window.LimePlugin
  init: ->
    @name = 'DBPediaInfoForTVPlugin'
    console.info "Initialize #{@name}"
    for annotation in @lime.annotations
      if annotation.resource.value.indexOf("dbpedia") > 0 and annotation.relation.value in ['http://connectme.at/ontology#explicitlyShows', 'http://connectme.at/ontology#explicitlyMentions', 'http://connectme.at/ontology#implicitlyShows' , 'http://connectme.at/ontology#implicitlyMentions']
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
          thumbnail: "img/info.png" # should go into CSS
          title: "#{annotation.getLabel()} Info"
          type: "DbpediaInfoForTVWidget"
          sortBy: ->
            10000 * annotation.start + annotation.end

        # We're going to need the annotation for the widget's `activate` event
        widget.annotation = annotation
        # widget was activated, we show details now
        jQuery(widget).bind 'activate', (e) =>
          # ataching google analytics
          try
            eventClickedLabel = e.target.options.title
            eventCategory = @name
            _gaq.push ['_trackEvent',eventCategory, 'clicked',eventClickedLabel]
          catch error
          @showAbstractInModalWindow annotation, @getModalContainer()

        # Hang the widget on the annotation
        annotation.widgets[@name] = widget

        jQuery(annotation).bind "becomeActive", (e) =>
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

        @getLSIImages annotation

        jQuery(widget).bind "leftarrow", (e) =>
          jQuery("#lefticon").trigger 'click'

        jQuery(widget).bind "rightarrow", (e) =>
          jQuery("#righticon").trigger 'click'


  getLSIImages: (annotation) ->
    @lime.cmf.getLSIImagesForTerm annotation.resource.value, (err, res) =>
      if err
        console.warn "Error getting LSI images resources", err
      else
        console.info "LSI resources for", annotation, res
        annotation.lsiImageResources = _(res).map (resultset) ->
          entity =
            image: resultset.image.value
          entity

        annotation.getLsiImagesResources = ->
          @lsiImageResources


  # Widget-specific detail-rendering
  showAbstractInModalWindow: (annotation, outputElement) ->
    modalContent = jQuery(outputElement)
    modalContent.css "width", "450px"
    modalContent.css "height", "auto"
    @index = 0
    startTime = new Date().getTime()
    label = annotation.getLabel()
    page = annotation.getPage()
    ###
    -- added 29.apr.2013 --
     LSIimages = list of images from the LSI that target the current annotation's DBPedia resource URI
     example:
     LAIImages = annotation.getLSIVideosFromTerm (annotation.resource.value,cb)

    a LSIImages can have the following structure:
    LSIImages = [
                  {
                  image:"imageURI",
                  hasKeyword: {"DBPedia resource URI 1", "DBPedia resource URI 2", "DBPedia resource URI 3", ... }
                  },

                  {
                  image:"imageURI",
                  hasKeyword: {"DBPedia resource URI 1", "DBPedia resource URI 2", "DBPedia resource URI 3", ... }
                  },
                  ...
                ]
    ###

    lime = this.lime
    comment = annotation.getDescription()
    maintext = comment
    pagetext = [];
    if (maintext.length >= 260)
      n = maintext.length
      if maintext.length >= 260
        tmptext = maintext.split(" ")
        n = tmptext.length
        textsum = ""
        i = 0
        for word in tmptext
          if textsum.length < 260
            textsum += word + " "
          else
            pagetext.push textsum
            textsum = ""

        maintext = pagetext[0]
    console.log pagetext


    depiction = annotation.getDepiction(without: 'thumb')
    if(depiction == null)
      depiction = "img/noimagenew.png"
    lsiImageList = annotation.getLsiImagesResources?() or []
    console.log "Asociated images ",label ,lsiImageList

    ###
      -- added 29.apr.2013 --
      Extend interface logic (below) to fit LSIImages by creating a new tile with 1 or more images
    ###
    if(pagetext.length < 1)
      result = """
               <div id="ifoWidgetExpanded" style="border: 1px dotted lightgray; position: relative;height: auto; width: 100%;">
               <div id="infoWidget" style="background-color: rgba(37, 37, 37, 0.7); height: 40px; left: 0px; width: 100%; position: relative; float: left;">
               <div class="infoWidgeticon" style="border-right: 1px dotted lightgray; position: relative; height: 100%; float: left; background-color: #3f3e3e; width: 8%;">
               <span id="iconLabel" style="font: Times; position: relative; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(82, 207, 255); font-family: 'Times New Roman',Times,serif; font-style: italic;">i</span>
               </div>
               <div class="infoWidgetTitle" style="font: Arial; position: relative; float: left; height: 100%; width: 86%; font-family: Arial,Helvetica,sans-serif; font-size: 26px; color: white; font-weight: normal; text-align: left; vertical-align: middle; text-indent: 1em; line-height: 140%;">
      #{label}</div>
               </div>
               <div id="infoText" style="padding: 10px; position: relative; float: left; background-color: rgba(68, 68, 68, 0.7); height: auto; font-style: normal; width: 96%;">
               <div id="infoTextBioTitle" style="font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: rgb(82, 207, 255); height: auto;">
               Info</div>
               <div id="infoMainTextContent" style="font: Helvetica; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; float: left; line-height: normal; position: relative; height: auto; width: 100%;">
      #{maintext}
               </div>
               </div>
               </div>
               """
      ###
      result = """
               <div id="infoWidgetExpanded" unselectable="on" style="-webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; position: relative; height: 600px; width: auto; ">
               <div id="infoMainText" style="position: relative; float: right; background-color: #242424; width: 300px; height: 300px; font-family: caviardreamsregular;">
               <span id="infoMainTextContent" >#{maintext}</span>
               <div style="position: absolute; z-index: 900; width: 100px; height: 50px; right: 0px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-size: contain; background-image: url('img/120px-DBpediaLogo.svg.png');"></div>
               </div>

               <div id="infoMainPicture" style="position: relative; float: right; width: 300px; height: 300px; background-color: #6ab1e7;">
               <div id="pic" style="position: relative; float: left; height: 100%; background-image: url('#{depiction}'); background-repeat: no-repeat; background-position: center center; background-size: cover; width: 100%;">
               <div id="icon" style="border-right: 1px dotted lightgray; float: left; background-color: #3f3e3e; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;">
               <span style="text-align:center; position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);">i</span>
               </div>
               </div>
               <div style="position: absolute; left: 0px; bottom: 0; width: 300px; height: 100px;">
               <div id="titlebackground" style="float: left; position: absolute; z-index: 900; width: 100%; bottom: 0px; background-color: #000000; left: 0px; top: 0px; height: 100%; opacity: 0.5;">
               </div>
               <span id="titletext" style="text-align:center; font-family: CaviarDreamsBold; font-size: 29px; line-height: 140%; position: absolute; z-index: 900; left: 5px; width: 100%; bottom: 0px; height: 100%; color: #fcf7f7; opacity: 1.0;">#{label}</span></div>
               </div>

               </div>
               """
      ###
    else
      ###
      result = """
               <div id="infoWidgetExpanded" unselectable="on" style="-webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; position: relative; height: 600px; width: auto; ">
               <div id="infoMainText" style="position: relative; float: right; background-color: #242424; width: 300px; height: 300px; font-family: caviardreamsregular;">
               <span id="infoMainTextContent" >#{pagetext[@index]}</span>
               <div style="position: absolute; z-index: 900; width: 100px; height: 50px; left: 0px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-size: contain; background-image: url('img/120px-DBpediaLogo.svg.png'); background-color: #3f3e3e;"></div>
               <div id="pageNumber" style="position: absolute; z-index: 900; width: 50px; height: 35px; left: 135px; bottom: 0px; background: transparent;">#{@index+1}/#{pagetext.length}</div>
               <div id="righticon" unselectable="on" style=" -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;cursor: hand; cursor: pointer; border-right: 1px dotted lightgray; background-color: #000000; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;">
               <span style="position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);">&gt;</span>
               </div>
               </div>

               <div id="infoMainPicture" style="position: relative; float: right; width: 300px; height: 300px; background-color: #6ab1e7;">
               <div id="pic" style="position: relative; float: left; height: 100%; background-image: url('#{depiction}'); background-repeat: no-repeat; background-position: center center; background-size: cover; width: 100%;">
               <div id="icon" style="border-right: 1px dotted lightgray; float: left; background-color: #3f3e3e; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;">
               <span style="position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);">i</span>
               </div>
               <div id="lefticon" unselectable="on" style="-webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; cursor: hand; cursor: pointer; display: none; border-left: 1px dotted lightgray; background-color: #000000; position: absolute; z-index: 9000; left: 0px; bottom: 0px; width: 50px; height: 50px;">
               <span style="position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);">&lt;</span>
               </div>
               </div>
               <div style="position: absolute; left: 0px; bottom: 0; width: 300px; height: 100px;">
               <div id="titlebackground" style="float: left; position: absolute; z-index: 900; width: 100%; bottom: 0px; background-color: #000000; left: 0px; top: 0px; height: 100%; opacity: 0.5;">
               </div>
               <span id="titletext" style="text-align:center; font-family: CaviarDreamsBold; font-size: 29px; line-height: 140%; position: absolute; z-index: 900; left: 5px; width: 100%; bottom: 0px; height: 100%; color: #fcf7f7; opacity: 1.0;">#{label}</span></div>
               </div>


               </div>
               """

      ###
      result = """
               <div id="ifoWidgetExpanded" style="border: 1px dotted lightgray; position: relative;height: auto; width: 100%;">
               <div id="infoWidget" style="background-color: rgba(37, 37, 37, 0.7); height: 40px; left: 0px; width: 100%; position: relative; float: left;">
               <div class="infoWidgeticon" style="border-right: 1px dotted lightgray; position: relative; height: 100%; float: left; background-color: #3f3e3e; width: 8%;">
               <span data-dojo-type="shapes.Text" id="iconLabel" style="font: Times; position: relative; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(82, 207, 255); font-family: 'Times New Roman',Times,serif; font-style: italic;">i</span>
               </div>
               <div class="infoWidgetTitle" style="font: Arial; position: relative; float: left; height: 100%; width: 86%; font-family: Arial,Helvetica,sans-serif; font-size: 26px; color: white; font-weight: normal; text-align: left; vertical-align: middle; text-indent: 1em; line-height: 140%;">
      #{label}</div>
               </div>
               <div id="infoText" style="padding: 10px; position: relative; float: left; background-color: rgba(68, 68, 68, 0.7); height: auto; font-style: normal; width: 96%;">
               <div id="infoTextBioTitle" style="font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: rgb(82, 207, 255); height: auto;">
               Info</div>
                 <div id="infoMainTextContent" style="font: Helvetica; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; float: left; line-height: normal; position: relative; height: auto; width: 100%;">
      #{pagetext[@index]}
                 </div>
               <div id="widgetControler" style="position: relative; height: 60px; width: 100%; float:left">
               </div>

               <div id="righticon" unselectable="on" style=" -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;cursor: hand; cursor: pointer; border-right: 1px dotted lightgray; background-color: #000000; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;">
               <span style="position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(82, 207, 255);">&gt;</span>
               </div>
               <div id="lefticon" unselectable="on" style="-webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; cursor: hand; cursor: pointer; display: none; border-left: 1px dotted lightgray; background-color: #000000; position: absolute; z-index: 9000; left: 0px; bottom: 0px; width: 50px; height: 50px;">
               <span style="position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(82, 207, 255);">&lt;</span>
               </div>
               <div id="pageNumber" style="position: absolute; z-index: 900; width: 50px; height: 35px; left: 45%; bottom: 0px; background: transparent;">#{@index+1}/#{pagetext.length}</div>
              </div>
              </div>
              """


    modalContent.append result

    #widget controls

    jQuery(".close").click (e) =>
      # measures how much time the expanded widget was on screen , in miliseconds
      endTime = new Date().getTime()
      timeSpent = endTime - startTime
      eventLabel = annotation.widgets[@name].options.title
      try
        _gaq.push ['_trackEvent', @name, 'viewed', eventLabel, timeSpent]
        _gaq.push ['_trackTiming', @name, eventLabel, timeSpent, 'viewed']
      catch error

    jQuery('#mask').click (e) =>
      # measures how much time the expanded widget was on screen , in miliseconds
      endTime = new Date().getTime()
      timeSpent = endTime - startTime
      eventLabel = annotation.widgets[@name].options.title
      try
        _gaq.push ['_trackEvent', @name, 'viewed', eventLabel, timeSpent]
        _gaq.push ['_trackTiming', @name, eventLabel, timeSpent, 'viewed']
      catch error

    jQuery('#righticon').click =>
      @index++
      if (@index == 1)
        jQuery('#lefticon').css "display", "block"
      #console.log "right icon click"
      if (@index >= pagetext.length-1)
        @index = pagetext.length - 1
        jQuery('#righticon').css "display", "none"
      maintext = pagetext[@index]
      jQuery("#infoMainTextContent").text maintext
      jQuery("#pageNumber").text "#{@index+1}/#{pagetext.length}"


    jQuery('#lefticon').click =>
      @index--
      if (@index == pagetext.length - 2)
        jQuery('#righticon').css "display", "block"
      #console.log "left icon click"
      if (@index <= 0)
        @index = 0
        jQuery('#lefticon').css "display", "none"
      maintext = pagetext[@index]
      jQuery("#infoMainTextContent").text maintext
      jQuery("#pageNumber").text "#{@index+1}/#{pagetext.length}"

