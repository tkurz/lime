(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.BusinessPlugin = (function(_super) {
    __extends(BusinessPlugin, _super);

    function BusinessPlugin() {
      _ref = BusinessPlugin.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    BusinessPlugin.prototype.init = function() {
      var annotation, _i, _len, _ref1, _ref2, _results;
      this.name = 'BusinessPlugin';
      annotation = void 0;
      console.info("Initialize BusinessPlugin");
      _ref1 = this.lime.annotations;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        annotation = _ref1[_i];
        if (annotation.isBookmark() && annotation.resource.value.indexOf("youtube.com") < 0 && ((_ref2 = annotation.relation.value) === 'http://connectme.at/ontology#explicitlyShows' || _ref2 === 'http://connectme.at/ontology#explicitlyMentions' || _ref2 === 'http://connectme.at/ontology#implicitlyShows' || _ref2 === 'http://connectme.at/ontology#implicitlyMentions' || _ref2 === 'http://connectme.at/ontology#hasContent')) {
          _results.push(this.handleAnnotation(annotation));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    BusinessPlugin.prototype.handleAnnotation = function(annotation) {
      var domain, nonConcept, url, widget,
        _this = this;
      nonConcept = annotation.resource.value;
      if (nonConcept.length >= 3) {
        url = annotation.resource.value;
        domain = url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0].replace('www.', '');
      }
      widget = this.lime.allocateWidgetSpace(this, {
        thumbnail: "img/shop.png",
        title: "" + ((typeof annotation.getLabel === "function" ? annotation.getLabel() : void 0) || domain),
        type: "BusinessWidget",
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
        return _this.showAbstractInModalWindow(annotation, _this.getModalContainer());
      });
      annotation.widgets[this.name] = widget;
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
      return jQuery(annotation).bind("becomeInactive", function(e) {
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
    };

    BusinessPlugin.prototype.showAbstractInModalWindow = function(annotation, outputElement) {
      var lime, modalContent, resource, result, startTime,
        _this = this;
      modalContent = $(outputElement);
      modalContent.css("width", "800px");
      modalContent.css("height", "600px");
      startTime = new Date().getTime();
      lime = this.lime;
      resource = "";
      resource = annotation.resource.value;
      if (annotation.resource.value.indexOf("webtv.feratel.com") > 0) {
        resource = resource.replace(/\$\$/g, "&");
      }
      console.log(resource);
      result = "<iframe frameborder=\"0\" style=\"height: 600px; width: 800px; position: relative; margin: 0 auto;\" src=\"" + resource + "\">\n<p>Your browser does not support iframes.</p>\n</iframe>";
      modalContent.append(result);
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
      return $('#mask').click(function(e) {
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
    };

    return BusinessPlugin;

  })(window.LimePlugin);

}).call(this);
