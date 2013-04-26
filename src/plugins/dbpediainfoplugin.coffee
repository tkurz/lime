class window.DBPediaInfoPlugin extends window.LimePlugin
  init: ->
    @name = 'DBPediaInfoPlugin'
    console.info "Initialize #{@name}"
    for annotation in @lime.annotations
      if annotation.resource.value.indexOf("dbpedia") > 0
        @handleAnnotation annotation

  # Putting this into a function keeps the annotation in the context
  handleAnnotation: (annotation) ->
    # console.info "The annotation #{annotation.resource} looks interesting, get the whole entity so we can show it in a widget!", annotation
    annotation.entityPromise.done =>
      # console.info "entities for annotation #{annotation.resource} loaded, create a widget for it!", annotation
      nonConcept = annotation.getDescription()
      nonConcept = nonConcept.replace("No description found.","")
      if(nonConcept.length >= 3)
        widget = @lime.allocateWidgetSpace @,
          thumbnail: "img/info.png" # should go into CSS
          title: "#{annotation.getLabel()} Info"
          type: "DbpediaInfoWidget"
          sortBy: ->
            10000 * annotation.start + annotation.end

        # We're going to need the annotation for the widget's `activate` event
        widget.annotation = annotation
        # widget was activated, we show details now
        jQuery(widget).bind 'activate', (e) =>
          # @getModalContainer().html @showAbstractInModalWindow annotation
          @showAbstractInModalWindow annotation, @getModalContainer()
        # Hang the widget on the annotation
        annotation.widgets[@name] = widget

        jQuery(annotation).bind "becomeActive", (e) =>
          annotation.widgets[@name].setActive()

        jQuery(annotation).bind "becomeInactive", (e) =>
          annotation.widgets[@name].setInactive()

  # Widget-specific detail-rendering
  showAbstractInModalWindow: (annotation, outputElement) ->
    modalContent = $(outputElement)
    modalContent.css "width", "600px"
    modalContent.css "height", "auto"
    label = annotation.getLabel()
    page = annotation.getPage()
    lime = this.lime
    comment = annotation.getDescription()
    maintext = comment
    secondarytext = ""
    if (maintext.length >= 240)
      n = maintext.length
      if maintext.length >= 240
        tmptext = maintext.split(" ")
        n = tmptext.length
        textsum = ""
        i = 0
        while textsum.length < 200
          textsum += tmptext[i] + " "
          i++
        maintext = textsum
        y = i
        while y < n
          secondarytext += tmptext[y] + " "
          y++

    depiction = annotation.getDepiction(without: 'thumb')
    if(depiction == null)
      depiction = "img/noimagenew.png"
    ###
    result = """
      <div id="listContainer" style="position:relative; float: left; z-index: 10; width:35%; height: 95%; background: white; box-shadow: rgba(85,85,85,0.5) 0px 0px 24px;" >
        <img src="#{depiction}" style="display: block; width: auto; max-height: 300px; max-width:90%; margin-top: 30px; margin-left: auto;  margin-right: auto; border: 5px solid black;"/>
      </div>
      <div id="displayArea" style="position:relative; float: left; z-index: 10; width: 65%; height:95%; background: #DBDBDB; overflow: auto;">
        <p style="margin-left: 10px; font-size: 22px; text-align: left; color:black; font-family: 'Share Tech', sans-serif; font-weight: 400;">#{comment}</p>
      </div>
    """
    ###
    ###
    result = result = "<div id=\"infoExtendedWidget\" style=\"width: 826px; height: 100%; background-color: #3b3a3a; position: relative; z-index: 900;\">\n   +
       <div id=\"infoImageList\" style=\"overflow: auto; background-color: #a5a4a4; height: 100%; width: 30%; right: 0px; display: block; position: absolute; z-index: 900;\">\n
          <div id=\"infoLSIImageX\" style=\"position: relative; margin-top: 5px; margin-right: auto; margin-left: auto; width: 90%; height: 120px; background-color: #ffffff; margin-bottom: 5px;\">\n
            <div style=\"position: absolute; z-index: 900; bottom: 0px; width: 100%; height: 30px; background-color: #cfcbcb; top: 90px;\">\n      Oo    Image caption</div>\n
              </div>\n   <div style=\"position: relative; margin-top: 5px; margin-right: auto; margin-left: auto; width: 90%; height: 120px; background-color: #ffffff; margin-bottom: 5px;\">\n     <div style=\"position: absolute; z-index: 900; bottom: 0px; width: 100%; height: 30px; background-color: #cfcbcb; top: 90px;\">\n     +
                    Oo    Image caption</div>\n   </div>\n   <div style=\"position: relative; margin-top: 5px; margin-right: auto; margin-left: auto; width: 90%; height: 120px; background-color: #ffffff; margin-bottom: 5px;\">\n    +
                         <div style=\"position: absolute; z-index: 900; bottom: 0px; width: 100%; height: 30px; background-color: #cfcbcb; top: 90px;\">\n       Oo    Image caption</div>\n    +
                            </div>\n    +
                               <div style=\"position: relative; margin-top: 5px; margin-right: auto; margin-left: auto; width: 90%; height: 120px; background-color: #ffffff; margin-bottom: 5px;\">\n     +
                                   <div style=\"position: absolute; z-index: 900; bottom: 0px; width: 100%; height: 30px; background-color: #cfcbcb; top: 90px;\">\n        +
                                      Oo    Image caption</div>\n   </div>\n   <div style=\"position: relative; margin-top: 5px; margin-right: auto; margin-left: auto; width: 90%; height: 120px; background-color: #ffffff; margin-bottom: 5px;\">\n     <div style=\"position: absolute; z-index: 900; bottom: 0px; width: 100%; height: 30px; background-color: #cfcbcb; top: 90px;\">\n       Oo    Image caption</div>\n   </div>\n </div>\n  <div id=\"infoTitleBar\" style=\"height: 33px; width: 70%; position: absolute; z-index: 900; left: 0px; top: 0px; background-color: #49acf8;\">\n<img src=\"img/info.png\" style=\"height: 100%; width: auto; margin-right: 1em;\"></img><b style=\"position: relative; color: #ffffff; bottom: 5px; font-size: 25px;\">" + label + "</b>\n  </div>\n  <div id=\"infoTextField\" style=\"position: absolute; z-index: 900; bottom: 0px; width: 70%; height: 94%; background-color: #484b49; left: 0.421875px; top: 34px; color: #ffffff; font-size: 25px;\">\n    <img src=\"" + depiction + "\" style=\"margin: .5em; height: auto; float: left; width: 200px;\"></img> " + comment + " </div>\n</div>"
    ###
    if(secondarytext.length > 2)
      result = """
             <div id="ifoWidgetExpanded" style="border: 1px dotted lightgray; position: relative; height: 600px; width: 600px; ">
             <div id="infoMainPicture" style="position: relative; float: left; width: 300px; height: 300px; background-color: rgb(171, 171, 172);">
              <div id="pic" style="position: relative; float: left; height: 100%; background-image: url('#{depiction}'); background-repeat: no-repeat; background-position: center center; background-size: cover; width: 40%;"></div>
              <div id="title" style="position: relative; float: left; width: 60%; height: 100%;">
              <div id="icon" style="border-right: 1px dotted lightgray; float: left; background-color: #3f3e3e; position: absolute; z-index: 900; right: 0px; bottom: 0px; width: 50px; height: 50px;">
                <span style="position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);">i</span>
              </div><span data-dojo-type="shapes.Text" style="position: absolute; z-index: 900; font-family: CaviarDreamsBold; line-height: 140%; height: 100%; left: 0px; top: 0px; font-size: 29px; color: #000000;">#{label}</span></div>
             </div>
             <div id="infoMainText" style="position: relative; float: left; background-color: #525050; width: 300px; height: 300px; font-family: caviardreamsregular;">
                <span style="color: #f1f1f1; float: left; position: absolute; z-index: 900; left: 2%; top: 2%; width: 96%; font-size: 25px; height: auto;">#{maintext}</span>
             <div style="position: absolute; z-index: 900; width: 100px; height: 50px; right: 0px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-size: contain; background-image: url('img/120px-DBpediaLogo.svg.png');"></div>
             </div>
             <div id="infoSecondText" style="font-family: CaviarDreamsRegular; font-size: 23px; color: #c0bebe; position: relative; float: left; background-color: #020000; vertical-align: middle; width: 300px; height: 300px; text-align: left; line-height: 1.2;">
              #{secondarytext}

             </div>
             <div id="infoSecondPic" style="background-repeat: no-repeat; background-image: url('#{depiction}'); background-position: center center; background-size: cover; position: relative; float: left; width: 300px; height: 300px;"></div>
             </div>
             """
    else
      result = """
             <div id="ifoWidgetExpanded" style="border: 1px dotted lightgray; position: relative; height: 300px; width: 600px; ">
             <div id="infoMainPicture" style="position: relative; float: left; width: 300px; height: 300px; background-color: rgb(171, 171, 172);">
             <div id="pic" style="position: relative; float: left; height: 100%; background-image: url('#{depiction}'); background-repeat: no-repeat; background-position: center center; background-size: cover; width: 40%;"></div>
             <div id="title" style="position: relative; float: left; width: 60%; height: 100%;">
             <div id="icon" style="border-right: 1px dotted lightgray; float: left; background-color: #3f3e3e; position: absolute; z-index: 900; right: 0px; bottom: 0px; width: 50px; height: 50px;">
             <span style="position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);">i</span>
             </div><span data-dojo-type="shapes.Text" style="position: absolute; z-index: 900; font-family: CaviarDreamsBold; line-height: 140%; height: 100%; left: 0px; top: 0px; font-size: 29px; color: #000000;">#{label}</span></div>
             </div>
             <div id="infoMainText" style="position: relative; float: left; background-color: #525050; width: 300px; height: 300px; font-family: caviardreamsregular;">
             <span style="color: #f1f1f1; float: left; position: absolute; z-index: 900; left: 2%; top: 2%; width: 96%; font-size: 25px; height: auto;">#{maintext}</span>
             <div style="position: absolute; z-index: 900; width: 100px; height: 50px; right: 0px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-size: contain; background-image: url('img/120px-DBpediaLogo.svg.png');"></div>
             </div>
             </div>
             """
    modalContent.append result
