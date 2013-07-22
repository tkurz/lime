(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.GoogleWeatherPlugin = (function(_super) {
    __extends(GoogleWeatherPlugin, _super);

    function GoogleWeatherPlugin() {
      _ref = GoogleWeatherPlugin.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    GoogleWeatherPlugin.prototype.init = function() {
      var annotation, _i, _len, _ref1, _results;
      this.name = 'GoogleWeatherPlugin';
      annotation = void 0;
      console.info("Initialize GoogleWeatherPlugin");
      _ref1 = this.lime.annotations;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        annotation = _ref1[_i];
        if (annotation.resource.value.indexOf("geonames") > 0 && annotation.resource.value.indexOf("about.rdf") < 0) {
          _results.push(this.handleAnnotation(annotation));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    GoogleWeatherPlugin.prototype.handleAnnotation = function(annotation) {
      var _this = this;
      return annotation.entityPromise.done(function(entities) {
        var nonConcept, widget;
        nonConcept = annotation.getDescription();
        nonConcept = nonConcept.replace("No description found.", "");
        if (nonConcept.length >= 0) {
          widget = _this.lime.allocateWidgetSpace(_this, {
            thumbnail: "img/weather.png",
            title: "" + (annotation.getLabel()) + " Weather",
            type: "GoogleWeatherWidget",
            sortBy: function() {
              return 10000 * annotation.start + annotation.end;
            }
          });
          widget.annotation = annotation;
          jQuery(widget).bind('activate', function(e) {
            return _this.showWeatherInModalWindow(annotation, _this.getModalContainer());
          });
          annotation.widgets[_this.name] = widget;
          jQuery(annotation).bind("becomeActive", function(e) {
            return annotation.widgets[_this.name].setActive();
          });
          return jQuery(annotation).bind("becomeInactive", function(e) {
            return annotation.widgets[_this.name].setInactive();
          });
        }
      });
    };

    GoogleWeatherPlugin.prototype.showWeatherInModalWindow = function(annotation, output) {
      var latitude, latlng, locationName, longitude, map, myOptions, weatherLayer;
      locationName = annotation.getLabel();
      latitude = annotation.getLatitude();
      longitude = annotation.getLongitude();
      latlng = new google.maps.LatLng(latitude, longitude);
      myOptions = {
        zoom: 11,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      map = new google.maps.Map(output[0], myOptions);
      weatherLayer = new google.maps.weather.WeatherLayer({
        temperatureUnits: google.maps.weather.TemperatureUnit.CELSIUS
      });
      return weatherLayer.setMap(map);
    };

    return GoogleWeatherPlugin;

  })(window.LimePlugin);

}).call(this);
