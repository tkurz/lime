class window.GeoNamesMapPlugin extends window.LimePlugin
  init: ->
    @name = 'GeoNamesMapPlugin'
    annotation = undefined
    console.info "Initialize GeoNamesMapPlugin"

    for annotation in @lime.annotations
      relevant = false
      relevant = annotation.resource.value.indexOf("sws.geonames.org") > 0 or (annotation.hash.latitude and annotation.hash.latitude)
      unless annotation.relation.value in ['http://connectme.at/ontology#explicitlyShows', 'http://connectme.at/ontology#explicitlyMentions', 'http://connectme.at/ontology#implicitlyShows' , 'http://connectme.at/ontology#implicitlyMentions'] # is "http://connectme.at/ontology#hasKeyword"
        relevant = false
      if relevant
        @handleAnnotation annotation

  # Putting this into a function keeps the annotation in the context
  handleAnnotation: (annotation) ->
    # console.info "The annotation #{annotation.resource} looks interesting, get the whole entity so we can show it in a widget!", annotation
    annotation.entityPromise.done =>
      # console.info "entities for annotation #{annotation.resource} loaded, create a widget for it!", annotation
      widget = @lime.allocateWidgetSpace @,
        thumbnail: "img/mapIcon.png" # should go into CSS
        title: "#{annotation.getLabel()} Map"
        type: "GeoNamesMapWidget"
        sortBy: ->
          10000 * annotation.start + annotation.end

      # We're going to need the annotation for the widget's `activate` event
      widget.annotation = annotation
      # widget was activated, we show details now
      jQuery(widget).bind 'activate', (e) =>
        try
          eventClickedLabel = e.target.options.title
          eventCategory = @name
          _gaq.push ['_trackEvent',eventCategory, 'clicked',eventClickedLabel]
        catch error
        @showInModalWindow annotation, @getModalContainer()

      # Hang the widget on the annotation
      annotation.widgets[@name] = widget

      jQuery(annotation).bind "becomeActive", (e) =>
        #attached gogle analytics stack push for active annotation
        try
          eventActiveLabel = e.target.widgets[@name].options.title
          eventCategory = @name
          _gaq.push ['_trackEvent',eventCategory,'becameActive',eventActiveLabel]
        catch error
        annotation.widgets[@name].setActive()

      jQuery(annotation).bind "becomeInactive", (e) =>
        #attached gogle analytics stack push for inactive annotation
        try
          eventActiveLabel = e.target.widgets[@name].options.title
          eventCategory = @name
          _gaq.push ['_trackEvent',eventCategory,'becomeInactive',eventActiveLabel]
        catch error
        annotation.widgets[@name].setInactive()


      jQuery(widget).bind "leftarrow", (e) =>
        # @geotabsiterator += 1
        @geotabsiterator = if @geotabs.length is @geotabsiterator + 1 then 0 else @geotabsiterator + 1
        #$('.geotab.selected').removeClass 'selected'
        if (@geotabsiterator == 0)
          $("#geoMap").trigger 'click'
          #$("#geoMap").addClass 'selected'
        if (@geotabsiterator == 1)
          $("#geoWeather").trigger 'click'

        if (@geotabsiterator == 2)
          $("#geoRout").trigger 'click'
          #$("#geoRout").addClass 'selected'
        if (@geotabsiterator == 3)
          $("#geoPanoramio").trigger 'click'
          #$("#geoPanoramio").addClass 'selected'

      jQuery(widget).bind "rightarrow", (e) =>
        # @geotabsiterator += 1
        @geotabsiterator = if @geotabsiterator is 0 then @geotabs.length - 1  else @geotabsiterator - 1
        #$('.geotab.selected').removeClass 'selected'
        if (@geotabsiterator == 0)
          $("#geoMap").trigger 'click'
          #$("#geoMap").addClass 'selected'
        if (@geotabsiterator == 1)
          $("#geoWeather").trigger 'click'
          #$("#geoWeather").addClass 'selected'
        if (@geotabsiterator == 2)
          $("#geoRout").trigger 'click'
          #$("#geoRout").addClass 'selected'
        if (@geotabsiterator == 3)
          $("#geoPanoramio").trigger 'click'
          #$("#geoPanoramio").addClass 'selected'

      jQuery(widget).bind "uparrow", (e) =>

        # customEvent = jQuery.Event "keydown"
        # customEvent.which = 107 # + key code value

        # $("#geoMap").trigger 'click'
        # $("#map_area").trigger customEvent
        currentZoom = @geomap.getZoom()
        @geomap.setZoom currentZoom + 1

      jQuery(widget).bind "downarrow", (e) =>
        currentZoom = @geomap.getZoom()
        @geomap.setZoom currentZoom - 1


  showInModalWindow: (annotation, outputElement) ->
    modalContent = undefined
    result = undefined
    language = UTILS.getParameterByName("lang")
    startTime = new Date().getTime()


    # fix container size
    modalContent = $(outputElement)
    modalContent.css "width", "600px"

    modalContent.css "height", "500px"

    # render widget
    if language.indexOf("en") >= 0
      # result = "<div id=\"map_area\" class=\"mainWidgetContainer\" style=\"position: absolute; z-index: 900; background-image: url('img/map.png'); background-repeat: no-repeat; background-position: left top; background-size: cover; box-shadow: inset 0 0 5px #888; height: " + (widgetHeight - 116) + "px; width: 740px; left: 0px; top: 116px;\"></div>\n <div id=\"geowidgetheader\" style=\"position: absolute; z-index: 900; background-color: #9c9c9b; background-repeat: no-repeat; background-position: 0px 0px; background-size: cover; background-image: url('img/mapBckg.png'); width: 660px; height: 116px; left: 80px; top: 0;\">\n   <div id=\"location_bar\" style=\"background-color: #45c048; width: 100%; position: relative; left: 0px; top: 0px; height: 38px; visibility: hidden; visibility: hidden;\">\n  </div>\n   <div id=\"weather_bar\" style=\"height: 38px; width: 100%; background-color: #f8cb86; visibility: hidden;\"></div>\n   <div id=\"close\" style=\"position: absolute; background-color: #070606; width: 0px; height: 100%; left: 616px; top: 0px;\">\n</div>\n   <p id=\"elevation\" style=\"bottom: 1px; float: none; display: inline; position: absolute; z-index: 900; font-family: Arial,Helvetica,sans-serif; font-size: 22px; text-align: right; line-height: normal; font-weight: bold; color: #ffffff; vertical-align: baseline; text-decoration: none; font-style: normal; text-indent: 0; margin-top: 0px; margin-bottom: 0px; margin-right: 1em; right: 48px;\"> &nbsp; </p>\n   <div id=\"rout_bar\" style=\"width: 100%; height: 40px; background-color: #fc8466; visibility: hidden;\"></div>\n </div>\n <div id=\"menu_bar\" style=\"border: none; position: absolute; z-index: 900; background-color: transparent; width: 77px; height: 113px; left: 3px; top: 0;\">\n <div id=\"menu_button_container\" style=\"position: relative; top: 0px; display: block; right: 0px; z-index: 900; float: right; width: 80px; height: 117px; left: 0px;\">\n<div id=\"geoMap\" style=\"position: relative; background-position: center center; background-image: url('img/mapIcon.png'); background-size: contain; float: none; height: 38px; width: 86px;\"></div>\n<div id=\"geoWeather\" style=\"position: relative; background-position: center center; background-image: url('img/weather.png'); background-size: contain; float: none; width: 86px; height: 38px;\"></div>\n<div id=\"geoRout\" style=\"background-position: center center; background-size: contain; background-image: url('img/directionIcon.png'); float: none; width: 86px; height: 40px;\"></div>\n</div>\n </div>\n </body>"
      result = """
               <div id="ifoWidgetExpanded" style="border: 1px dotted lightgray; position: absolute; top: 0; z-index: 100; width: 600px; right: 0; height: 100%;">
               <div id="map_area" style="left: 0px; top: 0px; width: 600px; height: 100%; position: relative;"></div>
               <div id="mapMenu" style="position: absolute; z-index: 900; width: auto; right: 1px; bottom: 0px; height: 41px;">
               <div id="geoMap" class="geotab" style="position: relative; background-position: center center; background-image: url('img/mapIcon.png'); background-size: contain; float: right; height: 40px; width: 86px;"></div>
               <div id="geoWeather" class="geotab" style="position: relative; background-position: center center; background-image: url('img/weather.png'); background-size: contain; float: right; width: 86px; height: 40px;"></div>
               <div id="geoRout" class="geotab" style="background-position: center center; background-size: contain; background-image: url('img/directionIcon.png'); float: right; width: 86px; height: 40px;"></div>
               <div id="geoPanoramio" class="geotab disabled" style="display: none; background-position: center center; background-size: contain; background-image: url('img/directionIcon.png'); float: right; width: 86px; height: 40px;"></div>
               </div>
              <!-- <div id="closingButton" style="position: absolute; z-index: 900; width: 87px; height: 38px; background-color: #414040; left: 513px; top: 408px;"><span data-dojo-type="shapes.Text" style="font-size: 14px; position: absolute; z-index: 900; color: #ffffff; left: 41px; top: 8.5px;">X</span></div> -->
               </div>
               """
    else
      # result = "<div id=\"map_area\" class=\"mainWidgetContainer\" style=\"position: absolute; z-index: 900; background-image: url('img/map.png'); background-repeat: no-repeat; background-position: left top; background-size: cover; box-shadow: inset 0 0 5px #888; height: " + (widgetHeight - 116) + "px; width: 740px; left: 0px; top: 116px;\"></div>\n <div id=\"geowidgetheader\" style=\"position: absolute; z-index: 900; background-color: #9c9c9b; background-repeat: no-repeat; background-position: 0px 0px; background-size: cover; background-image: url('img/mapBckg.png'); width: 660px; height: 116px; left: 80px; top: 0;\">\n   <div id=\"location_bar\" style=\"background-color: #45c048; width: 617px; position: relative; left: 0px; top: 0px; height: 38px;\">\n  </div>\n   <div id=\"weather_bar\" style=\"height: 38px; width: 617px; background-color: #f8cb86;\"></div>\n   <div id=\"close\" style=\"position: absolute; background-color: #070606; width: 48px; height: 100%; left: 616px; top: 0px;\">\n</div>\n   <p id=\"elevation\" style=\"bottom: 1px; float: none; display: inline; position: absolute; z-index: 900; font-family: Arial,Helvetica,sans-serif; font-size: 22px; text-align: right; line-height: normal; font-weight: bold; color: #ffffff; vertical-align: baseline; text-decoration: none; font-style: normal; text-indent: 0; margin-top: 0px; margin-bottom: 0px; margin-right: 1em; right: 48px;\"> &nbsp; </p>\n   <div id=\"rout_bar\" style=\"width: 617px; height: 40px; background-color: #fc8466;\"></div>\n </div>\n <div id=\"menu_bar\" style=\"border: none; border-radius: 6px; -moz-border-radius: 6px; border-top-left-radius: 6px; border-top-right-radius: 6px; border-bottom-right-radius: 6px; border-bottom-left-radius: 6px; position: absolute; z-index: 900; background-color: transparent; width: 77px; height: 113px; left: 0px; top: 0;\">\n <div id=\"menu_button_container\" style=\"position: relative; top: 0px; display: block; right: 0px; z-index: 900; float: right; width: 80px; height: 117px; left: 0px;\">\n<div id=\"geoMap\" style=\"position: relative; background-position: center center; background-image: url('img/mapIcon.png'); background-size: contain; float: none; height: 38px; width: 86px;\"></div>\n<div id=\"geoWeather\" style=\"position: relative; background-position: center center; background-image: url('img/weather.png'); background-size: contain; float: none; width: 86px; height: 38px;\"></div>\n<div id=\"geoRout\" style=\"background-position: center center; background-size: contain; background-image: url('img/directionIcon.png'); float: none; width: 86px; height: 40px;\"></div>\n</div>\n </div>\n </body>"  if language.indexOf("de") >= 0
      result = """
               <div id="ifoWidgetExpanded" style="border: 1px dotted lightgray; position: absolute; top: 0; z-index: 100; width: 600px; right: 0; height: 80%;">
               <div id="map_area" style="left: 0px; top: 0px; width: 600px; height: 100%; position: relative;"></div>
               <div id="mapMenu" style="position: absolute; z-index: 900; width: auto; right: 1px; bottom: 0px; height: 41px;">
               <div id="geoMap" class="geotab" style="position: relative; background-position: center center; background-image: url('img/mapIcon.png'); background-size: contain; float: right; height: 40px; width: 86px;"></div>
               <div id="geoWeather" class="geotab" style="position: relative; background-position: center center; background-image: url('img/weather.png'); background-size: contain; float: right; width: 86px; height: 40px;"></div>
               <div id="geoRout" class="geotab" style="background-position: center center; background-size: contain; background-image: url('img/directionIcon.png'); float: right; width: 86px; height: 40px;"></div>
               <div id="geoPanoramio" class="geotab disabled" style="display: none; background-position: center center; background-size: contain; background-image: url('img/directionIcon.png'); float: right; width: 86px; height: 40px;"></div>
               </div>
               <!-- <div id="closingButton" style="position: absolute; z-index: 900; width: 87px; height: 38px; background-color: #414040; left: 513px; top: 408px;"><span data-dojo-type="shapes.Text" style="font-size: 14px; position: absolute; z-index: 900; color: #ffffff; left: 41px; top: 8.5px;">X</span></div> -->
               </div>
               """
    modalContent.append result
    @geotabs = $('.geotab:not(.disabled)')
    @geotabsiterator = 0

    # control widget
    $(".close").click (e) =>
      endTime = new Date().getTime()
      timeSpent = endTime - startTime
      eventLabel = annotation.widgets[@name].options.title
      try
        _gaq.push ['_trackEvent', @name, 'viewed', eventLabel, timeSpent]
        _gaq.push ['_trackTiming', @name, eventLabel, timeSpent, 'viewed']
      catch error

    $('#mask').click (e) =>
      endTime = new Date().getTime()
      timeSpent = endTime - startTime
      eventLabel = annotation.widgets[@name].options.title
      try
        _gaq.push ['_trackEvent', @name, 'viewed', eventLabel, timeSpent]
        _gaq.push ['_trackTiming', @name, eventLabel, timeSpent, 'viewed']
      catch error

    $("#geoMap").click =>
      $('.geotab.selected').removeClass 'selected'
      # menu handling
      $("#location_bar").css "visibility", "visible"
      $("#weather_bar").css "visibility", "hidden"
      $("#rout_bar").css "visibility", "hidden"
      $("#map_area").empty()

      # cartography handling
      i = undefined
      latitude = undefined
      latlng = undefined
      locationName = undefined
      longitude = undefined
      map = undefined
      myOptions = undefined
      output = undefined
      x = undefined
      xmlDoc = undefined
      xmlhttp = undefined
      ###
      try
        if window.XMLHttpRequest
          xmlhttp = new XMLHttpRequest()
        else
          xmlhttp = new ActiveXObject("Microsoft.XMLHTTP")
        xmlhttp.open "POST", annotation.resource.value + "/about.rdf", false
        xmlhttp.send()
        xmlDoc = xmlhttp.responseXML
        x = xmlDoc.getElementsByTagName("Feature")
        i = 0
        while i < x.length
          locationName = x[i].getElementsByTagName("name")[0].childNodes[0].nodeValue
          latitude = x[i].getElementsByTagName("lat")[0].childNodes[0].nodeValue
          longitude = x[i].getElementsByTagName("long")[0].childNodes[0].nodeValue
          i++
        output = document.getElementById("map_area")
        latlng = new google.maps.LatLng(latitude, longitude)
        myOptions =
          zoom: 13
          center: latlng
          mapTypeId: google.maps.MapTypeId.ROADMAP

        map = new google.maps.Map(output, myOptions)
        @geomap = map
        console.info @geomap
        # google.maps.event.addListener(output, 'keydown', console.info 'map catched the keydown event');

      ###
      locationName = annotation.getLabel()
      latitude = annotation.getLatitude()
      longitude = annotation.getLongitude()

      output = document.getElementById("map_area")
      latlng = new google.maps.LatLng(latitude, longitude)
      myOptions =
        zoom: 13
        center: latlng
        mapTypeId: google.maps.MapTypeId.ROADMAP

      map = new google.maps.Map(output, myOptions)
      @geomap = map


      $("#geoMap").addClass 'selected'

    $("#geoWeather").click =>
      $('.geotab.selected').removeClass 'selected'
      # menu handling
      $("#location_bar").css "visibility", "hidden"
      $("#weather_bar").css "visibility", "visible"
      $("#rout_bar").css "visibility", "hidden"
      $("#map_area").empty()

      # cartography handling
      i = undefined
      latitude = undefined
      latlng = undefined
      locationName = undefined
      longitude = undefined
      map = undefined
      myOptions = undefined
      output = undefined
      weatherLayer = undefined
      x = undefined
      xmlDoc = undefined
      xmlhttp = undefined
      ###
      try
        if window.XMLHttpRequest
          xmlhttp = new XMLHttpRequest()
        else
          xmlhttp = new ActiveXObject("Microsoft.XMLHTTP")
        xmlhttp.open "POST", annotation.resource.value + "/about.rdf", false
        xmlhttp.send()
        xmlDoc = xmlhttp.responseXML
        x = xmlDoc.getElementsByTagName("Feature")
        i = 0
        while i < x.length
          locationName = x[i].getElementsByTagName("name")[0].childNodes[0].nodeValue
          latitude = x[i].getElementsByTagName("lat")[0].childNodes[0].nodeValue
          longitude = x[i].getElementsByTagName("long")[0].childNodes[0].nodeValue
          i++

      ###
      locationName = annotation.getLabel()
      latitude = annotation.getLatitude()
      longitude = annotation.getLongitude()

      output = document.getElementById("map_area")
      latlng = new google.maps.LatLng(latitude, longitude)
      myOptions =
        zoom: 11
        center: latlng
        mapTypeId: google.maps.MapTypeId.ROADMAP

      map = new google.maps.Map(output, myOptions)
      weatherLayer = new google.maps.weather.WeatherLayer(temperatureUnits: google.maps.weather.TemperatureUnit.CELSIUS)
      weatherLayer.setMap map
      @geomap = map
      $("#geoWeather").addClass 'selected'

    $("#geoRout").click =>
      $('.geotab.selected').removeClass 'selected'
      # menu handling
      $("#location_bar").css "visibility", "hidden"
      $("#weather_bar").css "visibility", "hidden"
      $("#rout_bar").css "visibility", "visible"
      $("#map_area").empty()

      # cartography handling
      if navigator.geolocation
        navigator.geolocation.getCurrentPosition ((position) ->
          i = undefined
          latitude = undefined
          locationName = undefined
          longitude = undefined
          map = undefined
          myOptions = undefined
          output = undefined
          x = undefined
          xmlDoc = undefined
          xmlhttp = undefined
          start = undefined
          destination = undefined
          directionDisplay = undefined
          directionsService = new google.maps.DirectionsService()
          ###
          try
            if window.XMLHttpRequest
              xmlhttp = new XMLHttpRequest()
            else
              xmlhttp = new ActiveXObject("Microsoft.XMLHTTP")
            xmlhttp.open "POST", annotation.resource.value + "/about.rdf", false
            xmlhttp.send()
            xmlDoc = xmlhttp.responseXML
            x = xmlDoc.getElementsByTagName("Feature")
            i = 0
            while i < x.length
              locationName = x[i].getElementsByTagName("name")[0].childNodes[0].nodeValue
              latitude = x[i].getElementsByTagName("lat")[0].childNodes[0].nodeValue
              longitude = x[i].getElementsByTagName("long")[0].childNodes[0].nodeValue
              i++

          ###

          locationName = annotation.getLabel()
          latitude = annotation.getLatitude()
          longitude = annotation.getLongitude()

          output = document.getElementById("map_area")
          directionsDisplay = new google.maps.DirectionsRenderer()
          destination = new google.maps.LatLng(latitude, longitude)
          mapOptions =
            zoom: 7
            mapTypeId: google.maps.MapTypeId.ROADMAP
            center: destination

          map = new google.maps.Map(output, mapOptions)
          start = new google.maps.LatLng(position.coords.latitude, position.coords.longitude)

          # set direction map
          #alert(start);
          directionsDisplay.setMap map
          @geomap = map
          request =
            origin: start
            destination: destination
            travelMode: google.maps.TravelMode.DRIVING

          directionsService.route request, (result, status) ->
            directionsDisplay.setDirections result  if status is google.maps.DirectionsStatus.OK


          # next function is the error callback
        ),
        (error) ->
          switch error.code
            when error.TIMEOUT
              alert "Timeout"
            when error.POSITION_UNAVAILABLE
              alert "Position unavailable"
            when error.PERMISSION_DENIED
              alert "Permission denied"
            when error.UNKNOWN_ERROR
              alert "Unknown error"
      $("#geoRout").addClass 'selected'

    $("#geoPanoramio").click =>
      $('.geotab.selected').removeClass 'selected'
      $("#geoPanoramio").addClass 'selected'


    # default selection
    $("#geoMap").trigger "click"
    $("#geoMap").addClass 'selected'
    return;
