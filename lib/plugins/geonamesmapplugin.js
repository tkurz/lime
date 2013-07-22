(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.GeoNamesMapPlugin = (function(_super) {
    __extends(GeoNamesMapPlugin, _super);

    function GeoNamesMapPlugin() {
      _ref = GeoNamesMapPlugin.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    GeoNamesMapPlugin.prototype.init = function() {
      var annotation, _i, _len, _ref1, _ref2, _results;
      this.name = 'GeoNamesMapPlugin';
      annotation = void 0;
      console.info("Initialize GeoNamesMapPlugin");
      _ref1 = this.lime.annotations;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        annotation = _ref1[_i];
        if (annotation.resource.value.indexOf("sws.geonames.org") > 0 && ((_ref2 = annotation.relation.value) === 'http://connectme.at/ontology#explicitlyShows' || _ref2 === 'http://connectme.at/ontology#explicitlyMentions' || _ref2 === 'http://connectme.at/ontology#implicitlyShows' || _ref2 === 'http://connectme.at/ontology#implicitlyMentions')) {
          _results.push(this.handleAnnotation(annotation));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    GeoNamesMapPlugin.prototype.handleAnnotation = function(annotation) {
      var _this = this;
      return annotation.entityPromise.done(function() {
        var widget;
        widget = _this.lime.allocateWidgetSpace(_this, {
          thumbnail: "img/mapIcon.png",
          title: "" + (annotation.getLabel()) + " Map",
          type: "GeoNamesMapWidget",
          sortBy: function() {
            return 10000 * annotation.start + annotation.end;
          }
        });
        widget.annotation = annotation;
        jQuery(widget).bind('activate', function(e) {
          var error, eventCategory, eventClickedLabel;
          try {
            eventClickedLabel = e.target.options.title;
            eventCategory = _this.name;
            _gaq.push(['_trackEvent', eventCategory, 'clicked', eventClickedLabel]);
          } catch (_error) {
            error = _error;
          }
          return _this.showInModalWindow(annotation, _this.getModalContainer());
        });
        annotation.widgets[_this.name] = widget;
        jQuery(annotation).bind("becomeActive", function(e) {
          var error, eventActiveLabel, eventCategory;
          try {
            eventActiveLabel = e.target.widgets[_this.name].options.title;
            eventCategory = _this.name;
            _gaq.push(['_trackEvent', eventCategory, 'becameActive', eventActiveLabel]);
          } catch (_error) {
            error = _error;
          }
          return annotation.widgets[_this.name].setActive();
        });
        jQuery(annotation).bind("becomeInactive", function(e) {
          var error, eventActiveLabel, eventCategory;
          try {
            eventActiveLabel = e.target.widgets[_this.name].options.title;
            eventCategory = _this.name;
            _gaq.push(['_trackEvent', eventCategory, 'becomeInactive', eventActiveLabel]);
          } catch (_error) {
            error = _error;
          }
          return annotation.widgets[_this.name].setInactive();
        });
        jQuery(widget).bind("leftarrow", function(e) {
          _this.geotabsiterator = _this.geotabs.length === _this.geotabsiterator + 1 ? 0 : _this.geotabsiterator + 1;
          if (_this.geotabsiterator === 0) {
            $("#geoMap").trigger('click');
          }
          if (_this.geotabsiterator === 1) {
            $("#geoWeather").trigger('click');
          }
          if (_this.geotabsiterator === 2) {
            $("#geoRout").trigger('click');
          }
          if (_this.geotabsiterator === 3) {
            return $("#geoPanoramio").trigger('click');
          }
        });
        jQuery(widget).bind("rightarrow", function(e) {
          _this.geotabsiterator = _this.geotabsiterator === 0 ? _this.geotabs.length - 1 : _this.geotabsiterator - 1;
          if (_this.geotabsiterator === 0) {
            $("#geoMap").trigger('click');
          }
          if (_this.geotabsiterator === 1) {
            $("#geoWeather").trigger('click');
          }
          if (_this.geotabsiterator === 2) {
            $("#geoRout").trigger('click');
          }
          if (_this.geotabsiterator === 3) {
            return $("#geoPanoramio").trigger('click');
          }
        });
        jQuery(widget).bind("uparrow", function(e) {
          var currentZoom;
          currentZoom = _this.geomap.getZoom();
          return _this.geomap.setZoom(currentZoom + 1);
        });
        return jQuery(widget).bind("downarrow", function(e) {
          var currentZoom;
          currentZoom = _this.geomap.getZoom();
          return _this.geomap.setZoom(currentZoom - 1);
        });
      });
    };

    GeoNamesMapPlugin.prototype.showInModalWindow = function(annotation, outputElement) {
      var language, modalContent, result, startTime,
        _this = this;
      modalContent = void 0;
      result = void 0;
      language = UTILS.getParameterByName("lang");
      startTime = new Date().getTime();
      modalContent = $(outputElement);
      modalContent.css("width", "600px");
      modalContent.css("height", "500px");
      if (language.indexOf("en") >= 0) {
        result = " <div id=\"ifoWidgetExpanded\" style=\"border: 1px dotted lightgray; position: absolute; top: 0; z-index: 100; width: 600px; right: 0; height: 100%;\">\n <div id=\"map_area\" style=\"left: 0px; top: 0px; width: 600px; height: 100%; position: relative;\"></div>\n <div id=\"mapMenu\" style=\"position: absolute; z-index: 900; width: auto; right: 1px; bottom: 0px; height: 41px;\">\n <div id=\"geoMap\" class=\"geotab\" style=\"position: relative; background-position: center center; background-image: url('img/mapIcon.png'); background-size: contain; float: right; height: 40px; width: 86px;\"></div>\n <div id=\"geoWeather\" class=\"geotab\" style=\"position: relative; background-position: center center; background-image: url('img/weather.png'); background-size: contain; float: right; width: 86px; height: 40px;\"></div>\n <div id=\"geoRout\" class=\"geotab\" style=\"background-position: center center; background-size: contain; background-image: url('img/directionIcon.png'); float: right; width: 86px; height: 40px;\"></div>\n <div id=\"geoPanoramio\" class=\"geotab disabled\" style=\"display: none; background-position: center center; background-size: contain; background-image: url('img/directionIcon.png'); float: right; width: 86px; height: 40px;\"></div>\n </div>\n<!-- <div id=\"closingButton\" style=\"position: absolute; z-index: 900; width: 87px; height: 38px; background-color: #414040; left: 513px; top: 408px;\"><span data-dojo-type=\"shapes.Text\" style=\"font-size: 14px; position: absolute; z-index: 900; color: #ffffff; left: 41px; top: 8.5px;\">X</span></div> -->\n </div>";
      } else {
        result = "<div id=\"ifoWidgetExpanded\" style=\"border: 1px dotted lightgray; position: absolute; top: 0; z-index: 100; width: 600px; right: 0; height: 80%;\">\n<div id=\"map_area\" style=\"left: 0px; top: 0px; width: 600px; height: 100%; position: relative;\"></div>\n<div id=\"mapMenu\" style=\"position: absolute; z-index: 900; width: auto; right: 1px; bottom: 0px; height: 41px;\">\n<div id=\"geoMap\" class=\"geotab\" style=\"position: relative; background-position: center center; background-image: url('img/mapIcon.png'); background-size: contain; float: right; height: 40px; width: 86px;\"></div>\n<div id=\"geoWeather\" class=\"geotab\" style=\"position: relative; background-position: center center; background-image: url('img/weather.png'); background-size: contain; float: right; width: 86px; height: 40px;\"></div>\n<div id=\"geoRout\" class=\"geotab\" style=\"background-position: center center; background-size: contain; background-image: url('img/directionIcon.png'); float: right; width: 86px; height: 40px;\"></div>\n<div id=\"geoPanoramio\" class=\"geotab disabled\" style=\"display: none; background-position: center center; background-size: contain; background-image: url('img/directionIcon.png'); float: right; width: 86px; height: 40px;\"></div>\n</div>\n<!-- <div id=\"closingButton\" style=\"position: absolute; z-index: 900; width: 87px; height: 38px; background-color: #414040; left: 513px; top: 408px;\"><span data-dojo-type=\"shapes.Text\" style=\"font-size: 14px; position: absolute; z-index: 900; color: #ffffff; left: 41px; top: 8.5px;\">X</span></div> -->\n</div>";
      }
      modalContent.append(result);
      this.geotabs = $('.geotab:not(.disabled)');
      this.geotabsiterator = 0;
      $(".close").click(function(e) {
        var endTime, error, eventLabel, timeSpent;
        endTime = new Date().getTime();
        timeSpent = endTime - startTime;
        eventLabel = annotation.widgets[_this.name].options.title;
        try {
          _gaq.push(['_trackEvent', _this.name, 'viewed', eventLabel, timeSpent]);
          return _gaq.push(['_trackTiming', _this.name, eventLabel, timeSpent, 'viewed']);
        } catch (_error) {
          error = _error;
        }
      });
      $('#mask').click(function(e) {
        var endTime, error, eventLabel, timeSpent;
        endTime = new Date().getTime();
        timeSpent = endTime - startTime;
        eventLabel = annotation.widgets[_this.name].options.title;
        try {
          _gaq.push(['_trackEvent', _this.name, 'viewed', eventLabel, timeSpent]);
          return _gaq.push(['_trackTiming', _this.name, eventLabel, timeSpent, 'viewed']);
        } catch (_error) {
          error = _error;
        }
      });
      $("#geoMap").click(function() {
        var i, latitude, latlng, locationName, longitude, map, myOptions, output, x, xmlDoc, xmlhttp;
        $('.geotab.selected').removeClass('selected');
        $("#location_bar").css("visibility", "visible");
        $("#weather_bar").css("visibility", "hidden");
        $("#rout_bar").css("visibility", "hidden");
        $("#map_area").empty();
        i = void 0;
        latitude = void 0;
        latlng = void 0;
        locationName = void 0;
        longitude = void 0;
        map = void 0;
        myOptions = void 0;
        output = void 0;
        x = void 0;
        xmlDoc = void 0;
        xmlhttp = void 0;
        /*
        try
          if window.XMLHttpRequest
            xmlhttp = new XMLHttpRequest()
          else
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP")
          xmlhttp.open "POST", annotation.resource.value + "/about.rdf", false
          xmlhttp.send()
          xmlDoc = xmlhttp.responseXML
          x = xmlDoc.getElementsByTagName("Feature")
          i = 0
          while i < x.length
            locationName = x[i].getElementsByTagName("name")[0].childNodes[0].nodeValue
            latitude = x[i].getElementsByTagName("lat")[0].childNodes[0].nodeValue
            longitude = x[i].getElementsByTagName("long")[0].childNodes[0].nodeValue
            i++
          output = document.getElementById("map_area")
          latlng = new google.maps.LatLng(latitude, longitude)
          myOptions =
            zoom: 13
            center: latlng
            mapTypeId: google.maps.MapTypeId.ROADMAP
        
          map = new google.maps.Map(output, myOptions)
          @geomap = map
          console.info @geomap
          # google.maps.event.addListener(output, 'keydown', console.info 'map catched the keydown event');
        */

        locationName = annotation.getLabel();
        latitude = annotation.getLatitude();
        longitude = annotation.getLongitude();
        output = document.getElementById("map_area");
        latlng = new google.maps.LatLng(latitude, longitude);
        myOptions = {
          zoom: 13,
          center: latlng,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(output, myOptions);
        _this.geomap = map;
        return $("#geoMap").addClass('selected');
      });
      $("#geoWeather").click(function() {
        var i, latitude, latlng, locationName, longitude, map, myOptions, output, weatherLayer, x, xmlDoc, xmlhttp;
        $('.geotab.selected').removeClass('selected');
        $("#location_bar").css("visibility", "hidden");
        $("#weather_bar").css("visibility", "visible");
        $("#rout_bar").css("visibility", "hidden");
        $("#map_area").empty();
        i = void 0;
        latitude = void 0;
        latlng = void 0;
        locationName = void 0;
        longitude = void 0;
        map = void 0;
        myOptions = void 0;
        output = void 0;
        weatherLayer = void 0;
        x = void 0;
        xmlDoc = void 0;
        xmlhttp = void 0;
        /*
        try
          if window.XMLHttpRequest
            xmlhttp = new XMLHttpRequest()
          else
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP")
          xmlhttp.open "POST", annotation.resource.value + "/about.rdf", false
          xmlhttp.send()
          xmlDoc = xmlhttp.responseXML
          x = xmlDoc.getElementsByTagName("Feature")
          i = 0
          while i < x.length
            locationName = x[i].getElementsByTagName("name")[0].childNodes[0].nodeValue
            latitude = x[i].getElementsByTagName("lat")[0].childNodes[0].nodeValue
            longitude = x[i].getElementsByTagName("long")[0].childNodes[0].nodeValue
            i++
        */

        locationName = annotation.getLabel();
        latitude = annotation.getLatitude();
        longitude = annotation.getLongitude();
        output = document.getElementById("map_area");
        latlng = new google.maps.LatLng(latitude, longitude);
        myOptions = {
          zoom: 11,
          center: latlng,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(output, myOptions);
        weatherLayer = new google.maps.weather.WeatherLayer({
          temperatureUnits: google.maps.weather.TemperatureUnit.CELSIUS
        });
        weatherLayer.setMap(map);
        _this.geomap = map;
        return $("#geoWeather").addClass('selected');
      });
      $("#geoRout").click(function() {
        $('.geotab.selected').removeClass('selected');
        $("#location_bar").css("visibility", "hidden");
        $("#weather_bar").css("visibility", "hidden");
        $("#rout_bar").css("visibility", "visible");
        $("#map_area").empty();
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((function(position) {
            var destination, directionDisplay, directionsDisplay, directionsService, i, latitude, locationName, longitude, map, mapOptions, myOptions, output, request, start, x, xmlDoc, xmlhttp;
            i = void 0;
            latitude = void 0;
            locationName = void 0;
            longitude = void 0;
            map = void 0;
            myOptions = void 0;
            output = void 0;
            x = void 0;
            xmlDoc = void 0;
            xmlhttp = void 0;
            start = void 0;
            destination = void 0;
            directionDisplay = void 0;
            directionsService = new google.maps.DirectionsService();
            /*
            try
              if window.XMLHttpRequest
                xmlhttp = new XMLHttpRequest()
              else
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP")
              xmlhttp.open "POST", annotation.resource.value + "/about.rdf", false
              xmlhttp.send()
              xmlDoc = xmlhttp.responseXML
              x = xmlDoc.getElementsByTagName("Feature")
              i = 0
              while i < x.length
                locationName = x[i].getElementsByTagName("name")[0].childNodes[0].nodeValue
                latitude = x[i].getElementsByTagName("lat")[0].childNodes[0].nodeValue
                longitude = x[i].getElementsByTagName("long")[0].childNodes[0].nodeValue
                i++
            */

            locationName = annotation.getLabel();
            latitude = annotation.getLatitude();
            longitude = annotation.getLongitude();
            output = document.getElementById("map_area");
            directionsDisplay = new google.maps.DirectionsRenderer();
            destination = new google.maps.LatLng(latitude, longitude);
            mapOptions = {
              zoom: 7,
              mapTypeId: google.maps.MapTypeId.ROADMAP,
              center: destination
            };
            map = new google.maps.Map(output, mapOptions);
            start = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            directionsDisplay.setMap(map);
            this.geomap = map;
            request = {
              origin: start,
              destination: destination,
              travelMode: google.maps.TravelMode.DRIVING
            };
            return directionsService.route(request, function(result, status) {
              if (status === google.maps.DirectionsStatus.OK) {
                return directionsDisplay.setDirections(result);
              }
            });
          }), function(error) {
            switch (error.code) {
              case error.TIMEOUT:
                return alert("Timeout");
              case error.POSITION_UNAVAILABLE:
                return alert("Position unavailable");
              case error.PERMISSION_DENIED:
                return alert("Permission denied");
              case error.UNKNOWN_ERROR:
                return alert("Unknown error");
            }
          });
        }
        return $("#geoRout").addClass('selected');
      });
      $("#geoPanoramio").click(function() {
        $('.geotab.selected').removeClass('selected');
        return $("#geoPanoramio").addClass('selected');
      });
      $("#geoMap").trigger("click");
      $("#geoMap").addClass('selected');
    };

    return GeoNamesMapPlugin;

  })(window.LimePlugin);

}).call(this);
