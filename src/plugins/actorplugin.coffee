class window.ActorPlugin extends window.LimePlugin
  init: ->
    @name = 'ActorPlugin'
    @actorOntologySet = [
        '<http://dbpedia.org/class/yago/Actor109765278>',
        '<http://dbpedia.org/class/yago/AustrianFilmActors>',
        '<http://dbpedia.org/class/yago/FilmActors>',
        '<http://dbpedia.org/class/yago/AmericanTelevisionActors>',
        '<http://dbpedia.org/class/yago/AmericanVoiceActors>',
        '<http://dbpedia.org/class/yago/AmericanActorsOfEnglishDescent>',
        '<http://dbpedia.org/class/yago/AmericanSoapOperaActors>',
        '<http://dbpedia.org/class/yago/AmericanFilmActors>',
        '<http://dbpedia.org/class/yago/Actress109767700>',
        '<http://dbpedia.org/class/yago/AmericanChildActors>',
        '<http://dbpedia.org/class/yago/ActorsFromCalifornia>'
        ]
    console.info "Initialize #{@name}"
    for annotation in @lime.annotations
      if annotation.resource.value.indexOf("dbpedia") > 0
        @handleAnnotation annotation

  # Putting this into a function keeps the annotation in the context
  handleAnnotation: (annotation) ->
    # console.info "The annotation #{annotation.resource} looks interesting, get the whole entity so we can show it in a widget!", annotation
    annotation.entityPromise.done =>
      isActor = false
      typeSet = annotation.getType()
      ###
          for annotationType in typeSet
          isActor = true if annotationType.id in @actorOntologySet
          console.log annotationType.id
      ###
      isActor = true
      if isActor
        console.info "entities for annotation #{annotation.resource} loaded, is actor #{isActor} create a widget for it!"
        nonConcept = annotation.getDescription()
        nonConcept = nonConcept.replace("No description found.","")
        if(nonConcept.length >= 3)
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
            # @getModalContainer().html @showAbstractInModalWindow annotation
            @showAbstractInModalWindow annotation, @getModalContainer()

          # Hang the widget on the annotation
          annotation.widgets[@name] = widget

          jQuery(annotation).bind "becomeActive", (e) =>
            annotation.widgets[@name].setActive()

          jQuery(annotation).bind "becomeInactive", (e) =>
            annotation.widgets[@name].setInactive()

          @getLSIImages annotation
          jQuery(widget).bind "leftarrow", (e) =>
            console.info 'left arrow pressed', e


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
    modalContent = $(outputElement)
    modalContent.css "width", "600px"
    modalContent.css "height", "auto"
    label = annotation.getLabel()
    page = annotation.getPage()
    starringList = annotation.getStarring()
    console.log "---- Movies", starringList
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
    secondarytext = ""
    if (maintext.length >= 240)
      n = maintext.length
      if maintext.length >= 240
        tmptext = maintext.split(" ")
        n = tmptext.length
        textsum = ""
        i = 0
        while textsum.length < 200
          textsum += tmptext[i] + " "
          i++
        maintext = textsum
        y = i
        while y < n
          secondarytext += tmptext[y] + " "
          y++

    depiction = annotation.getDepiction(without: 'thumb')
    if(depiction == null)
      depiction = "img/noimagenew.png"
    lsiImageList = annotation.getLsiImagesResources()
    console.log "Asociated images ",label ,lsiImageList

    ###
      -- added 29.apr.2013 --
      Extend interface logic (below) to fit LSIImages by creating a new tile with 1 or more images
    ###

    result = """
             <div id="ifoWidgetExpanded" style="border: 1px dotted lightgray; position: relative;height: auto; width: 600px;">
             <div id="infoWidget" style="background-color: rgba(37, 37, 37, 0.7); height: 40px; left: 0px; width: 100%; position: relative; float: left;">
             <div class="infoWidgeticon" style="border-right: 1px dotted lightgray; position: relative; height: 100%; float: left; background-color: #3f3e3e; width: 8%;">
             <span data-dojo-type="shapes.Text" id="iconLabel" style="font: Times; position: relative; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: #f38f0b; font-family: 'Times New Roman',Times,serif; font-style: italic;">i</span>
             </div>
             <div class="infoWidgetTitle" style="font: Arial; position: relative; float: left; height: 100%; width: 86%; font-family: Arial,Helvetica,sans-serif; font-size: 26px; color: white; font-weight: normal; text-align: left; vertical-align: middle; text-indent: 1em; line-height: 140%;">
              #{label}</div>
             </div>
             <div id="infoText" style="padding: 10px; position: relative; float: left; background-color: rgba(68, 68, 68, 0.7); height: auto; font-style: normal; width: 96%;">
             <div id="infoTextBioTitle" style="font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange; height: auto;">
             Bio</div>
             <div id="infoTextBio" style="font: Helvetica; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; float: left; line-height: normal; position: relative; height: auto; width: 100%;">
              #{comment}
             </div>
             <div id="infoTextCareerTitle" style="font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange;">
             Movies</div>
             <div id="infoTextCareer" style="font: Helvetica; width: 100%; position: relative; float: left; height: auto; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; line-height: normal;">
             #{starringList}</div>
             <div id="infoTextAwardsTitle" style="font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange;">
             Awards</div>
             <div id="infoTextAwards" style="font: Helvetica; width: 100%; position: relative; float: left; height: auto; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; line-height: normal;">
             Spaghetti Master</div>
             </div>
             </div>
             """

    modalContent.append result

