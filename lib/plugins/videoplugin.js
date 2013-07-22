(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.VideoPlugin = (function(_super) {
    __extends(VideoPlugin, _super);

    function VideoPlugin() {
      _ref = VideoPlugin.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    VideoPlugin.prototype.init = function() {
      var annotation, _i, _len, _ref1, _ref2, _results;
      this.name = 'VideoPlugin';
      console.info("Initialize " + this.name);
      _ref1 = this.lime.annotations;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        annotation = _ref1[_i];
        if (annotation.resource.value.indexOf("dbpedia.org") > 0 && ((_ref2 = annotation.relation.value) === 'http://connectme.at/ontology#explicitlyShows' || _ref2 === 'http://connectme.at/ontology#explicitlyMentions' || _ref2 === 'http://connectme.at/ontology#implicitlyShows' || _ref2 === 'http://connectme.at/ontology#implicitlyMentions')) {
          _results.push(this.handleAnnotation(annotation));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    VideoPlugin.prototype.handleAnnotation = function(annotation) {
      var _this = this;
      return annotation.entityPromise.done(function() {
        var nonConcept, widget;
        nonConcept = annotation.getDescription();
        nonConcept = nonConcept.replace("No description found.", "");
        if (nonConcept.length >= 3) {
          console.log("++++++ I should render a LSI video widget");
          widget = _this.lime.allocateWidgetSpace(_this, {
            thumbnail: "img/youtube.png",
            title: "" + (annotation.getLabel()) + " Videos",
            type: "VideoWidget",
            sortBy: function() {
              return 10000 * annotation.start + annotation.end;
            }
          });
          _this.getLSIVideos(annotation);
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
          annotation.widgets[_this.name] = widget;
          jQuery(annotation).bind("becomeActive", function(e) {
            var error, eventActiveLabel, eventCategory;
            if (annotation.lsiVideoResources) {
              if (annotation.lsiVideoResources.length > 0) {
                try {
                  eventActiveLabel = e.target.widgets[_this.name].options.title;
                  eventCategory = _this.name;
                  _gaq.push(['_trackEvent', eventCategory, 'becameActive', eventActiveLabel]);
                } catch (_error) {
                  error = _error;
                }
                return annotation.widgets[_this.name].setActive();
              }
            }
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
            _this.videotabsiterator = _this.videotabs.length === _this.videotabsiterator + 1 ? 0 : _this.videotabsiterator + 1;
            if (_this.videotabsiterator === 0) {
              $("#video1").trigger('click');
            }
            if (_this.videotabsiterator === 1) {
              $("#video2").trigger('click');
            }
            if (_this.videotabsiterator === 2) {
              $("#video3").trigger('click');
            }
            if (_this.videotabsiterator === 3) {
              return $("#video4").trigger('click');
            }
          });
          return jQuery(widget).bind("rightarrow", function(e) {
            _this.videotabsiterator = _this.videotabsiterator === 0 ? _this.videotabs.length - 1 : _this.videotabsiterator - 1;
            $('.videotab.selected').removeClass('selected');
            if (_this.videotabsiterator === 0) {
              $("#video1").trigger('click');
            }
            if (_this.videotabsiterator === 1) {
              $("#video2").trigger('click');
            }
            if (_this.videotabsiterator === 2) {
              $("#video3").trigger('click');
            }
            if (_this.videotabsiterator === 3) {
              return $("#video4").trigger('click');
            }
          });
        }
      });
    };

    VideoPlugin.prototype.getLSIVideos = function(annotation) {
      var _this = this;
      return this.lime.cmf.getLSIVideosForTerm(annotation.resource.value, function(err, res) {
        if (err) {
          return console.warn("Error getting LSI Video resources", err);
        } else {
          console.info("LSI resources for", annotation, res);
          annotation.lsiVideoResources = _(res).map(function(resultset) {
            var entity;
            entity = {
              title: resultset.title.value,
              locator: resultset.locator.value,
              img: resultset.img.value,
              video: resultset.video.value
            };
            return entity;
          });
          return annotation.getLsiVideoResources = function() {
            return this.lsiVideoResources;
          };
        }
      });
    };

    VideoPlugin.prototype.showAbstractInModalWindow = function(annotation, outputElement) {
      var modalContent, result, startTime, url, videoList,
        _this = this;
      modalContent = $(outputElement);
      modalContent.css("width", "600px");
      modalContent.css("height", "auto");
      startTime = new Date().getTime();
      /*
      -- added 29.apr.2013
      
      the videoList represents a result of a quary like this to the CMF:
              PREFIX mao: <http://www.w3.org/ns/ma-ont#>
              SELECT DISTINCT ?video
              WHERE {
                ?video a <http://www.w3.org/ns/ma-ont#VideoTrack> .
                ?video mao:description ?text .
                ?video mao:locator ?url .
                ?video mao:hasKeyword <http://dbpedia.org/resource/Sledding> .
              }
              ORDER BY ?video
      it should have the followind object structure:
      videoList = [
                      {
                        description: "text description", [string]
                        duration: 95.0, [flaot]
                        locator: "https://www.youtube.com/watch?v=tzBRpNI1Mck", [string]
                        title: "Nachtrodeln Schladming - Rohrmoos Hochwurzen Schlittenfahren", [string]
                        img: "http://i.ytimg.com/vi/tzBRpNI1Mck/0.jpg", [string]
                        kasKeyword: {"http://dbpedia.org/resource/Sledding", "http://dbpedia.org/resource/Schladming", "http://dbpedia.org/resource/Planai"} [array of string]
                      },
                      {
                        description: "Hochwurzen 1850 m.",
                        duration: "596.0",
                        locator: "https://www.youtube.com/watch?v=AXgZ98Z9EFw",
                        title: "Schladming- rodeln-Puzanje 2012.AVI",
                        img: "http://i.ytimg.com/vi/AXgZ98Z9EFw/0.jpg",
                        kasKeyword: {"http://dbpedia.org/resource/Sledding", "http://dbpedia.org/resource/Schladming", "http://dbpedia.org/resource/Hochwurzen"}
                      },
                      ...
                    ]
      */

      videoList = [
        {
          description: "Nachtrodeln auf der ca. 6,3 km langen Rodelbahn von der Bergstation der Hochwurzen Gipfelbahn bis zur Talstation in Rohrmoos. Mit 4 sch??nen urigen H??tten - H...",
          duration: "95.0",
          locator: "https://www.youtube.com/watch?v=tzBRpNI1Mck",
          title: "Nachtrodeln Schladming - Rohrmoos Hochwurzen Schlittenfahren",
          img: "http://i.ytimg.com/vi/tzBRpNI1Mck/0.jpg",
          kasKeyword: {
            "http://dbpedia.org/resource/Sledding": "http://dbpedia.org/resource/Sledding",
            "http://dbpedia.org/resource/Schladming": "http://dbpedia.org/resource/Schladming",
            "http://dbpedia.org/resource/Planai": "http://dbpedia.org/resource/Planai"
          }
        }, {
          description: "Hochwurzen 1850 m.",
          duration: "596.0",
          locator: "https://www.youtube.com/watch?v=AXgZ98Z9EFw",
          title: "Schladming- rodeln-Puzanje 2012.AVI",
          img: "http://i.ytimg.com/vi/AXgZ98Z9EFw/0.jpg",
          kasKeyword: {
            "http://dbpedia.org/resource/Sledding": "http://dbpedia.org/resource/Sledding",
            "http://dbpedia.org/resource/Schladming": "http://dbpedia.org/resource/Schladming",
            "http://dbpedia.org/resource/Hochwurzen": "http://dbpedia.org/resource/Hochwurzen"
          }
        }, {
          description: "Rodeln vom Feinsten auf der Hochwurzen ( Planai / Schladming). Musste Video leider auf 10min k??rzen. Fahrt dauerte 12min!",
          duration: "600.0",
          locator: "https://www.youtube.com/watch?v=zOzeGapneoY",
          title: "Rodeln Hochwurzen",
          img: "http://i.ytimg.com/vi/zOzeGapneoY/0.jpg",
          kasKeyword: {
            "http://dbpedia.org/resource/Sledding": "http://dbpedia.org/resource/Sledding",
            "http://dbpedia.org/resource/Hochwurzen": "http://dbpedia.org/resource/Hochwurzen"
          }
        }, {
          description: "Ein Ausschnitt aus der Helmkamera vom Rodeln im J??nner 2013. Kamerafahrt wurde nicht von mir gemacht...Ich bin der gefilmte =) Musik: Ski or die - Snowboard ...",
          duration: "55.0",
          locator: "https://www.youtube.com/watch?v=AWK9lkChVpA",
          title: "Rodelbahn Hochwurzen, Sturz (Helmkamera)",
          img: "http://i.ytimg.com/vi/AWK9lkChVpA/0.jpg",
          kasKeyword: {
            "http://dbpedia.org/resource/Sledding": "http://dbpedia.org/resource/Sledding"
          }
        }
      ];
      videoList = annotation.getLsiVideoResources();
      url = videoList[0].locator;
      url = url.split('v=')[1];
      url = url.split('&')[0];
      /*
       -- added 29.apr.2013
        UI handles the first 4 videoList items for now.
      */

      result = "<div id=\"videoWidgetExpanded\" style=\"border-top: 1px dotted lightgray; position: relative; width: 600px; height: auto;\">\n   <div id=\"videoArea\" style=\"left: 0px; top: 0px; width: 600px; position: relative; height: 450px; background-color: #f16f6f; float: left;\">\n   <iframe id=\"embededVideo\" width=\"600\" height=\"450\" style=\"margin: 0 auto; display: block;\" src=\"http://www.youtube.com/embed/" + url + "?autoplay=1\" frameborder=\"0\" allowfullscreen>\n   <p>Your browser does not support iframes.</p>\n   </iframe>\n   </div>";
      if (videoList.length === 2) {
        result += "<div id=\"videoList\" style=\"background-color: #0a0a0a; position: relative; float: left; width: 600px; height: 150px;\">\n<div id=\"video1\" class=\"videotab\" style=\"border: 1px solid black; position: relative; float: right; width: 298px; height: 148px; background-color: #9b9393; background-repeat: no-repeat; background-position: center center; background-size: cover; background-image: url('" + videoList[0].img + "');\">\n<div id=\"expandedwidget-videoicon1\" style=\"position: absolute; z-index: 900; width: 50px; height: 50px; bottom: 0px; left: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover;\" class=\"expandedwidget-videoicon\"></div>\n</div>\n<div id=\"video2\" class=\"videotab\" style=\"border: 1px solid black; position: relative; float: right; width: 298px; height: 148px; background-color: #9b9393; background-image: url('" + videoList[1].img + "'); background-repeat: no-repeat; background-position: center center; background-size: cover;\">\n<div id=\"expandedwidget-videoicon2\" style=\"width: 50px; height: 50px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover; position: absolute; z-index: 900; left: 0px;\" class=\"expandedwidget-videoicon\"></div>\n</div>\n<div id=\"video3\" class=\"videotab disabled\" style=\"display:none; border: 1px solid black; position: relative; float: right; width: 198px; height: 148px; background-color: #9b9393; background-repeat: no-repeat; background-position: center center; background-size: cover; background-image: url('" + videoList[2].img + "');\">\n<div id=\"expandedwidget-videoicon3\" style=\"width: 50px; height: 50px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover; position: absolute; z-index: 900; left: 0px;\" class=\"expandedwidget-videoicon\"></div>\n</div>\n<div id=\"video4\" class=\"videotab disabled\" style=\"display: none; border: 1px solid black; position: relative; float: right; width: 148px; height: 148px; background-color: #9b9393; background-repeat: no-repeat; background-position: center center; background-size: cover; background-image: url('" + videoList[3].img + "');\">\n<div id=\"expandedwidget-videoicon4\" style=\"width: 50px; height: 50px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover; position: absolute; z-index: 900; left: 0px;\" class=\"expandedwidget-videoicon\"></div>\n</div>\n</div>";
      }
      if (videoList.length === 3) {
        result += "<div id=\"videoList\" style=\"background-color: #0a0a0a; position: relative; float: left; width: 600px; height: 150px;\">\n    <div id=\"video1\" class=\"videotab\" style=\"border: 1px solid black; position: relative; float: right; width: 198px; height: 148px; background-color: #9b9393; background-repeat: no-repeat; background-position: center center; background-size: cover; background-image: url('" + videoList[0].img + "');\">\n        <div id=\"expandedwidget-videoicon1\" style=\"position: absolute; z-index: 900; width: 50px; height: 50px; bottom: 0px; left: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover;\" class=\"expandedwidget-videoicon\"></div>\n    </div>\n    <div id=\"video2\" class=\"videotab\" style=\"border: 1px solid black; position: relative; float: right; width: 198px; height: 148px; background-color: #9b9393; background-image: url('" + videoList[1].img + "'); background-repeat: no-repeat; background-position: center center; background-size: cover;\">\n        <div id=\"expandedwidget-videoicon2\" style=\"width: 50px; height: 50px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover; position: absolute; z-index: 900; left: 0px;\" class=\"expandedwidget-videoicon\"></div>\n    </div>\n    <div id=\"video3\" class=\"videotab\" style=\"border: 1px solid black; position: relative; float: right; width: 198px; height: 148px; background-color: #9b9393; background-repeat: no-repeat; background-position: center center; background-size: cover; background-image: url('" + videoList[2].img + "');\">\n        <div id=\"expandedwidget-videoicon3\" style=\"width: 50px; height: 50px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover; position: absolute; z-index: 900; left: 0px;\" class=\"expandedwidget-videoicon\"></div>\n    </div>\n    <div id=\"video4\" class=\"videotab disabled\" style=\"display: none; border: 1px solid black; position: relative; float: right; width: 148px; height: 148px; background-color: #9b9393; background-repeat: no-repeat; background-position: center center; background-size: cover; background-image: url('" + videoList[3].img + "');\">\n        <div id=\"expandedwidget-videoicon4\" style=\"width: 50px; height: 50px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover; position: absolute; z-index: 900; left: 0px;\" class=\"expandedwidget-videoicon\"></div>\n    </div>\n</div>";
      }
      if (videoList.length >= 4) {
        result += "<div id=\"videoList\" style=\"background-color: #0a0a0a; position: relative; float: left; width: 600px; height: 150px; \">\n<div id=\"video1\" class=\"videotab\" style=\"border: 1px solid black; position: relative; float: right; width: 147px; height: 148px; background-color: #9b9393; background-repeat: no-repeat; background-position: center center; background-size: cover; background-image: url('" + videoList[0].img + "');\">\n<div id=\"expandedwidget-videoicon1\" style=\"position: absolute; z-index: 900; width: 50px; height: 50px; bottom: 0px; left: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover;\" class=\"expandedwidget-videoicon\"></div>\n</div>\n<div id=\"video2\" class=\"videotab\" style=\"border: 1px solid black; position: relative; float: right; width: 147px; height: 148px; background-color: #9b9393; background-image: url('" + videoList[1].img + "'); background-repeat: no-repeat; background-position: center center; background-size: cover;\">\n<div id=\"expandedwidget-videoicon2\" style=\"width: 50px; height: 50px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover; position: absolute; z-index: 900; left: 0px;\" class=\"expandedwidget-videoicon\"></div>\n</div>\n<div id=\"video3\" class=\"videotab\" style=\"border: 1px solid black; position: relative; float: right; width: 147px; height: 148px; background-color: #9b9393; background-repeat: no-repeat; background-position: center center; background-size: cover; background-image: url('" + videoList[2].img + "');\">\n<div id=\"expandedwidget-videoicon3\" style=\"width: 50px; height: 50px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover; position: absolute; z-index: 900; left: 0px;\" class=\"expandedwidget-videoicon\"></div>\n</div>\n<div id=\"video4\" class=\"videotab\" style=\" border: 1px solid black; position: relative; float: right; width: 147px; height: 148px; background-color: #9b9393; background-repeat: no-repeat; background-position: center center; background-size: cover; background-image: url('" + videoList[3].img + "');\">\n<div id=\"expandedwidget-videoicon4\" style=\"width: 50px; height: 50px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover; position: absolute; z-index: 900; left: 0px;\" class=\"expandedwidget-videoicon\"></div>\n</div>\n</div>";
      }
      result += " </div>";
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
      this.videotabs = $('.videotab:not(.disabled)');
      this.videotabsiterator = 0;
      $("#video1").click(function() {
        $('.videotab.selected').removeClass('selected');
        url = videoList[0].locator;
        url = url.split('v=')[1];
        url = url.split('&')[0];
        $("#embededVideo").empty();
        $("#embededVideo").attr('src', "http://www.youtube.com/embed/" + url + "?autoplay=1");
        $(".expandedwidget-videoicon").css("background-image", "url('img/youtube.png')");
        $("#expandedwidget-videoicon1").css("background-image", "url('img/youtube_gr.png')");
        return $("#video1").addClass('selected');
      });
      $("#video2").click(function() {
        $('.videotab.selected').removeClass('selected');
        url = videoList[1].locator;
        url = url.split('=')[1];
        $("#embededVideo").empty();
        $("#embededVideo").attr('src', "http://www.youtube.com/embed/" + url + "?autoplay=1");
        $(".expandedwidget-videoicon").css("background-image", "url('img/youtube.png')");
        $("#expandedwidget-videoicon2").css("background-image", "url('img/youtube_gr.png')");
        return $("#video2").addClass('selected');
      });
      $("#video3").click(function() {
        $('.videotab.selected').removeClass('selected');
        url = videoList[2].locator;
        url = url.split('=')[1];
        $("#embededVideo").empty();
        $("#embededVideo").attr('src', "http://www.youtube.com/embed/" + url + "?autoplay=1");
        $(".expandedwidget-videoicon").css("background-image", "url('img/youtube.png')");
        $("#expandedwidget-videoicon3").css("background-image", "url('img/youtube_gr.png')");
        return $("#video3").addClass('selected');
      });
      $("#video4").click(function() {
        $('.videotab.selected').removeClass('selected');
        url = videoList[3].locator;
        url = url.split('=')[1];
        $("#embededVideo").empty();
        $("#embededVideo").attr('src', "http://www.youtube.com/embed/" + url + "?autoplay=1");
        $(".expandedwidget-videoicon").css("background-image", "url('img/youtube.png')");
        $("#expandedwidget-videoicon4").css("background-image", "url('img/youtube_gr.png')");
        return $("#video4").addClass('selected');
      });
      $("#video1").trigger("click");
      return console.log("videoList -", videoList);
    };

    return VideoPlugin;

  })(window.LimePlugin);

}).call(this);
