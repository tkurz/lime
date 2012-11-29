class window.LSIImagePlugin extends window.LimePlugin
  init: ->
    @name = 'LSIImagePlugin'
    annotation = undefined
    console.info "Initialize LSIImagePlugin"

    for annotation in @lime.annotations
      jQuery(annotation).bind "becomeActive", (e) =>
        if e.annotation.resource.value.indexOf("geonames") < 0
          domEl = @lime.allocateWidgetSpace()
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

            e.annotation.widgets.LSIImagePlugin = domEl

      jQuery(annotation).bind "becomeInactive", (e) =>

        #console.info(e.annotation, 'became inactive');
        if e.annotation.widgets.LSIImagePlugin
          e.annotation.widgets.LSIImagePlugin.find(".utility-icon").attr "src", "img/pic_gr.png"
          e.annotation.widgets.LSIImagePlugin.find(".utility-text").css "color", "#c6c4c4"
          return

  showDepictionInModalWindow: (annotation) -> # TO BE RESTRUCTURED
    try
      lodResource = "http://new.devserver.sti2.org:8080/lsi/api/invoke?lod=" + annotation.resource.value + "&mediaType=image&limit=9&ner=yes"
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
      if window.XMLHttpRequest # code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest()
      else # code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP")
      xmlhttp.onreadystatechange (e) =>
        if xmlhttp.readyState is 4 and xmlhttp.status is 200
          xmlDoc = xmlhttp.responseXML
          console.log xmlDoc
          x = xmlDoc.getElementsByTagName("Description")
          result = """
                   <div id="listContainer" style="position:relative; float: left; z-index: 10; width:35%; height: 95%; background: white; box-shadow: rgba(85,85,85,0.5) 0px 0px 24px;" >
                   <ul style="overflow: hidden; padding-left: 20px; padding-right: 10px;">
                   """
          i = 0
          while i < 9
            image = x[i].getAttribute("rdf:about")
            result += """
                      <li style="float: left; list-style: none; margin: 0 15px 30px 0;">
                      <a href="#" class="lsiLink">
                      <img class="lsiLink" src="#{annotation.getLabel()}" alt="description" style="width: 80px; height: 70px; border: 3px solid #777"/>
                      </a>
                      </li>
                      """

            i++
          result += """
                    </ul>
                    </div>
                    <div id="displayArea" style="position:relative; float: left; z-index: 1; width: 65%; height:95%; background: #DBDBDB; ">
                    <img id="bigImage" src="#{annotation.getDepiction()}" style="display: block; min-height: 300px; max-height: 330px; max-width: 600px; margin-top: 10px; margin-left: auto; margin-right: auto; border: 5px solid white;"/>
                    </div>
                    """
          modalContent = $("#modalContent")
          $(modalContent).append result
          $(".lsiLink").click (e) =>

            #Cancel the link behavior
            e.preventDefault()
            lsiImageSource = $(e.target).attr("src")
            $("#bigImage").attr "src", lsiImageSource


      xmlhttp.open "GET", lodResource, true
      xmlhttp.send()

  renderAnnotation: (annotation) ->
    returnResult = ""
    #console.info("rendering", annotation);
    unless annotation is `undefined`

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

    @showDepictionInModalWindow annotation