class window.BusinessPlugin extends window.LimePlugin
  init: ->
    @name = 'BusinessPlugin'
    annotation = undefined
    console.info "Initialize BusinessPlugin"

    for annotation in @lime.annotations
      if annotation.isBookmark() and annotation.resource.value.indexOf("youtube.com") < 0 and annotation.relation.value in ['http://connectme.at/ontology#explicitlyShows', 'http://connectme.at/ontology#explicitlyMentions', 'http://connectme.at/ontology#implicitlyShows' , 'http://connectme.at/ontology#implicitlyMentions', 'http://connectme.at/ontology#hasContent']
        # if annotation.resource.value.indexOf("geonames") < 0 && annotation.resource.value.indexOf("dbpedia") < 0 && annotation.resource.value.indexOf("youtube") < 0
        @handleAnnotation annotation

  # Putting this into a function keeps the annotation in the context
  handleAnnotation: (annotation) ->
    # console.info "The annotation #{annotation.resource} looks interesting, get the whole entity so we can show it in a widget!", annotation
    # annotation.entityPromise.done (entities) =>
    # console.info "entities for annotation #{annotation.resource} loaded, create a widget for it!", annotation
    nonConcept = annotation.resource.value
    #nonConcept = nonConcept.replace("No description found.","")
    if(nonConcept.length >= 3)
      url = annotation.resource.value;
      domain = url.replace('http://','').replace('https://','').split(/[/?#]/)[0].replace('www.', '')

    widget = @lime.allocateWidgetSpace @,
        thumbnail: "img/shop.png" # should go into CSS
        title: "#{domain}"
        type: "BusinessWidget"
        sortBy: ->
          10000 * annotation.start + annotation.end

      # We're going to need the annotation for the widget's `activate` event
      widget.annotation = annotation
      # widget was activated, we show details now
      jQuery(widget).bind 'activate', (e) =>
        @showAbstractInModalWindow annotation, @getModalContainer()

      # Hang the widget on the annotation
      annotation.widgets[@name] = widget

      jQuery(annotation).bind "becomeActive", (e) =>
        annotation.widgets[@name].setActive()

      jQuery(annotation).bind "becomeInactive", (e) =>
        annotation.widgets[@name].setInactive()

  showAbstractInModalWindow: (annotation, outputElement) ->
    modalContent = $(outputElement)
    modalContent.css "width", "800px"
    modalContent.css "height", "600px"
    startTime = new Date().getTime()
    #console.log("latitude: " + latitude + " longitude: " + longitude + " = latlong: " + latlng);
    lime = this.lime
    resource = ""
    resource = annotation.resource.value

    if annotation.resource.value.indexOf("webtv.feratel.com") > 0
      resource = resource.replace /\$\$/g, "&"

    console.log resource
    #result = "<div id=\"listContainer\" style=\"position:relative; float: left; z-index: 10; width:35%; height: 95%; background: white; box-shadow: rgba(85,85,85,0.5) 0px 0px 24px;\" >" + "<img src=\"" + depiction + "\" style=\"display: block; width: auto; max-height: 300px; max-width:90%; margin-top: 30px; margin-left: auto;  margin-right: auto; border: 5px solid black; \" >" + "</div>" + "<div id=\"displayArea\" style=\"position:relative; float: left; z-index: 1; width: 65%; height:95%; background: #DBDBDB; overflow: auto;\">" + "<p style=\"margin-left: 10px; font-size: 22px; text-align: left; color:black; font-family: 'Share Tech', sans-serif; font-weight: 400;\">" + comment + "</p>" + "</div>";
    result = """
             <iframe frameborder="0" style="height: 600px; width: 800px; position: relative; margin: 0 auto;" src="#{resource}">
             <p>Your browser does not support iframes.</p>
             </iframe>
             """
    modalContent.append result

    #widget controls
    $(".close").click (e) =>
      endTime = new Date().getTime()
      timeSpent = endTime - startTime
      eventLabel = annotation.widgets[@.name].options.title
      console.log ": #{eventLabel} was viewed #{timeSpent} msec."

    $('#mask').click (e) =>
      endTime = new Date().getTime()
      timeSpent = endTime - startTime
      eventLabel = annotation.widgets[@.name].options.title
      console.log ": #{eventLabel} was viewed #{timeSpent} msec."
