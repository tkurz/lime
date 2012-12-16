# Fetches annotation resource entities (if exist) from a LD endpoint,
# hangs them on each annotation
# sets a `ldLoaded` property to true on the annotation
# triggers an `ldLoaded` event on the annotation
class window.LDPlugin extends window.LimePlugin
  init: ->
    @vie = @lime.options.vie or @options.vie
    unless @vie
      if @lime.options.local
        jQuery.noop()
        # @options.stanbolUrl = 'http://localhost:8081'
      @vie = new VIE()
      @vie.use new @vie.StanbolService
        url: @options.stanbolUrl

    for annotation in @lime.annotations
      annotation.lime = @lime
      @loadAnnotation annotation

  defaults:
    stanbolUrl: "http://dev.iks-project.eu/stanbolfull"
    followRedirects: ['dbpedia:wikiPageRedirects', 'rdfs:seeAlso', 'owl:sameAs']

  loadAnnotation: (annotation) ->
    annotation.entityPromise = jQuery.Deferred()
    entityUri = annotation.resource.value
    error = (err) ->
      console.error "Couldn't load entity #{entityUri}", err
      # $.get('http://dev.iks-project.eu/cors/www.tvtrip.es/flachau-hotels/funsport-bike-skihotelanlage-tauernhof', function(res){console.info(window.test=res)})

    recursiveFetch = (entityUri, props, depth, cb) =>
      results = []
      success = (res) =>
        entity = _.detect res, (ent) -> ent.fromReference(ent.getSubject()) is ent.fromReference(entityUri)
        results.push entity
        if depth is 0
          cb _.flatten(results)
        else
          redirects = []
          for prop in props
            redirects.push entity.get prop
          redirects = _.flatten(redirects)
          redirects = _.uniq(redirects)
          redirects = _.compact(redirects)

          waitfor = redirects.length
          if waitfor
            for redirUrl in redirects
              recursiveFetch redirUrl, props, depth-1, (r) ->
                results.push r
                waitfor--
                if waitfor is 0
                  cb _(results).flatten()
          else
            cb _(results).flatten()

      @vie.load(entity: entityUri).using('stanbol').execute().fail(error).success(success)


    recursiveFetch entityUri, @options.followRedirects, 2, (res) ->
      annotation.entities = res
      # @vie.load(entity: entityUri).using('stanbol').execute().fail(error).success (res) =>

      # Add methods on the annotation to get label, description, etc in the player's preferred language
      annotation.getLabel = ->
        for entity in @entities
          value = VIE.Util.getPreferredLangForPreferredProperty(entity, ['rdfs:label'], [@lime.options.preferredLanguage, 'en'])
          if value isnt "n/a"
            return value
        return 'No label found.'
      annotation.getDescription = ->
        for entity in @entities
          value = VIE.Util.getPreferredLangForPreferredProperty(entity, ['dbpedia:abstract', 'rdfs:comment'], [@lime.options.preferredLanguage, 'en'])
          if value isnt "n/a"
            return value
        return 'No label found.'
      annotation.getDepiction = ->
        for entity in @entities
          result = ""
          depiction = entity.get 'foaf:depiction'
          if depiction
            if _.isArray depiction
              singleDepiction = _.detect depiction, (d) -> d.indexOf('thumb') isnt -1
              unless singleDepiction
                singleDepiction = depiction[0]
            else
              singleDepiction = depiction
            result = entity.fromReference(singleDepiction)
          if result
            return result
        return null
      annotation.getPage = ->
        for entity in @entities
          value = entity.get('foaf:homepage')
          if value
            return value
        @entities[0].fromReference(entity.getSubject())

      annotation.entityPromise.resolve annotation.entities
    return
    requestUrl = "#{@lime.options.annotFrameworkURL}meta/application/json?uri=#{encodeURIComponent annotation.resource.value}"
    jQuery.ajax
      url: requestUrl
      timeout: 2000
      # contentType: "application/json"
      success: (res) =>
        if typeof res is 'string'
          res = JSON.parse res
        if _.keys(res).length
          console.info annotation.resource.value, res

          lime = @lime
          annotation.getLabel = ->
            label = _(@entity['rdfs:label']).detect (labelObj) -> labelObj["@language"] is lime.options.preferredLanguage
            unless label
              label = _(@entity['rdfs:label']).detect (labelObj) -> labelObj["@language"] is "en"
              if label then return label["@value"] + " (Not found in " + lime.options.preferredLanguage.toUpperCase() + ")"
            return label?["@value"] || "No label found"

          annotation.getDescription = ->
            label = _(@entity['http://dbpedia.org/ontology/abstract']).detect (labelObj) -> labelObj["@language"] is lime.options.preferredLanguage
            unless label
              label = _(@entity['http://dbpedia.org/ontology/abstract']).detect (labelObj) -> labelObj["@language"] is "en"
              if label then label["@value"] += " (Not found in " + lime.options.preferredLanguage.toUpperCase() + ")"
            label = label?["@value"] || "No label found"


          annotation.getDepiction = ->
            depiction = @entity['foaf:depiction']?["@id"]
            # props['http://dbpedia.org/ontology/thumbnail']?[0].value
            depiction

          annotation.getPage = ->
            page = @entity['http://xmlns.com/foaf/0.1/homepage']?["@id"]
            page

          # TODO remove when all plugins are changed to using the promise
          annotation.entity = res
          annotation.ldLoaded = true
          jQuery(annotation).trigger jQuery.Event "ldloaded", entity: res

      error: (jqXhr, message) ->
        alert "Linked data plugin couldn't load the entity because of '#{message}'"
        console.error "LDPlugin error", message

class RDF
  constructor: (hash) ->
