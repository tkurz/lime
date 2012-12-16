# The CMF module communicates to the ConnectMe Media Framework (CMF) back-end
#
# Usage of all methods:
# var cmf = new CMF("http://connectme.salzburgresearch.at/CMF");
# cmf.getVideos(function(err, videos){ // The callback gets always two parameters: err, result.
#   if(err){
#     console.error("Error getting video list from the back-end", cmf.url);
#     return;
#   }
#   console.info("Videos succesfully loaded:", videos);
# });

class window.CMF
  constructor: (@url) ->
    @url = @url.replace(/\/$/, '') + '/'

  # Get the list of all videos stored on the CMF server
  getVideos: (resCB) ->
    res = []
    query = @_videosQuery
    @_runSPARQL(query, resCB)
  _videosQuery: """
      PREFIX mao: <http://www.w3.org/ns/ma-ont#>
      PREFIX oac: <http://www.openannotation.org/ns/>
      PREFIX yoovis: <http://yoovis.at/ontology/08/2012/>
      SELECT DISTINCT ?instance ?title ?thumbnail
      WHERE { ?instance a mao:MediaResource.
      ?instance mao:title ?title.
      ?instance yoovis:hasThumbnail ?thumbnail.}
      ORDER BY ?instance"""

  # Get the list of all annotated videos stored on the CMF server
  getAnnotatedVideos: (resCB) ->
    query = @_annotatedVideosQuery
    @_runSPARQL(query, resCB)
  _annotatedVideosQuery: """
    PREFIX mao: <http://www.w3.org/ns/ma-ont#>
    PREFIX oac: <http://www.openannotation.org/ns/>
    PREFIX yoovis: <http://yoovis.at/ontology/08/2012/>
    SELECT DISTINCT ?instance ?title ?thumbnail
    WHERE { ?instance a mao:MediaResource.
    ?instance mao:title ?title.
    ?instance mao:hasFragment ?fragment.
    OPTIONAL {?instance yoovis:hasThumbnail ?thumbnail.}
    ?annotation a oac:Annotation.
    ?annotation oac:target ?fragment.
    ?annotation oac:body ?body}
    ORDER BY ?instance"""

  # Wrapper for both `getAnnotationsForLocator` and `getAnnotationsForVideo`
  getAnnotationsForVideoOrLocator: (url, resCB) ->
    res = []
    waitfor = 2
    cb = (err, annotations) ->
      if err
        console.error err, annotations
        resCB err, annotations
        return
      res = res.concat annotations
      waitfor--
      if waitfor is 0
        resCB null, res

    @getAnnotationsForLocator url, cb
    @getAnnotationsForVideo url, cb

  # Wrapper for both `getVideoLocators` and `getAllVideoLocators`
  getLocatorsForVideoOrLocator: (url, resCB) ->
    res = []
    waitfor = 2
    cb = (err, annotations) ->
      if err
        console.error err, annotations
        resCB err, annotations
        return
      res = res.concat annotations
      waitfor--
      if waitfor is 0
        resCB null, res

    @getVideoLocators url, cb
    @getAllVideoLocators url, cb

  # The use of the rest of the methods is not necessary because all functionalities are
  # covered and generalized by the more convenient methods above
  # *****************************************************************

  # Get annotations for a video's CMF resource uri
  getAnnotationsForVideo: (resource, resCB) ->
    res = []
    query = @_annotationsForVideo(resource)
    @_runSPARQL(query, resCB)
  _annotationsForVideo: (resource) -> """PREFIX oac: <http://www.openannotation.org/ns/>
      PREFIX ma: <http://www.w3.org/ns/ma-ont#>
      SELECT DISTINCT ?annotation ?fragment ?resource ?relation
      WHERE { <#{resource}>  ma:hasFragment ?f.
         ?f ma:locator ?fragment.
         ?annotation oac:target ?f.
         ?annotation oac:body ?resource.
         ?f ?relation ?resource.}"""

  # Get annotations for a video's locator uri
  getAnnotationsForLocator: (locator, resCB) ->
    res = []
    query = @_annotationsForLocator(locator)
    @_runSPARQL(query, resCB)
  _annotationsForLocator: (locator) -> """
    PREFIX oac: <http://www.openannotation.org/ns/>
    PREFIX ma: <http://www.w3.org/ns/ma-ont#>
    SELECT DISTINCT ?annotation ?fragment ?resource ?relation
    WHERE { ?videoresource ma:locator <#{locator}>.
       ?videoresource ma:hasFragment ?f.
       ?f ma:locator ?fragment.
       ?annotation oac:target ?f.
       ?annotation oac:body ?resource.
       ?f ?relation ?resource.}"""

  # Get video locators for a video's CMF resource uri
  getVideoLocators: (resource, resCB) ->
    res = []
    query = @_getVideoLocators(resource)
    @_runSPARQL query, (err, res) ->
      unless err
        locators = _(res).map (l) ->
          source: l.source.value, type:l.type.value
      resCB err, locators
  _getVideoLocators: (resource) -> """
    PREFIX oac: <http://www.openannotation.org/ns/>
    PREFIX ma: <http://www.w3.org/ns/ma-ont#>
    SELECT DISTINCT ?source ?type
    WHERE { <#{resource}>  ma:locator ?source.
    ?source ma:hasFormat ?type}
    ORDER BY ?source"""

  # Get all video locators for any of a video's locators
  getAllVideoLocators: (locator, resCB) ->
    res = []
    query = @_getAllVideoLocators locator
    @_runSPARQL query, (err, res) ->
      unless err
        locators = _(res).map (l) ->
          source: l.source.value, type:l.type.value
      resCB err, locators
  _getAllVideoLocators: (locator) -> """
    PREFIX oac: <http://www.openannotation.org/ns/>
    PREFIX ma: <http://www.w3.org/ns/ma-ont#>
    SELECT DISTINCT ?source ?type
    WHERE {
    ?resource ma:locator <#{locator}>.
    ?resource  ma:locator ?source.
    ?source ma:hasFormat ?type}
    ORDER BY ?source"""

  # running SPARQL query
  _runSPARQL: (query, resCB) ->
    uri = "#{@url}sparql/select?query=#{encodeURIComponent(query)}&output=json"
    xhr = jQuery.getJSON uri, (data) =>
      res = []
      list = data.results.bindings
      resCB null, list
    xhr.error resCB

  # Testing all the methods above. See results in the console
  test: ->
    @getVideos (err, res) ->
      if err
        console.error "getVideos error", err, res
        return
      console.info "getVideos result", res

    @getAnnotatedVideos (err, res) =>
      if err
        console.error "getAnnotatedVideos error", err, res
        return
      console.info "getAnnotatedVideos result", res

      firstVideo = res[0].instance.value

      console.info "Getting locators for", firstVideo
      @getVideoLocators firstVideo, (err, res) =>
        if err
          console.error "getVideoLocators error", err, res
          return
        console.info "getVideoLocators result", res
        videolocator = res[0].source
        @getAllVideoLocators videolocator, (err, res) =>
          if err
            console.error "getAllVideoLocators error", err, res
            return
          console.info "getAllVideoLocators result", res
        @getAnnotationsForLocator videolocator, (err, annotations) =>
          if err
            console.error "getAnnotationsForLocator error", err, annotations
            return
          console.info "getAnnotationsForLocator result", annotations

        @getLocatorsForVideoOrLocator firstVideo, (err, res) =>
          if err
            console.error "getLocatorsForVideoOrLocator error", err, res
            return
          console.info "getLocatorsForVideoOrLocator result", firstVideo, res

        @getLocatorsForVideoOrLocator videolocator, (err, res) =>
          if err
            console.error "getLocatorsForVideoOrLocator error", err, res
            return
          console.info "getLocatorsForVideoOrLocator result", videolocator, res

        @getAnnotationsForVideoOrLocator firstVideo, (err, annotations) =>
          if err
            console.error "getAnnotationsForVideoOrLocator error", err, annotations
            return
          console.info "getAnnotationsForVideoOrLocator result", firstVideo, annotations

        @getAnnotationsForVideoOrLocator videolocator, (err, annotations) =>
          if err
            console.error "getAnnotationsForVideoOrLocator error", err, annotations
            return
          console.info "getAnnotationsForVideoOrLocator result", videolocator, annotations

      @getAnnotationsForVideo firstVideo, (err, annotations) =>
        if err
          console.error "getAnnotationsForVideo error", err, annotations
          return
        console.info "getAnnotationsForVideo result", annotations

