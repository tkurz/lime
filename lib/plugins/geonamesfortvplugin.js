(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.GeoNamesMapForTVPlugin = (function(_super) {
    __extends(GeoNamesMapForTVPlugin, _super);

    function GeoNamesMapForTVPlugin() {
      _ref = GeoNamesMapForTVPlugin.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    GeoNamesMapForTVPlugin.prototype.init = function() {
      var annotation, _i, _len, _ref1, _ref2, _results;
      this.name = 'GeoNamesMapForTVPlugin';
      annotation = void 0;
      console.info("Initialize GeoNamesMapForTVPlugin");
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

    GeoNamesMapForTVPlugin.prototype.handleAnnotation = function(annotation) {
      var _this = this;
      return annotation.entityPromise.done(function() {
        var widget;
        widget = _this.lime.allocateWidgetSpace(_this, {
          thumbnail: "img/mapIcon.png",
          title: "" + (annotation.getLabel()) + " Map",
          type: "GeoNamesMapForTVWidget",
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
            jQuery("#geoMap").trigger('click');
          }
          if (_this.geotabsiterator === 2) {
            jQuery("#geoWeather").trigger('click');
          }
          if (_this.geotabsiterator === 1) {
            jQuery("#geoRout").trigger('click');
          }
          if (_this.geotabsiterator === 3) {
            return jQuery("#geoPanoramio").trigger('click');
          }
        });
        jQuery(widget).bind("rightarrow", function(e) {
          _this.geotabsiterator = _this.geotabsiterator === 0 ? _this.geotabs.length - 1 : _this.geotabsiterator - 1;
          if (_this.geotabsiterator === 0) {
            jQuery("#geoMap").trigger('click');
          }
          if (_this.geotabsiterator === 2) {
            jQuery("#geoWeather").trigger('click');
          }
          if (_this.geotabsiterator === 1) {
            jQuery("#geoRout").trigger('click');
          }
          if (_this.geotabsiterator === 3) {
            return jQuery("#geoPanoramio").trigger('click');
          }
        });
        jQuery(widget).bind("uparrow", function(e) {
          _this.mapzoom++;
          _this.routemapzoom++;
          return jQuery(".selected:first").trigger("click");
        });
        return jQuery(widget).bind("downarrow", function(e) {
          _this.mapzoom--;
          _this.routemapzoom--;
          return jQuery(".selected:first").trigger("click");
        });
      });
    };

    GeoNamesMapForTVPlugin.prototype.showInModalWindow = function(annotation, outputElement) {
      var label, language, modalContent, result, startTime,
        _this = this;
      modalContent = void 0;
      result = void 0;
      language = UTILS.getParameterByName("lang");
      startTime = new Date().getTime();
      label = annotation.getLabel();
      modalContent = jQuery(outputElement);
      modalContent.css("width", "450px");
      modalContent.css("height", "450px");
      if (language.indexOf("en") >= 0) {
        result = "<div id=\"ifoWidgetExpanded\" style=\"border: 1px dotted lightgray; position: absolute; top: 0; z-index: 100; width: 450px; right: 0; height: 100%;\">\n<div id=\"map_area\" style=\"left: 0px; top: 0px; width: 450px; height: 100%; position: relative;\"><img></img></div>\n<div id=\"mapMenu\" style=\"position: absolute; z-index: 900; width: 100%; background-color: rgba(37, 37, 37, 0.7); right: 1px; bottom: 0px; height: 41px;\">\n<div if=\"mapLabel\" style=\"position: relative; float: left; height: 40px; width: auto;\">&nbsp;" + label + "</div>\n<div id=\"geoMap\" class=\"geotab\" style=\"position: relative; background-position: center center; background-image: url('img/mapIcon.png'); background-size: contain; float: right; height: 40px; width: 86px;\"></div>\n<div id=\"geoWeather\" class=\"geotab disabled\" style=\"display: none; position: relative; background-position: center center; background-image: url('img/weather.png'); background-size: contain; float: right; width: 86px; height: 40px;\"></div>\n<div id=\"geoRout\" class=\"geotab disabled\" style=\"display: none; background-position: center center; background-size: contain; background-image: url('img/directionIcon.png'); float: right; width: 86px; height: 40px;\"></div>\n<div id=\"geoPanoramio\" class=\"geotab disabled\" style=\"display: none; background-position: center center; background-size: contain; background-image: url('img/directionIcon.png'); float: right; width: 86px; height: 40px;\"></div>\n</div>\n<!-- <div id=\"closingButton\" style=\"position: absolute; z-index: 900; width: 87px; height: 38px; background-color: #414040; left: 513px; top: 408px;\"><span data-dojo-type=\"shapes.Text\" style=\"font-size: 14px; position: absolute; z-index: 900; color: #ffffff; left: 41px; top: 8.5px;\">X</span></div> -->\n</div>";
      } else {
        result = "<div id=\"ifoWidgetExpanded\" style=\"border: 1px dotted lightgray; position: absolute; top: 0; z-index: 100; width: 450px; right: 0; height: 80%;\">\n<div id=\"map_area\" style=\"left: 0px; top: 0px; width: 450px; height: 100%; position: relative;\"></div>\n<div id=\"mapMenu\" style=\"position: absolute; z-index: 900; width: 100%; background-color: rgba(37, 37, 37, 0.7); right: 1px; bottom: 0px; height: 41px;\">\n<div if=\"mapLabel\" style=\"position: relative; float: left; height: 40px; width: auto;\">&nbsp;" + label + "</div>\n<div id=\"geoMap\" class=\"geotab\" style=\"position: relative; background-position: center center; background-image: url('img/mapIcon.png'); background-size: contain; float: right; height: 40px; width: 86px;\"></div>\n<div id=\"geoWeather\" class=\"geotab disabled\" style=\"display: none; position: relative; background-position: center center; background-image: url('img/weather.png'); background-size: contain; float: right; width: 86px; height: 40px;\"></div>\n<div id=\"geoRout\" class=\"geotab disabled\" style=\"display: none; background-position: center center; background-size: contain; background-image: url('img/directionIcon.png'); float: right; width: 86px; height: 40px;\"></div>\n<div id=\"geoPanoramio\" class=\"geotab disabled\" style=\"display: none; background-position: center center; background-size: contain; background-image: url('img/directionIcon.png'); float: right; width: 86px; height: 40px;\"></div>\n</div>\n<!-- <div id=\"closingButton\" style=\"position: absolute; z-index: 900; width: 87px; height: 38px; background-color: #414040; left: 513px; top: 408px;\"><span data-dojo-type=\"shapes.Text\" style=\"font-size: 14px; position: absolute; z-index: 900; color: #ffffff; left: 41px; top: 8.5px;\">X</span></div> -->\n</div>";
      }
      modalContent.append(result);
      jQuery(".close").click(function(e) {
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
      jQuery('#mask').click(function(e) {
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
      this.geotabs = jQuery('.geotab:not(.disabled)');
      this.geotabsiterator = 0;
      jQuery("#geoMap").click(function() {
        var i, latitude, latlng, locationName, longitude, map, myOptions, newmap, output;
        jQuery('.geotab.selected').removeClass('selected');
        jQuery("#location_bar").css("visibility", "visible");
        jQuery("#weather_bar").css("visibility", "hidden");
        jQuery("#rout_bar").css("visibility", "hidden");
        jQuery("#map_area").empty();
        i = void 0;
        latitude = void 0;
        latlng = void 0;
        locationName = void 0;
        longitude = void 0;
        map = void 0;
        myOptions = void 0;
        output = void 0;
        locationName = annotation.getLabel();
        latitude = annotation.getLatitude();
        longitude = annotation.getLongitude();
        map = "#map_area";
        jQuery(map).empty();
        newmap = "<img src=\"http://maps.google.com/maps/api/staticmap?center=" + latitude + "," + longitude + "&zoom=" + _this.mapzoom + "&size=450x450&maptype=roadmap&visual_refresh=true&sensor=false\"></img>";
        jQuery(map).append(newmap);
        return jQuery("#geoMap").addClass('selected');
      });
      jQuery("#geoWeather").click(function() {
        var i, latitude, latlng, locationName, longitude, map, mapzoom, myOptions, output, weatherLayer;
        jQuery('.geotab.selected').removeClass('selected');
        jQuery("#location_bar").css("visibility", "hidden");
        jQuery("#weather_bar").css("visibility", "visible");
        jQuery("#rout_bar").css("visibility", "hidden");
        jQuery("#map_area").empty();
        i = void 0;
        latitude = void 0;
        latlng = void 0;
        locationName = void 0;
        longitude = void 0;
        map = void 0;
        myOptions = void 0;
        output = void 0;
        weatherLayer = void 0;
        locationName = annotation.getLabel();
        latitude = annotation.getLatitude();
        longitude = annotation.getLongitude();
        locationName = annotation.getLabel();
        latitude = annotation.getLatitude();
        longitude = annotation.getLongitude();
        mapzoom = 12;
        map = "#map_area";
        jQuery(map).attr("src", "http://maps.google.com/maps/api/staticmap?center=" + latitude + "," + longitude + "&zoom=" + mapzoom + "&size=450x450&maptype=roadmap&visual_refresh=true&sensor=false");
        return jQuery("#geoWeather").addClass('selected');
      });
      jQuery("#geoRout").click(function() {
        jQuery('.geotab.selected').removeClass('selected');
        jQuery("#location_bar").css("visibility", "hidden");
        jQuery("#weather_bar").css("visibility", "hidden");
        jQuery("#rout_bar").css("visibility", "visible");
        jQuery("#map_area").empty();
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((function(position) {
            var destination, directionsService, i, latitude, locationName, longitude, map, myOptions, newmap, output, request, start;
            i = void 0;
            latitude = void 0;
            locationName = void 0;
            longitude = void 0;
            map = void 0;
            myOptions = void 0;
            output = void 0;
            directionsService = new google.maps.DirectionsService();
            locationName = annotation.getLabel();
            latitude = annotation.getLatitude();
            longitude = annotation.getLongitude();
            destination = new google.maps.LatLng(latitude, longitude);
            start = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            request = {
              origin: start,
              destination: destination,
              travelMode: google.maps.TravelMode.DRIVING
            };
            this.directionString = "" + position.coords.latitude + "," + position.coords.longitude + "|";
            directionsService.route(request, function(result, status) {
              var myRoute, _i, _len, _ref1, _results;
              if (status === google.maps.DirectionsStatus.OK) {
                myRoute = result.routes[0].legs[0];
                _ref1 = myRoute.steps;
                _results = [];
                for (_i = 0, _len = _ref1.length; _i < _len; _i += 1) {
                  i = _ref1[_i];
                  console.log(i.end_location);
                  _results.push(this.directionString += i.end_location + '|');
                }
                return _results;
              }
            });
            console.log("route: " + position.coords.latitude + "," + position.coords.longitude + "|" + latitude + "," + longitude + " - @directionString= ", this.directionString);
            map = "#map_area";
            jQuery(map).empty();
            newmap = "<img src=\"http://maps.google.com/maps/api/staticmap?path=color:0x0000ff|weight:5|" + this.directionString + "&zoom=6&size=450x450&visual_refresh=true&maptype=roadmap&sensor=false\"></img>";
            return jQuery(map).append(newmap);
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
        return jQuery("#geoRout").addClass('selected');
      });
      jQuery("#geoPanoramio").click(function() {
        jQuery('.geotab.selected').removeClass('selected');
        return jQuery("#geoPanoramio").addClass('selected');
      });
      this.mapzoom = 12;
      this.routemapzoom = 6;
      jQuery("#geoMap").trigger("click");
      jQuery("#geoMap").addClass('selected');
    };

    return GeoNamesMapForTVPlugin;

  })(window.LimePlugin);

}).call(this);
