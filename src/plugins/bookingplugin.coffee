class window.BookingPlugin extends window.LimePlugin
  init: ->
    @name = 'BookingPlugin'
    annotation = undefined
    console.info "Initialize BusinessPlugin"

    for annotation in @lime.annotations
      if annotation.resource.value.indexOf("#BusinessEntity") > 0 and annotation.relation.value in ['http://connectme.at/ontology#explicitlyShows', 'http://connectme.at/ontology#explicitlyMentions', 'http://connectme.at/ontology#implicitlyShows' , 'http://connectme.at/ontology#implicitlyMentions', 'http://connectme.at/ontology#hasContent']
        # if annotation.resource.value.indexOf("geonames") < 0 && annotation.resource.value.indexOf("dbpedia") < 0 && annotation.resource.value.indexOf("youtube") < 0
        @handleAnnotation annotation

  # Putting this into a function keeps the annotation in the context
  handleAnnotation: (annotation) ->
    # console.info "The annotation #{annotation.resource} looks interesting, get the whole entity so we can show it in a widget!", annotation
    # annotation.entityPromise.done (entities) =>
    # console.info "entities for annotation #{annotation.resource} loaded, create a widget for it!", annotation

    $.getJSON "http://smart-ip.net/geoip-json?callback=?", (data) =>
      @clientIP =  data.host


    @getGRData annotation
    nonConcept = annotation.resource.value
    #nonConcept = nonConcept.replace("No description found.","")
    if(nonConcept.length >= 3)
      url = annotation.resource.value;
      domain = url.replace('http://','').replace('https://','').split(/[/?#]/)[0].replace('www.', '')

      widget = @lime.allocateWidgetSpace @,
        thumbnail: "img/shop.png" # should go into CSS
        title: "#{domain} offer"
        type: "BusinessWidget"
        sortBy: ->
          10000 * annotation.start + annotation.end




      # We're going to need the annotation for the widget's `activate` event
      widget.annotation = annotation
      # widget was activated, we show details now
      jQuery(widget).bind 'activate', (e) =>
        @expandWidget annotation, @getModalContainer()

      # Hang the widget on the annotation
      annotation.widgets[@name] = widget

      jQuery(annotation).bind "becomeActive", (e) =>
        if(annotation.goodRelationsDataResource)
          if(annotation.goodRelationsDataResource.length > 0)
            annotation.widgets[@name].setActive()

      jQuery(annotation).bind "becomeInactive", (e) =>
        annotation.widgets[@name].setInactive()

      jQuery(widget).bind "downarrow", (e) =>
        @bookingtabsiterator = if 3 is @bookingtabsiterator + 1 then 0 else @bookingtabsiterator + 1

        if (@bookingtabsiterator == 0)
          jQuery("#businessWho").trigger 'click'
          jQuery("#businessWho").addClass 'selected'
        if (@bookingtabsiterator == 1)
          jQuery("#businessWhat").trigger 'click'
          jQuery("#businessWhat").addClass 'selected'
        if (@bookingtabsiterator == 2)
          jQuery("#businessWhere").trigger 'click'
          jQuery("#businessWhere").addClass 'selected'


    jQuery(widget).bind "uparrow", (e) =>
      @bookingtabsiterator = if @bookingtabsiterator is 0 then 2  else @bookingtabsiterator - 1
      jQuery('.videotab.selected').removeClass 'selected'
      if (@bookingtabsiterator == 0)
        jQuery("#businessWho").trigger 'click'
        jQuery("#businessWho").addClass 'selected'
      if (@bookingtabsiterator == 1)
        jQuery("#businessWhat").trigger 'click'
        jQuery("#businessWhat").addClass 'selected'
      if (@bookingtabsiterator == 2)
        jQuery("#businessWhere").trigger 'click'
        jQuery("#businessWhere").addClass 'selected'

  getGRData: (annotation) ->
    @lime.cmf.getGRDataForTerm annotation.resource.value, (err, res) =>
      if err
        console.warn "Error getting CMF Good Relations resources", err
      else
        annotation.goodRelationsDataResource = _(res).map (resultset) ->
          entity =
            name: resultset.name.value
            street: resultset.street.value
            pcode: Number(resultset.pcode.value)
            city: resultset.city.value
            country: resultset.country.value
            telephone: resultset.telephone.value
            email: resultset.email.value
            description: resultset.description.value
            geoLat: Number(resultset.geoLat.value)
            geoLong: Number(resultset.geoLong.value)
            priceValue: Number(resultset.pricevalue.value)
            priceCurrency: resultset.pricecurrency.value
            product: resultset.product.value
          entity

        annotation.getGRDataResource = ->
          @goodRelationsDataResource

  _htmlEncode: (str) ->
    str.replace /[&<>"']/g, ($0) ->
      "&" + {"&":"amp", "<":"lt", ">":"gt", '"':"quot", "'":"#39"}[$0] + ";"

  expandWidget: (annotation, outputElement) ->
    modalContent = jQuery(outputElement)
    modalContent.css "width", "600px"
    modalContent.css "height", "auto"
    #console.log("latitude: " + latitude + " longitude: " + longitude + " = latlong: " + latlng);
    lime = this.lime
    resource = ""
    resource = annotation.resource.value
    startTime = new Date().getTime()


    #if annotation.resource.value.indexOf("webtv.feratel.com") > 0
     # resource = resource.replace /\$\$/g, "&"
    businessData = annotation.getGRDataResource()

    if(businessData.length)
      if(businessData.length > 0)
        #result = "<div id=\"listContainer\" style=\"position:relative; float: left; z-index: 10; width:35%; height: 95%; background: white; box-shadow: rgba(85,85,85,0.5) 0px 0px 24px;\" >" + "<img src=\"" + depiction + "\" style=\"display: block; width: auto; max-height: 300px; max-width:90%; margin-top: 30px; margin-left: auto;  margin-right: auto; border: 5px solid black; \" >" + "</div>" + "<div id=\"displayArea\" style=\"position:relative; float: left; z-index: 1; width: 65%; height:95%; background: #DBDBDB; overflow: auto;\">" + "<p style=\"margin-left: 10px; font-size: 22px; text-align: left; color:black; font-family: 'Share Tech', sans-serif; font-weight: 400;\">" + comment + "</p>" + "</div>";
        result = """
                 <div id="bookingWidgetExpanded" style="position: relative; z-index: 900; width: 600px; height: 600px; background-color: transparent;">
                 <div id="forthTile" style="position: relative; float: left; width: 300px; height: 300px;">
                 <div style="width: 100%; position: relative; height: 30px; font-size: 20px; color: #00BFFF; background-color: #696969;">
                 #{businessData[0].name}
                 </div>
                 <div style="width: 100%; position: relative; font-size: 16px; height: 50px; background-color: #303030; color: #f1f1f1;">
                 #{businessData[0].street}, #{businessData[0].pcode} #{businessData[0].city}, #{businessData[0].country}
                 </div>
                 <div style="width: 100%; position: relative; height: 20px; font-size: 16px; background-color: #303030; color: #f1f1f1; text-align: center;">
                  #{businessData[0].telephone}
                 </div>
                 <div style="width: 100%; position: relative; height: 170px; font-size: 16px; background-color: #303030; color: #f1f1f1; overflow-y: scroll;">
                 Über uns<br>
                 #{businessData[0].description}
                 </div>
                 <div class="businessContact"  style="cursor: hand; cursor: pointer; width: 100%; position: relative; height: 30px; color: black; background-color: lightgray; font-size: 21px; text-align: center; background-image: -webkit-gradient(radial, center center, 10, center center, from(white), to(#909090)); background-image: -o-radial-gradient(white, #909090); background-image: -ms-radial-gradient(white, #909090); background-image: -moz-radial-gradient(white, #909090); background-image: -webkit-radial-gradient(white, #909090); background-image: radial-gradient(white, #909090);">
                 kontaktieren Sie uns
                 </div>
                 </div>

                 <div id="secondTile" style="width: 300px; height: 300px; position: relative; float: left; display: none;">
                 <div id="businessName" style="width: 100%; position: relative; height: 30px; font-size: 20px; color: #FA8072; background-color: #696969;">
                  #{businessData[0].name}
                 </div>
                 <div id="businessAddress" style="width: 100%; position: relative; font-size: 16px; height: 50px; background-color: #303030; color: #f1f1f1;">
                  #{businessData[0].street}, #{businessData[0].pcode} #{businessData[0].city}, #{businessData[0].country}
                 </div>
                 <div id="businessTelephone" style="width: 100%; position: relative; height: 20px; font-size: 16px; background-color: #303030; color: #f1f1f1; text-align: center;">
                  #{businessData[0].telephone}
                 </div>
                 <div id="businessService" style="width: 100%; position: relative; height: 110px; background-color: #ffffff;">
                 <div id="businessService1" style="width: 100%; height: 80px; font-size: 16px; background-color: #696969; position: relative; overflow-y: scroll;">
                  #{businessData[0].product}
                 </div>
                 <div id="businessService2" style="width: 100%; height: 30px; font-size: 16px; background-color: #303030; position: relative;">
                  #{businessData[0].priceValue} #{businessData[0].priceCurrency}
                 </div>
                 <div id="businessService3" style="width: 100%; height: 20px; position: relative; display: none;">
                 Service 3 - Price XXXX EUR
                 </div>
                 <div id="businessService4" style="width: 100%; height: 20px; position: relative; display: none;">
                 Service 4 - Price XXXX EUR
                 </div>
                 <div id="businessService5" style="width: 100%; height: 20px; position: relative; display: none;">
                 Service 5 - Price XXXX EUR
                 </div>
                 </div>
                 <div id="businessOpeningHours" style="width: 100%; position: relative; height: 60px; background-color: #303030; color: #f1f1f1;">
                 
                 </div>
                   <div class="businessContact" style="cursor: hand; cursor: pointer; width: 100%; position: relative; height: 30px; color: black; background-color: lightgray; font-size: 21px; text-align: center; background-image: -webkit-gradient(radial, center center, 10, center center, from(white), to(#909090)); background-image: -o-radial-gradient(white, #909090); background-image: -ms-radial-gradient(white, #909090); background-image: -moz-radial-gradient(white, #909090); background-image: -webkit-radial-gradient(white, #909090); background-image: radial-gradient(white, #909090);">
                 kontaktieren Sie uns
                   </div>
                 </div>

                 <div id="firstTile" style="position: relative; float: left; width: 300px; height: 300px; display: none;">
                 <div style="width: 100%; position: relative; height: 30px; font-size: 20px; background-color: #696969; color: #90EE90;">
                 #{businessData[0].name}
                 </div>
                 <div id="map" style="width: 100%; height: 270px; position: absolute; z-index: 900; height: 89%; background-color: green;"></div>
                 </div>

                 <div id="thirdTile" style="width: 298px; height: 300px; float: left; position: relative; border-left:dotted 1px #bbbbbb">
                 <div id="businessWho" class="bookingtab" style="cursor: hand; cursor: pointer; width: 98%; height: 98px; position: relative; float: left; background-color: #696969; color: #00BFFF; font-size: 49px; border-bottom:dotted 1px #bbbbbb; border-right:dotted 1px #bbbbbb" >
                 Wie?
                 <div id="businessWhoLabel" style="cursor: hand; cursor: pointer; position: absolute; z-index: 900; left: 0px; bottom: 0px; height: 50%; width: 100%; font-size: 14pt; color: white; background-color: #303030;">
                 Über uns
                 </div>
                 </div>
                 <div id="businessWhat" class="bookingtab" style="cursor: hand; cursor: pointer; width: 98%; height: 98px; float: left; position: relative; background-color: #696969; color: #FA8072; font-size: 49px; border-bottom:dotted 1px #bbbbbb; border-right:dotted 1px #bbbbbb">
                 Was?
                 <div id="businessWhatLabel" style="cursor: hand; cursor: pointer; position: absolute; z-index: 900; left: 0px; bottom: 0px; height: 50%; width: 100%; font-size: 14pt; color: white; background-color: #303030;">
                 Unser Angebot
                 </div>
                 </div>
                 <div id="businessWhere" class="bookingtab" style="cursor: hand; cursor: pointer; width: 98%; height: 100px; position: relative; float: left; background-color: #696969; color: #90EE90; font-size: 49px; border-bottom:dotted 1px #bbbbbb; border-right:dotted 1px #bbbbbb">
                 Wo?
                 <div id="businessWhereLabel" style="cursor: hand; cursor: pointer; position: absolute; z-index: 900; width: 100%; height: 50%; left: 0px; bottom: 0px; font-size: 14pt; color: white; background-color: #303030;">
                 Reiseroute Karte
                 </div>
                 </div>
                 </div>

                 </div>

                 """
        modalContent.append result
        @bookingtabsiterator = 0

        #widget controls
        jQuery(".close").click (e) =>
          endTime = new Date().getTime()
          timeSpent = endTime - startTime
          eventLabel = annotation.widgets[@.name].options.title
          console.log ": #{eventLabel} was viewed #{timeSpent} msec."

        jQuery('#mask').click (e) =>
          endTime = new Date().getTime()
          timeSpent = endTime - startTime
          eventLabel = annotation.widgets[@.name].options.title
          console.log ": #{eventLabel} was viewed #{timeSpent} msec."

        jQuery(".businessContact").click =>
          jQuery(".businessContact").text "Danke schön!"
          grdata = annotation.getGRDataResource()
          if(grdata.length)
            if(grdata.length > 0)
              time = jQuery.now()
              bemail = grdata[0].email
              bname = grdata[0].name

              #entry = @clientIP + ' clicked on '+ grdata[0].name
              #@_htmlEncode entry
              jQuery.post 'http://devserver.sti2.org/connectme/logger.php?',
                entry : """
                        <div  style="width: 100%; position: relative; float: left; background-color: #e1e1e1; height: 30px; border-bottom: 1px dotted #696969;" class="item">
                        <div style="height: 100%; color: #32CD32; font-size: 16pt; background-color: #505050; width: 30px; text-align: center; position: relative; float: left;" class="icon">
                        @</div>
                            <div style="width: 200px; height: 100%; position: relative; float: left; font-size: 16px; text-align: center; border-right: 1px dotted #696969;" class="ip">
                #{@clientIP}</div>
                            <div style="width: 200px; height: 100%; position: relative; float: left; font-size: 16px; text-align: center; border-right: 1px dotted #696969;" class="email">
                #{bemail}l</div>
                            <div style="width: 200px; height: 100%; position: relative; float: left; font-size: 16px; text-align: center; border-right: 1px dotted #696969;" class="name">
                #{bname}</div>
                            <div style="width: 200px; height: 100%; position: relative; float: left; font-size: 16px; text-align: center; border-right: 1px dotted #696969;" class="time">
                #{time}</div>
                            </div>
                          """
                (data) ->




        jQuery("#businessWho").click =>
          jQuery('.bookingtab.selected').removeClass 'selected'
          jQuery("#businessWho").addClass "selected"

          jQuery("#forthTile").css "display", "block"
          jQuery("#firstTile").css "display", "none"
          jQuery("#secondTile").css "display", "none"
          jQuery("#map").empty()


        jQuery("#businessWhat").click =>
          jQuery('.bookingtab.selected').removeClass 'selected'
          jQuery("#businessWhat").addClass "selected"

          jQuery("#forthTile").css "display", "none"
          jQuery("#firstTile").css "display", "none"
          jQuery("#secondTile").css "display", "block"
          jQuery("#map").empty()


        jQuery("#businessWhere").click =>
          jQuery('.bookingtab.selected').removeClass 'selected'
          jQuery("#businessWhere").addClass "selected"

          jQuery("#forthTile").css "display", "none"
          jQuery("#firstTile").css "display", "block"
          jQuery("#secondTile").css "display", "none"
          # cartography handling
          if navigator.geolocation
            navigator.geolocation.getCurrentPosition ((position) ->
              i = undefined
              locationName = "Planai - Hochwurzen"
              #annotation.getLabel()
              latitude = 47.392887
              #annotation.getLatitude()
              longitude = 13.693318
              #annotation.getLongitude()
              map = undefined
              myOptions = undefined
              output = undefined
              x = undefined
              xmlDoc = undefined
              xmlhttp = undefined
              start = undefined
              destination = undefined
              directionDisplay = undefined
              directionsService = new google.maps.DirectionsService()
              grdata = annotation.getGRDataResource()
              if(grdata.length)
                 if(grdata.length > 0)
                    latitude = grdata[0].geoLat
                    #annotation.getLatitude()
                    longitude = grdata[0].geoLong
                    console.log 'latitude: ',latitude, ' longitude:  ', longitude
                    #annotation.getLongitude()

              output = document.getElementById("map")
              directionsDisplay = new google.maps.DirectionsRenderer()
              destination = new google.maps.LatLng(latitude, longitude)
              mapOptions =
                zoom: 7
                mapTypeId: google.maps.MapTypeId.ROADMAP
                center: destination

              map = new google.maps.Map(output, mapOptions)
              start = new google.maps.LatLng(position.coords.latitude, position.coords.longitude)

              # set direction map
              #alert(start);
              directionsDisplay.setMap map
              @geomap = map
              request =
                origin: start
                destination: destination
                travelMode: google.maps.TravelMode.DRIVING

              directionsService.route request, (result, status) ->
                directionsDisplay.setDirections result  if status is google.maps.DirectionsStatus.OK


              # next function is the error callback
            ),
            (error) ->
              switch error.code
                when error.TIMEOUT
                  alert "Timeout"
                when error.POSITION_UNAVAILABLE
                  alert "Position unavailable"
                when error.PERMISSION_DENIED
                  alert "Permission denied"
                when error.UNKNOWN_ERROR
                  alert "Unknown error"


        jQuery("#businessWho").trigger "click"