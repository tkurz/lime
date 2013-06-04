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
      if(nonConcept.length >= 0)
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
    locationName = annotation.getLabel()
    latitude = annotation.getLatitude()
    longitude = annotation.getLongitude()
    latlng = new google.maps.LatLng(latitude, longitude)

    #console.log("latitude: " + latitude + " longitude: " + longitude + " = latlong: " + latlng);
    myOptions =
      zoom: 11
      center: latlng
      mapTypeId: google.maps.MapTypeId.ROADMAP

    map = new google.maps.Map(output[0], myOptions)
    weatherLayer = new google.maps.weather.WeatherLayer(temperatureUnits: google.maps.weather.TemperatureUnit.CELSIUS)
    weatherLayer.setMap map
