# Fetches annotation resource entities (if exist) from a LD endpoint,
# hangs them on each annotation
# sets a `ldLoaded` property to true on the annotation
# triggers an `ldLoaded` event on the annotation
class window.LDPlugin extends window.LimePlugin
  init: =>
    loadAnnotation = (annotation) =>
      requestUrl = "#{@lime.options.annotFrameworkURL}meta/application/json?uri=#{encodeURIComponent annotation.resource.value}"
      jQuery.ajax
        url: requestUrl
        # contentType: "application/json"
        success: (res) =>
          if typeof res is 'string'
            res = JSON.parse res
          if _.keys(res).length
            console.info annotation.resource.value, res
            annotation.entity = res
            annotation.ldLoaded = true
            jQuery(annotation).trigger jQuery.Event "ldloaded", entity: res

            lime = @lime
            annotation.getLabel = ->
              label = _(@entity['rdfs:label'])
              .detect (labelObj) ->
                labelObj["@language"] is lime.options.preferredLanguage
              label = label["@value"]

            annotation.getDescription = ->

            annotation.getDepiction = ->
              depiction = @entity['http://xmlns.com/foaf/0.1/depiction']?["@id"]
              # props['http://dbpedia.org/ontology/thumbnail']?[0].value
              depiction

            annotation.getPage = ->
              page = @entity['http://xmlns.com/foaf/0.1/homepage']?["@id"]
              page


    error: (err) ->
          console.error arguments
    for annotation in @lime.annotations
      loadAnnotation annotation

class RDF
  constructor: (hash) ->
