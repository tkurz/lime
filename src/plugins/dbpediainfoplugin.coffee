class window.DBPediaInfoPlugin extends window.LimePlugin
  init: ->
    @name = 'DBPediaInfoPlugin'
    annotation = undefined
    console.info "Initialize DBPediaInfoPlugin"


    for annotation in @lime.annotations
      jQuery(annotation).bind "becomeActive", (e) =>
        if e.annotation.resource.value.indexOf("geonames") < 0
          domEl = @lime.allocateWidgetSpace("DBPediaInfoPlugin")
          if domEl

            if e.annotation.ldLoaded
              domEl.html @renderAnnotation(e.annotation)
              $(domEl).slideDown 500
            else
              jQuery(e.annotation).bind "ldloaded", (e2) =>
                domEl.html @renderAnnotation(e.annotation)
                $(domEl).slideDown 500
            # insert widget click function
            domEl.click => #click behaviour - highlight the related widgets by adding a class to them
              @lime.player.pause()
              @displayModal e.annotation

            e.annotation.widgets.DBPediaInfoPlugin = domEl

      jQuery(annotation).bind "becomeInactive", (e) =>

        #console.info(e.annotation, 'became inactive');
        if e.annotation.widgets.DBPediaInfoPlugin
          e.annotation.widgets.DBPediaInfoPlugin.find(".utility-icon").attr "src", "img/info_gr.png"
          e.annotation.widgets.DBPediaInfoPlugin.find(".utility-text").css "color", "#c6c4c4"
          return

  showAbstractInModalWindow: (annotation, modalContainer) ->
    label = annotation.getLabel()
    page = annotation.getPage()
    lime = this.lime
    comment = annotation.getDescription()
    depiction = annotation.getDepiction()

    result = "<div id=\"listContainer\" style=\"position:relative; float: left; z-index: 10; width:35%; height: 95%; background: white; box-shadow: rgba(85,85,85,0.5) 0px 0px 24px;\" >" + "<img src=\"" + depiction + "\" style=\"display: block; width: auto; max-height: 300px; max-width:90%; margin-top: 30px; margin-left: auto;  margin-right: auto; border: 5px solid black; \" >" + "</div>" + "<div id=\"displayArea\" style=\"position:relative; float: left; z-index: 1; width: 65%; height:95%; background: #DBDBDB; overflow: auto;\">" + "<p style=\"margin-left: 10px; font-size: 22px; text-align: left; color:black; font-family: 'Share Tech', sans-serif; font-weight: 400;\">" + comment + "</p>" + "</div>"
    modalContent = $("#modalContent")

    #$(modalContent).append("<div style=\"margin: 10px; font-family:verdana; font-size:20px; color: white\">" + comment + "</div>");
    $(modalContent).append result

  renderAnnotation: (annotation) ->
    unless annotation is `undefined`
      res = """
            <div class="DBPediaAbstractWidget">
              <table style="margin:0 auto; width: 100%;">
                <tr>
                  <td><b class="utility-text">#{annotation.getLabel()} Info </b></td>
                  <td><img class="utility-icon" src="img/info.png" style="float: right; width: 25px; height: 25px; " ></td>
                </tr>
              </table>
            </div>
            """
      return res

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

    #Resize the modal container
    $(modalcontainer).css "height", "70%"
    $(modalcontainer).css "max-height", "500px"

    # Empty the modal container
    $(modalcontainer).empty()

    # Create contetn holders within the modal container
    $(modalcontainer).append "<a href=\"#\" class=\"close\" role=\"button\"><img src=\"img/close-icon.png\" style=\"width: 22px; height: 22px;\"/></a>"
    $(modalcontainer).append "<div id=\"modalContent\" style=\"height: 95%; width: 100%; position: relative; margin: 0 auto;\">"
    $(modalcontainer).append "</div>"

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
      $(modalcontainer).empty()


    #if mask is clicked
    $(mask).click (e) =>
      $(this).hide()
      $(modalcontainer).hide()
      $(modalcontainer).empty()

    $(window).resize (e) =>

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
    @showAbstractInModalWindow annotation, modalcontainer