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
          @getModalContainer().html @renderAnnotation annotation

        # Hang the widget on the annotation
        annotation.widgets[@name] = widget

        jQuery(annotation).bind "becomeActive", (e) =>
          annotation.widgets[@name].setActive()

        jQuery(annotation).bind "becomeInactive", (e) =>
          annotation.widgets[@name].setInactive()


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
      result = """
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
    return result;
