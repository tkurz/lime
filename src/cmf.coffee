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
      WHERE {
        ?instance a mao:MediaResource.
        OPTIONAL {?instance mao:title ?title.}
        ?instance yoovis:hasThumbnail ?thumbnail.
      }
      ORDER BY ?instance"""

  # Get the list of all annotated videos stored on the CMF server
  getAnnotatedVideos: (resCB) ->
    query = @_annotatedVideosQuery
    return @_runSPARQL(query, resCB)
  _annotatedVideosQuery: """
    PREFIX mao: <http://www.w3.org/ns/ma-ont#>
    PREFIX oac: <http://www.openannotation.org/ns/>
    PREFIX yoovis: <http://yoovis.at/ontology/08/2012/>
    SELECT DISTINCT ?instance ?title ?thumbnail
    WHERE {
      ?instance a mao:MediaResource.
      OPTIONAL {?instance mao:title ?title.}
      ?instance mao:hasFragment ?fragment.
      OPTIONAL {?instance yoovis:hasThumbnail ?thumbnail.}
      ?annotation a oac:Annotation.
      ?annotation oac:hasTarget ?fragment.
      ?annotation oac:hasBody ?body
    }
    ORDER BY ASC(?title)"""

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
      PREFIX mao: <http://www.w3.org/ns/ma-ont#>
      PREFIX cma: <http://connectme.at/ontology#>
      SELECT DISTINCT ?annotation ?fragment ?resource ?relation ?type ?prefLabel
      WHERE {
        <#{resource}>  mao:hasFragment ?f.
        ?f mao:locator ?fragment.
        ?annotation oac:hasTarget ?f.
        ?annotation a ?type.
        OPTIONAL{?annotation cma:preferredLabel ?prefLabel.}
        ?annotation oac:hasBody ?resource.
        ?f ?relation ?resource.
      }"""

  # Get annotations for a video's locator uri
  getAnnotationsForLocator: (locator, resCB) ->
    res = []
    query = @_annotationsForLocator(locator)
    @_runSPARQL(query, resCB)
  _annotationsForLocator: (locator) -> """
    PREFIX oac: <http://www.openannotation.org/ns/>
    PREFIX mao: <http://www.w3.org/ns/ma-ont#>
    PREFIX cma: <http://connectme.at/ontology#>
    SELECT DISTINCT ?annotation ?fragment ?resource ?relation ?type ?prefLabel
    WHERE {
      ?videoresource mao:locator <#{locator}>.
      ?videoresource mao:hasFragment ?f.
      ?f mao:locator ?fragment.
      ?annotation oac:hasTarget ?f.
      ?annotation oac:hasBody ?resource.
      ?annotation a ?type.
      OPTIONAL{?annotation cma:preferredLabel ?prefLabel.}
      ?f ?relation ?resource.
    }"""

  # Get video locators for a video's CMF resource uri
  getVideoLocators: (resource, resCB) ->
    res = []
    query = @_getVideoLocators(resource)
    @_runSPARQL query, (err, res) ->
      unless err
        typeRegexp = new RegExp /\.(.{3,4})$/
        locators = _(res).map (l) ->
          if l.source.value.indexOf("<crid") <0
            type = l.type?.value or "video/#{ l.source.value.match(typeRegexp)[1] }"
            return source: l.source.value, type: type

      resCB err, locators
  _getVideoLocators: (resource) -> """
    PREFIX oac: <http://www.openannotation.org/ns/>
    PREFIX mao: <http://www.w3.org/ns/ma-ont#>
    SELECT DISTINCT ?source ?type
    WHERE {
      <#{resource}>  mao:locator ?source.
      OPTIONAL {?source mao:hasFormat ?type}
      FILTER regex(str(?source), "(http|https)")
    }
    ORDER BY ?source"""

  # Get all video locators for any of a video's locators
  getAllVideoLocators: (locator, resCB) ->
    res = []
    query = @_getAllVideoLocators locator
    @_runSPARQL query, (err, res) ->
      unless err
        typeRegexp = new RegExp /\.(.{3,4})$/
        locators = _(res).map (l) ->
          if l.source.value.indexOf("crid") <0
            type = l.type?.value or "video/#{ l.source.value.match(typeRegexp)[1] }"
            return source: l.source.value, type: type
      resCB err, locators
  _getAllVideoLocators: (locator) -> """
    PREFIX oac: <http://www.openannotation.org/ns/>
    PREFIX mao: <http://www.w3.org/ns/ma-ont#>
    SELECT DISTINCT ?source ?type
    WHERE {
      ?resource mao:locator <#{locator}>.
      ?resource  mao:locator ?source.
      OPTIONAL {?source mao:hasFormat ?type}
      FILTER regex(str(?source), "(http|https)")
    }
    ORDER BY ?source"""

  getLSIVideosForTerm: (keywordUri, resCB) ->
    res = []
    query = @_getLSIVideosForTerm keywordUri
    @_runSPARQL query, (err, res) ->
      resCB err, res

  _getLSIVideosForTerm: (keywordUri) -> """
    PREFIX mao: <http://www.w3.org/ns/ma-ont#>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    SELECT DISTINCT ?video ?duration ?description ?locator ?title ?img
    WHERE {
      ?video mao:hasKeyword <#{keywordUri}> .
      ?video a <http://www.w3.org/ns/ma-ont#VideoTrack> .
      OPTIONAL {?video mao:description ?description}.
      ?video mao:locator ?locator .
      OPTIONAL {?video mao:duration ?duration}.
      ?video mao:title ?title .
      OPTIONAL {?video foaf:img ?img}.
    }
    ORDER BY ?video """
  ###
  _getLSIVideosForTerm: (keywordUri) -> """
    PREFIX mao: <http://www.w3.org/ns/ma-ont#>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    SELECT DISTINCT ?video ?duration ?description ?locator ?title ?img
    WHERE {
      ?s <http://connectme.at/ontology#hasRelatedVideo> ?video .
      ?s <http://www.w3.org/ns/ma-ont#hasKeyword> <#{keywordUri}> .
      OPTIONAL {?video mao:description ?description}.
      ?video mao:locator ?locator .
      ?video mao:duration ?duration.
      ?video mao:title ?title .
      OPTIONAL {?video foaf:img ?img}.
    }
    ORDER BY ?video  """
  ###
  getLSIImagesForTerm: (keywordUri, resCB) ->
    res = []
    query = @_getLSIImagesForTerm keywordUri
    @_runSPARQL query, (err, res) ->
      resCB err, res

  _getLSIImagesForTerm: (keywordUri) -> """
    PREFIX mao: <http://www.w3.org/ns/ma-ont#>
    SELECT DISTINCT ?image
    WHERE {
      ?image a <http://www.w3.org/ns/ma-ont#Image> .
      ?image mao:hasKeyword <#{keywordUri}> .
    }
    ORDER BY ?image """

  getGRDataForTerm: (keywordUri, resCB) ->
    res = []
    query = @_getGRDataForTerm keywordUri
    @_runSPARQL query, (err, res) ->
      resCB err, res

  _getGRDataForTerm: (keywordUri) -> """
                                        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                                        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                                        PREFIX gr: <http://purl.org/goodrelations/v1#>
                                        PREFIX vCard: <http://www.w3.org/2001/vcard-rdf/3.0#>
                                        PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
                                        SELECT DISTINCT ?name ?street ?pcode ?city ?country ?telephone ?email ?description ?geoLat ?geoLong ?pricevalue ?pricecurrency ?product
                                        WHERE {
                                        <#{keywordUri}> gr:legalName ?name.
                                        <#{keywordUri}> vCard:ADR ?address.
                                        ?address vCard:Street ?street.
                                        ?address vCard:Pcode ?pcode.
                                        ?address vCard:City ?city.
                                        ?address vCard:Country ?country.
                                        ?address vCard:TEL ?tel.
                                        <#{keywordUri}> geo:lat ?geoLat.
                                        <#{keywordUri}> geo:long ?geoLong.
                                        ?tel rdf:value ?telephone.
                                        ?address vCard:EMAIL ?em.
                                        ?em rdf:value ?email.
                                        <#{keywordUri}> gr:offers ?offer.
                                        ?offer rdfs:comment ?description.
                                        ?offer gr:hasPriceSpecification ?price.
                                        ?price gr:hasCurrencyValue ?pricevalue.
                                        ?price gr:hasCurrency ?pricecurrency.
                                        ?price rdfs:comment ?product.
                                        }
                                        """

  # running SPARQL query
  _runSPARQL: (query, resCB) ->
    uri = "#{@url}sparql/select?query=#{encodeURIComponent(query)}&output=json"
    xhr = jQuery.getJSON uri, (data) =>
      res = []
      list = data.results.bindings
      if list.length isnt _(list).uniq().length
        console.warn('CMF DISTINCT is being ignored!', list, query)
        list = _(list).uniq()
      resCB null, list
    xhr.error resCB
    xhr

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

