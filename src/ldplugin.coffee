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
          if _.keys(res).length
            console.info annotation.resource.value, res
            annotation.entity = res
            annotation.ldLoaded = true
            jQuery(annotation).trigger jQuery.Event "ldloaded", entity: res

            lime = @lime
            annotation.getLabel = ->
              props = @entity[@resource.value]
              label = _(props['http://www.w3.org/2000/01/rdf-schema#label'])
              .detect (labelObj) ->
                labelObj.lang is lime.options.preferredLanguage
              .value
              label

            annotation.getDescription = ->

            annotation.getDepiction = ->
              props = @entity[@resource.value]
              depiction = props['http://xmlns.com/foaf/0.1/depiction']?[0].value
              # props['http://dbpedia.org/ontology/thumbnail']?[0].value
              depiction

            annotation.getPage = ->
              props = @entity[@resource.value]
              page = props['http://xmlns.com/foaf/0.1/page']?[0].value
              page


    error: (err) ->
          console.error arguments
    for annotation in @lime.annotations
      loadAnnotation annotation

class RDF
  constructor: (hash) ->
