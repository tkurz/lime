class window.TVPlugin extends window.LimePlugin
  init: ->
    @name = 'TVPlugin'
    console.info "Initialize #{@name}"
    for annotation in @lime.annotations
      if annotation.resource.value.indexOf("dbpedia") > 0
        @handleAnnotation annotation

  defaults:
    actorTypes: [
      '<http://dbpedia.org/class/yago/Actor109765278>'
      '<http://dbpedia.org/class/yago/AustrianFilmActors>'
      '<http://dbpedia.org/class/yago/FilmActors>'
      '<http://dbpedia.org/class/yago/AmericanTelevisionActors>'
      '<http://dbpedia.org/class/yago/AmericanVoiceActors>'
      '<http://dbpedia.org/class/yago/AmericanActorsOfEnglishDescent>'
      '<http://dbpedia.org/class/yago/AmericanSoapOperaActors>'
      '<http://dbpedia.org/class/yago/AmericanFilmActors>'
      '<http://dbpedia.org/class/yago/Actress109767700>'
      '<http://dbpedia.org/class/yago/AmericanChildActors>'
      '<http://dbpedia.org/class/yago/ActorsFromCalifornia>'
    ]
    characterTypes: [
      "<http://dbpedia.org/ontology/FictionalCharacter>"
      "<http://dbpedia.org/class/yago/FictionalCharactersFromCalifornia>"
      "<http://dbpedia.org/class/yago/FictionalCharacter109587565>"
    ]
    directorTypes: [
      "<http://dbpedia.org/class/yago/Director110014939>"
      "<http://dbpedia.org/class/yago/EnglishFilmDirectors>"
      "<http://dbpedia.org/class/yago/DanishFilmDirectors>"
      "<http://dbpedia.org/class/yago/SilentFilmDirectors>"
      "<http://dbpedia.org/class/yago/ItalianFilmDirectors>"
      "<http://dbpedia.org/class/yago/ScottishFilmDirectors>"
      "<http://dbpedia.org/class/yago/EnglishTheatreDirectors>"
      "<http://dbpedia.org/class/yago/DutchFilmDirectors>"
      "<http://dbpedia.org/class/yago/ArtisticDirectors>"
      "<http://dbpedia.org/class/yago/IndianFilmDirectors>"
      "<http://dbpedia.org/class/yago/TurkishFilmDirectors>"
      "<http://dbpedia.org/class/yago/HindiFilmDirectors>"
      "<http://dbpedia.org/class/yago/PolishFilmDirectors>"
      "<http://dbpedia.org/class/yago/RomanianFilmDirectors>"
      "<http://dbpedia.org/class/yago/MuslimAmericanFilmDirectors>"
      "<http://dbpedia.org/class/yago/SpanishFilmDirectors>"
      "<http://dbpedia.org/class/yago/BelgianFilmDirectors>"
      "<http://dbpedia.org/class/yago/EgyptianFilmDirectors>"
      "<http://dbpedia.org/class/yago/PakistaniFilmDirectors>"
      "<http://dbpedia.org/class/yago/IranianFilmDirectors>"
      "<http://dbpedia.org/class/yago/ItalianBritishFilmDirectors>"
      "<http://dbpedia.org/class/yago/BrazilianFilmDirectors>"
      "<http://dbpedia.org/class/yago/IcelandicFilmDirectors>"
      "<http://dbpedia.org/class/yago/AustralianTelevisionDirectors>"
      "<http://dbpedia.org/class/yago/M%C3%A9tisFilmDirectors>"
      "<http://dbpedia.org/class/yago/BengaliFilmDirectors>"
      "<http://dbpedia.org/class/yago/ColombianFilmDirectors>"
      "<http://dbpedia.org/class/yago/KannadaFilmDirectors>"
      "<http://dbpedia.org/class/yago/AmericanFilmDirectorsOfArmenianDescent>"
      "<http://dbpedia.org/class/yago/BangladeshiFilmDirectors>"
      "<http://dbpedia.org/class/yago/KurdishFilmDirectors>"
      "<http://dbpedia.org/class/yago/NativeAmericanFilmDirectors>"
      "<http://dbpedia.org/class/yago/PortuguEseFilmDirectors>"
      "<http://dbpedia.org/class/yago/AmericanFilmDirectors>"
      "<http://dbpedia.org/class/yago/English-languAgeFilmDirectors>"
      "<http://dbpedia.org/class/yago/AmericanTelevisionDirectors>"
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
        if entity and entity.isof('dbpedia:Person')
          # @_loadFullDbpediaEntity entity, (fullEntity) =>
            # @processAnnotation annotation, fullEntity.attributes['@type']
            @processAnnotation annotation

  processAnnotation: (annotation) ->
    if _.intersection(annotation.entities[0].attributes['@type'], @options.actorTypes).length
      # There's at least one type in common
      console.info 'Render Actor widget'
      widgetType = 'ActorWidget'
      widget = @_initWidget annotation, widgetType, @renderActor,
        thumbnail: "img/starIcon.png" # should go into CSS
        title: "#{annotation.getLabel()} (Actor)"
        type: widgetType
        sortBy: ->
          10000 * annotation.start + annotation.end

    if _.intersection(annotation.entities[0].attributes['@type'], @options.characterTypes).length
      console.info 'Render Character widget'
      # There's at least one type in common
      widgetType = 'CharacterWidget'
      widget = @_initWidget annotation, widgetType, @renderCharacter,
        thumbnail: "img/characterIcon.png" # should go into CSS
        title: "#{annotation.getLabel()} (Character)"
        type: widgetType
        sortBy: ->
          10000 * annotation.start + annotation.end

    if _.intersection(annotation.entities[0].attributes['@type'], @options.directorTypes).length
      console.info 'Render Director widget'
      # There's at least one type in common
      widgetType = 'DirectorWidget'
      widget = @_initWidget annotation, widgetType, @renderDirector,
        thumbnail: "img/directorIcon.png" # should go into CSS
        title: "#{annotation.getLabel()} (Director)"
        type: widgetType
        sortBy: ->
          10000 * annotation.start + annotation.end


  renderActor: (annotation, container) =>
    modalContent = jQuery(container)
    modalContent.css "width", "450px"
    modalContent.css "height", "auto"

    label = annotation.getLabel()
    page = annotation.getPage()
    starringListArray = []
    starringList = ""
    @_getStarringList annotation.resource.value, (data, result) =>
      result = []
      for show in data.results.bindings
        result.push "<#{show.date.value}> - <#{show.show.value}>"
      starringListArray = result
      if (starringListArray)
        for starringItem in starringListArray
          starringItem = @_cleanupLabel(starringItem) + "<\/br>"
          starringList += starringItem

        jQuery('#infoText').append """<div id="infoTextCareerTitle" style="font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange;">
                              Movies and TV Series</div>
                              <div id="infoTextCareer" style="font: Helvetica; width: 100%; position: relative; float: left; height: auto; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; line-height: normal;">
        #{starringList}</div>"""

      console.log '1) starringListArray = ', starringListArray
      return result

    console.log '2) starringListArray = ',starringListArray
    awardsListArray = []
    awardsListArray = annotation._detectProperty 'dcterms:subject'

    awardsList = ""
    if (awardsListArray)
      for awardsItem in awardsListArray
        awardsItem = @_cleanupLabel(awardsItem) + "<\/br>"
        if awardsItem.indexOf("winners")>0 or awardsItem.indexOf("award")>0 or awardsItem.indexOf("awards")>0
          if (awardsItem.indexOf("winners")>0)
            awardsItem = awardsItem.replace /winners/, ""
          awardsList += awardsItem
    console.log "awardsListArray = ", awardsList, " from this list: ", awardsListArray

    lime = this.lime
    comment = annotation.getDescription()
    comment = comment.split(". ")[0] + ". "
    birthDate = "Birth date: "
    try
      birthDate += annotation._detectProperty 'dbprop:birthDate'
    catch error
      try
        birthDate += annotation._detectProperty 'dbprop:dateOfBirth'
      catch error

    birthPlace = "Birth place: "
    try
      birthPlace += annotation._detectProperty('dbprop:birthPlace')['@value']
    catch error
      try
        birthPlace += annotation._detectProperty('dbprop:placeOfBirth')['@value']
      catch error

    result = """
             <div id="ifoWidgetExpanded" style="border: 1px dotted lightgray; position: relative;height: auto; width: 100%;">
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
    #{comment} <br>
    #{birthDate} <br>
    #{birthPlace} <br>

             </div>
             """
    ###
    if (starringList.length > 0)
      result += """
                <div id="infoTextCareerTitle" style="font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange;">
                Movies and TV Series</div>
                     <div id="infoTextCareer" style="font: Helvetica; width: 100%; position: relative; float: left; height: auto; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; line-height: normal;">
      #{starringList}</div>
                    """

    ###
    if (awardsList.length > 0)
      result += """ <div id="infoTextAwardsTitle" style="font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange;">
                     Awards</div>
                     <div id="infoTextAwards" style="font: Helvetica; width: 100%; position: relative; float: left; height: auto; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; line-height: normal;">
                    #{awardsList}</div>
                """

    result += """
              </div>
              </div>
              """

    container.append result

  renderCharacter: (annotation, container) ->
    modalContent = jQuery(container)
    modalContent.css "width", "450px"
    modalContent.css "height", "auto"

    label = annotation.getLabel()
    page = annotation.getPage()
    comment = annotation.getDescription()
    occupation = ""
    try
      occupation = annotation._detectProperty 'dbprop:occupation'
      occupation = @_cleanupLabel occupation
      occupation = "<b>Occupation:</b> " + occupation + "<br>"
    catch error

    nationality = ""
    try
      nationality = annotation._detectProperty 'dbprop:nationality'
      nationality = @_cleanupLabel nationality
      nationality = "<b>Nationality:</b> " +nationality + "<br>"
    catch error

    firstAppearance = ""
    try
      firstAppearance = annotation._detectProperty 'dbprop:firstAppearance'
      firstAppearance = @_cleanupLabel firstAppearance
      firstAppearance = "<b>First Appearance:</b> " + firstAppearance + "<br>"
    catch error

    nickname = ""
    try
      nickname = "<b>Nick name:</b> "
      nicknameList = annotation._detectProperty 'foaf:nick'
      for nick in nicknameList
        nickname += nick['@value'] + "<br>"
    catch error

    portrayer = ""
    try
      portrayer = annotation._detectProperty 'dbprop:portrayer'
      portrayer = @_cleanupLabel portrayer
      portrayer = "<b>Played by:</b> " + portrayer + "<br>"
    catch error

    result = """
             <div id="ifoWidgetExpanded" style="border: 1px dotted lightgray; position: relative;height: auto; width: 100%;">
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
    #{portrayer}
    #{firstAppearance}
    #{nationality}
    #{occupation}
    #{nickname}
              <br>

             </div>
             </div>
             </div>
             """
    container.append result

  renderDirector: (annotation, container) ->
    modalContent = jQuery(container)
    modalContent.css "width", "450px"
    modalContent.css "height", "auto"

    label = annotation.getLabel()
    page = annotation.getPage()
    console.log page
    starringListArray = []
    starringListArray = annotation._detectProperty 'dbprop:knownFor'
    starringList = ""
    if (starringListArray)
      for starringItem in starringListArray
        starringList += @_cleanupLabel starringItem

    awardsListArray = []
    awardsListArray = annotation._detectProperty 'dcterms:subject'

    awardsList = ""
    if (awardsListArray)
      for awardsItem in awardsListArray
        awardsItem = @_cleanupLabel(awardsItem) + "<\/br>"
        if awardsItem.indexOf("winners")>0 or awardsItem.indexOf("award")>0 or awardsItem.indexOf("awards")>0
          awardsList += awardsItem
    console.log "awardsListArray = ", awardsList, " from this list: ", awardsListArray


    lime = this.lime
    comment = annotation.getDescription()
    # comment = comment.split(". ")[0] + ". "
    birthDate = "Birth date: "
    try
      birthDate += annotation._detectProperty 'dbprop:birthDate'
    catch error
      try
        birthDate += annotation._detectProperty 'dbprop:dateOfBirth'
      catch error

    birthPlace = "Birth place: "
    try
      birthPlace += annotation._detectProperty('dbprop:birthPlace')['@value']
    catch error
      try
        birthPlace += annotation._detectProperty('dbprop:placeOfBirth')['@value']
      catch error
    result = """
             <div id="ifoWidgetExpanded" style="border: 1px dotted lightgray; position: relative;height: auto; width: 100%;">
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
    #{birthDate} <br>
    #{birthPlace} <br> <br>
    #{comment}

             </div>
             """
    if (starringList.length > 3)
      result += """
                <div id="infoTextCareerTitle" style="font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange;">
                Movies and TV Series</div>
                     <div id="infoTextCareer" style="font: Helvetica; width: 100%; position: relative; float: left; height: auto; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; line-height: normal;">
      #{starringList}</div>
                     """
    if (awardsList.length > 3)
      result += """ <div id="infoTextAwardsTitle" style="font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange;">
                Awards</div>
                   <div id="infoTextAwards" style="font: Helvetica; width: 100%; position: relative; float: left; height: auto; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; line-height: normal;">
      #{awardsList}</div>
                   """

    result += """
              </div>
              </div>
              """
    container.append result

  _cleanupLabel: (label) ->
    label = label.replace /<http:\/\/dbpedia.org\/resource\/(Category:)?/, ""
    label = label.replace /_/g, " "
    label = label.replace /[<>]/g, ""
    label = decodeURIComponent label
    label


  _loadFullDbpediaEntity: (entity, callback) =>
    @vie.load(entity: entity).using('dbpedia').execute()
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


  _initWidget: (annotation, widgetType, renderMethod, widgetOptions) ->
    widget = @lime.allocateWidgetSpace @, widgetOptions

    # We're going to need the annotation for the widget's `activate` event
    widget.annotation = annotation
    # widget was activated, we show details now
    jQuery(widget).bind 'activate', (e) =>
      renderMethod.apply @, [annotation, @getModalContainer()]

    # Hang the widget on the annotation
    annotation.widgets[widgetType] = widget

    jQuery(annotation).bind "becomeActive", (e) =>
      annotation.widgets[widgetType].setActive()

    jQuery(annotation).bind "becomeInactive", (e) =>
      annotation.widgets[widgetType].setInactive()

