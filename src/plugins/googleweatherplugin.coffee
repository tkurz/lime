class window.GoogleWeatherPlugin extends window.LimePlugin
  init: ->
    @name = 'GoogleWeatherPlugin'
    annotation = undefined
    console.info "Initialize GoogleWeatherPlugin"

    for annotation in @lime.annotations
      if annotation.resource.value.indexOf("geonames") > 0 && annotation.resource.value.indexOf("about.rdf") < 0
        @handleAnnotation annotation

  # Putting this into a function keeps the annotation in the context
  handleAnnotation: (annotation) ->
    # console.info "The annotation #{annotation.resource} looks interesting, get the whole entity so we can show it in a widget!", annotation
    annotation.entityPromise.done (entities) =>
      # console.info "entities for annotation #{annotation.resource} loaded, create a widget for it!", annotation
      nonConcept = annotation.getDescription()
      nonConcept = nonConcept.replace("No description found.","")
      if(nonConcept.length >= 3)
        widget = @lime.allocateWidgetSpace @,
          thumbnail: "img/weather.png" # should go into CSS
          title: "#{annotation.getLabel()} Weather"
          type: "GoogleWeatherWidget"
          sortBy: ->
            10000 * annotation.start + annotation.end

        # We're going to need the annotation for the widget's `activate` event
        widget.annotation = annotation
        # widget was activated, we show details now
        jQuery(widget).bind 'activate', (e) =>
          @showWeatherInModalWindow annotation, @getModalContainer()

        # Hang the widget on the annotation
        annotation.widgets[@name] = widget

        jQuery(annotation).bind "becomeActive", (e) =>
          annotation.widgets[@name].setActive()

        jQuery(annotation).bind "becomeInactive", (e) =>
          annotation.widgets[@name].setInactive()

  showWeatherInModalWindow: (annotation, output) ->
    try
      if window.XMLHttpRequest # code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest()
      else # code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP")
      xmlhttp.open "POST", annotation.resource.value + "/about.rdf", false
      xmlhttp.send()
      xmlDoc = xmlhttp.responseXML

      #document.write("<table border='1'>");
      x = xmlDoc.getElementsByTagName("Feature")
      i = 0
      while i < x.length

        #document.write("<tr><td>");
        locationName = x[i].getElementsByTagName("name")[0].childNodes[0].nodeValue

        #document.write("</td><td>");
        latitude = x[i].getElementsByTagName("lat")[0].childNodes[0].nodeValue

        #document.write("</td><td>");
        longitude = x[i].getElementsByTagName("long")[0].childNodes[0].nodeValue
        i++
    latlng = new google.maps.LatLng(latitude, longitude)

    #console.log("latitude: " + latitude + " longitude: " + longitude + " = latlong: " + latlng);
    myOptions =
      zoom: 11
      center: latlng
      mapTypeId: google.maps.MapTypeId.ROADMAP

    map = new google.maps.Map(output[0], myOptions)
    weatherLayer = new google.maps.weather.WeatherLayer(temperatureUnits: google.maps.weather.TemperatureUnit.CELSIUS)
    weatherLayer.setMap map
