class window.GeoNamesMapForTVPlugin extends window.LimePlugin
  init: ->
    @name = 'GeoNamesMapForTVPlugin'
    annotation = undefined
    console.info "Initialize GeoNamesMapForTVPlugin"

    for annotation in @lime.annotations
      if annotation.resource.value.indexOf("sws.geonames.org") > 0 and annotation.relation.value in ['http://connectme.at/ontology#explicitlyShows', 'http://connectme.at/ontology#explicitlyMentions', 'http://connectme.at/ontology#implicitlyShows' , 'http://connectme.at/ontology#implicitlyMentions'] # is "http://connectme.at/ontology#hasKeyword"
        @handleAnnotation annotation

  # Putting this into a function keeps the annotation in the context
  handleAnnotation: (annotation) ->
    # console.info "The annotation #{annotation.resource} looks interesting, get the whole entity so we can show it in a widget!", annotation
    annotation.entityPromise.done =>
      # console.info "entities for annotation #{annotation.resource} loaded, create a widget for it!", annotation
      widget = @lime.allocateWidgetSpace @,
        thumbnail: "img/mapIcon.png" # should go into CSS
        title: "#{annotation.getLabel()} Map"
        type: "GeoNamesMapForTVWidget"
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
        @geotabsiterator = if @geotabs.length is @geotabsiterator + 1 then 0 else @geotabsiterator + 1
        if (@geotabsiterator == 0)
          jQuery("#geoMap").trigger 'click'
        if (@geotabsiterator == 2)
          jQuery("#geoWeather").trigger 'click'
        if (@geotabsiterator == 1)
          jQuery("#geoRout").trigger 'click'
        if (@geotabsiterator == 3)
          jQuery("#geoPanoramio").trigger 'click'


        #jQuery(".geotab:not(.disabled):nth-child(#{@geotabsiterator})").trigger 'click'

      jQuery(widget).bind "rightarrow", (e) =>
        @geotabsiterator = if @geotabsiterator is 0 then @geotabs.length - 1  else @geotabsiterator - 1
        if (@geotabsiterator == 0)
          jQuery("#geoMap").trigger 'click'
        if (@geotabsiterator == 2)
          jQuery("#geoWeather").trigger 'click'
        if (@geotabsiterator == 1)
          jQuery("#geoRout").trigger 'click'
        if (@geotabsiterator == 3)
          jQuery("#geoPanoramio").trigger 'click'


      jQuery(widget).bind "uparrow", (e) =>

        # customEvent = jQuery.Event "keydown"
        # customEvent.which = 107 # + key code value

        # $("#geoMap").trigger 'click'
        # $("#map_area").trigger customEvent
        #currentZoom = @geomap.getZoom()
        #@geomap.setZoom currentZoom + 1
        @mapzoom++
        @routemapzoom++
        jQuery(".selected:first").trigger "click"

      jQuery(widget).bind "downarrow", (e) =>
        #currentZoom = @geomap.getZoom()
        #@geomap.setZoom currentZoom - 1
        @mapzoom--
        @routemapzoom--
        jQuery(".selected:first").trigger "click"


  showInModalWindow: (annotation, outputElement) ->
    modalContent = undefined
    result = undefined
    language = UTILS.getParameterByName("lang")
    startTime = new Date().getTime()


    # fix container size
    modalContent = jQuery(outputElement)
    modalContent.css "width", "450px"
    modalContent.css "height", "450px"

    # render widget
    if language.indexOf("en") >= 0
      # result = "<div id=\"map_area\" class=\"mainWidgetContainer\" style=\"position: absolute; z-index: 900; background-image: url('img/map.png'); background-repeat: no-repeat; background-position: left top; background-size: cover; box-shadow: inset 0 0 5px #888; height: " + (widgetHeight - 116) + "px; width: 740px; left: 0px; top: 116px;\"></div>\n <div id=\"geowidgetheader\" style=\"position: absolute; z-index: 900; background-color: #9c9c9b; background-repeat: no-repeat; background-position: 0px 0px; background-size: cover; background-image: url('img/mapBckg.png'); width: 660px; height: 116px; left: 80px; top: 0;\">\n   <div id=\"location_bar\" style=\"background-color: #45c048; width: 100%; position: relative; left: 0px; top: 0px; height: 38px; visibility: hidden; visibility: hidden;\">\n  </div>\n   <div id=\"weather_bar\" style=\"height: 38px; width: 100%; background-color: #f8cb86; visibility: hidden;\"></div>\n   <div id=\"close\" style=\"position: absolute; background-color: #070606; width: 0px; height: 100%; left: 616px; top: 0px;\">\n</div>\n   <p id=\"elevation\" style=\"bottom: 1px; float: none; display: inline; position: absolute; z-index: 900; font-family: Arial,Helvetica,sans-serif; font-size: 22px; text-align: right; line-height: normal; font-weight: bold; color: #ffffff; vertical-align: baseline; text-decoration: none; font-style: normal; text-indent: 0; margin-top: 0px; margin-bottom: 0px; margin-right: 1em; right: 48px;\"> &nbsp; </p>\n   <div id=\"rout_bar\" style=\"width: 100%; height: 40px; background-color: #fc8466; visibility: hidden;\"></div>\n </div>\n <div id=\"menu_bar\" style=\"border: none; position: absolute; z-index: 900; background-color: transparent; width: 77px; height: 113px; left: 3px; top: 0;\">\n <div id=\"menu_button_container\" style=\"position: relative; top: 0px; display: block; right: 0px; z-index: 900; float: right; width: 80px; height: 117px; left: 0px;\">\n<div id=\"geoMap\" style=\"position: relative; background-position: center center; background-image: url('img/mapIcon.png'); background-size: contain; float: none; height: 38px; width: 86px;\"></div>\n<div id=\"geoWeather\" style=\"position: relative; background-position: center center; background-image: url('img/weather.png'); background-size: contain; float: none; width: 86px; height: 38px;\"></div>\n<div id=\"geoRout\" style=\"background-position: center center; background-size: contain; background-image: url('img/directionIcon.png'); float: none; width: 86px; height: 40px;\"></div>\n</div>\n </div>\n </body>"
      result = """
               <div id="ifoWidgetExpanded" style="border: 1px dotted lightgray; position: absolute; top: 0; z-index: 100; width: 450px; right: 0; height: 100%;">
               <div id="map_area" style="left: 0px; top: 0px; width: 450px; height: 100%; position: relative;"><img></img></div>
               <div id="mapMenu" style="position: absolute; z-index: 900; width: 100%; background-color: rgba(37, 37, 37, 0.7); right: 1px; bottom: 0px; height: 41px;">
               <div id="geoMap" class="geotab" style="position: relative; background-position: center center; background-image: url('img/mapIcon.png'); background-size: contain; float: right; height: 40px; width: 86px;"></div>
               <div id="geoWeather" class="geotab disabled" style="display: none; position: relative; background-position: center center; background-image: url('img/weather.png'); background-size: contain; float: right; width: 86px; height: 40px;"></div>
               <div id="geoRout" class="geotab " style=" background-position: center center; background-size: contain; background-image: url('img/directionIcon.png'); float: right; width: 86px; height: 40px;"></div>
               <div id="geoPanoramio" class="geotab disabled" style="display: none; background-position: center center; background-size: contain; background-image: url('img/directionIcon.png'); float: right; width: 86px; height: 40px;"></div>
               </div>
               <!-- <div id="closingButton" style="position: absolute; z-index: 900; width: 87px; height: 38px; background-color: #414040; left: 513px; top: 408px;"><span data-dojo-type="shapes.Text" style="font-size: 14px; position: absolute; z-index: 900; color: #ffffff; left: 41px; top: 8.5px;">X</span></div> -->
               </div>
               """
    else
      # result = "<div id=\"map_area\" class=\"mainWidgetContainer\" style=\"position: absolute; z-index: 900; background-image: url('img/map.png'); background-repeat: no-repeat; background-position: left top; background-size: cover; box-shadow: inset 0 0 5px #888; height: " + (widgetHeight - 116) + "px; width: 740px; left: 0px; top: 116px;\"></div>\n <div id=\"geowidgetheader\" style=\"position: absolute; z-index: 900; background-color: #9c9c9b; background-repeat: no-repeat; background-position: 0px 0px; background-size: cover; background-image: url('img/mapBckg.png'); width: 660px; height: 116px; left: 80px; top: 0;\">\n   <div id=\"location_bar\" style=\"background-color: #45c048; width: 617px; position: relative; left: 0px; top: 0px; height: 38px;\">\n  </div>\n   <div id=\"weather_bar\" style=\"height: 38px; width: 617px; background-color: #f8cb86;\"></div>\n   <div id=\"close\" style=\"position: absolute; background-color: #070606; width: 48px; height: 100%; left: 616px; top: 0px;\">\n</div>\n   <p id=\"elevation\" style=\"bottom: 1px; float: none; display: inline; position: absolute; z-index: 900; font-family: Arial,Helvetica,sans-serif; font-size: 22px; text-align: right; line-height: normal; font-weight: bold; color: #ffffff; vertical-align: baseline; text-decoration: none; font-style: normal; text-indent: 0; margin-top: 0px; margin-bottom: 0px; margin-right: 1em; right: 48px;\"> &nbsp; </p>\n   <div id=\"rout_bar\" style=\"width: 617px; height: 40px; background-color: #fc8466;\"></div>\n </div>\n <div id=\"menu_bar\" style=\"border: none; border-radius: 6px; -moz-border-radius: 6px; border-top-left-radius: 6px; border-top-right-radius: 6px; border-bottom-right-radius: 6px; border-bottom-left-radius: 6px; position: absolute; z-index: 900; background-color: transparent; width: 77px; height: 113px; left: 0px; top: 0;\">\n <div id=\"menu_button_container\" style=\"position: relative; top: 0px; display: block; right: 0px; z-index: 900; float: right; width: 80px; height: 117px; left: 0px;\">\n<div id=\"geoMap\" style=\"position: relative; background-position: center center; background-image: url('img/mapIcon.png'); background-size: contain; float: none; height: 38px; width: 86px;\"></div>\n<div id=\"geoWeather\" style=\"position: relative; background-position: center center; background-image: url('img/weather.png'); background-size: contain; float: none; width: 86px; height: 38px;\"></div>\n<div id=\"geoRout\" style=\"background-position: center center; background-size: contain; background-image: url('img/directionIcon.png'); float: none; width: 86px; height: 40px;\"></div>\n</div>\n </div>\n </body>"  if language.indexOf("de") >= 0
      result = """
               <div id="ifoWidgetExpanded" style="border: 1px dotted lightgray; position: absolute; top: 0; z-index: 100; width: 450px; right: 0; height: 80%;">
               <div id="map_area" style="left: 0px; top: 0px; width: 450px; height: 100%; position: relative;"></div>
               <div id="mapMenu" style="position: absolute; z-index: 900; width: 100%; background-color: rgba(37, 37, 37, 0.7); right: 1px; bottom: 0px; height: 41px;">
               <div id="geoMap" class="geotab" style="position: relative; background-position: center center; background-image: url('img/mapIcon.png'); background-size: contain; float: right; height: 40px; width: 86px;"></div>
               <div id="geoWeather" class="geotab disabled" style="display: none; position: relative; background-position: center center; background-image: url('img/weather.png'); background-size: contain; float: right; width: 86px; height: 40px;"></div>
               <div id="geoRout" class="geotab" style="background-position: center center; background-size: contain; background-image: url('img/directionIcon.png'); float: right; width: 86px; height: 40px;"></div>
               <div id="geoPanoramio" class="geotab disabled" style="display: none; background-position: center center; background-size: contain; background-image: url('img/directionIcon.png'); float: right; width: 86px; height: 40px;"></div>
               </div>
               <!-- <div id="closingButton" style="position: absolute; z-index: 900; width: 87px; height: 38px; background-color: #414040; left: 513px; top: 408px;"><span data-dojo-type="shapes.Text" style="font-size: 14px; position: absolute; z-index: 900; color: #ffffff; left: 41px; top: 8.5px;">X</span></div> -->
               </div>
               """
    modalContent.append result

    # control widget
    jQuery(".close").click (e) =>
      endTime = new Date().getTime()
      timeSpent = endTime - startTime
      eventLabel = annotation.widgets[@name].options.title
      try
        _gaq.push ['_trackEvent', @name, 'viewed', eventLabel, timeSpent]
        _gaq.push ['_trackTiming', @name, eventLabel, timeSpent, 'viewed']
      catch error

    jQuery('#mask').click (e) =>
      endTime = new Date().getTime()
      timeSpent = endTime - startTime
      eventLabel = annotation.widgets[@name].options.title
      try
        _gaq.push ['_trackEvent', @name, 'viewed', eventLabel, timeSpent]
        _gaq.push ['_trackTiming', @name, eventLabel, timeSpent, 'viewed']
      catch error

    @geotabs = jQuery('.geotab:not(.disabled)')
    @geotabsiterator = 0

    jQuery("#geoMap").click =>
      jQuery('.geotab.selected').removeClass 'selected'
      # menu handling
      jQuery("#location_bar").css "visibility", "visible"
      jQuery("#weather_bar").css "visibility", "hidden"
      jQuery("#rout_bar").css "visibility", "hidden"
      jQuery("#map_area").empty()

      # cartography handling
      i = undefined
      latitude = undefined
      latlng = undefined
      locationName = undefined
      longitude = undefined
      map = undefined
      myOptions = undefined
      output = undefined


      locationName = annotation.getLabel()
      latitude = annotation.getLatitude()
      longitude = annotation.getLongitude()

      map = "#map_area"
      jQuery(map).empty()
      newmap = """<img src="http://maps.google.com/maps/api/staticmap?center=#{latitude},#{longitude}&zoom=#{@mapzoom}&size=450x450&maptype=roadmap&visual_refresh=true&sensor=false"></img>
               """
      jQuery(map).append newmap
      jQuery("#geoMap").addClass 'selected'

    jQuery("#geoWeather").click =>
      jQuery('.geotab.selected').removeClass 'selected'
      # menu handling
      jQuery("#location_bar").css "visibility", "hidden"
      jQuery("#weather_bar").css "visibility", "visible"
      jQuery("#rout_bar").css "visibility", "hidden"
      jQuery("#map_area").empty()

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

      locationName = annotation.getLabel()
      latitude = annotation.getLatitude()
      longitude = annotation.getLongitude()

      locationName = annotation.getLabel()
      latitude = annotation.getLatitude()
      longitude = annotation.getLongitude()
      mapzoom = 12
      map = "#map_area"

      jQuery(map).attr "src", "http://maps.google.com/maps/api/staticmap?center=#{latitude},#{longitude}&zoom=#{mapzoom}&size=450x450&maptype=roadmap&visual_refresh=true&sensor=false"

      jQuery("#geoWeather").addClass 'selected'

    jQuery("#geoRout").click =>
      jQuery('.geotab.selected').removeClass 'selected'
      # menu handling
      jQuery("#location_bar").css "visibility", "hidden"
      jQuery("#weather_bar").css "visibility", "hidden"
      jQuery("#rout_bar").css "visibility", "visible"
      jQuery("#map_area").empty()

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

          locationName = annotation.getLabel()
          latitude = annotation.getLatitude()
          longitude = annotation.getLongitude()

          map = "#map_area"
          jQuery(map).empty()
          newmap =  """<img src="http://maps.google.com/maps/api/staticmap?markers=#{position.coords.latitude},#{position.coords.longitude},greena|#{latitude},#{longitude},greenb&path=color:0x0000ff|weight:5|#{position.coords.latitude},#{position.coords.longitude}|#{latitude},#{longitude}&zoom=#{@routemapzoom}&size=450x450&visual_refresh=true&maptype=roadmap&sensor=false"></img>
                    """
          jQuery(map).append newmap

          destination = new google.maps.LatLng(latitude, longitude)
          start = new google.maps.LatLng(position.coords.latitude, position.coords.longitude)

          # set direction map

          request =
            origin: start
            destination: destination
            travelMode: google.maps.TravelMode.DRIVING
          @directionString = "#{position.coords.latitude},#{position.coords.longitude}|"
          directionsService.route request, (result, status) ->
            directionsDisplay.setDirections result  if status is google.maps.DirectionsStatus.OK
              myRoute = result.routes[0].legs[0]
              for i in myRoute.steps by 3
                @directionString += i.end_location+'|'

          console.log "@directionString= ", @directionString




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
      jQuery("#geoRout").addClass 'selected'

    jQuery("#geoPanoramio").click =>
      jQuery('.geotab.selected').removeClass 'selected'
      jQuery("#geoPanoramio").addClass 'selected'


    # default selection
    @mapzoom = 12
    @routemapzoom = 6
    jQuery("#geoMap").trigger "click"
    jQuery("#geoMap").addClass 'selected'
    return;
