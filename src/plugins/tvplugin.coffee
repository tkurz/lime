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
          @_loadFullDbpediaEntity entity, (fullEntity) =>
            @processAnnotation annotation, fullEntity.attributes['@type']

  processAnnotation: (annotation, typeArray) ->
    if _.intersection(typeArray, @options.actorTypes).length
      # There's at least one type in common
      console.info 'Render Actor widget'
      widgetType = 'ActorWidget'
      widget = @_initWidget annotation, widgetType, @renderActor,
        thumbnail: "img/info.png" # should go into CSS
        title: "#{annotation.getLabel()} (Actor)"
        type: widgetType
        sortBy: ->
          10000 * annotation.start + annotation.end

    if _.intersection(typeArray, @options.characterTypes).length
      console.info 'Render Character widget'
      # There's at least one type in common
      widgetType = 'CharacterWidget'
      widget = @_initWidget annotation, widgetType, @renderCharacter,
        thumbnail: "img/info.png" # should go into CSS
        title: "#{annotation.getLabel()} (Actor)"
        type: widgetType
        sortBy: ->
          10000 * annotation.start + annotation.end

    if _.intersection(typeArray, @options.directorTypes).length
      console.info 'Render Director widget'
      # There's at least one type in common
      widgetType = 'DirectorWidget'
      widget = @_initWidget annotation, widgetType, @renderDirector,
        thumbnail: "img/info.png" # should go into CSS
        title: "#{annotation.getLabel()} (Actor)"
        type: widgetType
        sortBy: ->
          10000 * annotation.start + annotation.end


  renderActor: (annotation, container) ->
    container.append "<div>Hello Actor #{annotation.getLabel()}!</div>"

  renderCharacter: (annotation, container) ->
    container.append "<div>Hello Character #{annotation.getLabel()}!</div>"

  renderDirector: (annotation, container) ->
    container.append "<div>Hello Director #{annotation.getLabel()}!</div>"

  _loadFullDbpediaEntity: (entity, callback) =>
    @vie.load(entity: entity.getSubject()).using('dbpedia').execute()
    .success (fullEntity) =>
      entity.set fullEntity
      callback fullEntity

  _initWidget: (annotation, widgetType, renderMethod, widgetOptions) ->
    widget = @lime.allocateWidgetSpace @, widgetOptions

    # We're going to need the annotation for the widget's `activate` event
    widget.annotation = annotation
    # widget was activated, we show details now
    jQuery(widget).bind 'activate', (e) =>
      renderMethod annotation, @getModalContainer()

    # Hang the widget on the annotation
    annotation.widgets[widgetType] = widget

    jQuery(annotation).bind "becomeActive", (e) =>
      annotation.widgets[widgetType].setActive()

    jQuery(annotation).bind "becomeInactive", (e) =>
      annotation.widgets[widgetType].setInactive()

