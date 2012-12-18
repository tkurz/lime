class window.GeoNamesMapPlugin extends window.LimePlugin
  init: ->
    @name = 'GeoNamesMapPlugin'
    annotation = undefined
    console.info "Initialize GeoNamesMapPlugin"

    for annotation in @lime.annotations
      jQuery(annotation).bind "becomeActive", (e) =>
        annotation = e.target
        if annotation.resource.value.indexOf("sws.geonames.org") > 0
          widget = @lime.allocateWidgetSpace @,
            thumbnail: "img/map.png" # should go into CSS
            title: "#{annotation.getLabel()} Map"
        if widget
          if annotation.ldLoaded
            # widget.html @renderAnnotation(annotation)
            widget.show()
          else
            jQuery(annotation).bind "ldloaded", (e) =>
              annotation = e.target
              # widget.html @renderAnnotation(annotation)
              widget.show()
          # insert widget click function
          widget.element.click => #click behaviour - highlight the related widgets by adding a class to them
            @lime.player.pause()
            @displayModal annotation

        annotation.widgets[@name] = widget

      jQuery(annotation).bind "becomeInactive", (e) =>
        annotation = e.target
        #console.info(annotation, 'became inactive');
        widget = annotation.widgets[@name]
        if widget
          widget.deactivate()
          return

  showInModalWindow: (outputElement) ->
    output = document.getElementById(outputElement)
    latlng = new google.maps.LatLng(latitude, longitude)

    #	console.log("latitude: " + latitude + " longitude: " + longitude + " = latlong: " + latlng);
    myOptions =
      zoom: 13
      center: latlng
      mapTypeId: google.maps.MapTypeId.ROADMAP

    map = new google.maps.Map(output, myOptions)
    return;

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
    $(modalcontainer).append "<div id=\"modalContent\" style=\"height: 95%; width: 100%; position: relative; margin: 0 auto; \"> &nbsp"
    $(modalcontainer).append "</div>"

    #	console.log("$(modalcontainer) = " + $(modalcontainer).html() + " modalcontainer " + modalcontainer.html());

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
    $(mask).click (e) =>
      $(this).hide()
      $(modalcontainer).hide()
      return;

    $(window).resize(e) =>
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
      return;

    #box.blur(function() { setTimeout(<bluraction>, 100); });
    @showInModalWindow "modalContent"
