(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.YoutubePlugin = (function(_super) {
    __extends(YoutubePlugin, _super);

    function YoutubePlugin() {
      _ref = YoutubePlugin.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    YoutubePlugin.prototype.init = function() {
      var annotation, _i, _len, _ref1, _results;
      this.name = 'YoutubePlugin';
      annotation = void 0;
      console.info("Initialize YoutubePlugin");
      _ref1 = this.lime.annotations;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        annotation = _ref1[_i];
        if (annotation.resource.value.indexOf("geonames") < 0 && annotation.resource.value.indexOf("dbpedia") < 0 && annotation.resource.value.indexOf("youtube") > 0) {
          _results.push(this.handleAnnotation(annotation));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    YoutubePlugin.prototype.handleAnnotation = function(annotation) {
      var nonConcept, widget,
        _this = this;
      nonConcept = annotation.resource.value;
      nonConcept = nonConcept.replace("No description found.", "");
      if (nonConcept.length >= 3) {
        widget = this.lime.allocateWidgetSpace(this, {
          thumbnail: "img/youtube.png",
          title: "" + (annotation.getLabel()) + " Video",
          type: "YoutubeWidget",
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
      }
    };

    YoutubePlugin.prototype.showAbstractInModalWindow = function(annotation, outputElement) {
      var lime, modalContent, result, startTime, url,
        _this = this;
      modalContent = $(outputElement);
      modalContent.css("width", "600px");
      modalContent.css("height", "auto");
      startTime = new Date().getTime();
      lime = this.lime;
      url = annotation.resource.value;
      url = url.split('v=')[1];
      console.info(annotation.resource.value, url);
      result = "<iframe width=\"600\" height=\"338\" style=\"margin: 0 auto; display: block;\" src=\"http://www.youtube.com/embed/" + url + "?autoplay=1\" frameborder=\"0\" allowfullscreen>\n     <p>Your browser does not support iframes.</p>\n </iframe>";
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

    /* displayModal: (annotation) -> # Modal window script usin jquery
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
      $(modalcontainer).css "height", "90%"
      $(modalcontainer).css "max-height", "750px"
      $(modalcontainer).css "max-width", "700px"
      $(modalcontainer).css "overflow-x", "auto"
      $(modalcontainer).empty()
      $(modalcontainer).append "<a href=\"#\" class=\"close\" role=\"button\"><img src=\"img/close-icon.png\" style=\"width: 22px; height: 22px;\"/></a>"
      $(modalcontainer).append "<div id=\"modalContent\" style=\"height: 95%; width: 100%; position: relative; margin: 0 auto; color: black; \">"
    
      #  $(modalcontainer).append("<div id=\"mapLabel\" style=\"width: inherit; height: 25%; font-family:verdana; font-size:14px; /media/EXPRESSGATE/MyWorks/For_Seekda/TV Emulator/Dev/ConnectMe_1.2/img/sport.pngkground-image: -ms-linear-gradient(bottom, rgb(33,26,20) 32%, rgb(69,61,55) 66%, rgb(28,22,21) 15%); background-image: -webkit-gradient(	linear,	left bottom, left top, color-stop(0.32, rgb(33,26,20)), color-stop(0.66, rgb(69,61,55)), color-stop(0.15, rgb(28,22,21))); color: white\"> " + "<table> <tr> <td> <img src=\"img/mapIcon.png\" style=\"width: 40px; height: 40px;\" ></td><td><em style=\"font-size:18px; color: white;\">" + locationName + "</em></td></tr></table>" + "&nbsp;&nbsp;  lat: " + latitude + "; long: " + longitude + "</div>");
      $(modalcontainer).append "</div>"
    
      #console.log("$(modalcontainer) = " + $(modalcontainer).html() + " modalcontainer " + modalcontainer.html());
    
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
        $(modalcontainer).hide().empty();
    
    
      #if mask is clicked
      $(mask).click (e)=>
        $(mask).hide()
        $(modalcontainer).hide().empty();
    
      $(window).resize (e)=>
    
        #var box = modalcontainer;
    
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
    
      #box.blur(function() { setTimeout(<bluraction>, 100); });
      @showInModalWindow annotation, "modalContent"
    */


    return YoutubePlugin;

  })(window.LimePlugin);

}).call(this);
