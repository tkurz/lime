  class window.GoogleWeatherPlugin extends window.LimePlugin
    init: ->
      @name = 'GoogleWeatherPlugin'
      annotation = undefined
      console.info "Initialize GoogleWeatherPlugin"

      for annotation in @lime.annotations
        jQuery(annotation).bind "becomeActive", (e) =>
          annotation = e.target
          if annotation.resource.value.indexOf("geonames") > 0 && annotation.resource.value.indexOf("about.rdf") < 0
            domEl = @lime.allocateWidgetSpace("GoogleWeatherPlugin")
            if domEl
              if annotation.ldLoaded
                domEl.html @renderAnnotation(annotation)
                $(domEl).slideDown 500
              else
                jQuery(annotation).bind "ldloaded", (e) =>
                  annotation = e.target
                  domEl.html @renderAnnotation(annotation)
                  $(domEl).slideDown 500
              # insert widget click function
              domEl.click => #click behaviour - highlight the related widgets by adding a class to them
                @lime.player.pause()
                @displayModal annotation

              annotation.widgets.DBPediaAbstractPlugin = domEl

      jQuery(annotation).bind "becomeInactive", (e) =>
        annotation = e.target
        #console.info(annotation, 'became inactive');
        if annotation.widgets.DBPediaAbstractPlugin
          annotation.widgets.DBPediaAbstractPlugin.find(".utility-icon").attr "src", "img/weather_gr.png"
          annotation.widgets.DBPediaAbstractPlugin.find(".utility-text").css "color", "#c6c4c4"
          return

    renderAnnotation: (annotation) ->
      hasWeather = false
      returnResult = "<p> Should be a Weather widget here </p>"
      try
        if window.XMLHttpRequest # code for IE7+, Firefox, Chrome, Opera, Safari
          xmlhttp = new XMLHttpRequest()
        else # code for IE6, IE5
          xmlhttp = new ActiveXObject("Microsoft.XMLHTTP")
        xmlhttp.open "POST", annotation.resource.value + "/about.rdf", false
        xmlhttp.send()
        xmlDoc = xmlhttp.responseXML
        queryString = undefined
        x = xmlDoc.getElementsByTagName("Feature")
        i = 0
        while i < x.length
          locationName = x[i].getElementsByTagName("name")[0].childNodes[0].nodeValue
          latitude = x[i].getElementsByTagName("lat")[0].childNodes[0].nodeValue
          longitude = x[i].getElementsByTagName("long")[0].childNodes[0].nodeValue
          i++

        #console.log("weather map for "+locationName+" : "+latitude +" "+longitude);
        unless locationName is ""
          locationName = locationName.replace(" ", "+")
          hasWeather = true

          # querystring = "http://www.google.com/ig/api?weather=" + locationName;
          querystring = "./backup/" + locationName + ".xml"
          xmlhttp.open "GET", querystring, false
          xmlhttp.send()
          xmlDoc = xmlhttp.responseXML
          city = xmlDoc.getElementsByTagName("city")[0].getAttribute("data")

          #console.log("Weather in: " + city);
          temp_c = xmlDoc.getElementsByTagName("temp_c")[0].getAttribute("data")
          temp_f = xmlDoc.getElementsByTagName("temp_f")[0].getAttribute("data")
          current_conditions = xmlDoc.getElementsByTagName("current_conditions")
          weather_condition = current_conditions[0].getElementsByTagName("condition")[0].getAttribute("data")
          weather_icon = current_conditions[0].getElementsByTagName("icon")[0].getAttribute("data")
          weather_icon = "http://www.google.com" + weather_icon
          returnResult = "<div class=\"GoogleWeatherWidget\">" + "<table style=\"margin:0 auto; width: 100%;\">" + "<tr>" + "<td><b class=\"utility-text\" >" + locationName + " Weather </b></td>" + "<td><img class=\"utility-icon\" src=\"img/weather.png\" style=\"float: right; width: 25px; height: 25px; \" ></td>" + "</tr>" + "</table>" + "</div>"

      #console.log("hasCoord: " + hasWeather);
      return returnResult;

    showWeatherInModalWindow: (outputElement) ->
      output = document.getElementById(outputElement)
      latlng = new google.maps.LatLng(latitude, longitude)

      #console.log("latitude: " + latitude + " longitude: " + longitude + " = latlong: " + latlng);
      myOptions =
        zoom: 11
        center: latlng
        mapTypeId: google.maps.MapTypeId.ROADMAP

      map = new google.maps.Map(output, myOptions)
      weatherLayer = new google.maps.weather.WeatherLayer(temperatureUnits: google.maps.weather.TemperatureUnit.CELSIUS)
      weatherLayer.setMap map

    displayModal: (annotation) -> # Modal window script usin jquery
      # Get Modal Window
      #var modalcontainer;
      if @lime.player.isFullScreen
        modalcontainer = $(".modalwindow")
      else
        modalcontainer = $("#modalWindow")

      # Get mask element
      mask = undefined
      if @lime.player.isFullScreen
        mask = $(".mask")
      else
        mask = $("#mask")
      $(modalcontainer).css "height", "70%"
      $(modalcontainer).css "max-height", "1200px"
      $(modalcontainer).empty()
      $(modalcontainer).append "<a href=\"#\" class=\"close\" role=\"button\"><img src=\"img/close-icon.png\" style=\"width: 22px; height: 22px;\"/></a>"
      $(modalcontainer).append "<div id=\"modalContent\" style=\"height: 95%; width: 100%; position: relative; margin: 0 auto; color: black; \"> &nbsp"

      #	$(modalcontainer).append("<div id=\"mapLabel\" style=\"width: inherit; height: 25%; font-family:verdana; font-size:14px; /media/EXPRESSGATE/MyWorks/For_Seekda/TV Emulator/Dev/ConnectMe_1.2/img/sport.pngkground-image: -ms-linear-gradient(bottom, rgb(33,26,20) 32%, rgb(69,61,55) 66%, rgb(28,22,21) 15%); background-image: -webkit-gradient(	linear,	left bottom, left top, color-stop(0.32, rgb(33,26,20)), color-stop(0.66, rgb(69,61,55)), color-stop(0.15, rgb(28,22,21))); color: white\"> " + "<table> <tr> <td> <img src=\"img/mapIcon.png\" style=\"width: 40px; height: 40px;\" ></td><td><em style=\"font-size:18px; color: white;\">" + locationName + "</em></td></tr></table>" + "&nbsp;&nbsp;  lat: " + latitude + "; long: " + longitude + "</div>");
      $(modalcontainer).append "</div>"

      #console.log("$(modalcontainer) = " + $(modalcontainer).html() + " modalcontainer " + modalcontainer.html());

      #Get the screen height and width
      maskHeight = $(window).height()
      maskWidth = $(window).width()

      #Set heigth and width to mask to fill up the whole screen
      $(mask).css
        width: maskWidth
        height: maskHeight


      #transition effect
      $(mask).fadeIn 100
      $(mask).fadeTo "fast", 0.8

      #Get the window height and width
      winH = $(window).height()
      winW = $(window).width()

      #Set the popup window to center
      $(modalcontainer).css "top", winH / 2 - $(modalcontainer).height() / 2
      $(modalcontainer).css "left", winW / 2 - $(modalcontainer).width() / 2

      #transition effect
      $(modalcontainer).fadeIn 100

      #if close button is clicked
      $(".close").click (e) =>

        #Cancel the link behavior
        e.preventDefault()
        $(mask).hide()
        $(modalcontainer).hide()


      #if mask is clicked
      $(mask).click (e)=>
        $(this).hide()
        $(modalcontainer).hide()

      $(window).resize (e)=>

        #var box = modalcontainer;

        #Get the screen height and width
        maskHeight = $(document).height()
        maskWidth = $(document).width()

        #Set height and width to mask to fill up the whole screen
        $(mask).css
          width: maskWidth
          height: maskHeight


        #Get the window height and width
        winH = $(window).height()
        winW = $(window).width()

        #Set the popup window to center
        $(modalcontainer).css "top", winH / 2 - $(modalcontainer).height() / 2
        $(modalcontainer).css "left", winW / 2 - $(modalcontainer).width() / 2


      #box.blur(function() { setTimeout(<bluraction>, 100); });
      showWeatherInModalWindow "modalContent"