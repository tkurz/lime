class window.LSIImagePlugin extends window.LimePlugin
  init: ->
    @name = 'LSIImagePlugin'
    annotation = undefined
    console.info "Initialize LSIImagePlugin"

    for annotation in @lime.annotations
      jQuery(annotation).bind "becomeActive", (e) =>
        annotation = e.target
        annotation.entityPromise.done (entity) =>
          if annotation.resource.value.indexOf("geonames") < 0
            widget = @lime.allocateWidgetSpace @,
              thumbnail: "img/pic.png" # should go into CSS
              title: "#{annotation.getLabel()} Pics"
            if widget
              widget.annotation = annotation
              widget.show()
              # insert widget click function
              jQuery(widget).bind 'activate', (e) => #click behaviour - highlight the related widgets by adding a class to them
                annotation = e.target.annotation
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

  showDepictionInModalWindow: (annotation) -> # TO BE RESTRUCTURED

    ###
    try
      lodResource = "http://new.devserver.sti2.org:8080/lsi/api/invoke?lod=" + annotation.resource.value + "&mediaType=image&limit=9&ner=yes&context"

      lodResource = "http://devserver.sti2.org/connectme/uitests/lime6/LSI/Flachau.rdf"  if lodResource.indexOf("Flachau") > 0
      lodResource = "http://devserver.sti2.org/connectme/uitests/lime6/LSI/Zorbing.rdf"  if lodResource.indexOf("Zorbing") > 0
      lodResource = "http://devserver.sti2.org/connectme/uitests/lime6/LSI/Canyoning.rdf"  if lodResource.indexOf("Canyoning") > 0
      lodResource = "http://devserver.sti2.org/connectme/uitests/lime6/LSI/Freeskiing.rdf"  if lodResource.indexOf("Freeskiing") > 0
      lodResource = "http://devserver.sti2.org/connectme/uitests/lime6/LSI/Mountainbiking.rdf"  if lodResource.indexOf("Mountainbiking") > 0
      lodResource = "http://devserver.sti2.org/connectme/uitests/lime6/LSI/Rafting.rdf"  if lodResource.indexOf("Rafting") > 0
      lodResource = "http://devserver.sti2.org/connectme/uitests/lime6/LSI/Sauna.rdf"  if lodResource.indexOf("Sauna") > 0
      lodResource = "http://devserver.sti2.org/connectme/uitests/lime6/LSI/Skateboarding.rdf"  if lodResource.indexOf("Skateboarding") > 0
      lodResource = "http://devserver.sti2.org/connectme/uitests/lime6/LSI/Sledding.rdf"  if lodResource.indexOf("Sledding") > 0
      lodResource = "http://devserver.sti2.org/connectme/uitests/lime6/LSI/Snowboarding.rdf"  if lodResource.indexOf("Snowboarding") > 0
      lodResource = "http://devserver.sti2.org/connectme/uitests/lime6/LSI/Snowshoe.rdf"  if lodResource.indexOf("Snowshoe") > 0
      lodResource = "http://devserver.sti2.org/connectme/uitests/lime6/LSI/Trampoline.rdf"  if lodResource.indexOf("Trampoline") > 0


      # request = $.get lodResource
      # request.success (data) ->
      $.ajax lodResource,
        type: 'GET'
        dataType: 'xml'
        success: (data, textStatus, jqXHR) ->
          console.log("success "+ textStatus)
          x = data.Description
          result = """
                   <div id="listContainer" style="position:relative; float: left; z-index: 10; width:35%; height: 95%; background: white; box-shadow: rgba(85,85,85,0.5) 0px 0px 24px;" >
                   <ul style="overflow: hidden; padding-left: 20px; padding-right: 10px;">
                   """
          i = 0
          image = " "
          while i < 9
            image = x[i].about
            result += """
                      <li style="float: left; list-style: none; margin: 0 15px 30px 0;">
                      <a href="#" class="lsiLink">
                      <img class="lsiLink" src="#{image}" alt="description" style="width: 80px; height: 70px; border: 3px solid #777"/>
                      </a>
                      </li>
                      """

            i++
          result += """
                    </ul>
                    </div>
                    <div id="displayArea" style="position:relative; float: left; z-index: 1; width: 65%; height:95%; background: #DBDBDB; ">
                    <img id="bigImage" src="#{image}" style="display: block; min-height: 300px; max-height: 330px; max-width: 600px; margin-top: 10px; margin-left: auto; margin-right: auto; border: 5px solid white;"/>
                    </div>
                    """
          modalContent = $("#modalContent")
          $(modalContent).append result
          $(".lsiLink").click (e) =>

            #Cancel the link behavior
            e.preventDefault()
            lsiImageSource = $(e.target).attr("src")
            $("#bigImage").attr "src", lsiImageSource

        error: (jqXHR, textStatus, errorThrown) ->
          $(modalContent).append "AJAX Error: #{textStatus}"
    catch e
      console.error e

    ###

  renderAnnotation: (annotation) ->
    returnResult = ""
    #console.info("rendering", annotation);
    if annotation
      labelObj = _(annotation.entity["rdfs:label"]).detect((labelObject) =>
        labelObject['@language'] is @lime.options.preferredLanguage
      )
      label = labelObj['@value']

      #	depiction = ( _ref = props['http://xmlns.com/foaf/0.1/depiction']) != null ? _ref[0].value :
      #	void 0;
      #	page = ( _ref1 = props['http://xmlns.com/foaf/0.1/page']) != null ? _ref1[0].value :
      #	void 0;
      #console.info(label, depiction);
      returnResult = """
                     <div class="LSIImageWidget">
                      <table style="margin:0 auto; width: 100%;">
                        <tr>
                          <td>
                            <b class="utility-text">#{annotation.getLabel()} Pics </b>
                          </td>
                          <td>
                            <img class="utility-icon" src="img/pic.png" style="float: right; width: 25px; height: 25px; " >
                         </td>
                        </tr>
                      </table>
                     </div>
                     """
    return returnResult;

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
    $(modalcontainer).css "max-height", "400px"
    $(modalcontainer).empty()
    $(modalcontainer).append "<a href=\"#\" class=\"close\" role=\"button\"><img src=\"img/close-icon.png\" style=\"width: 22px; height: 22px;\"/></a>"
    $(modalcontainer).append "<div id=\"modalContent\" style=\"height: 95%; width: 100%; position: relative; margin: 0 auto; text-align: center;\">"
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
      $(mask).hide()
      $(modalcontainer).hide()
      $(modalcontainer).empty()

    $(window).resize (e) =>
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

      #Set the popup window to center
      $(modalcontainer).css "top", winH / 2 - $(modalcontainer).height() / 2
      $(modalcontainer).css "left", winW / 2 - $(modalcontainer).width() / 2

    @showDepictionInModalWindow annotation