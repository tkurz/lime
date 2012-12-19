class window.GoogleWeatherPlugin extends window.LimePlugin
  init: ->
    @name = 'GoogleWeatherPlugin'
    annotation = undefined
    console.info "Initialize GoogleWeatherPlugin"

    for annotation in @lime.annotations
      jQuery(annotation).bind "becomeActive", (e) =>
        annotation = e.target
        if annotation.resource.value.indexOf("geonames") > 0 && annotation.resource.value.indexOf("about.rdf") < 0
          annotation.entityPromise.done (entity) =>
            widget = @lime.allocateWidgetSpace @,
              thumbnail: "img/weather.png" # should go into CSS
              title: "#{annotation.getLabel()} Weather"
            if widget
              widget.annotation = annotation
              widget.show()
              # insert widget click function
              jQuery(widget).bind 'activate', (e) => #click behaviour - highlight the related widgets by adding a class to them
                annotation = e.target.annotation
                @displayModal annotation

            annotation.widgets[@name] = widget

      jQuery(annotation).bind "becomeInactive", (e) =>
        annotation = e.target
        #console.info(annotation, 'became inactive');
        widget = annotation.widgets[@name]
        if widget
          widget.deactivate()
          return


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
    @showWeatherInModalWindow "modalContent"