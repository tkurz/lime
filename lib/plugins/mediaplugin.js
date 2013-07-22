(function() {
  var _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.MediaPlugin = (function(_super) {
    __extends(MediaPlugin, _super);

    function MediaPlugin() {
      this._getStarringList = __bind(this._getStarringList, this);
      this._loadFullDbpediaEntity = __bind(this._loadFullDbpediaEntity, this);
      this.renderMedia = __bind(this.renderMedia, this);
      _ref = MediaPlugin.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    MediaPlugin.prototype.init = function() {
      var annotation, _i, _len, _ref1, _results;
      this.name = 'MediaPlugin';
      console.info("Initialize " + this.name);
      _ref1 = this.lime.annotations;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        annotation = _ref1[_i];
        if (annotation.resource.value.indexOf("dbpedia") > 0) {
          _results.push(this.handleAnnotation(annotation));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    MediaPlugin.prototype.defaults = {
      activityTypes: ['<http://dbpedia.org/page/Category:Sledding>', '<http://dbpedia.org/page/Category:Winter_sports>', '<http://dbpedia.org/page/Category:Racing_sports>', '<http://dbpedia.org/class/yago/LeisureActivities>', '<http://dbpedia.org/page/Category:Leisure_activities>', '<http://dbpedia.org/page/Category:Mountain_biking>', '<http://dbpedia.org/page/Category:Rock_climbing>', '<http://dbpedia.org/page/Category:Paragliding>', '<http://dbpedia.org/page/Category:Archery>', '<http://dbpedia.org/page/Category:Olympic_sports>', '<http://dbpedia.org/class/yago/ActorsFromCalifornia>', '<http://dbpedia.org/class/yago/WhitewaterSports>', '<http://dbpedia.org/page/Category:Whitewater_sports>', '<http://dbpedia.org/page/Category:Rafting>']
    };

    MediaPlugin.prototype.handleAnnotation = function(annotation) {
      var _this = this;
      return annotation.entityPromise.done(function() {
        var entity;
        if (!_this.vie) {
          _this.vie = annotation.vie;
          _this.vie.namespaces.add({
            umbel: 'http://umbel.org/umbel/rc/'
          });
          _this.vie.use(new _this.vie.DBPediaService);
        }
        if (annotation.resource.value.indexOf('dbpedia') !== -1) {
          entity = _this.vie.entities.get(annotation.resource.value);
          return _this._loadFullDbpediaEntity(entity, function(fullEntity) {
            return _this.processAnnotation(annotation, fullEntity);
          });
        }
      });
    };

    MediaPlugin.prototype.processAnnotation = function(annotation, fullEntity) {
      var widget, widgetType;
      if (_.intersection(fullEntity.attributes['@type'], this.options.activityTypes).length || _.intersection(fullEntity.attributes['dcterms:subject'], this.options.activityTypes).length) {
        console.info('Render Media widget');
        widgetType = 'MediaWidget';
        return widget = this._initWidget(annotation, fullEntity, widgetType, this.renderMedia, {
          thumbnail: "img/youtube.png",
          title: "" + (annotation.getLabel()),
          type: widgetType,
          sortBy: function() {
            return 10000 * annotation.start + annotation.end;
          }
        });
      }
    };

    MediaPlugin.prototype.renderMedia = function(annotation, fullEntity, container) {
      var modalContent, result, startTime, url, videoList,
        _this = this;
      modalContent = jQuery(container);
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
      url = url.split('=')[1];
      /*
       -- added 29.apr.2013
        UI handles the first 4 videoList items for now.
      */

      result = "<div id=\"videoWidgetExpanded\" style=\"border-top: 1px dotted lightgray; position: relative; width: 600px; height: auto;\">\n<div id=\"videoArea\" style=\"left: 0px; top: 0px; width: 600px; position: relative; height: 450px; background-color: #f16f6f; float: left;\">\n<iframe id=\"embededVideo\" width=\"600\" height=\"450\" style=\"margin: 0 auto; display: block;\" src=\"http://www.youtube.com/embed/" + url + "?autoplay=1\" frameborder=\"0\" allowfullscreen>\n<p>Your browser does not support iframes.</p>\n</iframe>\n</div>";
      if (videoList.length === 2) {
        result += "<div id=\"videoList\" style=\"background-color: #0a0a0a; position: relative; float: left; width: 600px; height: 150px;\">\n<div id=\"video1\" class=\"videotab\" style=\"border: 1px solid black; position: relative; float: right; width: 298px; height: 148px; background-color: #9b9393; background-repeat: no-repeat; background-position: center center; background-size: cover; background-image: url('" + videoList[0].img + "');\">\n<div id=\"expandedwidget-videoicon1\" style=\"position: absolute; z-index: 900; width: 50px; height: 50px; bottom: 0px; left: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover;\" class=\"expandedwidget-videoicon\"></div>\n</div>\n<div id=\"video2\" class=\"videotab\" style=\"border: 1px solid black; position: relative; float: right; width: 298px; height: 148px; background-color: #9b9393; background-image: url('" + videoList[1].img + "'); background-repeat: no-repeat; background-position: center center; background-size: cover;\">\n<div id=\"expandedwidget-videoicon2\" style=\"width: 50px; height: 50px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover; position: absolute; z-index: 900; left: 0px;\" class=\"expandedwidget-videoicon\"></div>\n</div>\n<div id=\"video3\" class=\"videotab disabled\" style=\"display:none; border: 1px solid black; position: relative; float: right; width: 198px; height: 148px; background-color: #9b9393; background-repeat: no-repeat; background-position: center center; background-size: cover; background-image: url('" + videoList[2].img + "');\">\n<div id=\"expandedwidget-videoicon3\" style=\"width: 50px; height: 50px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover; position: absolute; z-index: 900; left: 0px;\" class=\"expandedwidget-videoicon\"></div>\n</div>\n<div id=\"video4\" class=\"videotab disabled\" style=\"display: none; border: 1px solid black; position: relative; float: right; width: 148px; height: 148px; background-color: #9b9393; background-repeat: no-repeat; background-position: center center; background-size: cover; background-image: url('" + videoList[3].img + "');\">\n<div id=\"expandedwidget-videoicon4\" style=\"width: 50px; height: 50px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover; position: absolute; z-index: 900; left: 0px;\" class=\"expandedwidget-videoicon\"></div>\n</div>\n</div>";
      }
      if (videoList.length === 3) {
        result += "<div id=\"videoList\" style=\"background-color: #0a0a0a; position: relative; float: left; width: 600px; height: 150px;\">\n<div id=\"video1\" class=\"videotab\" style=\"border: 1px solid black; position: relative; float: right; width: 198px; height: 148px; background-color: #9b9393; background-repeat: no-repeat; background-position: center center; background-size: cover; background-image: url('" + videoList[0].img + "');\">\n<div id=\"expandedwidget-videoicon1\" style=\"position: absolute; z-index: 900; width: 50px; height: 50px; bottom: 0px; left: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover;\" class=\"expandedwidget-videoicon\"></div>\n</div>\n<div id=\"video2\" class=\"videotab\" style=\"border: 1px solid black; position: relative; float: right; width: 198px; height: 148px; background-color: #9b9393; background-image: url('" + videoList[1].img + "'); background-repeat: no-repeat; background-position: center center; background-size: cover;\">\n<div id=\"expandedwidget-videoicon2\" style=\"width: 50px; height: 50px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover; position: absolute; z-index: 900; left: 0px;\" class=\"expandedwidget-videoicon\"></div>\n</div>\n<div id=\"video3\" class=\"videotab\" style=\"border: 1px solid black; position: relative; float: right; width: 198px; height: 148px; background-color: #9b9393; background-repeat: no-repeat; background-position: center center; background-size: cover; background-image: url('" + videoList[2].img + "');\">\n<div id=\"expandedwidget-videoicon3\" style=\"width: 50px; height: 50px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover; position: absolute; z-index: 900; left: 0px;\" class=\"expandedwidget-videoicon\"></div>\n</div>\n<div id=\"video4\" class=\"videotab disabled\" style=\"display: none; border: 1px solid black; position: relative; float: right; width: 148px; height: 148px; background-color: #9b9393; background-repeat: no-repeat; background-position: center center; background-size: cover; background-image: url('" + videoList[3].img + "');\">\n<div id=\"expandedwidget-videoicon4\" style=\"width: 50px; height: 50px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-image: url('img/youtube.png'); background-size: cover; position: absolute; z-index: 900; left: 0px;\" class=\"expandedwidget-videoicon\"></div>\n</div>\n</div>";
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
      jQuery("#video1").click(function() {
        jQuery('.videotab.selected').removeClass('selected');
        url = videoList[0].locator;
        url = url.split('=')[1];
        jQuery("#embededVideo").empty();
        jQuery("#embededVideo").attr('src', "http://www.youtube.com/embed/" + url + "?autoplay=1");
        jQuery(".expandedwidget-videoicon").css("background-image", "url('img/youtube.png')");
        jQuery("#expandedwidget-videoicon1").css("background-image", "url('img/youtube_gr.png')");
        return jQuery("#video1").addClass('selected');
      });
      jQuery("#video2").click(function() {
        jQuery('.videotab.selected').removeClass('selected');
        url = videoList[1].locator;
        url = url.split('=')[1];
        jQuery("#embededVideo").empty();
        jQuery("#embededVideo").attr('src', "http://www.youtube.com/embed/" + url + "?autoplay=1");
        jQuery(".expandedwidget-videoicon").css("background-image", "url('img/youtube.png')");
        jQuery("#expandedwidget-videoicon2").css("background-image", "url('img/youtube_gr.png')");
        return jQuery("#video2").addClass('selected');
      });
      jQuery("#video3").click(function() {
        jQuery('.videotab.selected').removeClass('selected');
        url = videoList[2].locator;
        url = url.split('=')[1];
        jQuery("#embededVideo").empty();
        jQuery("#embededVideo").attr('src', "http://www.youtube.com/embed/" + url + "?autoplay=1");
        jQuery(".expandedwidget-videoicon").css("background-image", "url('img/youtube.png')");
        jQuery("#expandedwidget-videoicon3").css("background-image", "url('img/youtube_gr.png')");
        return jQuery("#video3").addClass('selected');
      });
      jQuery("#video4").click(function() {
        jQuery('.videotab.selected').removeClass('selected');
        url = videoList[3].locator;
        url = url.split('=')[1];
        jQuery("#embededVideo").empty();
        jQuery("#embededVideo").attr('src', "http://www.youtube.com/embed/" + url + "?autoplay=1");
        jQuery(".expandedwidget-videoicon").css("background-image", "url('img/youtube.png')");
        jQuery("#expandedwidget-videoicon4").css("background-image", "url('img/youtube_gr.png')");
        return jQuery("#video4").addClass('selected');
      });
      return jQuery("#video1").trigger("click");
    };

    MediaPlugin.prototype.getLSIVideos = function(annotation) {
      var _this = this;
      return this.lime.cmf.getLSIVideosForTerm(annotation.resource.value, function(err, res) {
        if (err) {
          return console.warn("Error getting LSI Video resources", err);
        } else {
          annotation.lsiVideoResources = _(res).map(function(resultset) {
            var entity;
            entity = {
              title: resultset.title.value,
              description: resultset.description.value,
              duration: Number(resultset.duration.value),
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

    MediaPlugin.prototype._loadFullDbpediaEntity = function(entity, callback) {
      var _this = this;
      return this.vie.load({
        entity: entity.getSubject()
      }).using('dbpedia').execute().success(function(fullEntity) {
        entity.set(fullEntity);
        return callback(fullEntity);
      });
    };

    MediaPlugin.prototype._getStarringList = function(dbpediaResourceURI, callback) {
      var query, result, url;
      result = [];
      query = "PREFIX foaf: <http://xmlns.com/foaf/0.1/>\nPREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\nPREFIX dcterms: <http://purl.org/dc/terms/>\nPREFIX dbpedia-owl: <http://dbpedia.org/ontology/>\nPREFIX dbprop: <http://dbpedia.org/property/>\nPREFIX dbcat: <http://dbpedia.org/resource/Category:>\nPREFIX skos: <http://www.w3.org/2004/02/skos/core#>\nSELECT DISTINCT ?show ?date WHERE {\n?show dbprop:starring <" + dbpediaResourceURI + "> .\n?show <http://dbpedia.org/ontology/releaseDate> ?date .\n} ORDER BY DESC(?date)\nLIMIT 5";
      url = "http://dbpedia.org/sparql?query=" + escape(query) + "&format=json";
      $.getJSON(url, callback);
      return result;
    };

    MediaPlugin.prototype._initWidget = function(annotation, fullEntity, widgetType, renderMethod, widgetOptions) {
      var widget,
        _this = this;
      widget = this.lime.allocateWidgetSpace(this, widgetOptions);
      this.getLSIVideos(annotation);
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
        return renderMethod(annotation, fullEntity, _this.getModalContainer());
      });
      annotation.widgets[widgetType] = widget;
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
            return annotation.widgets[widgetType].setActive();
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
        return annotation.widgets[widgetType].setInactive();
      });
      jQuery(widget).bind("leftarrow", function(e) {
        _this.videotabsiterator = _this.videotabs.length === _this.videotabsiterator + 1 ? 0 : _this.videotabsiterator + 1;
        if (_this.videotabsiterator === 0) {
          jQuery("#video1").trigger('click');
        }
        if (_this.videotabsiterator === 1) {
          jQuery("#video2").trigger('click');
        }
        if (_this.videotabsiterator === 2) {
          jQuery("#video3").trigger('click');
        }
        if (_this.videotabsiterator === 3) {
          return jQuery("#video4").trigger('click');
        }
      });
      return jQuery(widget).bind("rightarrow", function(e) {
        _this.videotabsiterator = _this.videotabsiterator === 0 ? _this.videotabs.length - 1 : _this.videotabsiterator - 1;
        jQuery('.videotab.selected').removeClass('selected');
        if (_this.videotabsiterator === 0) {
          jQuery("#video1").trigger('click');
        }
        if (_this.videotabsiterator === 1) {
          jQuery("#video2").trigger('click');
        }
        if (_this.videotabsiterator === 2) {
          jQuery("#video3").trigger('click');
        }
        if (_this.videotabsiterator === 3) {
          return jQuery("#video4").trigger('click');
        }
      });
    };

    return MediaPlugin;

  })(window.LimePlugin);

}).call(this);
