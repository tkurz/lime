class window.LSIImagePlugin extends window.LimePlugin
  init: ->
    @name = 'LSIImagePlugin'
    annotation = undefined
    console.info "Initialize LSIImagePlugin"

    for annotation in @lime.annotations
      if annotation.resource.value.indexOf("geonames") < 0
        @handleAnnotation annotation

  # Putting this into a function keeps the annotation in the context
  handleAnnotation: (annotation) ->
    # console.info "The annotation #{annotation.resource} looks interesting, get the whole entity so we can show it in a widget!", annotation
    annotation.entityPromise.done (entities) =>
      # console.info "entities for annotation #{annotation.resource} loaded, create a widget for it!", annotation
      nonConcept = annotation.getDescription()
      nonConcept = nonConcept.replace("No description found.","")
      if(nonConcept.length >= 3)
        widget = @lime.allocateWidgetSpace @,
          thumbnail: "img/pic.png" # should go into CSS
          title: "#{annotation.getLabel()} Pics"
          type: "DbpediaInfoWidget"
          sortBy: ->
            10000 * annotation.start + annotation.end

        # We're going to need the annotation for the widget's `activate` event
        widget.annotation = annotation
        # widget was activated, we show details now
        jQuery(widget).bind 'activate', (e) =>
          @showDepictionInModalWindow annotation
        # Hang the widget on the annotation
        annotation.widgets[@name] = widget

        jQuery(annotation).bind "becomeActive", (e) =>
          annotation.widgets[@name].setActive()

        jQuery(annotation).bind "becomeInactive", (e) =>
          annotation.widgets[@name].setInactive()

  showDepictionInModalWindow: (annotation) -> # TO BE RESTRUCTURED
    try
      lodResource = "http://new.devserver.sti2.org:8080/lsi/api/invoke?lod=" + annotation.resource.value + "&mediaType=video&limit=9&ner=yes"

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
          modalContainer = @getModalContainer().html result
          $(".lsiLink", modalContainer).click (e) =>

            #Cancel the link behavior
            e.preventDefault()
            lsiImageSource = $(e.target).attr("src")
            $("#bigImage", modalContainer).attr "src", lsiImageSource

        error: (jqXHR, textStatus, errorThrown) ->
          $(modalContent).append "AJAX Error: #{textStatus}"
