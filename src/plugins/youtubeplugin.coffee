class window.YoutubePlugin extends window.LimePlugin
  init: ->
    @name = 'YoutubePlugin'
    annotation = undefined
    console.info "Initialize YoutubePlugin"

    for annotation in @lime.annotations
      if annotation.resource.value.indexOf("geonames") < 0 and annotation.resource.value.indexOf("dbpedia") < 0 and annotation.resource.value.indexOf("youtube") > 0
        @handleAnnotation annotation

  # Putting this into a function keeps the annotation in the context
  handleAnnotation: (annotation) ->
    # console.info "The annotation #{annotation.resource} looks interesting, get the whole entity so we can show it in a widget!", annotation
    # annotation.entityPromise.done (entities) =>
     # console.info "entities for annotation #{annotation.resource} loaded, create a widget for it!", annotation
    nonConcept = annotation.resource.value
    nonConcept = nonConcept.replace("No description found.","")
    if(nonConcept.length >= 3)
      widget = @lime.allocateWidgetSpace @,
        thumbnail: "img/youtube.png" # should go into CSS
        title: "#{annotation.getLabel()} Video"
        type: "YoutubeWidget"
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
    modalContent.css "width", "600px"
    modalContent.css "height", "auto"
    #console.log("latitude: " + latitude + " longitude: " + longitude + " = latlong: " + latlng);
    lime = this.lime
    url = annotation.resource.value
    url = url.split('v=')[1]
    console.info annotation.resource.value, url
    # result = "<div id=\"listContainer\" style=\"position:relative; float: left; z-index: 10; width:35%; height: 95%; background: white; box-shadow: rgba(85,85,85,0.5) 0px 0px 24px;\" >" + "<img src=\"" + depiction + "\" style=\"display: block; width: auto; max-height: 300px; max-width:90%; margin-top: 30px; margin-left: auto;  margin-right: auto; border: 5px solid black; \" >" + "</div>" + "<div id=\"displayArea\" style=\"position:relative; float: left; z-index: 1; width: 65%; height:95%; background: #DBDBDB; overflow: auto;\">" + "<p style=\"margin-left: 10px; font-size: 22px; text-align: left; color:black; font-family: 'Share Tech', sans-serif; font-weight: 400;\">" + comment + "</p>" + "</div>";
    result = """
             <iframe width="600" height="338" style="margin: 0 auto; display: block;" src="http://www.youtube.com/embed/#{url}?autoplay=1" frameborder="0" allowfullscreen>
                  <p>Your browser does not support iframes.</p>
              </iframe>
            """
    modalContent.append result


  ### displayModal: (annotation) -> # Modal window script usin jquery
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
    $(modalcontainer).css "height", "90%"
    $(modalcontainer).css "max-height", "750px"
    $(modalcontainer).css "max-width", "700px"
    $(modalcontainer).css "overflow-x", "auto"
    $(modalcontainer).empty()
    $(modalcontainer).append "<a href=\"#\" class=\"close\" role=\"button\"><img src=\"img/close-icon.png\" style=\"width: 22px; height: 22px;\"/></a>"
    $(modalcontainer).append "<div id=\"modalContent\" style=\"height: 95%; width: 100%; position: relative; margin: 0 auto; color: black; \">"

    #  $(modalcontainer).append("<div id=\"mapLabel\" style=\"width: inherit; height: 25%; font-family:verdana; font-size:14px; /media/EXPRESSGATE/MyWorks/For_Seekda/TV Emulator/Dev/ConnectMe_1.2/img/sport.pngkground-image: -ms-linear-gradient(bottom, rgb(33,26,20) 32%, rgb(69,61,55) 66%, rgb(28,22,21) 15%); background-image: -webkit-gradient(	linear,	left bottom, left top, color-stop(0.32, rgb(33,26,20)), color-stop(0.66, rgb(69,61,55)), color-stop(0.15, rgb(28,22,21))); color: white\"> " + "<table> <tr> <td> <img src=\"img/mapIcon.png\" style=\"width: 40px; height: 40px;\" ></td><td><em style=\"font-size:18px; color: white;\">" + locationName + "</em></td></tr></table>" + "&nbsp;&nbsp;  lat: " + latitude + "; long: " + longitude + "</div>");
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
      $(modalcontainer).hide().empty();


    #if mask is clicked
    $(mask).click (e)=>
      $(mask).hide()
      $(modalcontainer).hide().empty();

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
    @showInModalWindow annotation, "modalContent"

    ###
