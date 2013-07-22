(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.LSIImagePlugin = (function(_super) {
    __extends(LSIImagePlugin, _super);

    function LSIImagePlugin() {
      _ref = LSIImagePlugin.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    LSIImagePlugin.prototype.init = function() {
      var annotation, _i, _len, _ref1, _results;
      this.name = 'LSIImagePlugin';
      annotation = void 0;
      console.info("Initialize LSIImagePlugin");
      _ref1 = this.lime.annotations;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        annotation = _ref1[_i];
        if (annotation.resource.value.indexOf("geonames") < 0) {
          _results.push(this.handleAnnotation(annotation));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    LSIImagePlugin.prototype.handleAnnotation = function(annotation) {
      var _this = this;
      return annotation.entityPromise.done(function(entities) {
        var nonConcept, widget;
        nonConcept = annotation.getDescription();
        nonConcept = nonConcept.replace("No description found.", "");
        if (nonConcept.length >= 3) {
          widget = _this.lime.allocateWidgetSpace(_this, {
            thumbnail: "img/pic.png",
            title: "" + (annotation.getLabel()) + " Pics",
            type: "DbpediaInfoWidget",
            sortBy: function() {
              return 10000 * annotation.start + annotation.end;
            }
          });
          widget.annotation = annotation;
          jQuery(widget).bind('activate', function(e) {
            return _this.showDepictionInModalWindow(annotation);
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

    LSIImagePlugin.prototype.showDepictionInModalWindow = function(annotation) {
      var lodResource;
      try {
        lodResource = "http://new.devserver.sti2.org:8080/lsi/api/invoke?lod=" + annotation.resource.value + "&mediaType=video&limit=9&ner=yes";
        return $.ajax(lodResource, {
          type: 'GET',
          dataType: 'xml',
          success: function(data, textStatus, jqXHR) {
            var i, image, modalContainer, result, x,
              _this = this;
            console.log("success " + textStatus);
            x = data.Description;
            result = "<div id=\"listContainer\" style=\"position:relative; float: left; z-index: 10; width:35%; height: 95%; background: white; box-shadow: rgba(85,85,85,0.5) 0px 0px 24px;\" >\n<ul style=\"overflow: hidden; padding-left: 20px; padding-right: 10px;\">";
            i = 0;
            image = " ";
            while (i < 9) {
              image = x[i].about;
              result += "<li style=\"float: left; list-style: none; margin: 0 15px 30px 0;\">\n<a href=\"#\" class=\"lsiLink\">\n<img class=\"lsiLink\" src=\"" + image + "\" alt=\"description\" style=\"width: 80px; height: 70px; border: 3px solid #777\"/>\n</a>\n</li>";
              i++;
            }
            result += "</ul>\n</div>\n<div id=\"displayArea\" style=\"position:relative; float: left; z-index: 1; width: 65%; height:95%; background: #DBDBDB; \">\n<img id=\"bigImage\" src=\"" + image + "\" style=\"display: block; min-height: 300px; max-height: 330px; max-width: 600px; margin-top: 10px; margin-left: auto; margin-right: auto; border: 5px solid white;\"/>\n</div>";
            modalContainer = this.getModalContainer().html(result);
            return $(".lsiLink", modalContainer).click(function(e) {
              var lsiImageSource;
              e.preventDefault();
              lsiImageSource = $(e.target).attr("src");
              return $("#bigImage", modalContainer).attr("src", lsiImageSource);
            });
          },
          error: function(jqXHR, textStatus, errorThrown) {
            return $(modalContent).append("AJAX Error: " + textStatus);
          }
        });
      } catch (_error) {}
    };

    return LSIImagePlugin;

  })(window.LimePlugin);

}).call(this);
