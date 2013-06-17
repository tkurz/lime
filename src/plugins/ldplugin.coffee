# Fetches annotation resource entities (if exist) from a LD endpoint,
# hangs them on each annotation
# sets a `ldLoaded` property to true on the annotation
# triggers an `ldLoaded` event on the annotation
class window.LDPlugin extends window.LimePlugin
  init: ->
    @vie = @lime.options.vie or @options.vie
    @promises = {}
    unless @vie
      if @lime.options.local
        jQuery.noop()
        # @options.stanbolUrl = 'http://localhost:8081'
      @vie = new VIE()
      @vie.use new @vie.StanbolService
        url: @options.stanbolUrl

    # Pause for the time of getting the annotation entities
    pausedBefore = @lime.player.paused()
    _.defer =>
      @lime.player.pause()
      console.info "Loading entities first... Player paused..."

    waitForAnnotationFetch = @lime.annotations.length

    for annotation in @lime.annotations
      annotation.lime = @lime
      annotation.vie = @vie
      @loadAnnotation annotation, =>
        waitForAnnotationFetch--
        console.info "still waiting for so many annotations...", waitForAnnotationFetch
        if waitForAnnotationFetch is 0
          console.info "Loading entities finished."
          unless pausedBefore
            console.info "Playing again."
            @lime.player.play()
        if waitForAnnotationFetch < 0
          console.error "This should not ever happen!"
          debugger

  defaults:
    stanbolUrl: "http://dev.iks-project.eu/stanbolfull"
    followRedirects: [
      'dbpedia:wikiPageRedirects'
      'rdfs:seeAlso'
      'owl:sameAs'
      # redirect to the dbpedia entity using the english label of the (e.g. geonames) entity.
      (ent) ->
        engName = VIE.Util.getPreferredLangForPreferredProperty(ent, ['rdfs:label', 'geonames:alternateName'], ["en"])
        # name = ent.get('geonames:name')
        if engName
          return "http://dbpedia.org/resource/#{engName.replace(/\s/g, '_')}"
    ]

  loadAnnotation: (annotation, readyCb) ->
    entityUri = annotation.resource.value
    if @promises[entityUri]
      annotation.entityPromise = @promises[entityUri]
      readyCb()
      return

    annotation.entityPromise = @promises[entityUri] = jQuery.Deferred()

    debug = ''
    # debug = "http://dbpedia.org/resource/Category:Mountains_of_Salzburg"
    if entityUri is debug
      @lime.player.pause()
      debugger

    # Fetches the entity for `entityUri` and the possible redirects based on props, in a decreasing `depth`.
    recursiveFetch = (entityUri, props, depth, cb) =>
      results = []
      waitfor = 0
      handleMerge = =>
        asdf
      error = (err) ->
        waitfor--
        console.error "Couldn't load entity #{entityUri}", err
        unless waitfor > 0
          cb []
        # $.get('http://dev.iks-project.eu/cors/www.tvtrip.es/flachau-hotels/funsport-bike-skihotelanlage-tauernhof', function(res){console.info(window.test=res)})
      success = (res) =>
        entity = _.detect res, (ent) -> ent.fromReference(ent.getSubject()) is ent.fromReference(entityUri)
        if entity
          results.push entity
        if depth is 0
          cb _.flatten(results)
        else
          redirects = []
          if entity
            for prop in props
              if _.isString(prop)
                redir = entity.get prop
                unless redir?.isEntity
                  redirects.push redir
              if _.isFunction(prop)
                redirects.push(prop(entity))
          redirects = _.flatten(redirects)
          redirects = _.uniq(redirects)
          redirects = _.compact(redirects)

          waitfor = redirects.length
          if waitfor
            for redirUrl in redirects
              recursiveFetch redirUrl, props, depth-1, (r) ->
                results.push r
                waitfor--
                if waitfor <= 0
                  cb _(results).flatten()
          else
            cb _(results).flatten()
      # console.info 'load entity', entityUri
      @vie.load(entity: entityUri).using('stanbol').execute().fail(error).success(success)

    if annotation.isBookmark()
      annotation.getLabel = annotation.getName = ->
        if annotation.hash.prefLabel
          return annotation.hash.prefLabel.value
      readyCb()
    else
      recursiveFetch entityUri, @options.followRedirects, 2, (res) ->
        res = _(res).uniq (entity) ->
          entity.getSubject()
        console.info "LDPlugin loaded", res
        if entityUri is debug
          @lime.player.pause()
          debugger
        annotation.entities = res or []
      # @vie.load(entity: entityUri).using('stanbol').execute().fail(error).success (res) =>

        annotation._detectPropertyLanguageOnEntity = (properties, languages, defaultLabel) ->
          for entity in @entities
            value = VIE.Util.getPreferredLangForPreferredProperty(entity, properties, languages)
            if value isnt "n/a"
              return value
          return defaultLabel

        annotation._detectProperty = (property) ->
          for entity in @entities
            value = entity.get(property)
            if value
              return value
            @entities[0].fromReference(entity.getSubject())

        # Add methods on the annotation to get label, description, etc in the player's preferred language

        annotation.getLabel = annotation.getName = ->
          # console.log "the analized annotation", annotation
          if annotation.hash.prefLabel
            return annotation.hash.prefLabel.value
          else
            return @_detectPropertyLanguageOnEntity(['rdfs:label', 'geonames:alternateName'], [@lime.options.preferredLanguage, 'en'], "No label found.")
        annotation.getDescription = ->
          @_detectPropertyLanguageOnEntity(['dbpedia:abstract', 'rdfs:comment'], [@lime.options.preferredLanguage, 'en'], "No description found.")

        annotation.getDepiction = (options) ->
          for entity in @entities
            result = ""
            depiction = entity.get 'foaf:depiction'
            if depiction
              if _.isArray depiction
                singleDepiction = _.detect depiction, (d) ->
                  res = true
                  if options?.with
                    res = res and d.indexOf(options?.with) isnt -1
                  if options?.without
                    res = res and d.indexOf(options?.without) is -1
                  res
                unless singleDepiction
                  singleDepiction = depiction[0]
              else
                singleDepiction = depiction
              result = entity.fromReference(singleDepiction)
            if result
              return result
          return null

        annotation.getPage = ->
          homepage = @_detectProperty @entities, 'foaf:homepage'
          unless homepage
            for entity in @entities
              if entity.getSubject().indexOf('dbpedia') isnt -1
                label = VIE.Util.getPreferredLangForPreferredProperty entity, ['rdfs:label'], [@lime.options.preferredLanguage]
                return "http://#{@lime.options.preferredLanguage}.wikipedia.org/wiki/#{label}"
              else
                value = entity.get('foaf:homepage')
                if value
                  return value
            if @entities.length
              return @entities[0].fromReference(entity.getSubject())
            else
              return @resource.value
          return homepage

        annotation.getType = ->
          for entity in @entities
            typeSet = entity.get('@type')
            if _.isArray typeSet
                result = typeSet
            else
                result = [typeSet]
          return result

        annotation.getStarring = ->
          starringList = @_detectProperty @entities, 'dbpedia-owl:knownFor'
          unless starringList
            for entity in @entities
              value = entity.get('dbpedia-owl:knownFor')
              if _.isArray value
                starringList = value
              else
                starringList = [value]
          console.log "===== LDPlugin - getStarring result: ", starringList
          return starringList

        annotation.getLatitude = ->
          value = 0.0
          for entity in @entities
            if entity.getSubject().indexOf('geonames') isnt -1
              value = entity.attributes['<http://www.w3.org/2003/01/geo/wgs84_pos#lat>']
          console.log "Latitude = ", value
          return value

        annotation.getLongitude = ->
          value = 0.0
          for entity in @entities
            if entity.getSubject().indexOf('geonames') isnt -1
              value = entity.attributes['<http://www.w3.org/2003/01/geo/wgs84_pos#long>']
          console.log "Latitude = ", value
          return value

        annotation.entityPromise.resolve annotation.entities
        readyCb()

class RDF
  constructor: (hash) ->
