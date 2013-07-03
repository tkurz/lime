/* Lime Player 2.1.0 - Linked Media Player
by Szaby Gruenwald, Cristian Bara and the ConnectMe Project.
Available under the Apache License, Version 2.0
See http://connectme.sti2.org/ for more information.
*/
(function() {
  var URI;

  window.Annotation = (function() {
    function Annotation(hash) {
      var fragmentHash, startEnd, t, xywh, _ref, _ref1, _ref2, _ref3,
        _this = this;
      this.hash = hash;
      hash = this.hash;
      hash.fragment.value = hash.fragment.value.replace("?", "#");
      hash.fragment.type = 'uri';
      this.annotation = hash.annotation.value;
      this.start = 0;
      this.end = -1;
      this.state = 'inactive';
      this.widgets = {};
      jQuery(this).bind("mouseenter", function(e) {
        var widget, widgetname, _ref, _results;
        _ref = _this.widgets;
        _results = [];
        for (widgetname in _ref) {
          widget = _ref[widgetname];
          _results.push(jQuery(widget).addClass("hover"));
        }
        return _results;
      });
      jQuery(this).bind("mouseleave", function(e) {
        var widget, widgetname, _ref, _results;
        _ref = _this.widgets;
        _results = [];
        for (widgetname in _ref) {
          widget = _ref[widgetname];
          _results.push(jQuery(widget).removeClass("hover"));
        }
        return _results;
      });
      if (hash.fragment.type = 'uri') {
        this.fragment = new URI(hash.fragment.value);
        fragmentHash = this.fragment.hash;
        t = fragmentHash.match(/t=([0-9,]*)/);
        if (t) {
          t = t[1];
          startEnd = t.match(/([0-9]{1,})/g);
          if (startEnd) {
            this.start = Number(startEnd[0]);
            this.end = Number(startEnd[1]) || -1;
          }
        }
        xywh = fragmentHash.match(/xywh=([a-z0-9,:]*)/);
        if (xywh) {
          this.isPercent = xywh[1].indexOf('percent') !== -1;
          _ref = _(xywh[1].match(/([0-9]{1,})/g)).map(function(n) {
            return Number(n);
          }), this.x = _ref[0], this.y = _ref[1], this.w = _ref[2], this.h = _ref[3];
        }
      }
      this.isSpacial = this.x !== void 0 || ((((this.x === (_ref3 = this.y) && _ref3 === (_ref2 = this.w)) && _ref2 === (_ref1 = this.h)) && _ref1 === 0));
      this.resource = new URI(hash.resource.value);
      this.relation = new URI(hash.relation.value);
    }

    Annotation.prototype.toString = function() {
      return this.resource.value;
    };

    Annotation.prototype.isBookmark = function() {
      return this.hash.type.value === "http://www.w3.org/ns/openannotation/extensions/Bookmark";
    };

    return Annotation;

  })();

  URI = (function() {
    function URI(uri) {
      var hash;
      this.value = decodeURIComponent(uri);
      hash = uri.match(/^.*?#([a-zA-Z0-9,&=:]*)$/);
      if (hash) {
        this.hash = hash[1];
      } else {
        this.hash = '';
      }
      this.type = 'uri';
    }

    URI.prototype.toString = function() {
      return this.value;
    };

    return URI;

  })();

}).call(this);

(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.AnnotationOverlays = (function(_super) {
    __extends(AnnotationOverlays, _super);

    function AnnotationOverlays() {
      _ref = AnnotationOverlays.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    AnnotationOverlays.prototype.init = function() {
      this.initSpacialAnnotations();
      this.initTimeAnnotations();
      return this.initConceptOverlay();
    };

    AnnotationOverlays.prototype.initSpacialAnnotations = function() {
      var annotation, container, limeplayer, resize, _i, _len, _ref1,
        _this = this;
      console.info("Initialize SpacialAnnotationOverlays");
      this.spacialAnnotationOverlay = jQuery("<div class='spacial-annotation-overlays-wrapper'></div>");
      this.lime.player.videoOverlay.append(this.spacialAnnotationOverlay);
      container = jQuery(".spacial-annotation-overlays-wrapper", this.lime.player.el);
      limeplayer = this.lime;
      jQuery(this.lime.player).bind("timeupdate", function(e) {});
      _ref1 = this.lime.annotations;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        annotation = _ref1[_i];
        jQuery(annotation).bind("becomeActive", function(e) {
          var domEl;
          annotation = e.annotation;
          if (annotation.isSpacial && (annotation.w > 0) && (annotation.h > 0)) {
            container.prepend(_this.renderAnnotation(annotation));
            domEl = jQuery(".spatial_annotation:first", container);
            jQuery(domEl).data('annotation', annotation);
            domEl.mouseenter(function(e) {
              var mouseenterEvent;
              annotation = jQuery(e.target).data().annotation;
              mouseenterEvent = jQuery.Event("mouseenter");
              jQuery(annotation).trigger(mouseenterEvent, ['test']);
              jQuery(e.target).fadeOut(50);
              return jQuery(e.target).fadeIn(50);
            });
            domEl.mouseleave(function(e) {
              var mouseleaveEvent;
              mouseleaveEvent = jQuery.Event("mouseleave");
              return jQuery(annotation).trigger(mouseleaveEvent, ['test']);
            });
            domEl.click(function() {
              var i, widget, _results;
              limeplayer.player.pause();
              _results = [];
              for (i in annotation.widgets) {
                if (i !== "AnnotationOverlays") {
                  widget = annotation.widgets[i];
                  _results.push(widget.addClass("highlighted").delay(2000).queue(function(next) {
                    jQuery(this).removeClass("highlighted");
                    return next();
                  }));
                } else {
                  _results.push(void 0);
                }
              }
              return _results;
            });
            annotation.widgets.AnnotationOverlays = domEl;
            return domEl;
          }
        });
        jQuery(annotation).bind("becomeInactive", function(e) {
          annotation = e.annotation;
          if (annotation.isSpacial && (annotation.w > 0) && (annotation.h > 0)) {
            annotation.widgets.AnnotationOverlays.remove();
            return delete annotation.widgets.AnnotationOverlays;
          } else {
            return false;
          }
        });
      }
      resize = function() {
        var playerWidth, videoEl, videoWidth;
        videoEl = jQuery('video', _this.lime.element);
        playerWidth = videoEl.width();
        videoEl.css({
          width: 'auto'
        });
        videoWidth = videoEl.width();
        console.info('video width', playerWidth, videoWidth, _this.spacialAnnotationOverlay[0]);
        videoEl.css('width', '');
        return _this.spacialAnnotationOverlay.css({
          left: Math.floor((playerWidth - videoWidth) / 2),
          right: (playerWidth - videoWidth) / 2,
          position: 'absolute',
          height: '100%',
          "pointer-events": 'none'
        });
      };
      jQuery(window).resize(resize);
      return resize();
    };

    AnnotationOverlays.prototype.initTimeAnnotations = function() {
      var annotation, container, domEl, fullLength, leftPercent, _i, _len, _ref1, _results,
        _this = this;
      console.info("Initialize TimeAnnotationOverlays");
      container = this.lime.player.timelineOverlay;
      fullLength = this.lime.player.getLength();
      console.info('length', fullLength);
      _ref1 = this.lime.annotations;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        annotation = _ref1[_i];
        leftPercent = annotation.start / fullLength * 100;
        container.prepend("<div class='time-annotation' style='left:" + leftPercent + "%;'>&nbsp;</div>");
        domEl = jQuery('.time-annotation:first', container);
        jQuery(domEl).data('annotation', annotation);
        domEl.click(function(e) {
          annotation = jQuery(e.target).data().annotation;
          _this.lime.player.seek(annotation.start);
          return _this.lime.player.play();
        });
        domEl.bind('mouseenter', function(e) {
          var mouseenterEvent;
          annotation = jQuery(e.target).data().annotation;
          mouseenterEvent = jQuery.Event("mouseenter");
          jQuery(annotation).trigger(mouseenterEvent, ['test']);
          _this.fillConceptOverlay(_this.renderConceptOverlay(annotation));
          return _this.showConceptOverlay();
        });
        _results.push(domEl.mouseleave(function(e) {
          var mouseleaveEvent;
          annotation = jQuery(e.target).data().annotation;
          mouseleaveEvent = jQuery.Event("mouseleave");
          jQuery(annotation).trigger(mouseleaveEvent, ['test']);
          return _this.hideConceptOverlay();
        }));
      }
      return _results;
    };

    AnnotationOverlays.prototype.initConceptOverlay = function() {
      var _this = this;
      this.conceptOverlayEl = jQuery("<div class='concept-overlay concept-list-overlay'></div>");
      this.lime.player.videoOverlay.append(this.conceptOverlayEl);
      this.conceptOverlayEl.hide();
      jQuery(this.conceptOverlayEl).mouseenter(function() {
        return _this.showConceptOverlay();
      });
      return jQuery(this.conceptOverlayEl).mouseleave(function() {
        return _this.hideConceptOverlay();
      });
    };

    AnnotationOverlays.prototype.showConceptOverlay = function() {
      if (this.hideTimeoutHandle) {
        clearTimeout(this.hideTimeoutHandle);
        this.hideTimeoutHandle = void 0;
      }
      return this.conceptOverlayEl.show();
    };

    AnnotationOverlays.prototype.hideConceptOverlay = function() {
      var _this = this;
      return this.hideTimeoutHandle = setTimeout(function() {
        _this.conceptOverlayEl.hide();
        return _this.hideTimeoutHandle;
      }, 2000);
    };

    AnnotationOverlays.prototype.fillConceptOverlay = function(content) {
      return jQuery(this.conceptOverlayEl).html("").append(content);
    };

    AnnotationOverlays.prototype.renderConceptOverlay = function(annotation) {
      var activeAnnotations, ann, currentSrc, currentTime, depiction, getFilename, res, _i, _len,
        _this = this;
      getFilename = function(uri) {
        var regexp, _ref1;
        regexp = new RegExp(/\/([^\/#]*)(#.*)?$/);
        return (_ref1 = uri.match(regexp)) != null ? _ref1[1] : void 0;
      };
      currentTime = annotation.start;
      currentSrc = this.lime.player.currentSource();
      activeAnnotations = _.filter(this.lime.annotations, function(ann) {
        return ann.start <= currentTime && ann.end > currentTime && currentSrc.indexOf(getFilename(ann.fragment.value)) !== -1;
      });
      activeAnnotations = _(activeAnnotations).sortBy(function(ann) {
        return [0 - ann.start, ann.hash.relation.value, ann.hash.fragment.value];
      });
      activeAnnotations = _.uniq(activeAnnotations, function(ann) {
        return ann.hash.annotation.value;
      });
      res = "";
      for (_i = 0, _len = activeAnnotations.length; _i < _len; _i++) {
        ann = activeAnnotations[_i];
        depiction = typeof ann.getDepiction === "function" ? ann.getDepiction({
          without: 'thumb'
        }) : void 0;
        res += "<tr><td class='icon'>";
        if (depiction) {
          res += "<img src='" + depiction + "' style='height:20px;' />";
        }
        res += "</td>\n<td class='timeframe'>\n  " + (this.timeformat(ann.start)) + " - " + (this.timeformat(ann.end)) + "\n</td>\n<td class='label'>";
        if (ann.getPage) {
          res += "<a href='" + (ann.getPage()) + "' target='_blank' title='" + ann.hash.fragment.value + "'>" + (ann.getLabel()) + "</a>";
        } else {
          res += "<span>" + ((typeof ann.getLabel === "function" ? ann.getLabel() : void 0) || ann) + "</span>";
        }
        res += "</td></tr>";
      }
      res = jQuery("<table class=\"navlist\">" + res + "</table>");
      jQuery('li:first', res).addClass('active');
      jQuery('a[target=_blank]', res).click(function(e) {
        return _this.lime.player.pause();
      });
      return res;
    };

    AnnotationOverlays.prototype.timeformat = function(s) {
      var h, m, res, x;
      x = s;
      s = x % 60;
      x = (x - s) / 60;
      m = x % 60;
      h = (x - m) / 60;
      res = "";
      if ((0 < h && h < 10)) {
        h = "0" + h;
      }
      if (m < 10) {
        m = "0" + m;
      }
      if (s < 10) {
        s = "0" + s;
      }
      if (h) {
        res += "" + h + ":";
      }
      return res += "" + m + ":" + s;
    };

    AnnotationOverlays.prototype.renderAnnotation = function(annotation) {
      var label, props, unit,
        _this = this;
      if (annotation.ldLoaded) {
        props = annotation.entity[annotation.resource.value];
        label = _(props["http://www.w3.org/2000/01/rdf-schema#label"]).detect(function(labelObj) {
          return labelObj.lang === _this.lime.options.preferredLanguage;
        }).value;
      }
      if (label === undefined) {
        label = "";
      }
      unit = annotation.isPercent ? "%" : "px";
      return "<div class='spatial_annotation' style='position: absolute; width: " + annotation.w + unit + "; height: " + annotation.h + unit + "; left: " + annotation.x + unit + "; top: " + annotation.y + unit + "'>" + label + "</div>";
    };

    return AnnotationOverlays;

  })(window.LimePlugin);

}).call(this);

(function() {
  window.CMF = (function() {
    function CMF(url) {
      this.url = url;
      this.url = this.url.replace(/\/$/, '') + '/';
    }

    CMF.prototype.getVideos = function(resCB) {
      var query, res;
      res = [];
      query = this._videosQuery;
      return this._runSPARQL(query, resCB);
    };

    CMF.prototype._videosQuery = "PREFIX mao: <http://www.w3.org/ns/ma-ont#>\nPREFIX oac: <http://www.openannotation.org/ns/>\nPREFIX yoovis: <http://yoovis.at/ontology/08/2012/>\nSELECT DISTINCT ?instance ?title ?thumbnail\nWHERE {\n  ?instance a mao:MediaResource.\n  OPTIONAL {?instance mao:title ?title.}\n  ?instance yoovis:hasThumbnail ?thumbnail.\n}\nORDER BY ?instance";

    CMF.prototype.getAnnotatedVideos = function(resCB) {
      var query;
      query = this._annotatedVideosQuery;
      return this._runSPARQL(query, resCB);
    };

    CMF.prototype._annotatedVideosQuery = "PREFIX mao: <http://www.w3.org/ns/ma-ont#>\nPREFIX oac: <http://www.openannotation.org/ns/>\nPREFIX yoovis: <http://yoovis.at/ontology/08/2012/>\nSELECT DISTINCT ?instance ?title ?thumbnail\nWHERE {\n  ?instance a mao:MediaResource.\n  OPTIONAL {?instance mao:title ?title.}\n  ?instance mao:hasFragment ?fragment.\n  OPTIONAL {?instance yoovis:hasThumbnail ?thumbnail.}\n  ?annotation a oac:Annotation.\n  ?annotation oac:hasTarget ?fragment.\n  ?annotation oac:hasBody ?body\n}\nORDER BY ASC(?title)";

    CMF.prototype.getAnnotationsForVideoOrLocator = function(url, resCB) {
      var cb, res, waitfor;
      res = [];
      waitfor = 2;
      cb = function(err, annotations) {
        if (err) {
          console.error(err, annotations);
          resCB(err, annotations);
          return;
        }
        res = res.concat(annotations);
        waitfor--;
        if (waitfor === 0) {
          return resCB(null, res);
        }
      };
      this.getAnnotationsForLocator(url, cb);
      return this.getAnnotationsForVideo(url, cb);
    };

    CMF.prototype.getLocatorsForVideoOrLocator = function(url, resCB) {
      var cb, res, waitfor;
      res = [];
      waitfor = 2;
      cb = function(err, annotations) {
        if (err) {
          console.error(err, annotations);
          resCB(err, annotations);
          return;
        }
        res = res.concat(annotations);
        waitfor--;
        if (waitfor === 0) {
          return resCB(null, res);
        }
      };
      this.getVideoLocators(url, cb);
      return this.getAllVideoLocators(url, cb);
    };

    CMF.prototype.getAnnotationsForVideo = function(resource, resCB) {
      var query, res;
      res = [];
      query = this._annotationsForVideo(resource);
      return this._runSPARQL(query, resCB);
    };

    CMF.prototype._annotationsForVideo = function(resource) {
      return "PREFIX oac: <http://www.openannotation.org/ns/>\nPREFIX mao: <http://www.w3.org/ns/ma-ont#>\nPREFIX cma: <http://connectme.at/ontology#>\nSELECT DISTINCT ?annotation ?fragment ?resource ?relation ?type ?prefLabel\nWHERE {\n  <" + resource + ">  mao:hasFragment ?f.\n  ?f mao:locator ?fragment.\n  ?annotation oac:hasTarget ?f.\n  ?annotation a ?type.\n  OPTIONAL{?annotation cma:preferredLabel ?prefLabel.}\n  ?annotation oac:hasBody ?resource.\n  ?f ?relation ?resource.\n}";
    };

    CMF.prototype.getAnnotationsForLocator = function(locator, resCB) {
      var query, res;
      res = [];
      query = this._annotationsForLocator(locator);
      return this._runSPARQL(query, resCB);
    };

    CMF.prototype._annotationsForLocator = function(locator) {
      return "PREFIX oac: <http://www.openannotation.org/ns/>\nPREFIX mao: <http://www.w3.org/ns/ma-ont#>\nPREFIX cma: <http://connectme.at/ontology#>\nSELECT DISTINCT ?annotation ?fragment ?resource ?relation ?type ?prefLabel\nWHERE {\n  ?videoresource mao:locator <" + locator + ">.\n  ?videoresource mao:hasFragment ?f.\n  ?f mao:locator ?fragment.\n  ?annotation oac:hasTarget ?f.\n  ?annotation oac:hasBody ?resource.\n  ?annotation a ?type.\n  OPTIONAL{?annotation cma:preferredLabel ?prefLabel.}\n  ?f ?relation ?resource.\n}";
    };

    CMF.prototype.getVideoLocators = function(resource, resCB) {
      var query, res;
      res = [];
      query = this._getVideoLocators(resource);
      return this._runSPARQL(query, function(err, res) {
        var locators, typeRegexp;
        if (!err) {
          typeRegexp = new RegExp(/\.(.{3,4})$/);
          locators = _(res).map(function(l) {
            var type, _ref;
            if (l.source.value.indexOf("<crid") < 0) {
              type = ((_ref = l.type) != null ? _ref.value : void 0) || ("video/" + (l.source.value.match(typeRegexp)[1]));
              return {
                source: l.source.value,
                type: type
              };
            }
          });
        }
        return resCB(err, locators);
      });
    };

    CMF.prototype._getVideoLocators = function(resource) {
      return "PREFIX oac: <http://www.openannotation.org/ns/>\nPREFIX mao: <http://www.w3.org/ns/ma-ont#>\nSELECT DISTINCT ?source ?type\nWHERE {\n  <" + resource + ">  mao:locator ?source.\n  OPTIONAL {?source mao:hasFormat ?type}\n  FILTER regex(str(?source), \"(http|https)\")\n}\nORDER BY ?source";
    };

    CMF.prototype.getAllVideoLocators = function(locator, resCB) {
      var query, res;
      res = [];
      query = this._getAllVideoLocators(locator);
      return this._runSPARQL(query, function(err, res) {
        var locators, typeRegexp;
        if (!err) {
          typeRegexp = new RegExp(/\.(.{3,4})$/);
          locators = _(res).map(function(l) {
            var type, _ref;
            if (l.source.value.indexOf("crid") < 0) {
              type = ((_ref = l.type) != null ? _ref.value : void 0) || ("video/" + (l.source.value.match(typeRegexp)[1]));
              return {
                source: l.source.value,
                type: type
              };
            }
          });
        }
        return resCB(err, locators);
      });
    };

    CMF.prototype._getAllVideoLocators = function(locator) {
      return "PREFIX oac: <http://www.openannotation.org/ns/>\nPREFIX mao: <http://www.w3.org/ns/ma-ont#>\nSELECT DISTINCT ?source ?type\nWHERE {\n  ?resource mao:locator <" + locator + ">.\n  ?resource  mao:locator ?source.\n  OPTIONAL {?source mao:hasFormat ?type}\n  FILTER regex(str(?source), \"(http|https)\")\n}\nORDER BY ?source";
    };

    CMF.prototype.getLSIVideosForTerm = function(keywordUri, resCB) {
      var query, res;
      res = [];
      query = this._getLSIVideosForTerm(keywordUri);
      return this._runSPARQL(query, function(err, res) {
        return resCB(err, res);
      });
    };

    CMF.prototype._getLSIVideosForTerm = function(keywordUri) {
      return "PREFIX mao: <http://www.w3.org/ns/ma-ont#>\nPREFIX foaf: <http://xmlns.com/foaf/0.1/>\nSELECT DISTINCT ?video ?duration ?description ?locator ?title ?img\nWHERE {\n  ?video mao:hasKeyword <" + keywordUri + "> .\n  ?video a <http://www.w3.org/ns/ma-ont#VideoTrack> .\n  OPTIONAL {?video mao:description ?description}.\n  ?video mao:locator ?locator .\n  OPTIONAL {?video mao:duration ?duration}.\n  ?video mao:title ?title .\n  OPTIONAL {?video foaf:img ?img}.\n}\nORDER BY ?video ";
    };

    /*
    _getLSIVideosForTerm: (keywordUri) -> """
      PREFIX mao: <http://www.w3.org/ns/ma-ont#>
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      SELECT DISTINCT ?video ?duration ?description ?locator ?title ?img
      WHERE {
        ?s <http://connectme.at/ontology#hasRelatedVideo> ?video .
        ?s <http://www.w3.org/ns/ma-ont#hasKeyword> <#{keywordUri}> .
        OPTIONAL {?video mao:description ?description}.
        ?video mao:locator ?locator .
        ?video mao:duration ?duration.
        ?video mao:title ?title .
        OPTIONAL {?video foaf:img ?img}.
      }
      ORDER BY ?video  """
    */


    CMF.prototype.getLSIImagesForTerm = function(keywordUri, resCB) {
      var query, res;
      res = [];
      query = this._getLSIImagesForTerm(keywordUri);
      return this._runSPARQL(query, function(err, res) {
        return resCB(err, res);
      });
    };

    CMF.prototype._getLSIImagesForTerm = function(keywordUri) {
      return "PREFIX mao: <http://www.w3.org/ns/ma-ont#>\nSELECT DISTINCT ?image\nWHERE {\n  ?image a <http://www.w3.org/ns/ma-ont#Image> .\n  ?image mao:hasKeyword <" + keywordUri + "> .\n}\nORDER BY ?image ";
    };

    CMF.prototype.getGRDataForTerm = function(keywordUri, resCB) {
      var query, res;
      res = [];
      query = this._getGRDataForTerm(keywordUri);
      return this._runSPARQL(query, function(err, res) {
        return resCB(err, res);
      });
    };

    CMF.prototype._getGRDataForTerm = function(keywordUri) {
      return "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\nPREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\nPREFIX gr: <http://purl.org/goodrelations/v1#>\nPREFIX vCard: <http://www.w3.org/2001/vcard-rdf/3.0#>\nPREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>\nSELECT DISTINCT ?name ?street ?pcode ?city ?country ?telephone ?email ?description ?geoLat ?geoLong ?pricevalue ?pricecurrency ?product\nWHERE {\n<" + keywordUri + "> gr:legalName ?name.\n<" + keywordUri + "> vCard:ADR ?address.\n?address vCard:Street ?street.\n?address vCard:Pcode ?pcode.\n?address vCard:City ?city.\n?address vCard:Country ?country.\n?address vCard:TEL ?tel.\n<" + keywordUri + "> geo:lat ?geoLat.\n<" + keywordUri + "> geo:long ?geoLong.\n?tel rdf:value ?telephone.\n?address vCard:EMAIL ?em.\n?em rdf:value ?email.\n<" + keywordUri + "> gr:offers ?offer.\n?offer rdfs:comment ?description.\n?offer gr:hasPriceSpecification ?price.\n?price gr:hasCurrencyValue ?pricevalue.\n?price gr:hasCurrency ?pricecurrency.\n?price rdfs:comment ?product.\n}";
    };

    CMF.prototype._runSPARQL = function(query, resCB) {
      var uri, xhr,
        _this = this;
      uri = "" + this.url + "sparql/select?query=" + (encodeURIComponent(query)) + "&output=json";
      xhr = jQuery.getJSON(uri, function(data) {
        var list, res;
        res = [];
        list = data.results.bindings;
        if (list.length !== _(list).uniq().length) {
          console.warn('CMF DISTINCT is being ignored!', list, query);
          list = _(list).uniq();
        }
        return resCB(null, list);
      });
      xhr.error(resCB);
      return xhr;
    };

    CMF.prototype.test = function() {
      var _this = this;
      this.getVideos(function(err, res) {
        if (err) {
          console.error("getVideos error", err, res);
          return;
        }
        return console.info("getVideos result", res);
      });
      return this.getAnnotatedVideos(function(err, res) {
        var firstVideo;
        if (err) {
          console.error("getAnnotatedVideos error", err, res);
          return;
        }
        console.info("getAnnotatedVideos result", res);
        firstVideo = res[0].instance.value;
        console.info("Getting locators for", firstVideo);
        _this.getVideoLocators(firstVideo, function(err, res) {
          var videolocator;
          if (err) {
            console.error("getVideoLocators error", err, res);
            return;
          }
          console.info("getVideoLocators result", res);
          videolocator = res[0].source;
          _this.getAllVideoLocators(videolocator, function(err, res) {
            if (err) {
              console.error("getAllVideoLocators error", err, res);
              return;
            }
            return console.info("getAllVideoLocators result", res);
          });
          _this.getAnnotationsForLocator(videolocator, function(err, annotations) {
            if (err) {
              console.error("getAnnotationsForLocator error", err, annotations);
              return;
            }
            return console.info("getAnnotationsForLocator result", annotations);
          });
          _this.getLocatorsForVideoOrLocator(firstVideo, function(err, res) {
            if (err) {
              console.error("getLocatorsForVideoOrLocator error", err, res);
              return;
            }
            return console.info("getLocatorsForVideoOrLocator result", firstVideo, res);
          });
          _this.getLocatorsForVideoOrLocator(videolocator, function(err, res) {
            if (err) {
              console.error("getLocatorsForVideoOrLocator error", err, res);
              return;
            }
            return console.info("getLocatorsForVideoOrLocator result", videolocator, res);
          });
          _this.getAnnotationsForVideoOrLocator(firstVideo, function(err, annotations) {
            if (err) {
              console.error("getAnnotationsForVideoOrLocator error", err, annotations);
              return;
            }
            return console.info("getAnnotationsForVideoOrLocator result", firstVideo, annotations);
          });
          return _this.getAnnotationsForVideoOrLocator(videolocator, function(err, annotations) {
            if (err) {
              console.error("getAnnotationsForVideoOrLocator error", err, annotations);
              return;
            }
            return console.info("getAnnotationsForVideoOrLocator result", videolocator, annotations);
          });
        });
        return _this.getAnnotationsForVideo(firstVideo, function(err, annotations) {
          if (err) {
            console.error("getAnnotationsForVideo error", err, annotations);
            return;
          }
          return console.info("getAnnotationsForVideo result", annotations);
        });
      });
    };

    return CMF;

  })();

}).call(this);

(function() {
  (function($) {
    var $scrollTo, both;
    both = function(val) {
      if (typeof val === "object") {
        return val;
      } else {
        return {
          top: val,
          left: val
        };
      }
    };
    $scrollTo = $.scrollTo = function(target, duration, settings) {
      return $(window).scrollTo(target, duration, settings);
    };
    $scrollTo.defaults = {
      axis: "xy",
      duration: (parseFloat($.fn.jquery) >= 1.3 ? 0 : 1),
      limit: true
    };
    $scrollTo.window = function(scope) {
      return $(window)._scrollable();
    };
    $.fn._scrollable = function() {
      return this.map(function() {
        var doc, elem, isWin;
        elem = this;
        isWin = !elem.nodeName || $.inArray(elem.nodeName.toLowerCase(), ["iframe", "#document", "html", "body"]) !== -1;
        if (!isWin) {
          return elem;
        }
        doc = (elem.contentWindow || elem).document || elem.ownerDocument || elem;
        if (/webkit/i.test(navigator.userAgent) || doc.compatMode === "BackCompat") {
          return doc.body;
        } else {
          return doc.documentElement;
        }
      });
    };
    $.fn.scrollTo = function(target, duration, settings) {
      if (typeof duration === "object") {
        settings = duration;
        duration = 0;
      }
      if (typeof settings === "function") {
        settings = {
          onAfter: settings
        };
      }
      if (target === "max") {
        target = 9e9;
      }
      settings = $.extend({}, $scrollTo.defaults, settings);
      duration = duration || settings.duration;
      settings.queue = settings.queue && settings.axis.length > 1;
      if (settings.queue) {
        duration /= 2;
      }
      settings.offset = both(settings.offset);
      settings.over = both(settings.over);
      return this._scrollable().each(function() {
        var $elem, animate, attr, elem, targ, toff, win;
        animate = function(callback) {
          return $elem.animate(attr, duration, settings.easing, callback && function() {
            return callback.call(this, target, settings);
          });
        };
        if (target == null) {
          return;
        }
        elem = this;
        $elem = $(elem);
        targ = target;
        toff = void 0;
        attr = {};
        win = $elem.is("html,body");
        switch (typeof targ) {
          case "number":
          case "string":
            if (/^([+-]=?)?\d+(\.\d+)?(px|%)?$/.test(targ)) {
              targ = both(targ);
              break;
            }
            targ = $(targ, this);
            if (!targ.length) {
              return;
            }
            break;
          case "object":
            if (targ.is || targ.style) {
              toff = (targ = $(targ)).offset();
            }
        }
        $.each(settings.axis.split(""), function(i, axis) {
          var Pos, key, max, old, pos, val;
          Pos = (axis === "x" ? "Left" : "Top");
          pos = Pos.toLowerCase();
          key = "scroll" + Pos;
          old = elem[key];
          max = $scrollTo.max(elem, axis);
          if (toff) {
            attr[key] = toff[pos] + (win ? 0 : old - $elem.offset()[pos]);
            if (settings.margin) {
              attr[key] -= parseInt(targ.css("margin" + Pos)) || 0;
              attr[key] -= parseInt(targ.css("border" + Pos + "Width")) || 0;
            }
            attr[key] += settings.offset[pos] || 0;
            if (settings.over[pos]) {
              attr[key] += targ[(axis === "x" ? "width" : "height")]() * settings.over[pos];
            }
          } else {
            val = targ[pos];
            attr[key] = (val.slice && val.slice(-1) === "%" ? parseFloat(val) / 100 * max : val);
          }
          if (settings.limit && /^\d+$/.test(attr[key])) {
            attr[key] = (attr[key] <= 0 ? 0 : Math.min(attr[key], max));
          }
          if (!i && settings.queue) {
            if (old !== attr[key]) {
              animate(settings.onAfterFirst);
            }
            return delete attr[key];
          }
        });
        return animate(settings.onAfter);
      }).end();
    };
    return $scrollTo.max = function(elem, axis) {
      var Dim, body, html, scroll, size;
      Dim = (axis === "x" ? "Width" : "Height");
      scroll = "scroll" + Dim;
      if (!$(elem).is("html,body")) {
        return elem[scroll] - $(elem)[Dim.toLowerCase()]();
      }
      size = "client" + Dim;
      html = elem.ownerDocument.documentElement;
      body = elem.ownerDocument.body;
      return Math.max(html[scroll], body[scroll]) - Math.min(html[size], body[size]);
    };
  })(jQuery);

}).call(this);

(function() {
  window.LIMEPlayer = (function() {
    /* maybe later...
    SCROLLING_LIST: 'scrolling-list'
    ACTIVE_ONLY: 'active-only'
    DELAYER_HIDE: 'delayed-hide'
    */

    function LIMEPlayer(opts) {
      var cmf, options,
        _this = this;
      cmf = new CMF("http://connectme.salzburgresearch.at/CMF");
      options = {
        containerDiv: "mainwrapper",
        videoPlayerSize: {
          "width": 640,
          "height": 360
        },
        preferredLanguage: "en",
        annotations: [],
        annotFrameworkURL: "http://connectme.salzburgresearch.at/CMF/",
        plugins: {
          TestPlugin: {}
        },
        activeWidgetTypes: null,
        fullscreen: false,
        widgetVisibility: 'scrolling-list',
        hidingDelay: 2000,
        widgetContainers: [
          {
            element: jQuery('#widget-container-1'),
            options: null
          }
        ],
        annotationsVisible: true,
        debug: false,
        local: false,
        builtinPlugins: {
          AnnotationOverlays: {},
          LDPlugin: {}
        },
        widget: {}
      };
      this.options = jQuery.extend(options, opts);
      if (typeof this.options.containerDiv === "string") {
        this.el = jQuery("#" + this.options.containerDiv);
      } else {
        this.el = jQuery(this.options.containerDiv);
      }
      if (this.el.length !== 1) {
        console.error("LIMEPlayer options.containerDiv has to be a DOM element or the ID of a DOM element.", this.options.containerDiv);
        return;
      }
      this.widgets = [];
      this.widgetContainers = this.options.widgetContainers;
      this.cmf = new CMF(this.options.annotFrameworkURL);
      this._initVideoPlayer(function() {
        return _this._loadAnnotations(function() {
          return _this._initPlugins(function() {
            return _this._startScheduler();
          });
        });
      });
    }

    LIMEPlayer.prototype._startScheduler = function() {
      /* handle becomeActive and becomeInactive events*/

      var _this = this;
      return jQuery(this).bind('timeupdate', function(e) {
        var annotation, currentSrc, currentTime, _i, _len, _ref, _results;
        currentTime = e.currentTime || _this.player.currentTime();
        currentSrc = _this.player.currentSource();
        _ref = _this.annotations;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          annotation = _ref[_i];
          if (currentSrc.indexOf(_this._getFilename(annotation.fragment.value)) !== -1) {
            if (annotation.state === 'inactive' && annotation.start <= currentTime && annotation.end + 1 > currentTime) {
              annotation.state = 'active';
              jQuery(annotation).trigger(jQuery.Event("becomeActive", {
                annotation: annotation
              }));
            }
            if (annotation.state === 'active' && (annotation.start > currentTime || annotation.end + 1 < currentTime)) {
              annotation.state = 'inactive';
              _results.push(jQuery(annotation).trigger(jQuery.Event("becomeInactive", {
                annotation: annotation
              })));
            } else {
              _results.push(void 0);
            }
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
    };

    LIMEPlayer.prototype._initVideoPlayer = function(cb) {
      var displaysrc, i, locator, _i, _len, _ref,
        _this = this;
      displaysrc = '';
      _ref = this.options.video;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        locator = _ref[i];
        displaysrc = displaysrc + ("<source src='" + locator.source + "' type='" + locator.type + "' />");
      }
      this.el.append("<div class='videowrapper' id='videowrapper'>\n  <video id='video_player' class='video-js vjs-default-skin' controls preload='metadata' width='" + this.options.videoPlayerSize.width + "' height='" + this.options.videoPlayerSize.height + "' poster='img/connectme-video-poster.jpg'>\n    " + displaysrc + "\n  </video>\n</div>");
      this.videoEl = jQuery('video', this.el);
      console.info("Initializing the player");
      return window.LIMEPlayer.VideoPlayerInit(this.videoEl[0], {}, function(err, playerInstance) {
        if (err) {
          console.info(err);
          return;
        }
        console.info("Player initialized");
        _this.player = playerInstance;
        _this._initEventListeners();
        _this.fullscreenWidgetContainer = jQuery("<div class='fullscreen-annotation-wrapper'></div>");
        _this.player.videoOverlay.append(_this.fullscreenWidgetContainer);
        return cb();
      });
    };

    LIMEPlayer.prototype._initEventListeners = function() {
      var _this = this;
      jQuery(this.player).bind('timeupdate', function(playerEvent) {
        var e;
        e = jQuery.Event("timeupdate", {
          currentTime: _this.player.currentTime()
        });
        return jQuery(_this).trigger(e);
      });
      jQuery(this.player).bind('fullscreenchange', function(e) {
        return _this._moveWidgets(e.isFullScreen);
      });
      return this.initKeyEventsHandlers();
    };

    LIMEPlayer.prototype.filterVisibleWidgets = function(typeArray) {
      var plugin, widget, _i, _len, _ref, _results;
      this.options.activeWidgetTypes = typeArray;
      _ref = this.plugins;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        plugin = _ref[_i];
        _results.push((function() {
          var _j, _len1, _ref1, _results1;
          _ref1 = plugin.widgets;
          _results1 = [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            widget = _ref1[_j];
            if (widget.isActive) {
              _results1.push(this.options.widgetVisibility());
            } else {
              _results1.push(void 0);
            }
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    LIMEPlayer.prototype.getHiddenWidgetTypes = function() {
      return JSON.parse(localStorage.getItem('hiddenWidgetTypes')) || [];
    };

    LIMEPlayer.prototype.updateDeactivatedWidgetStates = function(activeWidgetTypes) {
      var widget, widgetType, _i, _len, _ref, _results;
      _ref = this.widgets;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        widget = _ref[_i];
        widgetType = widget.options.type;
        if (activeWidgetTypes.indexOf(widgetType) !== -1) {
          _results.push(widget.element.removeClass('deactivated'));
        } else {
          _results.push(widget.element.addClass('deactivated'));
        }
      }
      return _results;
    };

    LIMEPlayer.prototype.updateWidgetsList = _.throttle(function() {
      var container, el, first, widget, widgetElement, widgetsEls, widgetsSorted, _i, _j, _len, _len1, _ref, _results,
        _this = this;
      widgetsSorted = _.sortBy(this.widgets, function(widget) {
        return widget.options.sortBy();
      });
      _ref = this.widgetContainers;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        container = _ref[_i];
        if (!jQuery(container).data().sorted) {
          widgetsEls = jQuery(container).find('.lime-widget');
          widgetsSorted = _.sortBy(this.widgets, function(widgetEl) {
            var _ref1;
            return (_ref1 = jQuery(widgetEl).data().widget) != null ? _ref1.options.sortBy() : void 0;
          });
          for (_j = 0, _len1 = widgetsSorted.length; _j < _len1; _j++) {
            el = widgetsSorted[_j];
            jQuery(container).prepend(el);
          }
          jQuery(container).data('sorted', true);
        }
        if (this.options.widgetVisibility === 'scrolling-list') {
          first = _.detect(jQuery(container.element).children(), function(widgetElement) {
            var widget;
            widget = jQuery(widgetElement).data().widget;
            return widget != null ? widget.isActive() : void 0;
          });
          if (first) {
            jQuery(first).parent().scrollTo(first);
            jQuery('.nav-selected').removeClass('nav-selected');
            _results.push(jQuery(first).addClass('nav-selected'));
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push((function() {
            var _k, _len2, _ref1, _results1;
            _ref1 = jQuery(container.element).children();
            _results1 = [];
            for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
              widgetElement = _ref1[_k];
              widget = jQuery(widgetElement).data().widget;
              if (!widget.isActive()) {
                _results1.push(widget.hide());
              } else {
                _results1.push(void 0);
              }
            }
            return _results1;
          })());
        }
      }
      return _results;
    }, 100);

    LIMEPlayer.prototype.initKeyEventsHandlers = function() {
      var _this = this;
      jQuery(window).keydown(function(e) {
        var event, _ref;
        if (_this.activeWidget) {
          event = null;
          switch (e.keyCode) {
            case 37:
              event = jQuery.Event('leftarrow');
              break;
            case 38:
              event = jQuery.Event('uparrow');
              break;
            case 39:
              event = jQuery.Event('rightarrow');
              break;
            case 40:
              event = jQuery.Event('downarrow');
              break;
            case 13:
              event = jQuery.Event('select');
              break;
            case 178:
              event = jQuery.Event('stop');
              break;
            case 179:
            case 32:
              event = jQuery.Event('playpause');
          }
          if (event) {
            jQuery(_this.activeWidget).trigger(event);
          }
          jQuery(_this.activeWidget).trigger(e);
          if (e.keyCode === 27) {
            if ((_ref = _this.modalContainer) != null ? _ref.is(':visible') : void 0) {
              if (history.pushState) {
                return history.back();
              } else {
                return _this.modalContainer.trigger(jQuery.Event('close'));
              }
            }
          }
        }
      });
      this.claimKeyEvents(this);
      jQuery(window).bind('popstate', function(event) {
        var _ref;
        if ((_ref = _this.modalContainer) != null ? _ref.is(':visible') : void 0) {
          return _this.modalContainer.trigger(jQuery.Event('close'));
        }
      });
      jQuery(this).bind('downarrow', function(e) {
        var activeWidget, activeWidgets, index, newIndex, nrOfWidgets;
        console.info('lime is the active widget and down arrow was pressed');
        activeWidgets = jQuery('.lime-widget:not(.inactive)');
        activeWidget = activeWidgets.filter('.nav-selected');
        nrOfWidgets = activeWidgets.length;
        index = activeWidgets.index(activeWidget);
        newIndex = nrOfWidgets === index + 1 ? 0 : index + 1;
        activeWidget = jQuery(activeWidgets[newIndex]);
        return _this.navActivateWidget(activeWidget);
      });
      jQuery(this).bind('uparrow', function(e) {
        var activeWidget, activeWidgets, index, newIndex, nrOfWidgets;
        console.info('lime is the active widget and up arrow was pressed', jQuery('.lime-widget:not(.inactive)'));
        activeWidgets = jQuery('.lime-widget:not(.inactive)');
        activeWidget = activeWidgets.filter('.nav-selected');
        nrOfWidgets = activeWidgets.length;
        index = activeWidgets.index(activeWidget);
        newIndex = index === 0 ? nrOfWidgets - 1 : index - 1;
        activeWidget = jQuery(activeWidgets[newIndex]);
        return _this.navActivateWidget(activeWidget);
      });
      jQuery(this).bind('select', function(e) {
        var activeWidget, activeWidgets;
        console.info('lime is the active widget and select was pressed', jQuery('.lime-widget:not(.inactive)'));
        activeWidgets = jQuery('.lime-widget:not(.inactive)');
        activeWidget = activeWidgets.filter('.nav-selected');
        return activeWidget.trigger('click');
      });
      jQuery(this).bind('playpause', function(e) {
        if (_this.player.paused()) {
          return _this.player.play();
        } else {
          return _this.player.pause();
        }
      });
      jQuery(this).bind('rightarrow', function(e) {
        var currentTime, firstFutureAnnotation, futureAnnotations;
        currentTime = _this.player.currentTime();
        futureAnnotations = _(_this.annotations).filter(function(ann) {
          return ann.start > currentTime;
        });
        firstFutureAnnotation = _(futureAnnotations).min(function(ann) {
          return ann.start;
        });
        _this.player.seek(firstFutureAnnotation.start);
        return jQuery(_this.player).trigger('timeupdate');
      });
      return jQuery(this).bind('leftarrow', function(e) {
        var currentTime, latestPastAnnotation, pastAnnotations;
        currentTime = _this.player.currentTime();
        pastAnnotations = _(_this.annotations).filter(function(ann) {
          return ann.start < currentTime;
        });
        if (pastAnnotations.length) {
          latestPastAnnotation = _(pastAnnotations).max(function(ann) {
            return ann.start;
          });
          _this.player.seek(latestPastAnnotation.start);
        } else {
          _this.player.seek(0);
        }
        return jQuery(_this.player).trigger('timeupdate');
      });
    };

    LIMEPlayer.prototype.claimKeyEvents = function(widget) {
      return this.activeWidget = widget;
    };

    LIMEPlayer.prototype.navActivateWidget = function(widgetEl) {
      jQuery('.nav-selected').removeClass('nav-selected');
      return widgetEl.addClass('nav-selected');
    };

    LIMEPlayer.prototype._isWidgetToBeShown = function(widget) {
      if (this.options.activeWidgetTypes && !_(this.options.activeWidgetTypes).contains(widget.options.type)) {
        return false;
      }
      switch (this.options.widgetVisibility) {
        case 'scrolling-list':
          return true;
        case 'active-only':
        case 'delayed-hide':
          if (widget.isActive) {
            return true;
          } else {
            return false;
          }
      }
    };

    LIMEPlayer.prototype._loadAnnotations = function(cb) {
      var src,
        _this = this;
      console.info("Loading annotations from LMF");
      src = this.player.currentSource();
      this.annotations = this.options.annotations;
      this.annotations = _.filter(this.options.annotations, function(ann) {
        return src.indexOf(_this._getFilename(ann.fragment.value)) !== -1;
      });
      this.annotations = _.uniq(this.annotations, false, function(item) {
        return [item.hash.resource.value, item.hash.fragment.value];
      });
      console.info("Relevant annotations:", this.annotations);
      return cb();
    };

    LIMEPlayer.prototype._moveWidgets = function(isFullscreen) {
      var annotation, widgetContainer, widgetEl, widgetList, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2, _ref3, _ref4, _results;
      console.log("fullscreen", isFullscreen, ", Visible " + LimePlayer.options.annotationsVisible);
      if (isFullscreen && LimePlayer.options.annotationsVisible) {
        _ref = this.widgetContainers;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          widgetContainer = _ref[_i];
          widgetList = [];
          _ref1 = widgetContainer.element.find('.lime-widget');
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            widgetEl = _ref1[_j];
            widgetList.push(widgetEl);
            this.fullscreenWidgetContainer.append(widgetEl);
          }
          widgetContainer.widgetList = widgetList;
        }
      } else {
        _ref2 = this.widgetContainers;
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          widgetContainer = _ref2[_k];
          widgetContainer.element.html("");
          _ref3 = widgetContainer.widgetList;
          for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
            widgetEl = _ref3[_l];
            widgetContainer.element.append(widgetEl);
          }
          widgetContainer.element.append('&nbsp;');
          jQuery(widgetContainer).data('widgetList', null);
        }
        /*
        for widgetEl in @fullscreenWidgetContainer.children()
          @fullscreenWidgetContainer.append widgetEl
        */

      }
      _ref4 = LimePlayer.annotations;
      _results = [];
      for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
        annotation = _ref4[_m];
        if (annotation.state === 'active') {
          _results.push(jQuery(annotation).trigger(jQuery.Event("becomeActive", {
            annotation: annotation
          })));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    LIMEPlayer.prototype._initPlugins = function(cb) {
      var error, options, pluginClass, _ref, _ref1;
      this.plugins = [];
      _ref = this.options.builtinPlugins;
      for (pluginClass in _ref) {
        options = _ref[pluginClass];
        try {
          this.plugins.push(new window[pluginClass](this, this.options[pluginClass] || {}));
        } catch (_error) {
          error = _error;
          console.error("Error initializing " + pluginClass + " plugin", error);
        }
      }
      _ref1 = this.options.plugins;
      for (pluginClass in _ref1) {
        options = _ref1[pluginClass];
        try {
          this.plugins.push(new window[pluginClass](this, options));
        } catch (_error) {
          error = _error;
          console.error("Error initializing " + pluginClass + " plugin", error);
        }
      }
      return cb();
    };

    LIMEPlayer.prototype.allocateWidgetSpace = function(plugin, options) {
      var container, containers, domEl, opts, res,
        _this = this;
      if (!(plugin instanceof window.LimePlugin)) {
        console.error("allocateWidgetSpace needs the first parameter to be the plugin itself requesting for the widget.");
      }
      containers = [];
      if (options && plugin.options.preferredContainer && this._hasFreeSpace(plugin.options.preferredContainer, options)) {
        containers = [plugin.options.preferredContainer];
      } else {
        containers = _(this.widgetContainers).filter(function(cont) {
          return _this._hasFreeSpace(cont, options);
        });
      }
      if (!containers.length) {
        containers = this.widgetContainers;
      }
      containers = _.sortBy(containers, function(cont) {
        return cont.element.children().length;
      });
      container = containers[0];
      if (container.element) {
        container = container.element;
      }
      container.prepend("<div class='lime-widget'></div>");
      domEl = jQuery(".lime-widget:first", container);
      opts = _(this.options.widget).extend(options);
      res = new LimeWidget(plugin, domEl, opts);
      _.defer(function() {
        if (_this.options.widgetVisibility === 'scrolling-list' && _this._isWidgetToBeShown(res)) {
          res.render();
          _this.widgets.push(res);
          res.show();
          res.setInactive();
          if (_this.getHiddenWidgetTypes().indexOf(options.type) !== -1) {
            res.element.addClass('deactivated');
          }
          return _this.updateWidgetsList();
        }
      });
      return res;
    };

    LIMEPlayer.prototype._hasFreeSpace = function(container, options) {
      var currentHeight;
      currentHeight = container.element.height();
      if (currentHeight > 0) {
        return true;
      } else {
        return false;
      }
    };

    LIMEPlayer.prototype.play = function() {
      return this.player.play();
    };

    LIMEPlayer.prototype.pause = function() {
      return this.player.pause();
    };

    LIMEPlayer.prototype.seek = function(pos) {
      return this.player.seek(pos);
    };

    LIMEPlayer.prototype._getFilename = function(uri) {
      var regexp, _ref;
      regexp = new RegExp(/\/([^\/#]*)(#.*)?$/);
      return (_ref = uri.match(regexp)) != null ? _ref[1] : void 0;
    };

    return LIMEPlayer;

  })();

  (function($) {
    return $.fn.goTo = function() {
      $(this).parent().scrollTo(this);
      return this;
    };
  })(jQuery);

}).call(this);

(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.LimePlugin = (function() {
    function LimePlugin(lime, options) {
      this.lime = lime;
      this.options = jQuery.extend({}, this.defaults, options);
      this.init();
    }

    LimePlugin.prototype.defaults = {
      preferredContainer: null
    };

    LimePlugin.prototype.widgets = [];

    LimePlugin.prototype.init = function() {
      return console.error("All Lime plugins have to implement the init method!");
    };

    LimePlugin.prototype.getModalContainer = function() {
      var mask, maskHeight, maskWidth, modalContainer, winH, winW,
        _this = this;
      modalContainer = this.lime.modalContainer;
      mask = this.lime.modalMask;
      if (!modalContainer) {
        if (this.lime.player.isFullscreen()) {
          this.lime.player.videoOverlay.append("<!-- Mask to cover the whole screen --><div id=\"mask\"></div>");
          this.lime.modalMask = jQuery('#mask');
          this.lime.player.videoOverlay.append("<div class=\"modal-container\"></div>");
          this.lime.modalContainer = jQuery('.modal-container', this.lime.player.videoOverlay);
        } else {
          jQuery('body').append("<!-- Mask to cover the whole screen --><div id=\"mask\"></div>");
          this.lime.modalMask = jQuery('#mask');
          jQuery('body').append("<div class=\"modal-container\"></div>");
          this.lime.modalContainer = jQuery('body .modal-container');
        }
        modalContainer = this.lime.modalContainer;
        mask = this.lime.modalMask;
        jQuery(modalContainer).bind('close', function(e) {
          mask.hide();
          modalContainer.hide();
          modalContainer.empty();
          return _this.lime.claimKeyEvents(_this.lime);
        });
        mask.click(function(e) {
          mask.hide();
          modalContainer.hide();
          modalContainer.empty();
          return _this.lime.claimKeyEvents(_this.lime);
        });
        jQuery(this.lime.player).bind('fullscreenchange', function(e) {
          if (e.isFullScreen) {
            _this.lime.player.videoOverlay.append(mask);
            return _this.lime.player.videoOverlay.append(modalContainer);
          } else {
            jQuery('body').append(mask);
            return jQuery('body').append(modalContainer);
          }
        });
      }
      mask = jQuery('#mask');
      modalContainer.empty();
      modalContainer.show();
      mask.show();
      modalContainer.append("<div style=\"height: 22px; width: 100%; position: relative; margin: 0 auto; background: black;\"> <a href=\"#\" class=\"close\" role=\"button\"><img src=\"img/close-icon.png\" style=\"width: 22px; height: 22px;\"/></a></div>");
      modalContainer.append("<div class=\"modalContent\" style=\"height: 98%; width: 100%; position: relative; margin: 0 auto;\">");
      modalContainer.append("</div>");
      maskHeight = jQuery(window).height();
      maskWidth = jQuery(window).width();
      mask.css({
        width: maskWidth,
        height: maskHeight
      });
      mask.fadeIn(100);
      mask.fadeTo("fast", 0.8);
      winH = jQuery(window).height();
      winW = jQuery(window).width();
      modalContainer.css("top", jQuery("#header").height());
      modalContainer.css("right", jQuery("#widget-container-2").width());
      modalContainer.fadeIn(100);
      jQuery(".close", modalContainer).click(function(e) {
        e.preventDefault();
        mask.hide();
        modalContainer.hide();
        modalContainer.empty();
        return _this.lime.claimKeyEvents(_this.lime);
      });
      jQuery(window).resize(function(e) {
        maskHeight = jQuery(document).height();
        maskWidth = jQuery(document).width();
        mask.css({
          width: maskWidth,
          height: maskHeight
        });
        winH = jQuery(window).height();
        winW = jQuery(window).width();
        modalContainer.css("top", jQuery("#header").height());
        modalContainer.css("right", jQuery("#widget-container-2").width());
        modalContainer.css("width", "auto");
        return modalContainer.css("height", "auto");
      });
      return jQuery('.modalContent', modalContainer);
    };

    return LimePlugin;

  })();

  window.TestPlugin = (function(_super) {
    __extends(TestPlugin, _super);

    function TestPlugin() {
      _ref = TestPlugin.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    TestPlugin.prototype.init = function() {
      var annotation, _i, _len, _ref1, _results;
      this.name = 'TestPlugin';
      console.info("Initialize " + this.name);
      _ref1 = this.lime.annotations;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        annotation = _ref1[_i];
        _results.push(this.handleAnnotation(annotation));
      }
      return _results;
    };

    TestPlugin.prototype.handleAnnotation = function(annotation) {
      var _this = this;
      return annotation.entityPromise.done(function(entities) {
        var widget;
        widget = _this.lime.allocateWidgetSpace(_this, {
          thumbnail: "img/info.png",
          title: "" + (annotation.getLabel()) + " Info",
          type: "TestWidget",
          sortBy: function() {
            return 10000 * annotation.start + annotation.end;
          }
        });
        widget.annotation = annotation;
        jQuery(widget).bind('activate', function(e) {
          return _this.getModalContainer().html(_this.renderAnnotation(annotation));
        });
        annotation.widgets[_this.name] = widget;
        jQuery(annotation).bind("becomeActive", function(e) {
          return annotation.widgets[_this.name].setActive();
        });
        return jQuery(annotation).bind("becomeInactive", function(e) {
          return annotation.widgets[_this.name].setInactive();
        });
      });
    };

    TestPlugin.prototype.renderAnnotation = function(annotation) {
      var depiction, label, page, props;
      props = annotation.entity;
      label = annotation.getLabel();
      depiction = annotation.getDepiction();
      page = annotation.getPage();
      return "<p>\n<a href=\"" + page + "\" target=\"_blank\">" + label + "</a>\n</p>\n<p>\n<img src=\"" + depiction + "\" width=\"200\"/>\n</p>";
    };

    return TestPlugin;

  })(window.LimePlugin);

}).call(this);

(function() {
  window.LIMEPlayer.VideoPlayerInit = function(el, options, cb) {
    var _this = this;
    if (!_V_) {
      console.error("VideoJS not loaded!");
      cb("VideoJS not loaded");
      return;
    }
    _.defer(function() {
      var player;
      console.info("1. Player initialisation");
      player = {
        instance: _V_(el, {
          flash: {
            iFrameMode: true
          },
          swf: "lib/videojs/video-js.swf"
        }),
        isFullscreen: function() {
          return this.instance.isFullScreen;
        },
        play: function() {
          return this.instance.play();
        },
        pause: function() {
          return this.instance.pause();
        },
        getLength: function() {
          return this.instance.duration();
        },
        seek: function(pos) {
          if (pos !== void 0) {
            return this.instance.currentTime(pos);
          }
        },
        currentTime: function() {
          return this.instance.currentTime();
        },
        currentSource: function() {
          return this.instance.tag.currentSrc || this.instance.tag.src || jQuery('source', this.instance.tag).attr('src');
        },
        paused: function() {
          return this.instance.paused();
        }
      };
      player.instance.addEvent("error", function(e) {
        return cb(e);
      });
      player.instance.addEvent("loadedmetadata", function() {
        var timelineOverlay, videoOverlay;
        console.info("3. Player.loadedmetadata");
        player.instance.isFullScreen = options.fullscreen;
        videoOverlay = player.instance.addComponent("VideoOverlay");
        player.videoOverlay = jQuery(videoOverlay.el);
        player.videoOverlay.css({
          height: '100%'
        });
        timelineOverlay = player.instance.controlBar.progressControl.addComponent("VideoOverlay");
        player.timelineOverlay = jQuery(timelineOverlay.el);
        player.timelineOverlay.css({
          position: 'absolute',
          top: 0,
          right: 0,
          left: 0,
          height: '100%',
          padding: 0,
          margin: 0,
          background: 'transparent',
          'pointer-events': 'none'
        });
        player.buttonContainer = player.instance.controlBar.el;
        player.instance.controlBar.addComponent("AnnotationToggle").el;
        player.instance.addEvent("timeupdate", function(e) {
          var limeevent;
          limeevent = jQuery.Event("timeupdate", {
            currentTime: player.instance.currentTime()
          });
          return jQuery(player).trigger(limeevent);
        });
        player.instance.addEvent('fullscreenchange', function(e) {
          var fsce;
          fsce = jQuery.Event('fullscreenchange', {
            isFullScreen: player.instance.isFullScreen
          });
          return jQuery(player).trigger(fsce);
        });
        player.instance.addEvent('play', function(e) {
          var playevent;
          playevent = jQuery.Event('play');
          return jQuery(player).trigger(playevent);
        });
        player.instance.play();
        return cb(null, player);
      });
      return console.info("2. Player instantiated.");
    });
    _V_.VideoOverlay = _V_.Component.extend({
      options: {
        loadEvent: "play"
      },
      init: function(player, options) {
        return this._super(player, options);
      },
      createElement: function() {
        el = _V_.createElement("div", {
          className: "lime-overlay"
        });
        return el;
      }
    });
    return _V_.AnnotationToggle = _V_.Button.extend({
      buttonText: "Annotations On/Off",
      buildCSSClass: function() {
        return "vjs-annotationstoggler " + this._super();
      },
      onClick: function() {
        if (LimePlayer.options.annotationsVisible === false) {
          jQuery(".vjs-annotationstoggler").removeClass("annotationstoggler-off");
          LimePlayer.options.annotationsVisible = true;
          if (LimePlayer.player.AnnotationOverlaysComponent) {
            LimePlayer.player.AnnotationOverlaysComponent.show();
          }
          if (this.player.isFullScreen) {
            LimePlayer.player.AnnotationsSidebars.show();
          } else {
            LimePlayer.player.AnnotationsSidebars.hide();
          }
        } else {
          jQuery(".vjs-annotationstoggler").addClass("annotationstoggler-off");
          LimePlayer.player.AnnotationsSidebars.hide();
          if (LimePlayer.player.AnnotationOverlaysComponent) {
            LimePlayer.player.AnnotationOverlaysComponent.hide();
          }
          LimePlayer.options.annotationsVisible = false;
        }
        return console.log("fullscreen " + this.player.isFullScreen, "visible " + LimePlayer.options.annotationsVisible);
      }
    });
  };

}).call(this);

(function() {
  window.LimeWidget = (function() {
    function LimeWidget(plugin, element, options) {
      var defaults;
      this.plugin = plugin;
      this.element = element;
      this.lime = this.plugin.lime;
      defaults = {
        type: 'defaultwidget'
      };
      this.options = _(defaults).extend(this.options, options);
      this._init();
    }

    LimeWidget.prototype.render = function() {
      var defMethod, m, _i, _len, _ref,
        _this = this;
      this.element.html("<div class=\"" + this.options.type + "\">\n  <table style=\"margin:0 auto; width: 100%;\">\n    <tr>\n      <td style=\"width: 45px; background-color: rgb(0, 0, 0);\"><img class=\"utility-icon\" src=\"" + this.options.thumbnail + "\" style=\"width: 45px; height: 27px;\" ></td>\n      <td><span class=\"utility-text\">" + this.options.title + "</span></td>\n    </tr>\n  </table>\n</div>");
      jQuery(this.element).parent().data('sorted', false);
      jQuery(this.element).data('widget', this);
      jQuery(this.element).data('plugin', this.plugin);
      jQuery(this.element).click(function(e) {
        var plugin, time, widget, _ref;
        widget = jQuery(e.currentTarget).data().widget;
        plugin = jQuery(e.currentTarget).data().plugin;
        if (widget.isActive()) {
          _this.plugin.lime.pause();
          jQuery(_this).trigger('activate', {
            plugin: plugin,
            widget: widget
          });
          time = _this.lime.player.currentTime();
          if (typeof history.pushState === "function") {
            history.pushState({
              annotation: (_ref = widget.annotation) != null ? _ref.hash.annotation.value : void 0,
              widgetType: widget.options.type,
              time: time
            }, 'state123', "#time=" + time + "&widgetType=" + widget.options.type);
          }
          _this.lime.claimKeyEvents(widget);
        } else {
          plugin.lime.player.seek(widget.annotation.start);
          plugin.lime.player.play();
        }
        return plugin.lime.navActivateWidget(widget.element);
      });
      defMethod = function(o, m) {
        return _this[m] = function() {
          return o[m].call(o, arguments);
        };
      };
      _ref = ['addClass', 'html', 'removeClass'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        m = _ref[_i];
        defMethod(this.element, m);
      }
      return this.isRendered = true;
    };

    LimeWidget.prototype.html = function(content) {
      return this.element.html(content);
    };

    LimeWidget.prototype.options = {
      showSpeed: 500,
      label: 'Default label'
    };

    LimeWidget.prototype._init = function() {
      return this.state = 'hidden';
    };

    LimeWidget.prototype.show = function() {
      this.element.slideDown(this.options.showSpeed);
      return this.state = 'visible';
    };

    LimeWidget.prototype.hide = function() {
      return this.element.slideUp(this.options.showSpeed);
    };

    LimeWidget.prototype.setActive = function() {
      if (!this.isRendered) {
        this.render();
      }
      this.show();
      this.state = 'active';
      this.element.find(".utility-icon").attr("src", this.options.thumbnail);
      this.element.removeClass('inactive');
      this.element.parent().prepend(this.element);
      return this.lime.updateWidgetsList();
    };

    LimeWidget.prototype.setInactive = function() {
      var grayThumbnail;
      this.state = 'inactive';
      grayThumbnail = this.options.thumbnail.replace('.png', '');
      this.element.find(".utility-icon").attr("src", grayThumbnail + "_gr.png");
      this.element.addClass('inactive');
      return this.lime.updateWidgetsList();
    };

    LimeWidget.prototype.isActive = function() {
      return this.state === 'active';
    };

    return LimeWidget;

  })();

}).call(this);

(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.ActorPlugin = (function(_super) {
    __extends(ActorPlugin, _super);

    function ActorPlugin() {
      _ref = ActorPlugin.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    ActorPlugin.prototype.init = function() {
      var annotation, _i, _len, _ref1, _results;
      this.name = 'ActorPlugin';
      this.actorOntologySet = ['<http://dbpedia.org/class/yago/Actor109765278>', '<http://dbpedia.org/class/yago/AustrianFilmActors>', '<http://dbpedia.org/class/yago/FilmActors>', '<http://dbpedia.org/class/yago/AmericanTelevisionActors>', '<http://dbpedia.org/class/yago/AmericanVoiceActors>', '<http://dbpedia.org/class/yago/AmericanActorsOfEnglishDescent>', '<http://dbpedia.org/class/yago/AmericanSoapOperaActors>', '<http://dbpedia.org/class/yago/AmericanFilmActors>', '<http://dbpedia.org/class/yago/Actress109767700>', '<http://dbpedia.org/class/yago/AmericanChildActors>', '<http://dbpedia.org/class/yago/ActorsFromCalifornia>'];
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

    ActorPlugin.prototype.handleAnnotation = function(annotation) {
      var _this = this;
      return annotation.entityPromise.done(function() {
        var isActor, nonConcept, typeSet, widget;
        isActor = false;
        typeSet = annotation.getType();
        /*
            for annotationType in typeSet
            isActor = true if annotationType.id in @actorOntologySet
            console.log annotationType.id
        */

        isActor = true;
        if (isActor) {
          console.info("entities for annotation " + annotation.resource + " loaded, is actor " + isActor + " create a widget for it!");
          nonConcept = annotation.getDescription();
          nonConcept = nonConcept.replace("No description found.", "");
          if (nonConcept.length >= 3) {
            widget = _this.lime.allocateWidgetSpace(_this, {
              thumbnail: "img/info.png",
              title: "" + (annotation.getLabel()) + " Info",
              type: "DbpediaInfoWidget",
              sortBy: function() {
                return 10000 * annotation.start + annotation.end;
              }
            });
            widget.annotation = annotation;
            jQuery(widget).bind('activate', function(e) {
              return _this.showAbstractInModalWindow(annotation, _this.getModalContainer());
            });
            annotation.widgets[_this.name] = widget;
            jQuery(annotation).bind("becomeActive", function(e) {
              return annotation.widgets[_this.name].setActive();
            });
            jQuery(annotation).bind("becomeInactive", function(e) {
              return annotation.widgets[_this.name].setInactive();
            });
            _this.getLSIImages(annotation);
            return jQuery(widget).bind("leftarrow", function(e) {
              return console.info('left arrow pressed', e);
            });
          }
        }
      });
    };

    ActorPlugin.prototype.getLSIImages = function(annotation) {
      var _this = this;
      return this.lime.cmf.getLSIImagesForTerm(annotation.resource.value, function(err, res) {
        if (err) {
          return console.warn("Error getting LSI images resources", err);
        } else {
          console.info("LSI resources for", annotation, res);
          annotation.lsiImageResources = _(res).map(function(resultset) {
            var entity;
            entity = {
              image: resultset.image.value
            };
            return entity;
          });
          return annotation.getLsiImagesResources = function() {
            return this.lsiImageResources;
          };
        }
      });
    };

    ActorPlugin.prototype.showAbstractInModalWindow = function(annotation, outputElement) {
      var comment, depiction, i, label, lime, lsiImageList, maintext, modalContent, n, page, result, secondarytext, starringList, textsum, tmptext, y;
      modalContent = $(outputElement);
      modalContent.css("width", "600px");
      modalContent.css("height", "auto");
      label = annotation.getLabel();
      page = annotation.getPage();
      starringList = annotation.getStarring();
      console.log("---- Movies", starringList);
      /*
      -- added 29.apr.2013 --
       LSIimages = list of images from the LSI that target the current annotation's DBPedia resource URI
       example:
       LAIImages = annotation.getLSIVideosFromTerm (annotation.resource.value,cb)
      
      a LSIImages can have the following structure:
      LSIImages = [
                    {
                    image:"imageURI",
                    hasKeyword: {"DBPedia resource URI 1", "DBPedia resource URI 2", "DBPedia resource URI 3", ... }
                    },
      
                    {
                    image:"imageURI",
                    hasKeyword: {"DBPedia resource URI 1", "DBPedia resource URI 2", "DBPedia resource URI 3", ... }
                    },
                    ...
                  ]
      */

      lime = this.lime;
      comment = annotation.getDescription();
      maintext = comment;
      secondarytext = "";
      if (maintext.length >= 240) {
        n = maintext.length;
        if (maintext.length >= 240) {
          tmptext = maintext.split(" ");
          n = tmptext.length;
          textsum = "";
          i = 0;
          while (textsum.length < 200) {
            textsum += tmptext[i] + " ";
            i++;
          }
          maintext = textsum;
          y = i;
          while (y < n) {
            secondarytext += tmptext[y] + " ";
            y++;
          }
        }
      }
      depiction = annotation.getDepiction({
        without: 'thumb'
      });
      if (depiction === null) {
        depiction = "img/noimagenew.png";
      }
      lsiImageList = annotation.getLsiImagesResources();
      console.log("Asociated images ", label, lsiImageList);
      /*
        -- added 29.apr.2013 --
        Extend interface logic (below) to fit LSIImages by creating a new tile with 1 or more images
      */

      result = "<div id=\"ifoWidgetExpanded\" style=\"border: 1px dotted lightgray; position: relative;height: auto; width: 600px;\">\n<div id=\"infoWidget\" style=\"background-color: rgba(37, 37, 37, 0.7); height: 40px; left: 0px; width: 100%; position: relative; float: left;\">\n<div class=\"infoWidgeticon\" style=\"border-right: 1px dotted lightgray; position: relative; height: 100%; float: left; background-color: #3f3e3e; width: 8%;\">\n<span data-dojo-type=\"shapes.Text\" id=\"iconLabel\" style=\"font: Times; position: relative; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: #f38f0b; font-family: 'Times New Roman',Times,serif; font-style: italic;\">i</span>\n</div>\n<div class=\"infoWidgetTitle\" style=\"font: Arial; position: relative; float: left; height: 100%; width: 86%; font-family: Arial,Helvetica,sans-serif; font-size: 26px; color: white; font-weight: normal; text-align: left; vertical-align: middle; text-indent: 1em; line-height: 140%;\">\n " + label + "</div>\n</div>\n<div id=\"infoText\" style=\"padding: 10px; position: relative; float: left; background-color: rgba(68, 68, 68, 0.7); height: auto; font-style: normal; width: 96%;\">\n<div id=\"infoTextBioTitle\" style=\"font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange; height: auto;\">\nBio</div>\n<div id=\"infoTextBio\" style=\"font: Helvetica; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; float: left; line-height: normal; position: relative; height: auto; width: 100%;\">\n " + comment + "\n</div>\n<div id=\"infoTextCareerTitle\" style=\"font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange;\">\nMovies</div>\n<div id=\"infoTextCareer\" style=\"font: Helvetica; width: 100%; position: relative; float: left; height: auto; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; line-height: normal;\">\n" + starringList + "</div>\n<div id=\"infoTextAwardsTitle\" style=\"font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange;\">\nAwards</div>\n<div id=\"infoTextAwards\" style=\"font: Helvetica; width: 100%; position: relative; float: left; height: auto; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; line-height: normal;\">\nSpaghetti Master</div>\n</div>\n</div>";
      return modalContent.append(result);
    };

    return ActorPlugin;

  })(window.LimePlugin);

}).call(this);

(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.BookingPlugin = (function(_super) {
    __extends(BookingPlugin, _super);

    function BookingPlugin() {
      _ref = BookingPlugin.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    BookingPlugin.prototype.init = function() {
      var annotation, _i, _len, _ref1, _ref2, _results;
      this.name = 'BookingPlugin';
      annotation = void 0;
      console.info("Initialize BusinessPlugin");
      _ref1 = this.lime.annotations;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        annotation = _ref1[_i];
        if (annotation.resource.value.indexOf("#BusinessEntity") > 0 && ((_ref2 = annotation.relation.value) === 'http://connectme.at/ontology#explicitlyShows' || _ref2 === 'http://connectme.at/ontology#explicitlyMentions' || _ref2 === 'http://connectme.at/ontology#implicitlyShows' || _ref2 === 'http://connectme.at/ontology#implicitlyMentions' || _ref2 === 'http://connectme.at/ontology#hasContent')) {
          _results.push(this.handleAnnotation(annotation));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    BookingPlugin.prototype.handleAnnotation = function(annotation) {
      var domain, nonConcept, url, widget,
        _this = this;
      $.getJSON("http://smart-ip.net/geoip-json?callback=?", function(data) {
        return _this.clientIP = data.host;
      });
      this.getGRData(annotation);
      nonConcept = annotation.resource.value;
      if (nonConcept.length >= 3) {
        url = annotation.resource.value;
        domain = url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0].replace('www.', '');
        widget = this.lime.allocateWidgetSpace(this, {
          thumbnail: "img/shop.png",
          title: "" + domain + " offer",
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
          return _this.expandWidget(annotation, _this.getModalContainer());
        });
        annotation.widgets[this.name] = widget;
        jQuery(annotation).bind("becomeActive", function(e) {
          var error, eventActiveLabel, eventCategory;
          if (annotation.goodRelationsDataResource) {
            if (annotation.goodRelationsDataResource.length > 0) {
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
        jQuery(widget).bind("downarrow", function(e) {
          _this.bookingtabsiterator = 3 === _this.bookingtabsiterator + 1 ? 0 : _this.bookingtabsiterator + 1;
          if (_this.bookingtabsiterator === 0) {
            jQuery("#businessWho").trigger('click');
            jQuery("#businessWho").addClass('selected');
          }
          if (_this.bookingtabsiterator === 1) {
            jQuery("#businessWhat").trigger('click');
            jQuery("#businessWhat").addClass('selected');
          }
          if (_this.bookingtabsiterator === 2) {
            jQuery("#businessWhere").trigger('click');
            return jQuery("#businessWhere").addClass('selected');
          }
        });
      }
      return jQuery(widget).bind("uparrow", function(e) {
        _this.bookingtabsiterator = _this.bookingtabsiterator === 0 ? 2 : _this.bookingtabsiterator - 1;
        jQuery('.videotab.selected').removeClass('selected');
        if (_this.bookingtabsiterator === 0) {
          jQuery("#businessWho").trigger('click');
          jQuery("#businessWho").addClass('selected');
        }
        if (_this.bookingtabsiterator === 1) {
          jQuery("#businessWhat").trigger('click');
          jQuery("#businessWhat").addClass('selected');
        }
        if (_this.bookingtabsiterator === 2) {
          jQuery("#businessWhere").trigger('click');
          return jQuery("#businessWhere").addClass('selected');
        }
      });
    };

    BookingPlugin.prototype.getGRData = function(annotation) {
      var _this = this;
      return this.lime.cmf.getGRDataForTerm(annotation.resource.value, function(err, res) {
        if (err) {
          return console.warn("Error getting CMF Good Relations resources", err);
        } else {
          annotation.goodRelationsDataResource = _(res).map(function(resultset) {
            var entity;
            entity = {
              name: resultset.name.value,
              street: resultset.street.value,
              pcode: Number(resultset.pcode.value),
              city: resultset.city.value,
              country: resultset.country.value,
              telephone: resultset.telephone.value,
              email: resultset.email.value,
              description: resultset.description.value,
              geoLat: Number(resultset.geoLat.value),
              geoLong: Number(resultset.geoLong.value),
              priceValue: Number(resultset.pricevalue.value),
              priceCurrency: resultset.pricecurrency.value,
              product: resultset.product.value
            };
            return entity;
          });
          return annotation.getGRDataResource = function() {
            return this.goodRelationsDataResource;
          };
        }
      });
    };

    BookingPlugin.prototype._htmlEncode = function(str) {
      return str.replace(/[&<>"']/g, function($0) {
        return "&" + {
          "&": "amp",
          "<": "lt",
          ">": "gt",
          '"': "quot",
          "'": "#39"
        }[$0] + ";";
      });
    };

    BookingPlugin.prototype.expandWidget = function(annotation, outputElement) {
      var businessData, lime, modalContent, resource, result, startTime,
        _this = this;
      modalContent = jQuery(outputElement);
      modalContent.css("width", "600px");
      modalContent.css("height", "auto");
      lime = this.lime;
      resource = "";
      resource = annotation.resource.value;
      startTime = new Date().getTime();
      businessData = annotation.getGRDataResource();
      if (businessData.length) {
        if (businessData.length > 0) {
          result = "<div id=\"bookingWidgetExpanded\" style=\"position: relative; z-index: 900; width: 600px; height: 600px; background-color: transparent;\">\n<div id=\"forthTile\" style=\"position: relative; float: left; width: 300px; height: 300px;\">\n<div style=\"width: 100%; position: relative; height: 30px; font-size: 20px; color: #00BFFF; background-color: #696969;\">\n" + businessData[0].name + "\n</div>\n<div style=\"width: 100%; position: relative; font-size: 16px; height: 50px; background-color: #303030; color: #f1f1f1;\">\n" + businessData[0].street + ", " + businessData[0].pcode + " " + businessData[0].city + ", " + businessData[0].country + "\n</div>\n<div style=\"width: 100%; position: relative; height: 20px; font-size: 16px; background-color: #303030; color: #f1f1f1; text-align: center;\">\n " + businessData[0].telephone + "\n</div>\n<div style=\"width: 100%; position: relative; height: 170px; font-size: 16px; background-color: #303030; color: #f1f1f1; overflow-y: scroll;\">\nÜber uns<br>\n" + businessData[0].description + "\n</div>\n<div class=\"businessContact\"  style=\"cursor: hand; cursor: pointer; width: 100%; position: relative; height: 30px; color: black; background-color: lightgray; font-size: 21px; text-align: center; background-image: -webkit-gradient(radial, center center, 10, center center, from(white), to(#909090)); background-image: -o-radial-gradient(white, #909090); background-image: -ms-radial-gradient(white, #909090); background-image: -moz-radial-gradient(white, #909090); background-image: -webkit-radial-gradient(white, #909090); background-image: radial-gradient(white, #909090);\">\nkontaktieren Sie uns\n</div>\n</div>\n\n<div id=\"secondTile\" style=\"width: 300px; height: 300px; position: relative; float: left; display: none;\">\n<div id=\"businessName\" style=\"width: 100%; position: relative; height: 30px; font-size: 20px; color: #FA8072; background-color: #696969;\">\n " + businessData[0].name + "\n</div>\n<div id=\"businessAddress\" style=\"width: 100%; position: relative; font-size: 16px; height: 50px; background-color: #303030; color: #f1f1f1;\">\n " + businessData[0].street + ", " + businessData[0].pcode + " " + businessData[0].city + ", " + businessData[0].country + "\n</div>\n<div id=\"businessTelephone\" style=\"width: 100%; position: relative; height: 20px; font-size: 16px; background-color: #303030; color: #f1f1f1; text-align: center;\">\n " + businessData[0].telephone + "\n</div>\n<div id=\"businessService\" style=\"width: 100%; position: relative; height: 110px; background-color: #ffffff;\">\n<div id=\"businessService1\" style=\"width: 100%; height: 80px; font-size: 16px; background-color: #696969; position: relative; overflow-y: scroll;\">\n " + businessData[0].product + "\n</div>\n<div id=\"businessService2\" style=\"width: 100%; height: 30px; font-size: 16px; background-color: #303030; position: relative;\">\n " + businessData[0].priceValue + " " + businessData[0].priceCurrency + "\n</div>\n<div id=\"businessService3\" style=\"width: 100%; height: 20px; position: relative; display: none;\">\nService 3 - Price XXXX EUR\n</div>\n<div id=\"businessService4\" style=\"width: 100%; height: 20px; position: relative; display: none;\">\nService 4 - Price XXXX EUR\n</div>\n<div id=\"businessService5\" style=\"width: 100%; height: 20px; position: relative; display: none;\">\nService 5 - Price XXXX EUR\n</div>\n</div>\n<div id=\"businessOpeningHours\" style=\"width: 100%; position: relative; height: 60px; background-color: #303030; color: #f1f1f1;\">\n\n</div>\n  <div class=\"businessContact\" style=\"cursor: hand; cursor: pointer; width: 100%; position: relative; height: 30px; color: black; background-color: lightgray; font-size: 21px; text-align: center; background-image: -webkit-gradient(radial, center center, 10, center center, from(white), to(#909090)); background-image: -o-radial-gradient(white, #909090); background-image: -ms-radial-gradient(white, #909090); background-image: -moz-radial-gradient(white, #909090); background-image: -webkit-radial-gradient(white, #909090); background-image: radial-gradient(white, #909090);\">\nkontaktieren Sie uns\n  </div>\n</div>\n\n<div id=\"firstTile\" style=\"position: relative; float: left; width: 300px; height: 300px; display: none;\">\n<div style=\"width: 100%; position: relative; height: 30px; font-size: 20px; background-color: #696969; color: #90EE90;\">\n" + businessData[0].name + "\n</div>\n<div id=\"map\" style=\"width: 100%; height: 270px; position: absolute; z-index: 900; height: 89%; background-color: green;\"></div>\n</div>\n\n<div id=\"thirdTile\" style=\"width: 298px; height: 300px; float: left; position: relative; border-left:dotted 1px #bbbbbb\">\n<div id=\"businessWho\" class=\"bookingtab\" style=\"cursor: hand; cursor: pointer; width: 98%; height: 98px; position: relative; float: left; background-color: #696969; color: #00BFFF; font-size: 49px; border-bottom:dotted 1px #bbbbbb; border-right:dotted 1px #bbbbbb\" >\nWie?\n<div id=\"businessWhoLabel\" style=\"cursor: hand; cursor: pointer; position: absolute; z-index: 900; left: 0px; bottom: 0px; height: 50%; width: 100%; font-size: 14pt; color: white; background-color: #303030;\">\nÜber uns\n</div>\n</div>\n<div id=\"businessWhat\" class=\"bookingtab\" style=\"cursor: hand; cursor: pointer; width: 98%; height: 98px; float: left; position: relative; background-color: #696969; color: #FA8072; font-size: 49px; border-bottom:dotted 1px #bbbbbb; border-right:dotted 1px #bbbbbb\">\nWas?\n<div id=\"businessWhatLabel\" style=\"cursor: hand; cursor: pointer; position: absolute; z-index: 900; left: 0px; bottom: 0px; height: 50%; width: 100%; font-size: 14pt; color: white; background-color: #303030;\">\nUnser Angebot\n</div>\n</div>\n<div id=\"businessWhere\" class=\"bookingtab\" style=\"cursor: hand; cursor: pointer; width: 98%; height: 100px; position: relative; float: left; background-color: #696969; color: #90EE90; font-size: 49px; border-bottom:dotted 1px #bbbbbb; border-right:dotted 1px #bbbbbb\">\nWo?\n<div id=\"businessWhereLabel\" style=\"cursor: hand; cursor: pointer; position: absolute; z-index: 900; width: 100%; height: 50%; left: 0px; bottom: 0px; font-size: 14pt; color: white; background-color: #303030;\">\nReiseroute Karte\n</div>\n</div>\n</div>\n\n</div>\n";
          modalContent.append(result);
          this.bookingtabsiterator = 0;
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
          jQuery(".businessContact").click(function() {
            var bemail, bname, grdata, time;
            jQuery(".businessContact").text("Danke schön!");
            grdata = annotation.getGRDataResource();
            if (grdata.length) {
              if (grdata.length > 0) {
                time = jQuery.now();
                bemail = grdata[0].email;
                bname = grdata[0].name;
                return jQuery.post('http://devserver.sti2.org/connectme/logger.php?', {
                  entry: "        <div  style=\"width: 100%; position: relative; float: left; background-color: #e1e1e1; height: 30px; border-bottom: 1px dotted #696969;\" class=\"item\">\n        <div style=\"height: 100%; color: #32CD32; font-size: 16pt; background-color: #505050; width: 30px; text-align: center; position: relative; float: left;\" class=\"icon\">\n        @</div>\n            <div style=\"width: 200px; height: 100%; position: relative; float: left; font-size: 16px; text-align: center; border-right: 1px dotted #696969;\" class=\"ip\">\n" + _this.clientIP + "</div>\n            <div style=\"width: 200px; height: 100%; position: relative; float: left; font-size: 16px; text-align: center; border-right: 1px dotted #696969;\" class=\"email\">\n" + bemail + "l</div>\n            <div style=\"width: 200px; height: 100%; position: relative; float: left; font-size: 16px; text-align: center; border-right: 1px dotted #696969;\" class=\"name\">\n" + bname + "</div>\n            <div style=\"width: 200px; height: 100%; position: relative; float: left; font-size: 16px; text-align: center; border-right: 1px dotted #696969;\" class=\"time\">\n" + time + "</div>\n            </div>"
                }, function(data) {});
              }
            }
          });
          jQuery("#businessWho").click(function() {
            jQuery('.bookingtab.selected').removeClass('selected');
            jQuery("#businessWho").addClass("selected");
            jQuery("#forthTile").css("display", "block");
            jQuery("#firstTile").css("display", "none");
            jQuery("#secondTile").css("display", "none");
            return jQuery("#map").empty();
          });
          jQuery("#businessWhat").click(function() {
            jQuery('.bookingtab.selected').removeClass('selected');
            jQuery("#businessWhat").addClass("selected");
            jQuery("#forthTile").css("display", "none");
            jQuery("#firstTile").css("display", "none");
            jQuery("#secondTile").css("display", "block");
            return jQuery("#map").empty();
          });
          jQuery("#businessWhere").click(function() {
            jQuery('.bookingtab.selected').removeClass('selected');
            jQuery("#businessWhere").addClass("selected");
            jQuery("#forthTile").css("display", "none");
            jQuery("#firstTile").css("display", "block");
            jQuery("#secondTile").css("display", "none");
            if (navigator.geolocation) {
              return navigator.geolocation.getCurrentPosition((function(position) {
                var destination, directionDisplay, directionsDisplay, directionsService, grdata, i, latitude, locationName, longitude, map, mapOptions, myOptions, output, request, start, x, xmlDoc, xmlhttp;
                i = void 0;
                locationName = "Planai - Hochwurzen";
                latitude = 47.392887;
                longitude = 13.693318;
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
                grdata = annotation.getGRDataResource();
                if (grdata.length) {
                  if (grdata.length > 0) {
                    latitude = grdata[0].geoLat;
                    longitude = grdata[0].geoLong;
                  }
                }
                output = document.getElementById("map");
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
          });
          return jQuery("#businessWho").trigger("click");
        }
      }
    };

    return BookingPlugin;

  })(window.LimePlugin);

}).call(this);

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
        title: "" + domain,
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

(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  window.CharacterPlugin = (function(_super) {
    __extends(CharacterPlugin, _super);

    function CharacterPlugin() {
      _ref = CharacterPlugin.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    CharacterPlugin.prototype.init = function() {
      var annotation, _i, _len, _ref1, _results;
      this.name = 'CharacterPlugin';
      this.characterOntologySet = ["<http://dbpedia.org/ontology/FictionalCharacter>", "<http://dbpedia.org/class/yago/FictionalCharactersFromCalifornia>", "<http://dbpedia.org/class/yago/FictionalCharacter109587565>"];
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

    CharacterPlugin.prototype.handleAnnotation = function(annotation) {
      var _this = this;
      return annotation.entityPromise.done(function() {
        var annotationType, isCharacter, nonConcept, typeSet, widget, _i, _len, _ref1;
        isCharacter = false;
        typeSet = annotation.getType();
        for (_i = 0, _len = typeSet.length; _i < _len; _i++) {
          annotationType = typeSet[_i];
          if (_ref1 = annotationType.id, __indexOf.call(_this.characterOntologySet, _ref1) >= 0) {
            isCharacter = true;
          }
        }
        if (isCharacter) {
          nonConcept = annotation.getDescription();
          nonConcept = nonConcept.replace("No description found.", "");
          if (nonConcept.length >= 3) {
            widget = _this.lime.allocateWidgetSpace(_this, {
              thumbnail: "img/info.png",
              title: "" + (annotation.getLabel()) + " Info",
              type: "CharacterWidget",
              sortBy: function() {
                return 10000 * annotation.start + annotation.end;
              }
            });
            widget.annotation = annotation;
            jQuery(widget).bind('activate', function(e) {
              return _this.showAbstractInModalWindow(annotation, _this.getModalContainer());
            });
            annotation.widgets[_this.name] = widget;
            jQuery(annotation).bind("becomeActive", function(e) {
              return annotation.widgets[_this.name].setActive();
            });
            jQuery(annotation).bind("becomeInactive", function(e) {
              return annotation.widgets[_this.name].setInactive();
            });
            _this.getLSIImages(annotation);
            return jQuery(widget).bind("leftarrow", function(e) {
              return console.info('left arrow pressed', e);
            });
          }
        }
      });
    };

    CharacterPlugin.prototype.getLSIImages = function(annotation) {
      var _this = this;
      return this.lime.cmf.getLSIImagesForTerm(annotation.resource.value, function(err, res) {
        if (err) {
          return console.warn("Error getting LSI images resources", err);
        } else {
          console.info("LSI resources for", annotation, res);
          annotation.lsiImageResources = _(res).map(function(resultset) {
            var entity;
            entity = {
              image: resultset.image.value
            };
            return entity;
          });
          return annotation.getLsiImagesResources = function() {
            return this.lsiImageResources;
          };
        }
      });
    };

    CharacterPlugin.prototype.showAbstractInModalWindow = function(annotation, outputElement) {
      var comment, depiction, label, lime, lsiImageList, modalContent, page, result;
      modalContent = $(outputElement);
      modalContent.css("width", "600px");
      modalContent.css("height", "auto");
      label = annotation.getLabel();
      page = annotation.getPage();
      /*
      -- added 29.apr.2013 --
       LSIimages = list of images from the LSI that target the current annotation's DBPedia resource URI
       example:
       LAIImages = annotation.getLSIVideosFromTerm (annotation.resource.value,cb)
      
      a LSIImages can have the following structure:
      LSIImages = [
                    {
                    image:"imageURI",
                    hasKeyword: {"DBPedia resource URI 1", "DBPedia resource URI 2", "DBPedia resource URI 3", ... }
                    },
      
                    {
                    image:"imageURI",
                    hasKeyword: {"DBPedia resource URI 1", "DBPedia resource URI 2", "DBPedia resource URI 3", ... }
                    },
                    ...
                  ]
      */

      lime = this.lime;
      comment = annotation.getDescription();
      /*
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
      */

      depiction = annotation.getDepiction({
        without: 'thumb'
      });
      if (depiction === null) {
        depiction = "img/noimagenew.png";
      }
      lsiImageList = annotation.getLsiImagesResources();
      console.log("Asociated images ", label, lsiImageList);
      /*
        -- added 29.apr.2013 --
        Extend interface logic (below) to fit LSIImages by creating a new tile with 1 or more images
      
      if(secondarytext.length > 2)
        if(lsiImageList.length >0)
          result = """
                   <div id="infoWidgetExpanded" style="position: relative; height: 600px; width: auto; ">
                   <div id="infoMainText" style="position: relative; float: right; background-color: #242424; width: 300px; height: 600px; font-family: caviardreamsregular;">
                   <span style="color: #f1f1f1; float: left; position: absolute; z-index: 900; left: 2%; top: 2%; width: 96%; font-size: 25px; height: auto;">#{comment}</span>
                   <div style="position: absolute; z-index: 900; width: 100px; height: 50px; right: 0px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-size: contain; background-image: url('img/120px-DBpediaLogo.svg.png');"></div>
                   </div>
      
                   <div id="infoMainPicture" style="position: relative; float: right; width: 300px; height: 300px; background-color: #6ab1e7;">
                   <div id="pic" style="position: relative; float: left; height: 100%; background-image: url('#{depiction}'); background-repeat: no-repeat; background-position: center center; background-size: cover; width: 100%;">
                   <div id="icon" style="border-right: 1px dotted lightgray; float: left; background-color: #3f3e3e; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;">
                   <span style="position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);">i</span>
                   </div>
                   </div>
                   <div style="position: absolute; left: 0px; bottom: 0; width: 300px; height: 100px;">
                   <div id="titlebackground" style="float: left; position: absolute; z-index: 900; width: 100%; bottom: 0px; background-color: #000000; left: 0px; top: 0px; height: 100%; opacity: 0.5;">
                   </div>
                   <span id="titletext" style="font-family: CaviarDreamsBold; font-size: 29px; line-height: 140%; position: absolute; z-index: 900; left: 0px; width: 100%; bottom: 0px; height: 100%; color: #fcf7f7; opacity: 1.0;">#{label}</span></div>
                   </div>
      
                   <div id="infoSecondText" style=" display: none; font-family: CaviarDreamsRegular; font-size: 25px; color: #f1f1f1; position: relative; float: right; background-color: #242424; vertical-align: middle; width: 300px; height: 300px; text-align: left; line-height: 1.2;">
          #{secondarytext}
                   </div>
      
                   <div id="infoSecondPic" style="background-repeat: no-repeat; background-image: url('#{lsiImageList[0].image}'); background-position: center center; background-size: cover; position: relative; float: right; width: 300px; height: 300px;"></div>
      
      
                   </div>
                   """
        else
          result = """
                   <div id="infoWidgetExpanded" style="position: relative; height: 600px; width: auto; ">
                   <div id="infoMainText" style="position: relative; float: right; background-color: #242424; width: 300px; height: 600px; font-family: caviardreamsregular;">
                   <span style="color: #f1f1f1; float: left; position: absolute; z-index: 900; left: 2%; top: 2%; width: 96%; font-size: 25px; height: auto;">#{comment}</span>
                   <div style="position: absolute; z-index: 900; width: 100px; height: 50px; right: 0px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-size: contain; background-image: url('img/120px-DBpediaLogo.svg.png');"></div>
                   </div>
      
                   <div id="infoMainPicture" style="position: relative; float: right; width: 300px; height: 300px; background-color: #6ab1e7;">
                   <div id="pic" style="position: relative; float: left; height: 100%; background-image: url('#{depiction}'); background-repeat: no-repeat; background-position: center center; background-size: cover; width: 100%;">
                   <div id="icon" style="border-right: 1px dotted lightgray; float: left; background-color: #3f3e3e; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;">
                   <span style="position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);">i</span>
                   </div>
                   </div>
                   <div style="position: absolute; left: 0px; bottom: 0; width: 300px; height: 100px;">
                   <div id="titlebackground" style="float: left; position: absolute; z-index: 900; width: 100%; bottom: 0px; background-color: #000000; left: 0px; top: 0px; height: 100%; opacity: 0.5;">
                   </div>
                   <span id="titletext" style="font-family: CaviarDreamsBold; font-size: 29px; line-height: 140%; position: absolute; z-index: 900; left: 0px; width: 100%; bottom: 0px; height: 100%; color: #fcf7f7; opacity: 1.0;">#{label}</span></div>
                   </div>
      
                   <div id="infoSecondText" style="display: none; font-family: CaviarDreamsRegular; font-size: 25px; color: #f1f1f1; position: relative; float: right; background-color: #242424; vertical-align: middle; width: 300px; height: 300px; text-align: left; line-height: 1.2;">
          #{secondarytext}
                   </div>
      
                   <div id="infoSecondPic" style=" background-repeat: no-repeat; background-image: url('#{depiction}'); background-position: center center; background-size: cover; position: relative; float: right; width: 300px; height: 300px; opacity: 0;"></div>
      
      
                   </div>
                   """
      else
        if(lsiImageList.length >0)
          result = """
                   <div id="infoWidgetExpanded" style="position: relative; height: 600px; width: auto; ">
                   <div id="infoMainText" style="position: relative; float: right; background-color: #242424; width: 300px; height: 300px; font-family: caviardreamsregular;">
                   <span style="color: #f1f1f1; float: left; position: absolute; z-index: 900; left: 2%; top: 2%; width: 96%; font-size: 25px; height: auto;">#{maintext}</span>
                   <div style="position: absolute; z-index: 900; width: 100px; height: 50px; right: 0px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-size: contain; background-image: url('img/120px-DBpediaLogo.svg.png');"></div>
                   </div>
      
                   <div id="infoMainPicture" style="position: relative; float: right; width: 300px; height: 300px; background-color: #6ab1e7;">
                   <div id="pic" style="position: relative; float: left; height: 100%; background-image: url('#{depiction}'); background-repeat: no-repeat; background-position: center center; background-size: cover; width: 100%;">
                   <div id="icon" style="border-right: 1px dotted lightgray; float: left; background-color: #3f3e3e; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;">
                   <span style="position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);">i</span>
                   </div>
                   </div>
                   <div style="position: absolute; left: 0px; bottom: 0; width: 300px; height: 100px;">
                   <div id="titlebackground" style="float: left; position: absolute; z-index: 900; width: 100%; bottom: 0px; background-color: #000000; left: 0px; top: 0px; height: 100%; opacity: 0.5;">
                   </div>
                   <span id="titletext" style="font-family: CaviarDreamsBold; font-size: 29px; line-height: 140%; position: absolute; z-index: 900; left: 0px; width: 100%; bottom: 0px; height: 100%; color: #fcf7f7; opacity: 1.0;">#{label}</span></div>
                   </div>
      
                   <div id="infoSecondText" style="font-family: CaviarDreamsRegular; font-size: 25px; color: #f1f1f1; position: relative; float: right; background-color: #242424; vertical-align: middle; width: 300px; height: 300px; text-align: left; line-height: 1.2; display: none;">
      
                   </div>
      
                   <div id="infoSecondPic" style="background-repeat: no-repeat; background-image: url('#{lsiImageList[0].image}'); background-position: center center; background-size: cover; position: relative; float: right; width: 300px; height: 300px; display: block;"></div>
      
      
                   </div>
                   """
        else
          result = """
                   <div id="infoWidgetExpanded" style="position: relative; height: 600px; width: auto; ">
                   <div id="infoMainText" style="position: relative; float: right; background-color: #242424; width: 300px; height: 300px; font-family: caviardreamsregular;">
                   <span style="color: #f1f1f1; float: left; position: absolute; z-index: 900; left: 2%; top: 2%; width: 96%; font-size: 25px; height: auto;">#{maintext}</span>
                   <div style="position: absolute; z-index: 900; width: 100px; height: 50px; right: 0px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-size: contain; background-image: url('img/120px-DBpediaLogo.svg.png');"></div>
                   </div>
      
                   <div id="infoMainPicture" style="position: relative; float: right; width: 300px; height: 300px; background-color: #6ab1e7;">
                   <div id="pic" style="position: relative; float: left; height: 100%; background-image: url('#{depiction}'); background-repeat: no-repeat; background-position: center center; background-size: cover; width: 100%;">
                   <div id="icon" style="border-right: 1px dotted lightgray; float: left; background-color: #3f3e3e; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;">
                   <span style="position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);">i</span>
                   </div>
                   </div>
                   <div style="position: absolute; left: 0px; bottom: 0; width: 300px; height: 100px;">
                   <div id="titlebackground" style="float: left; position: absolute; z-index: 900; width: 100%; bottom: 0px; background-color: #000000; left: 0px; top: 0px; height: 100%; opacity: 0.5;">
                   </div>
                   <span id="titletext" style="font-family: CaviarDreamsBold; font-size: 29px; line-height: 140%; position: absolute; z-index: 900; left: 0px; width: 100%; bottom: 0px; height: 100%; color: #fcf7f7; opacity: 1.0;">#{label}</span></div>
                   </div>
      
                   <div id="infoSecondText" style="font-family: CaviarDreamsRegular; font-size: 25px; color: #f1f1f1; position: relative; float: right; background-color: #242424; vertical-align: middle; width: 300px; height: 300px; text-align: left; line-height: 1.2; display: none;">
      
                   </div>
      
                   <div id="infoSecondPic" style="background-repeat: no-repeat; background-image: url('#{depiction}'); background-position: center center; background-size: cover; position: relative; float: right; width: 300px; height: 300px; display: none;"></div>
      
      
                   </div>
                   """
      */

      result = "<div id=\"ifoWidgetExpanded\" style=\"border: 1px dotted lightgray; position: relative;height: auto; width: 600px;\">\n<div id=\"infoWidget\" style=\"background-color: rgba(37, 37, 37, 0.7); height: 40px; left: 0px; width: 100%; position: relative; float: left;\">\n    <div class=\"infoWidgeticon\" style=\"border-right: 1px dotted lightgray; position: relative; height: 100%; float: left; background-color: #3f3e3e; width: 8%;\">\n       <span data-dojo-type=\"shapes.Text\" id=\"iconLabel\" style=\"font: Times; position: relative; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: #f38f0b; font-family: 'Times New Roman',Times,serif; font-style: italic;\">i</span>\n    </div>\n    <div class=\"infoWidgetTitle\" style=\"font: Arial; position: relative; float: left; height: 100%; width: 86%; font-family: Arial,Helvetica,sans-serif; font-size: 26px; color: white; font-weight: normal; text-align: left; vertical-align: middle; text-indent: 1em; line-height: 140%;\">\n    " + label + "</div>\n    </div>\n<div id=\"infoText\" style=\"padding: 10px; position: relative; float: left; background-color: rgba(68, 68, 68, 0.7); height: auto; font-style: normal; width: 96%;\">\n    <div id=\"infoTextBioTitle\" style=\"font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange; height: auto;\">\n    Bio</div>\n    <div id=\"infoTextBio\" style=\"font: Helvetica; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; float: left; line-height: normal; position: relative; height: auto; width: 100%;\">\n    " + comment + "\n    </div>\n    <div id=\"infoTextCareerTitle\" style=\"font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange;\">\n    Movies</div>\n    <div id=\"infoTextCareer\" style=\"font: Helvetica; width: 100%; position: relative; float: left; height: auto; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; line-height: normal;\">\n    The Big Bang Theory</div>\n    <div id=\"infoTextAwardsTitle\" style=\"font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange;\">\n    Awards</div>\n    <div id=\"infoTextAwards\" style=\"font: Helvetica; width: 100%; position: relative; float: left; height: auto; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; line-height: normal;\">\n    Spaghetti Master</div>\n</div>\n</div>";
      return modalContent.append(result);
    };

    return CharacterPlugin;

  })(window.LimePlugin);

}).call(this);

(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.DBPediaInfoForTVPlugin = (function(_super) {
    __extends(DBPediaInfoForTVPlugin, _super);

    function DBPediaInfoForTVPlugin() {
      _ref = DBPediaInfoForTVPlugin.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    DBPediaInfoForTVPlugin.prototype.init = function() {
      var annotation, _i, _len, _ref1, _ref2, _results;
      this.name = 'DBPediaInfoForTVPlugin';
      console.info("Initialize " + this.name);
      _ref1 = this.lime.annotations;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        annotation = _ref1[_i];
        if (annotation.resource.value.indexOf("dbpedia") > 0 && ((_ref2 = annotation.relation.value) === 'http://connectme.at/ontology#explicitlyShows' || _ref2 === 'http://connectme.at/ontology#explicitlyMentions' || _ref2 === 'http://connectme.at/ontology#implicitlyShows' || _ref2 === 'http://connectme.at/ontology#implicitlyMentions')) {
          _results.push(this.handleAnnotation(annotation));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    DBPediaInfoForTVPlugin.prototype.handleAnnotation = function(annotation) {
      var _this = this;
      return annotation.entityPromise.done(function() {
        var nonConcept, widget;
        nonConcept = annotation.getDescription();
        nonConcept = nonConcept.replace("No description found.", "");
        if (nonConcept.length >= 3) {
          widget = _this.lime.allocateWidgetSpace(_this, {
            thumbnail: "img/info.png",
            title: "" + (annotation.getLabel()) + " Info",
            type: "DbpediaInfoForTVWidget",
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
          _this.getLSIImages(annotation);
          jQuery(widget).bind("leftarrow", function(e) {
            return jQuery("#lefticon").trigger('click');
          });
          return jQuery(widget).bind("rightarrow", function(e) {
            return jQuery("#righticon").trigger('click');
          });
        }
      });
    };

    DBPediaInfoForTVPlugin.prototype.getLSIImages = function(annotation) {
      var _this = this;
      return this.lime.cmf.getLSIImagesForTerm(annotation.resource.value, function(err, res) {
        if (err) {
          return console.warn("Error getting LSI images resources", err);
        } else {
          console.info("LSI resources for", annotation, res);
          annotation.lsiImageResources = _(res).map(function(resultset) {
            var entity;
            entity = {
              image: resultset.image.value
            };
            return entity;
          });
          return annotation.getLsiImagesResources = function() {
            return this.lsiImageResources;
          };
        }
      });
    };

    DBPediaInfoForTVPlugin.prototype.showAbstractInModalWindow = function(annotation, outputElement) {
      var comment, depiction, i, label, lime, lsiImageList, maintext, modalContent, n, page, pagetext, result, startTime, textsum, tmptext, word, _i, _len,
        _this = this;
      modalContent = jQuery(outputElement);
      modalContent.css("width", "450px");
      modalContent.css("height", "auto");
      this.index = 0;
      startTime = new Date().getTime();
      label = annotation.getLabel();
      page = annotation.getPage();
      /*
      -- added 29.apr.2013 --
       LSIimages = list of images from the LSI that target the current annotation's DBPedia resource URI
       example:
       LAIImages = annotation.getLSIVideosFromTerm (annotation.resource.value,cb)
      
      a LSIImages can have the following structure:
      LSIImages = [
                    {
                    image:"imageURI",
                    hasKeyword: {"DBPedia resource URI 1", "DBPedia resource URI 2", "DBPedia resource URI 3", ... }
                    },
      
                    {
                    image:"imageURI",
                    hasKeyword: {"DBPedia resource URI 1", "DBPedia resource URI 2", "DBPedia resource URI 3", ... }
                    },
                    ...
                  ]
      */

      lime = this.lime;
      comment = annotation.getDescription();
      maintext = comment;
      pagetext = [];
      if (maintext.length >= 260) {
        n = maintext.length;
        if (maintext.length >= 260) {
          tmptext = maintext.split(" ");
          n = tmptext.length;
          textsum = "";
          i = 0;
          for (_i = 0, _len = tmptext.length; _i < _len; _i++) {
            word = tmptext[_i];
            if (textsum.length < 260) {
              textsum += word + " ";
            } else {
              pagetext.push(textsum);
              textsum = "";
            }
          }
          maintext = pagetext[0];
        }
      }
      console.log(pagetext);
      depiction = annotation.getDepiction({
        without: 'thumb'
      });
      if (depiction === null) {
        depiction = "img/noimagenew.png";
      }
      lsiImageList = (typeof annotation.getLsiImagesResources === "function" ? annotation.getLsiImagesResources() : void 0) || [];
      console.log("Asociated images ", label, lsiImageList);
      /*
        -- added 29.apr.2013 --
        Extend interface logic (below) to fit LSIImages by creating a new tile with 1 or more images
      */

      if (pagetext.length < 1) {
        result = "         <div id=\"ifoWidgetExpanded\" style=\"border: 1px dotted lightgray; position: relative;height: auto; width: 100%;\">\n         <div id=\"infoWidget\" style=\"background-color: rgba(37, 37, 37, 0.7); height: 40px; left: 0px; width: 100%; position: relative; float: left;\">\n         <div class=\"infoWidgeticon\" style=\"border-right: 1px dotted lightgray; position: relative; height: 100%; float: left; background-color: #3f3e3e; width: 8%;\">\n         <span id=\"iconLabel\" style=\"font: Times; position: relative; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(82, 207, 255); font-family: 'Times New Roman',Times,serif; font-style: italic;\">i</span>\n         </div>\n         <div class=\"infoWidgetTitle\" style=\"font: Arial; position: relative; float: left; height: 100%; width: 86%; font-family: Arial,Helvetica,sans-serif; font-size: 26px; color: white; font-weight: normal; text-align: left; vertical-align: middle; text-indent: 1em; line-height: 140%;\">\n" + label + "</div>\n         </div>\n         <div id=\"infoText\" style=\"padding: 10px; position: relative; float: left; background-color: rgba(68, 68, 68, 0.7); height: auto; font-style: normal; width: 96%;\">\n         <div id=\"infoTextBioTitle\" style=\"font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: rgb(82, 207, 255); height: auto;\">\n         Info</div>\n         <div id=\"infoMainTextContent\" style=\"font: Helvetica; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; float: left; line-height: normal; position: relative; height: auto; width: 100%;\">\n" + maintext + "\n         </div>\n         </div>\n         </div>";
        /*
        result = """
                 <div id="infoWidgetExpanded" unselectable="on" style="-webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; position: relative; height: 600px; width: auto; ">
                 <div id="infoMainText" style="position: relative; float: right; background-color: #242424; width: 300px; height: 300px; font-family: caviardreamsregular;">
                 <span id="infoMainTextContent" >#{maintext}</span>
                 <div style="position: absolute; z-index: 900; width: 100px; height: 50px; right: 0px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-size: contain; background-image: url('img/120px-DBpediaLogo.svg.png');"></div>
                 </div>
        
                 <div id="infoMainPicture" style="position: relative; float: right; width: 300px; height: 300px; background-color: #6ab1e7;">
                 <div id="pic" style="position: relative; float: left; height: 100%; background-image: url('#{depiction}'); background-repeat: no-repeat; background-position: center center; background-size: cover; width: 100%;">
                 <div id="icon" style="border-right: 1px dotted lightgray; float: left; background-color: #3f3e3e; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;">
                 <span style="text-align:center; position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);">i</span>
                 </div>
                 </div>
                 <div style="position: absolute; left: 0px; bottom: 0; width: 300px; height: 100px;">
                 <div id="titlebackground" style="float: left; position: absolute; z-index: 900; width: 100%; bottom: 0px; background-color: #000000; left: 0px; top: 0px; height: 100%; opacity: 0.5;">
                 </div>
                 <span id="titletext" style="text-align:center; font-family: CaviarDreamsBold; font-size: 29px; line-height: 140%; position: absolute; z-index: 900; left: 5px; width: 100%; bottom: 0px; height: 100%; color: #fcf7f7; opacity: 1.0;">#{label}</span></div>
                 </div>
        
                 </div>
                 """
        */

      } else {
        /*
        result = """
                 <div id="infoWidgetExpanded" unselectable="on" style="-webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; position: relative; height: 600px; width: auto; ">
                 <div id="infoMainText" style="position: relative; float: right; background-color: #242424; width: 300px; height: 300px; font-family: caviardreamsregular;">
                 <span id="infoMainTextContent" >#{pagetext[@index]}</span>
                 <div style="position: absolute; z-index: 900; width: 100px; height: 50px; left: 0px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-size: contain; background-image: url('img/120px-DBpediaLogo.svg.png'); background-color: #3f3e3e;"></div>
                 <div id="pageNumber" style="position: absolute; z-index: 900; width: 50px; height: 35px; left: 135px; bottom: 0px; background: transparent;">#{@index+1}/#{pagetext.length}</div>
                 <div id="righticon" unselectable="on" style=" -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;cursor: hand; cursor: pointer; border-right: 1px dotted lightgray; background-color: #000000; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;">
                 <span style="position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);">&gt;</span>
                 </div>
                 </div>
        
                 <div id="infoMainPicture" style="position: relative; float: right; width: 300px; height: 300px; background-color: #6ab1e7;">
                 <div id="pic" style="position: relative; float: left; height: 100%; background-image: url('#{depiction}'); background-repeat: no-repeat; background-position: center center; background-size: cover; width: 100%;">
                 <div id="icon" style="border-right: 1px dotted lightgray; float: left; background-color: #3f3e3e; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;">
                 <span style="position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);">i</span>
                 </div>
                 <div id="lefticon" unselectable="on" style="-webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; cursor: hand; cursor: pointer; display: none; border-left: 1px dotted lightgray; background-color: #000000; position: absolute; z-index: 9000; left: 0px; bottom: 0px; width: 50px; height: 50px;">
                 <span style="position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);">&lt;</span>
                 </div>
                 </div>
                 <div style="position: absolute; left: 0px; bottom: 0; width: 300px; height: 100px;">
                 <div id="titlebackground" style="float: left; position: absolute; z-index: 900; width: 100%; bottom: 0px; background-color: #000000; left: 0px; top: 0px; height: 100%; opacity: 0.5;">
                 </div>
                 <span id="titletext" style="text-align:center; font-family: CaviarDreamsBold; font-size: 29px; line-height: 140%; position: absolute; z-index: 900; left: 5px; width: 100%; bottom: 0px; height: 100%; color: #fcf7f7; opacity: 1.0;">#{label}</span></div>
                 </div>
        
        
                 </div>
                 """
        */

        result = "         <div id=\"ifoWidgetExpanded\" style=\"border: 1px dotted lightgray; position: relative;height: auto; width: 100%;\">\n         <div id=\"infoWidget\" style=\"background-color: rgba(37, 37, 37, 0.7); height: 40px; left: 0px; width: 100%; position: relative; float: left;\">\n         <div class=\"infoWidgeticon\" style=\"border-right: 1px dotted lightgray; position: relative; height: 100%; float: left; background-color: #3f3e3e; width: 8%;\">\n         <span data-dojo-type=\"shapes.Text\" id=\"iconLabel\" style=\"font: Times; position: relative; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(82, 207, 255); font-family: 'Times New Roman',Times,serif; font-style: italic;\">i</span>\n         </div>\n         <div class=\"infoWidgetTitle\" style=\"font: Arial; position: relative; float: left; height: 100%; width: 86%; font-family: Arial,Helvetica,sans-serif; font-size: 26px; color: white; font-weight: normal; text-align: left; vertical-align: middle; text-indent: 1em; line-height: 140%;\">\n" + label + "</div>\n         </div>\n         <div id=\"infoText\" style=\"padding: 10px; position: relative; float: left; background-color: rgba(68, 68, 68, 0.7); height: auto; font-style: normal; width: 96%;\">\n         <div id=\"infoTextBioTitle\" style=\"font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: rgb(82, 207, 255); height: auto;\">\n         Info</div>\n           <div id=\"infoMainTextContent\" style=\"font: Helvetica; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; float: left; line-height: normal; position: relative; height: auto; width: 100%;\">\n" + pagetext[this.index] + "\n           </div>\n         <div id=\"widgetControler\" style=\"position: relative; height: 60px; width: 100%; float:left\">\n         </div>\n\n         <div id=\"righticon\" unselectable=\"on\" style=\" -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;cursor: hand; cursor: pointer; border-right: 1px dotted lightgray; background-color: #000000; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;\">\n         <span style=\"position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(82, 207, 255);\">&gt;</span>\n         </div>\n         <div id=\"lefticon\" unselectable=\"on\" style=\"-webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; cursor: hand; cursor: pointer; display: none; border-left: 1px dotted lightgray; background-color: #000000; position: absolute; z-index: 9000; left: 0px; bottom: 0px; width: 50px; height: 50px;\">\n         <span style=\"position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(82, 207, 255);\">&lt;</span>\n         </div>\n         <div id=\"pageNumber\" style=\"position: absolute; z-index: 900; width: 50px; height: 35px; left: 45%; bottom: 0px; background: transparent;\">" + (this.index + 1) + "/" + pagetext.length + "</div>\n        </div>\n        </div>";
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
      jQuery('#righticon').click(function() {
        _this.index++;
        if (_this.index === 1) {
          jQuery('#lefticon').css("display", "block");
        }
        if (_this.index >= pagetext.length - 1) {
          _this.index = pagetext.length - 1;
          jQuery('#righticon').css("display", "none");
        }
        maintext = pagetext[_this.index];
        jQuery("#infoMainTextContent").text(maintext);
        return jQuery("#pageNumber").text("" + (_this.index + 1) + "/" + pagetext.length);
      });
      return jQuery('#lefticon').click(function() {
        _this.index--;
        if (_this.index === pagetext.length - 2) {
          jQuery('#righticon').css("display", "block");
        }
        if (_this.index <= 0) {
          _this.index = 0;
          jQuery('#lefticon').css("display", "none");
        }
        maintext = pagetext[_this.index];
        jQuery("#infoMainTextContent").text(maintext);
        return jQuery("#pageNumber").text("" + (_this.index + 1) + "/" + pagetext.length);
      });
    };

    return DBPediaInfoForTVPlugin;

  })(window.LimePlugin);

}).call(this);

(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.DBPediaInfoPlugin = (function(_super) {
    __extends(DBPediaInfoPlugin, _super);

    function DBPediaInfoPlugin() {
      _ref = DBPediaInfoPlugin.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    DBPediaInfoPlugin.prototype.init = function() {
      var annotation, _i, _len, _ref1, _ref2, _results;
      this.name = 'DBPediaInfoPlugin';
      console.info("Initialize " + this.name);
      _ref1 = this.lime.annotations;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        annotation = _ref1[_i];
        if (annotation.resource.value.indexOf("dbpedia") > 0 && ((_ref2 = annotation.relation.value) === 'http://connectme.at/ontology#explicitlyShows' || _ref2 === 'http://connectme.at/ontology#explicitlyMentions' || _ref2 === 'http://connectme.at/ontology#implicitlyShows' || _ref2 === 'http://connectme.at/ontology#implicitlyMentions')) {
          _results.push(this.handleAnnotation(annotation));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    DBPediaInfoPlugin.prototype.handleAnnotation = function(annotation) {
      var _this = this;
      return annotation.entityPromise.done(function() {
        var nonConcept, widget;
        nonConcept = annotation.getDescription();
        nonConcept = nonConcept.replace("No description found.", "");
        if (nonConcept.length >= 3) {
          widget = _this.lime.allocateWidgetSpace(_this, {
            thumbnail: "img/info.png",
            title: "" + (annotation.getLabel()) + " Info",
            type: "DbpediaInfoWidget",
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
          _this.getLSIImages(annotation);
          jQuery(widget).bind("leftarrow", function(e) {
            return jQuery("#lefticon").trigger('click');
          });
          return jQuery(widget).bind("rightarrow", function(e) {
            return jQuery("#righticon").trigger('click');
          });
        }
      });
    };

    DBPediaInfoPlugin.prototype.getLSIImages = function(annotation) {
      var _this = this;
      return this.lime.cmf.getLSIImagesForTerm(annotation.resource.value, function(err, res) {
        if (err) {
          return console.warn("Error getting LSI images resources", err);
        } else {
          console.info("LSI resources for", annotation, res);
          annotation.lsiImageResources = _(res).map(function(resultset) {
            var entity;
            entity = {
              image: resultset.image.value
            };
            return entity;
          });
          return annotation.getLsiImagesResources = function() {
            return this.lsiImageResources;
          };
        }
      });
    };

    DBPediaInfoPlugin.prototype.showAbstractInModalWindow = function(annotation, outputElement) {
      var comment, depiction, i, label, lime, lsiImageList, maintext, modalContent, n, page, pagetext, result, startTime, textsum, tmptext, word, _i, _len,
        _this = this;
      modalContent = jQuery(outputElement);
      modalContent.css("width", "600px");
      modalContent.css("height", "auto");
      this.index = 0;
      startTime = new Date().getTime();
      label = annotation.getLabel();
      page = annotation.getPage();
      /*
      -- added 29.apr.2013 --
       LSIimages = list of images from the LSI that target the current annotation's DBPedia resource URI
       example:
       LAIImages = annotation.getLSIVideosFromTerm (annotation.resource.value,cb)
      
      a LSIImages can have the following structure:
      LSIImages = [
                    {
                    image:"imageURI",
                    hasKeyword: {"DBPedia resource URI 1", "DBPedia resource URI 2", "DBPedia resource URI 3", ... }
                    },
      
                    {
                    image:"imageURI",
                    hasKeyword: {"DBPedia resource URI 1", "DBPedia resource URI 2", "DBPedia resource URI 3", ... }
                    },
                    ...
                  ]
      */

      lime = this.lime;
      comment = annotation.getDescription();
      maintext = comment;
      pagetext = [];
      if (maintext.length >= 260) {
        n = maintext.length;
        if (maintext.length >= 260) {
          tmptext = maintext.split(" ");
          n = tmptext.length;
          textsum = "";
          i = 0;
          for (_i = 0, _len = tmptext.length; _i < _len; _i++) {
            word = tmptext[_i];
            if (textsum.length < 260) {
              textsum += word + " ";
            } else {
              pagetext.push(textsum);
              textsum = "";
            }
          }
          maintext = pagetext[0];
        }
      }
      console.log(pagetext);
      depiction = annotation.getDepiction({
        without: 'thumb'
      });
      if (depiction === null) {
        depiction = "img/noimagenew.png";
      }
      lsiImageList = (typeof annotation.getLsiImagesResources === "function" ? annotation.getLsiImagesResources() : void 0) || [];
      console.log("Asociated images ", label, lsiImageList);
      /*
        -- added 29.apr.2013 --
        Extend interface logic (below) to fit LSIImages by creating a new tile with 1 or more images
      */

      if (pagetext.length < 1) {
        result = "<div id=\"infoWidgetExpanded\" unselectable=\"on\" style=\"-webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; position: relative; height: 600px; width: auto; \">\n<div id=\"infoMainText\" style=\"position: relative; float: right; background-color: #242424; width: 300px; height: 300px; font-family: caviardreamsregular;\">\n<span id=\"infoMainTextContent\" >" + maintext + "</span>\n<div style=\"position: absolute; z-index: 900; width: 100px; height: 50px; right: 0px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-size: contain; background-image: url('img/120px-DBpediaLogo.svg.png');\"></div>\n</div>\n\n<div id=\"infoMainPicture\" style=\"position: relative; float: right; width: 300px; height: 300px; background-color: #6ab1e7;\">\n   <div id=\"pic\" style=\"position: relative; float: left; height: 100%; background-image: url('" + depiction + "'); background-repeat: no-repeat; background-position: center center; background-size: cover; width: 100%;\">\n    <div id=\"icon\" style=\"border-right: 1px dotted lightgray; float: left; background-color: #3f3e3e; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;\">\n    <span style=\"text-align:center; position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);\">i</span>\n    </div>\n    </div>\n    <div style=\"position: absolute; left: 0px; bottom: 0; width: 300px; height: 100px;\">\n    <div id=\"titlebackground\" style=\"float: left; position: absolute; z-index: 900; width: 100%; bottom: 0px; background-color: #000000; left: 0px; top: 0px; height: 100%; opacity: 0.5;\">\n    </div>\n  <span id=\"titletext\" style=\"text-align:center; font-family: CaviarDreamsBold; font-size: 29px; line-height: 140%; position: absolute; z-index: 900; left: 5px; width: 100%; bottom: 0px; height: 100%; color: #fcf7f7; opacity: 1.0;\">" + label + "</span></div>\n </div>\n\n</div>";
      } else {
        result = "<div id=\"infoWidgetExpanded\" unselectable=\"on\" style=\"-webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; position: relative; height: 600px; width: auto; \">\n<div id=\"infoMainText\" style=\"position: relative; float: right; background-color: #242424; width: 300px; height: 300px; font-family: caviardreamsregular;\">\n<span id=\"infoMainTextContent\" >" + pagetext[this.index] + "</span>\n<div style=\"position: absolute; z-index: 900; width: 100px; height: 50px; left: 0px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-size: contain; background-image: url('img/120px-DBpediaLogo.svg.png'); background-color: #3f3e3e;\"></div>\n<div id=\"pageNumber\" style=\"position: absolute; z-index: 900; width: 50px; height: 35px; left: 135px; bottom: 0px; background: transparent;\">" + (this.index + 1) + "/" + pagetext.length + "</div>\n<div id=\"righticon\" unselectable=\"on\" style=\" -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;cursor: hand; cursor: pointer; border-right: 1px dotted lightgray; background-color: #000000; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;\">\n<span style=\"position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);\">&gt;</span>\n</div>\n</div>\n\n<div id=\"infoMainPicture\" style=\"position: relative; float: right; width: 300px; height: 300px; background-color: #6ab1e7;\">\n<div id=\"pic\" style=\"position: relative; float: left; height: 100%; background-image: url('" + depiction + "'); background-repeat: no-repeat; background-position: center center; background-size: cover; width: 100%;\">\n<div id=\"icon\" style=\"border-right: 1px dotted lightgray; float: left; background-color: #3f3e3e; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;\">\n<span style=\"position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);\">i</span>\n</div>\n<div id=\"lefticon\" unselectable=\"on\" style=\"-webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; cursor: hand; cursor: pointer; display: none; border-left: 1px dotted lightgray; background-color: #000000; position: absolute; z-index: 9000; left: 0px; bottom: 0px; width: 50px; height: 50px;\">\n<span style=\"position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);\">&lt;</span>\n</div>\n</div>\n<div style=\"position: absolute; left: 0px; bottom: 0; width: 300px; height: 100px;\">\n<div id=\"titlebackground\" style=\"float: left; position: absolute; z-index: 900; width: 100%; bottom: 0px; background-color: #000000; left: 0px; top: 0px; height: 100%; opacity: 0.5;\">\n</div>\n<span id=\"titletext\" style=\"text-align:center; font-family: CaviarDreamsBold; font-size: 29px; line-height: 140%; position: absolute; z-index: 900; left: 5px; width: 100%; bottom: 0px; height: 100%; color: #fcf7f7; opacity: 1.0;\">" + label + "</span></div>\n</div>\n\n\n</div>";
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
      jQuery('#righticon').click(function() {
        _this.index++;
        if (_this.index === 1) {
          jQuery('#lefticon').css("display", "block");
        }
        if (_this.index >= pagetext.length - 1) {
          _this.index = pagetext.length - 1;
          jQuery('#righticon').css("display", "none");
        }
        maintext = pagetext[_this.index];
        jQuery("#infoMainTextContent").text(maintext);
        return jQuery("#pageNumber").text("" + (_this.index + 1) + "/" + pagetext.length);
      });
      return jQuery('#lefticon').click(function() {
        _this.index--;
        if (_this.index === pagetext.length - 2) {
          jQuery('#righticon').css("display", "block");
        }
        if (_this.index <= 0) {
          _this.index = 0;
          jQuery('#lefticon').css("display", "none");
        }
        maintext = pagetext[_this.index];
        jQuery("#infoMainTextContent").text(maintext);
        return jQuery("#pageNumber").text("" + (_this.index + 1) + "/" + pagetext.length);
      });
    };

    return DBPediaInfoPlugin;

  })(window.LimePlugin);

}).call(this);

(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.DBPediaInfoPlugin = (function(_super) {
    __extends(DBPediaInfoPlugin, _super);

    function DBPediaInfoPlugin() {
      _ref = DBPediaInfoPlugin.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    DBPediaInfoPlugin.prototype.init = function() {
      var annotation, _i, _len, _ref1, _ref2, _results;
      this.name = 'DBPediaInfoPlugin';
      console.info("Initialize " + this.name);
      _ref1 = this.lime.annotations;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        annotation = _ref1[_i];
        if (annotation.resource.value.indexOf("dbpedia") > 0 && ((_ref2 = annotation.relation.value) === 'http://connectme.at/ontology#explicitlyShows' || _ref2 === 'http://connectme.at/ontology#explicitlyMentions' || _ref2 === 'http://connectme.at/ontology#implicitlyShows' || _ref2 === 'http://connectme.at/ontology#implicitlyMentions')) {
          _results.push(this.handleAnnotation(annotation));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    DBPediaInfoPlugin.prototype.handleAnnotation = function(annotation) {
      var _this = this;
      return annotation.entityPromise.done(function() {
        var nonConcept, widget;
        nonConcept = annotation.getDescription();
        nonConcept = nonConcept.replace("No description found.", "");
        if (nonConcept.length >= 3) {
          widget = _this.lime.allocateWidgetSpace(_this, {
            thumbnail: "img/info.png",
            title: "" + (annotation.getLabel()) + " Info",
            type: "DbpediaInfoWidget",
            sortBy: function() {
              return 10000 * annotation.start + annotation.end;
            }
          });
          widget.annotation = annotation;
          jQuery(widget).bind('activate', function(e) {
            return _this.showAbstractInModalWindow(annotation, _this.getModalContainer());
          });
          annotation.widgets[_this.name] = widget;
          jQuery(annotation).bind("becomeActive", function(e) {
            return annotation.widgets[_this.name].setActive();
          });
          jQuery(annotation).bind("becomeInactive", function(e) {
            return annotation.widgets[_this.name].setInactive();
          });
          _this.getLSIImages(annotation);
          return jQuery(widget).bind("leftarrow", function(e) {
            return console.info('left arrow pressed', e);
          });
        }
      });
    };

    DBPediaInfoPlugin.prototype.getLSIImages = function(annotation) {
      var _this = this;
      return this.lime.cmf.getLSIImagesForTerm(annotation.resource.value, function(err, res) {
        if (err) {
          return console.warn("Error getting LSI images resources", err);
        } else {
          console.info("LSI resources for", annotation, res);
          annotation.lsiImageResources = _(res).map(function(resultset) {
            var entity;
            entity = {
              image: resultset.image.value
            };
            return entity;
          });
          return annotation.getLsiImagesResources = function() {
            return this.lsiImageResources;
          };
        }
      });
    };

    DBPediaInfoPlugin.prototype.showAbstractInModalWindow = function(annotation, outputElement) {
      var comment, depiction, i, label, lime, lsiImageList, maintext, modalContent, n, page, result, secondarytext, startTime, textsum, tmptext, y,
        _this = this;
      modalContent = $(outputElement);
      modalContent.css("width", "600px");
      modalContent.css("height", "auto");
      startTime = new Date().getTime();
      label = annotation.getLabel();
      page = annotation.getPage();
      /*
      -- added 29.apr.2013 --
       LSIimages = list of images from the LSI that target the current annotation's DBPedia resource URI
       example:
       LAIImages = annotation.getLSIVideosFromTerm (annotation.resource.value,cb)
      
      a LSIImages can have the following structure:
      LSIImages = [
                    {
                    image:"imageURI",
                    hasKeyword: {"DBPedia resource URI 1", "DBPedia resource URI 2", "DBPedia resource URI 3", ... }
                    },
      
                    {
                    image:"imageURI",
                    hasKeyword: {"DBPedia resource URI 1", "DBPedia resource URI 2", "DBPedia resource URI 3", ... }
                    },
                    ...
                  ]
      */

      lime = this.lime;
      comment = annotation.getDescription();
      maintext = comment;
      secondarytext = "";
      if (maintext.length >= 240) {
        n = maintext.length;
        if (maintext.length >= 240) {
          tmptext = maintext.split(" ");
          n = tmptext.length;
          textsum = "";
          i = 0;
          while (textsum.length < 200) {
            textsum += tmptext[i] + " ";
            i++;
          }
          maintext = textsum;
          y = i;
          while (y < n) {
            secondarytext += tmptext[y] + " ";
            y++;
          }
        }
      }
      depiction = annotation.getDepiction({
        without: 'thumb'
      });
      if (depiction === null) {
        depiction = "img/noimagenew.png";
      }
      lsiImageList = (typeof annotation.getLsiImagesResources === "function" ? annotation.getLsiImagesResources() : void 0) || [];
      console.log("Asociated images ", label, lsiImageList);
      /*
        -- added 29.apr.2013 --
        Extend interface logic (below) to fit LSIImages by creating a new tile with 1 or more images
      */

      if (secondarytext.length > 2) {
        if (lsiImageList.length > 0) {
          result = "         <div id=\"infoWidgetExpanded\" style=\"position: relative; height: 600px; width: auto; \">\n         <div id=\"infoMainText\" style=\"position: relative; float: right; background-color: #242424; width: 300px; height: 600px; font-family: caviardreamsregular;\">\n         <span style=\"color: #f1f1f1; float: left; position: absolute; z-index: 900; left: 2%; top: 2%; width: 96%; font-size: 25px; height: auto;\">" + comment + "</span>\n         <div style=\"position: absolute; z-index: 900; width: 100px; height: 50px; right: 0px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-size: contain; background-image: url('img/120px-DBpediaLogo.svg.png');\"></div>\n         </div>\n\n         <div id=\"infoMainPicture\" style=\"position: relative; float: right; width: 300px; height: 300px; background-color: #6ab1e7;\">\n         <div id=\"pic\" style=\"position: relative; float: left; height: 100%; background-image: url('" + depiction + "'); background-repeat: no-repeat; background-position: center center; background-size: cover; width: 100%;\">\n         <div id=\"icon\" style=\"border-right: 1px dotted lightgray; float: left; background-color: #3f3e3e; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;\">\n         <span style=\"position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);\">i</span>\n         </div>\n         </div>\n         <div style=\"position: absolute; left: 0px; bottom: 0; width: 300px; height: 100px;\">\n         <div id=\"titlebackground\" style=\"float: left; position: absolute; z-index: 900; width: 100%; bottom: 0px; background-color: #000000; left: 0px; top: 0px; height: 100%; opacity: 0.5;\">\n         </div>\n         <span id=\"titletext\" style=\"font-family: CaviarDreamsBold; font-size: 29px; line-height: 140%; position: absolute; z-index: 900; left: 5px; width: 100%; bottom: 0px; height: 100%; color: #fcf7f7; opacity: 1.0;\">" + label + "</span></div>\n         </div>\n\n         <div id=\"infoSecondText\" style=\" display: none; font-family: CaviarDreamsRegular; font-size: 25px; color: #f1f1f1; position: relative; float: right; background-color: #242424; vertical-align: middle; width: 300px; height: 300px; text-align: left; line-height: 1.2;\">\n" + secondarytext + "\n         </div>\n\n         <div id=\"infoSecondPic\" style=\"background-repeat: no-repeat; background-image: url('" + lsiImageList[0].image + "'); background-position: center center; background-size: cover; position: relative; float: right; width: 300px; height: 300px;\"></div>\n\n\n         </div>";
        } else {
          result = "         <div id=\"infoWidgetExpanded\" style=\"position: relative; height: 600px; width: auto; \">\n         <div id=\"infoMainText\" style=\"position: relative; float: right; background-color: #242424; width: 300px; height: 600px; font-family: caviardreamsregular;\">\n         <span style=\"color: #f1f1f1; float: left; position: absolute; z-index: 900; left: 2%; top: 2%; width: 96%; font-size: 25px; height: auto;\">" + comment + "</span>\n         <div style=\"position: absolute; z-index: 900; width: 100px; height: 50px; right: 0px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-size: contain; background-image: url('img/120px-DBpediaLogo.svg.png');\"></div>\n         </div>\n\n         <div id=\"infoMainPicture\" style=\"position: relative; float: right; width: 300px; height: 300px; background-color: #6ab1e7;\">\n         <div id=\"pic\" style=\"position: relative; float: left; height: 100%; background-image: url('" + depiction + "'); background-repeat: no-repeat; background-position: center center; background-size: cover; width: 100%;\">\n         <div id=\"icon\" style=\"border-right: 1px dotted lightgray; float: left; background-color: #3f3e3e; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;\">\n         <span style=\"position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);\">i</span>\n         </div>\n         </div>\n         <div style=\"position: absolute; left: 0px; bottom: 0; width: 300px; height: 100px;\">\n         <div id=\"titlebackground\" style=\"float: left; position: absolute; z-index: 900; width: 100%; bottom: 0px; background-color: #000000; left: 0px; top: 0px; height: 100%; opacity: 0.5;\">\n         </div>\n         <span id=\"titletext\" style=\"font-family: CaviarDreamsBold; font-size: 29px; line-height: 140%; position: absolute; z-index: 900; left: 5px; width: 100%; bottom: 0px; height: 100%; color: #fcf7f7; opacity: 1.0;\">" + label + "</span></div>\n         </div>\n\n         <div id=\"infoSecondText\" style=\"display: none; font-family: CaviarDreamsRegular; font-size: 25px; color: #f1f1f1; position: relative; float: right; background-color: #242424; vertical-align: middle; width: 300px; height: 300px; text-align: left; line-height: 1.2;\">\n" + secondarytext + "\n         </div>\n\n         <div id=\"infoSecondPic\" style=\" background-repeat: no-repeat; background-image: url('" + depiction + "'); background-position: center center; background-size: cover; position: relative; float: right; width: 300px; height: 300px; opacity: 0;\"></div>\n\n\n         </div>";
        }
      } else {
        if (lsiImageList.length > 0) {
          result = "<div id=\"infoWidgetExpanded\" style=\"position: relative; height: 600px; width: auto; \">\n<div id=\"infoMainText\" style=\"position: relative; float: right; background-color: #242424; width: 300px; height: 300px; font-family: caviardreamsregular;\">\n<span style=\"color: #f1f1f1; float: left; position: absolute; z-index: 900; left: 2%; top: 2%; width: 96%; font-size: 25px; height: auto;\">" + maintext + "</span>\n<div style=\"position: absolute; z-index: 900; width: 100px; height: 50px; right: 0px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-size: contain; background-image: url('img/120px-DBpediaLogo.svg.png');\"></div>\n</div>\n\n<div id=\"infoMainPicture\" style=\"position: relative; float: right; width: 300px; height: 300px; background-color: #6ab1e7;\">\n<div id=\"pic\" style=\"position: relative; float: left; height: 100%; background-image: url('" + depiction + "'); background-repeat: no-repeat; background-position: center center; background-size: cover; width: 100%;\">\n<div id=\"icon\" style=\"border-right: 1px dotted lightgray; float: left; background-color: #3f3e3e; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;\">\n<span style=\"position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);\">i</span>\n</div>\n</div>\n<div style=\"position: absolute; left: 0px; bottom: 0; width: 300px; height: 100px;\">\n<div id=\"titlebackground\" style=\"float: left; position: absolute; z-index: 900; width: 100%; bottom: 0px; background-color: #000000; left: 0px; top: 0px; height: 100%; opacity: 0.5;\">\n</div>\n<span id=\"titletext\" style=\"font-family: CaviarDreamsBold; font-size: 29px; line-height: 140%; position: absolute; z-index: 900; left: 5px; width: 100%; bottom: 0px; height: 100%; color: #fcf7f7; opacity: 1.0;\">" + label + "</span></div>\n</div>\n\n<div id=\"infoSecondText\" style=\"font-family: CaviarDreamsRegular; font-size: 25px; color: #f1f1f1; position: relative; float: right; background-color: #242424; vertical-align: middle; width: 300px; height: 300px; text-align: left; line-height: 1.2; display: none;\">\n\n</div>\n\n<div id=\"infoSecondPic\" style=\"background-repeat: no-repeat; background-image: url('" + lsiImageList[0].image + "'); background-position: center center; background-size: cover; position: relative; float: right; width: 300px; height: 300px; display: block;\"></div>\n\n\n</div>";
        } else {
          result = "<div id=\"infoWidgetExpanded\" style=\"position: relative; height: 600px; width: auto; \">\n<div id=\"infoMainText\" style=\"position: relative; float: right; background-color: #242424; width: 300px; height: 300px; font-family: caviardreamsregular;\">\n<span style=\"color: #f1f1f1; float: left; position: absolute; z-index: 900; left: 2%; top: 2%; width: 96%; font-size: 25px; height: auto;\">" + maintext + "</span>\n<div style=\"position: absolute; z-index: 900; width: 100px; height: 50px; right: 0px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-size: contain; background-image: url('img/120px-DBpediaLogo.svg.png');\"></div>\n</div>\n\n<div id=\"infoMainPicture\" style=\"position: relative; float: right; width: 300px; height: 300px; background-color: #6ab1e7;\">\n<div id=\"pic\" style=\"position: relative; float: left; height: 100%; background-image: url('" + depiction + "'); background-repeat: no-repeat; background-position: center center; background-size: cover; width: 100%;\">\n<div id=\"icon\" style=\"border-right: 1px dotted lightgray; float: left; background-color: #3f3e3e; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;\">\n<span style=\"position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);\">i</span>\n</div>\n</div>\n<div style=\"position: absolute; left: 0px; bottom: 0; width: 300px; height: 100px;\">\n<div id=\"titlebackground\" style=\"float: left; position: absolute; z-index: 900; width: 100%; bottom: 0px; background-color: #000000; left: 0px; top: 0px; height: 100%; opacity: 0.5;\">\n</div>\n<span id=\"titletext\" style=\"font-family: CaviarDreamsBold; font-size: 29px; line-height: 140%; position: absolute; z-index: 900; left: 5px; width: 100%; bottom: 0px; height: 100%; color: #fcf7f7; opacity: 1.0;\">" + label + "</span></div>\n</div>\n\n<div id=\"infoSecondText\" style=\"font-family: CaviarDreamsRegular; font-size: 25px; color: #f1f1f1; position: relative; float: right; background-color: #242424; vertical-align: middle; width: 300px; height: 300px; text-align: left; line-height: 1.2; display: none;\">\n\n</div>\n\n<div id=\"infoSecondPic\" style=\"background-repeat: no-repeat; background-image: url('" + depiction + "'); background-position: center center; background-size: cover; position: relative; float: right; width: 300px; height: 300px; display: none;\"></div>\n\n\n</div>";
        }
      }
      modalContent.append(result);
      $(".close").click(function(e) {
        var endTime, eventLabel, timeSpent;
        endTime = new Date().getTime();
        timeSpent = endTime - startTime;
        eventLabel = annotation.widgets[_this.name].options.title;
        return console.log(": " + eventLabel + " was viewed " + timeSpent + " msec.");
      });
      return $('#mask').click(function(e) {
        var endTime, eventLabel, timeSpent;
        endTime = new Date().getTime();
        timeSpent = endTime - startTime;
        eventLabel = annotation.widgets[_this.name].options.title;
        return console.log(": " + eventLabel + " was viewed " + timeSpent + " msec.");
      });
    };

    return DBPediaInfoPlugin;

  })(window.LimePlugin);

}).call(this);

(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  window.DirectorPlugin = (function(_super) {
    __extends(DirectorPlugin, _super);

    function DirectorPlugin() {
      _ref = DirectorPlugin.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    DirectorPlugin.prototype.init = function() {
      var annotation, _i, _len, _ref1, _results;
      this.name = 'DirectorPlugin';
      this.directorOntologySet = ["<http://dbpedia.org/class/yago/Director110014939>", "<http://dbpedia.org/class/yago/EnglishFilmDirectors>", "<http://dbpedia.org/class/yago/DanishFilmDirectors>", "<http://dbpedia.org/class/yago/SilentFilmDirectors>", "<http://dbpedia.org/class/yago/ItalianFilmDirectors>", "<http://dbpedia.org/class/yago/ScottishFilmDirectors>", "<http://dbpedia.org/class/yago/EnglishTheatreDirectors>", "<http://dbpedia.org/class/yago/DutchFilmDirectors>", "<http://dbpedia.org/class/yago/ArtisticDirectors>", "<http://dbpedia.org/class/yago/IndianFilmDirectors>", "<http://dbpedia.org/class/yago/TurkishFilmDirectors>", "<http://dbpedia.org/class/yago/HindiFilmDirectors>", "<http://dbpedia.org/class/yago/PolishFilmDirectors>", "<http://dbpedia.org/class/yago/RomanianFilmDirectors>", "<http://dbpedia.org/class/yago/MuslimAmericanFilmDirectors>", "<http://dbpedia.org/class/yago/SpanishFilmDirectors>", "<http://dbpedia.org/class/yago/BelgianFilmDirectors>", "<http://dbpedia.org/class/yago/EgyptianFilmDirectors>", "<http://dbpedia.org/class/yago/PakistaniFilmDirectors>", "<http://dbpedia.org/class/yago/IranianFilmDirectors>", "<http://dbpedia.org/class/yago/ItalianBritishFilmDirectors>", "<http://dbpedia.org/class/yago/BrazilianFilmDirectors>", "<http://dbpedia.org/class/yago/IcelandicFilmDirectors>", "<http://dbpedia.org/class/yago/AustralianTelevisionDirectors>", "<http://dbpedia.org/class/yago/M%C3%A9tisFilmDirectors>", "<http://dbpedia.org/class/yago/BengaliFilmDirectors>", "<http://dbpedia.org/class/yago/ColombianFilmDirectors>", "<http://dbpedia.org/class/yago/KannadaFilmDirectors>", "<http://dbpedia.org/class/yago/AmericanFilmDirectorsOfArmenianDescent>", "<http://dbpedia.org/class/yago/BangladeshiFilmDirectors>", "<http://dbpedia.org/class/yago/KurdishFilmDirectors>", "<http://dbpedia.org/class/yago/NativeAmericanFilmDirectors>", "<http://dbpedia.org/class/yago/PortuguEseFilmDirectors>", "<http://dbpedia.org/class/yago/AmericanFilmDirectors>", "<http://dbpedia.org/class/yago/English-languAgeFilmDirectors>"];
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

    DirectorPlugin.prototype.handleAnnotation = function(annotation) {
      var _this = this;
      return annotation.entityPromise.done(function() {
        var annotationType, isDirector, nonConcept, typeSet, widget, _i, _len, _ref1;
        isDirector = false;
        typeSet = annotation.getType();
        for (_i = 0, _len = typeSet.length; _i < _len; _i++) {
          annotationType = typeSet[_i];
          if (_ref1 = annotationType.id, __indexOf.call(_this.directorOntologySet, _ref1) >= 0) {
            isDirector = true;
          }
        }
        if (isDirector) {
          nonConcept = annotation.getDescription();
          nonConcept = nonConcept.replace("No description found.", "");
          if (nonConcept.length >= 3) {
            widget = _this.lime.allocateWidgetSpace(_this, {
              thumbnail: "img/info.png",
              title: "" + (annotation.getLabel()) + " Info",
              type: "DbpediaInfoWidget",
              sortBy: function() {
                return 10000 * annotation.start + annotation.end;
              }
            });
            widget.annotation = annotation;
            jQuery(widget).bind('activate', function(e) {
              return _this.showAbstractInModalWindow(annotation, _this.getModalContainer());
            });
            annotation.widgets[_this.name] = widget;
            jQuery(annotation).bind("becomeActive", function(e) {
              return annotation.widgets[_this.name].setActive();
            });
            jQuery(annotation).bind("becomeInactive", function(e) {
              return annotation.widgets[_this.name].setInactive();
            });
            _this.getLSIImages(annotation);
            return jQuery(widget).bind("leftarrow", function(e) {
              return console.info('left arrow pressed', e);
            });
          }
        }
      });
    };

    DirectorPlugin.prototype.getLSIImages = function(annotation) {
      var _this = this;
      return this.lime.cmf.getLSIImagesForTerm(annotation.resource.value, function(err, res) {
        if (err) {
          return console.warn("Error getting LSI images resources", err);
        } else {
          console.info("LSI resources for", annotation, res);
          annotation.lsiImageResources = _(res).map(function(resultset) {
            var entity;
            entity = {
              image: resultset.image.value
            };
            return entity;
          });
          return annotation.getLsiImagesResources = function() {
            return this.lsiImageResources;
          };
        }
      });
    };

    DirectorPlugin.prototype.showAbstractInModalWindow = function(annotation, outputElement) {
      var comment, depiction, label, lime, lsiImageList, modalContent, page, result;
      modalContent = $(outputElement);
      modalContent.css("width", "600px");
      modalContent.css("height", "auto");
      label = annotation.getLabel();
      page = annotation.getPage();
      /*
      -- added 29.apr.2013 --
       LSIimages = list of images from the LSI that target the current annotation's DBPedia resource URI
       example:
       LAIImages = annotation.getLSIVideosFromTerm (annotation.resource.value,cb)
      
      a LSIImages can have the following structure:
      LSIImages = [
                    {
                    image:"imageURI",
                    hasKeyword: {"DBPedia resource URI 1", "DBPedia resource URI 2", "DBPedia resource URI 3", ... }
                    },
      
                    {
                    image:"imageURI",
                    hasKeyword: {"DBPedia resource URI 1", "DBPedia resource URI 2", "DBPedia resource URI 3", ... }
                    },
                    ...
                  ]
      */

      lime = this.lime;
      comment = annotation.getDescription();
      /*
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
      */

      depiction = annotation.getDepiction({
        without: 'thumb'
      });
      if (depiction === null) {
        depiction = "img/noimagenew.png";
      }
      lsiImageList = annotation.getLsiImagesResources();
      console.log("Asociated images ", label, lsiImageList);
      /*
        -- added 29.apr.2013 --
        Extend interface logic (below) to fit LSIImages by creating a new tile with 1 or more images
      
      if(secondarytext.length > 2)
        if(lsiImageList.length >0)
          result = """
                   <div id="infoWidgetExpanded" style="position: relative; height: 600px; width: auto; ">
                   <div id="infoMainText" style="position: relative; float: right; background-color: #242424; width: 300px; height: 600px; font-family: caviardreamsregular;">
                   <span style="color: #f1f1f1; float: left; position: absolute; z-index: 900; left: 2%; top: 2%; width: 96%; font-size: 25px; height: auto;">#{comment}</span>
                   <div style="position: absolute; z-index: 900; width: 100px; height: 50px; right: 0px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-size: contain; background-image: url('img/120px-DBpediaLogo.svg.png');"></div>
                   </div>
      
                   <div id="infoMainPicture" style="position: relative; float: right; width: 300px; height: 300px; background-color: #6ab1e7;">
                   <div id="pic" style="position: relative; float: left; height: 100%; background-image: url('#{depiction}'); background-repeat: no-repeat; background-position: center center; background-size: cover; width: 100%;">
                   <div id="icon" style="border-right: 1px dotted lightgray; float: left; background-color: #3f3e3e; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;">
                   <span style="position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);">i</span>
                   </div>
                   </div>
                   <div style="position: absolute; left: 0px; bottom: 0; width: 300px; height: 100px;">
                   <div id="titlebackground" style="float: left; position: absolute; z-index: 900; width: 100%; bottom: 0px; background-color: #000000; left: 0px; top: 0px; height: 100%; opacity: 0.5;">
                   </div>
                   <span id="titletext" style="font-family: CaviarDreamsBold; font-size: 29px; line-height: 140%; position: absolute; z-index: 900; left: 0px; width: 100%; bottom: 0px; height: 100%; color: #fcf7f7; opacity: 1.0;">#{label}</span></div>
                   </div>
      
                   <div id="infoSecondText" style=" display: none; font-family: CaviarDreamsRegular; font-size: 25px; color: #f1f1f1; position: relative; float: right; background-color: #242424; vertical-align: middle; width: 300px; height: 300px; text-align: left; line-height: 1.2;">
          #{secondarytext}
                   </div>
      
                   <div id="infoSecondPic" style="background-repeat: no-repeat; background-image: url('#{lsiImageList[0].image}'); background-position: center center; background-size: cover; position: relative; float: right; width: 300px; height: 300px;"></div>
      
      
                   </div>
                   """
        else
          result = """
                   <div id="infoWidgetExpanded" style="position: relative; height: 600px; width: auto; ">
                   <div id="infoMainText" style="position: relative; float: right; background-color: #242424; width: 300px; height: 600px; font-family: caviardreamsregular;">
                   <span style="color: #f1f1f1; float: left; position: absolute; z-index: 900; left: 2%; top: 2%; width: 96%; font-size: 25px; height: auto;">#{comment}</span>
                   <div style="position: absolute; z-index: 900; width: 100px; height: 50px; right: 0px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-size: contain; background-image: url('img/120px-DBpediaLogo.svg.png');"></div>
                   </div>
      
                   <div id="infoMainPicture" style="position: relative; float: right; width: 300px; height: 300px; background-color: #6ab1e7;">
                   <div id="pic" style="position: relative; float: left; height: 100%; background-image: url('#{depiction}'); background-repeat: no-repeat; background-position: center center; background-size: cover; width: 100%;">
                   <div id="icon" style="border-right: 1px dotted lightgray; float: left; background-color: #3f3e3e; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;">
                   <span style="position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);">i</span>
                   </div>
                   </div>
                   <div style="position: absolute; left: 0px; bottom: 0; width: 300px; height: 100px;">
                   <div id="titlebackground" style="float: left; position: absolute; z-index: 900; width: 100%; bottom: 0px; background-color: #000000; left: 0px; top: 0px; height: 100%; opacity: 0.5;">
                   </div>
                   <span id="titletext" style="font-family: CaviarDreamsBold; font-size: 29px; line-height: 140%; position: absolute; z-index: 900; left: 0px; width: 100%; bottom: 0px; height: 100%; color: #fcf7f7; opacity: 1.0;">#{label}</span></div>
                   </div>
      
                   <div id="infoSecondText" style="display: none; font-family: CaviarDreamsRegular; font-size: 25px; color: #f1f1f1; position: relative; float: right; background-color: #242424; vertical-align: middle; width: 300px; height: 300px; text-align: left; line-height: 1.2;">
          #{secondarytext}
                   </div>
      
                   <div id="infoSecondPic" style=" background-repeat: no-repeat; background-image: url('#{depiction}'); background-position: center center; background-size: cover; position: relative; float: right; width: 300px; height: 300px; opacity: 0;"></div>
      
      
                   </div>
                   """
      else
        if(lsiImageList.length >0)
          result = """
                   <div id="infoWidgetExpanded" style="position: relative; height: 600px; width: auto; ">
                   <div id="infoMainText" style="position: relative; float: right; background-color: #242424; width: 300px; height: 300px; font-family: caviardreamsregular;">
                   <span style="color: #f1f1f1; float: left; position: absolute; z-index: 900; left: 2%; top: 2%; width: 96%; font-size: 25px; height: auto;">#{maintext}</span>
                   <div style="position: absolute; z-index: 900; width: 100px; height: 50px; right: 0px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-size: contain; background-image: url('img/120px-DBpediaLogo.svg.png');"></div>
                   </div>
      
                   <div id="infoMainPicture" style="position: relative; float: right; width: 300px; height: 300px; background-color: #6ab1e7;">
                   <div id="pic" style="position: relative; float: left; height: 100%; background-image: url('#{depiction}'); background-repeat: no-repeat; background-position: center center; background-size: cover; width: 100%;">
                   <div id="icon" style="border-right: 1px dotted lightgray; float: left; background-color: #3f3e3e; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;">
                   <span style="position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);">i</span>
                   </div>
                   </div>
                   <div style="position: absolute; left: 0px; bottom: 0; width: 300px; height: 100px;">
                   <div id="titlebackground" style="float: left; position: absolute; z-index: 900; width: 100%; bottom: 0px; background-color: #000000; left: 0px; top: 0px; height: 100%; opacity: 0.5;">
                   </div>
                   <span id="titletext" style="font-family: CaviarDreamsBold; font-size: 29px; line-height: 140%; position: absolute; z-index: 900; left: 0px; width: 100%; bottom: 0px; height: 100%; color: #fcf7f7; opacity: 1.0;">#{label}</span></div>
                   </div>
      
                   <div id="infoSecondText" style="font-family: CaviarDreamsRegular; font-size: 25px; color: #f1f1f1; position: relative; float: right; background-color: #242424; vertical-align: middle; width: 300px; height: 300px; text-align: left; line-height: 1.2; display: none;">
      
                   </div>
      
                   <div id="infoSecondPic" style="background-repeat: no-repeat; background-image: url('#{lsiImageList[0].image}'); background-position: center center; background-size: cover; position: relative; float: right; width: 300px; height: 300px; display: block;"></div>
      
      
                   </div>
                   """
        else
          result = """
                   <div id="infoWidgetExpanded" style="position: relative; height: 600px; width: auto; ">
                   <div id="infoMainText" style="position: relative; float: right; background-color: #242424; width: 300px; height: 300px; font-family: caviardreamsregular;">
                   <span style="color: #f1f1f1; float: left; position: absolute; z-index: 900; left: 2%; top: 2%; width: 96%; font-size: 25px; height: auto;">#{maintext}</span>
                   <div style="position: absolute; z-index: 900; width: 100px; height: 50px; right: 0px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-size: contain; background-image: url('img/120px-DBpediaLogo.svg.png');"></div>
                   </div>
      
                   <div id="infoMainPicture" style="position: relative; float: right; width: 300px; height: 300px; background-color: #6ab1e7;">
                   <div id="pic" style="position: relative; float: left; height: 100%; background-image: url('#{depiction}'); background-repeat: no-repeat; background-position: center center; background-size: cover; width: 100%;">
                   <div id="icon" style="border-right: 1px dotted lightgray; float: left; background-color: #3f3e3e; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;">
                   <span style="position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);">i</span>
                   </div>
                   </div>
                   <div style="position: absolute; left: 0px; bottom: 0; width: 300px; height: 100px;">
                   <div id="titlebackground" style="float: left; position: absolute; z-index: 900; width: 100%; bottom: 0px; background-color: #000000; left: 0px; top: 0px; height: 100%; opacity: 0.5;">
                   </div>
                   <span id="titletext" style="font-family: CaviarDreamsBold; font-size: 29px; line-height: 140%; position: absolute; z-index: 900; left: 0px; width: 100%; bottom: 0px; height: 100%; color: #fcf7f7; opacity: 1.0;">#{label}</span></div>
                   </div>
      
                   <div id="infoSecondText" style="font-family: CaviarDreamsRegular; font-size: 25px; color: #f1f1f1; position: relative; float: right; background-color: #242424; vertical-align: middle; width: 300px; height: 300px; text-align: left; line-height: 1.2; display: none;">
      
                   </div>
      
                   <div id="infoSecondPic" style="background-repeat: no-repeat; background-image: url('#{depiction}'); background-position: center center; background-size: cover; position: relative; float: right; width: 300px; height: 300px; display: none;"></div>
      
      
                   </div>
              """
      */

      result = "<div id=\"ifoWidgetExpanded\" style=\"border: 1px dotted lightgray; position: relative;height: auto; width: 600px;\">\n<div id=\"infoWidget\" style=\"background-color: rgba(37, 37, 37, 0.7); height: 40px; left: 0px; width: 100%; position: relative; float: left;\">\n<div class=\"infoWidgeticon\" style=\"border-right: 1px dotted lightgray; position: relative; height: 100%; float: left; background-color: #3f3e3e; width: 8%;\">\n<span data-dojo-type=\"shapes.Text\" id=\"iconLabel\" style=\"font: Times; position: relative; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: #f38f0b; font-family: 'Times New Roman',Times,serif; font-style: italic;\">i</span>\n</div>\n<div class=\"infoWidgetTitle\" style=\"font: Arial; position: relative; float: left; height: 100%; width: 86%; font-family: Arial,Helvetica,sans-serif; font-size: 26px; color: white; font-weight: normal; text-align: left; vertical-align: middle; text-indent: 1em; line-height: 140%;\">\n     " + label + "</div>\n</div>\n<div id=\"infoText\" style=\"padding: 10px; position: relative; float: left; background-color: rgba(68, 68, 68, 0.7); height: auto; font-style: normal; width: 96%;\">\n<div id=\"infoTextBioTitle\" style=\"font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange; height: auto;\">\nBio</div>\n<div id=\"infoTextBio\" style=\"font: Helvetica; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; float: left; line-height: normal; position: relative; height: auto; width: 100%;\">\n     " + comment + "\n</div>\n<div id=\"infoTextCareerTitle\" style=\"font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange;\">\nMovies</div>\n<div id=\"infoTextCareer\" style=\"font: Helvetica; width: 100%; position: relative; float: left; height: auto; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; line-height: normal;\">\nThe Big Bang Theory</div>\n<div id=\"infoTextAwardsTitle\" style=\"font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange;\">\nAwards</div>\n<div id=\"infoTextAwards\" style=\"font: Helvetica; width: 100%; position: relative; float: left; height: auto; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; line-height: normal;\">\nSpaghetti Master</div>\n</div>\n</div>";
      return modalContent.append(result);
    };

    return DirectorPlugin;

  })(window.LimePlugin);

}).call(this);

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

(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.Help = (function(_super) {
    __extends(Help, _super);

    function Help() {
      _ref = Help.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Help.prototype.init = function() {
      var annotation, button, widget,
        _this = this;
      this.name = 'Help';
      annotation = void 0;
      console.info("Initialize Help");
      $("div .help").click(function() {
        _this.lime.player.pause();
        return _this.renderHelpInModalWindow();
      });
      button = $("<div class='vjs-control help' title='Help' alt='Help' style='font-size: 18px;top: 2px;'>?<div></div></div>");
      button.click(function(e) {
        _this.lime.player.pause();
        return _this.renderHelpInModalWindow();
      });
      $(this.lime.player.buttonContainer).append(button);
      if (this.options.permanentWidget) {
        console.info('Permanent widgets are on.');
        widget = this.lime.allocateWidgetSpace(this, {
          thumbnail: "img/helpWidget.png",
          title: "Help",
          type: "HelpWidget",
          sortBy: function() {
            return 100000000;
          }
        });
        jQuery(widget).bind('activate', function(e) {
          var error, eventCategory, eventClickedLabel;
          try {
            eventClickedLabel = e.target.options.title;
            eventCategory = _this.name;
            _gaq.push(['_trackEvent', eventCategory, 'clicked', eventClickedLabel]);
          } catch (_error) {
            error = _error;
          }
          _this.lime.player.pause();
          return _this.renderHelpInModalWindow();
        });
        return _.defer(function() {
          return widget.setActive();
        });
      }
    };

    Help.prototype.defaults = {
      unhidable: [],
      permanentWidget: false
    };

    Help.prototype.renderHelpInModalWindow = function() {
      var modalContent;
      modalContent = this.getModalContainer();
      return modalContent.append("<img src='img/helpMC.png'/>\n");
    };

    return Help;

  })(window.LimePlugin);

}).call(this);

(function() {
  var RDF, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.LDPlugin = (function(_super) {
    __extends(LDPlugin, _super);

    function LDPlugin() {
      this.recursiveFetch = __bind(this.recursiveFetch, this);
      _ref = LDPlugin.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    LDPlugin.prototype.init = function() {
      var annotation, pausedBefore, waitForAnnotationFetch, _i, _len, _ref1, _results,
        _this = this;
      this.vie = this.lime.options.vie || this.options.vie;
      this.promises = {};
      if (!this.vie) {
        if (this.lime.options.local) {
          jQuery.noop();
        }
        this.vie = new VIE();
        this.vie.use(new this.vie.StanbolService({
          url: this.options.stanbolUrl
        }));
      }
      pausedBefore = this.lime.player.paused();
      _.defer(function() {
        _this.lime.player.pause();
        return console.info("Loading entities first... Player paused...");
      });
      waitForAnnotationFetch = this.lime.annotations.length;
      _ref1 = this.lime.annotations;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        annotation = _ref1[_i];
        annotation.lime = this.lime;
        annotation.vie = this.vie;
        _results.push(this.loadAnnotation(annotation, function() {
          waitForAnnotationFetch--;
          console.info("still waiting for so many annotations...", waitForAnnotationFetch);
          if (waitForAnnotationFetch === 0) {
            console.info("Loading entities finished.");
            if (!pausedBefore) {
              console.info("Playing again.");
              _this.lime.player.play();
            }
          }
          if (waitForAnnotationFetch < 0) {
            console.error("This should not ever happen!");
            debugger;
          }
        }));
      }
      return _results;
    };

    LDPlugin.prototype.defaults = {
      stanbolUrl: "http://dev.iks-project.eu/stanbolfull",
      followRedirects: [
        'dbpedia:wikiPageRedirects', 'rdfs:seeAlso', 'owl:sameAs', function(ent) {
          var engName;
          engName = VIE.Util.getPreferredLangForPreferredProperty(ent, ['rdfs:label', 'geonames:alternateName'], ["en"]);
          if (engName) {
            return "http://dbpedia.org/resource/" + (engName.replace(/\s/g, '_'));
          }
        }
      ]
    };

    LDPlugin.prototype.loadAnnotation = function(annotation, readyCb) {
      var debug, entityUri;
      entityUri = annotation.resource.value;
      if (annotation.isBookmark()) {
        annotation.getLabel = annotation.getName = function() {
          if (annotation.hash.prefLabel) {
            return annotation.hash.prefLabel.value;
          }
        };
        return readyCb();
      } else {
        if (this.promises[entityUri]) {
          annotation.entityPromise = this.promises[entityUri];
          annotation.entityPromise.annotations.push(annotation);
          readyCb();
          return;
        }
        annotation.entityPromise = this.promises[entityUri] = jQuery.Deferred();
        annotation.entityPromise.annotations = [annotation];
        debug = '';
        if (entityUri === debug) {
          this.lime.player.pause();
          debugger;
        }
        return this.recursiveFetch(entityUri, this.options.followRedirects, 2, function(res) {
          var _i, _len, _ref1;
          res = _(res).uniq(function(entity) {
            return entity.getSubject();
          });
          console.info("LDPlugin loaded", res);
          if (entityUri === debug) {
            this.lime.player.pause();
            debugger;
          }
          _ref1 = annotation.entityPromise.annotations;
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            annotation = _ref1[_i];
            annotation.entities = res || [];
            annotation._detectPropertyLanguageOnEntity = function(properties, languages, defaultLabel) {
              var entity, value, _j, _len1, _ref2;
              _ref2 = this.entities;
              for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
                entity = _ref2[_j];
                value = VIE.Util.getPreferredLangForPreferredProperty(entity, properties, languages);
                if (value !== "n/a") {
                  return value;
                }
              }
              return defaultLabel;
            };
            annotation._detectProperty = function(property) {
              var entity, value, _j, _len1, _ref2;
              _ref2 = this.entities;
              for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
                entity = _ref2[_j];
                value = entity.get(property);
                if (value) {
                  return value;
                }
                this.entities[0].fromReference(entity.getSubject());
              }
            };
            annotation.getLabel = annotation.getName = function() {
              if (annotation.hash.prefLabel) {
                return annotation.hash.prefLabel.value;
              } else {
                return this._detectPropertyLanguageOnEntity(['rdfs:label', 'geonames:alternateName'], [this.lime.options.preferredLanguage, 'en'], "No label found.");
              }
            };
            annotation.getDescription = function() {
              return this._detectPropertyLanguageOnEntity(['dbpedia:abstract', 'rdfs:comment'], [this.lime.options.preferredLanguage, 'en'], "No description found.");
            };
            annotation.getDepiction = function(options) {
              var depiction, entity, result, singleDepiction, _j, _len1, _ref2;
              _ref2 = this.entities;
              for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
                entity = _ref2[_j];
                result = "";
                depiction = entity.get('foaf:depiction');
                if (depiction) {
                  if (_.isArray(depiction)) {
                    singleDepiction = _.detect(depiction, function(d) {
                      res = true;
                      if (options != null ? options["with"] : void 0) {
                        res = res && d.indexOf(options != null ? options["with"] : void 0) !== -1;
                      }
                      if (options != null ? options.without : void 0) {
                        res = res && d.indexOf(options != null ? options.without : void 0) === -1;
                      }
                      return res;
                    });
                    if (!singleDepiction) {
                      singleDepiction = depiction[0];
                    }
                  } else {
                    singleDepiction = depiction;
                  }
                  result = entity.fromReference(singleDepiction);
                }
                if (result) {
                  return result;
                }
              }
              return null;
            };
            annotation.getPage = function() {
              var entity, homepage, label, value, _j, _len1, _ref2;
              homepage = this._detectProperty(this.entities, 'foaf:homepage');
              if (!homepage) {
                _ref2 = this.entities;
                for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
                  entity = _ref2[_j];
                  if (entity.getSubject().indexOf('dbpedia') !== -1) {
                    label = VIE.Util.getPreferredLangForPreferredProperty(entity, ['rdfs:label'], [this.lime.options.preferredLanguage]);
                    return "http://" + this.lime.options.preferredLanguage + ".wikipedia.org/wiki/" + label;
                  } else {
                    value = entity.get('foaf:homepage');
                    if (value) {
                      return value;
                    }
                  }
                }
                if (this.entities.length) {
                  return this.entities[0].fromReference(entity.getSubject());
                } else {
                  return this.resource.value;
                }
              }
              return homepage;
            };
            annotation.getType = function() {
              var entity, result, typeSet, _j, _len1, _ref2;
              _ref2 = this.entities;
              for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
                entity = _ref2[_j];
                typeSet = entity.get('@type');
                if (_.isArray(typeSet)) {
                  result = typeSet;
                } else {
                  result = [typeSet];
                }
              }
              return result;
            };
            annotation.getStarring = function() {
              var entity, starringList, value, _j, _len1, _ref2;
              starringList = this._detectProperty(this.entities, 'dbpedia-owl:knownFor');
              if (!starringList) {
                _ref2 = this.entities;
                for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
                  entity = _ref2[_j];
                  value = entity.get('dbpedia-owl:knownFor');
                  if (_.isArray(value)) {
                    starringList = value;
                  } else {
                    starringList = [value];
                  }
                }
              }
              console.log("===== LDPlugin - getStarring result: ", starringList);
              return starringList;
            };
            annotation.getLatitude = function() {
              var entity, value, _j, _len1, _ref2;
              value = 0.0;
              _ref2 = this.entities;
              for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
                entity = _ref2[_j];
                if (entity.getSubject().indexOf('geonames') !== -1) {
                  value = entity.attributes['<http://www.w3.org/2003/01/geo/wgs84_pos#lat>'];
                }
              }
              console.log("Latitude = ", value);
              return value;
            };
            annotation.getLongitude = function() {
              var entity, value, _j, _len1, _ref2;
              value = 0.0;
              _ref2 = this.entities;
              for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
                entity = _ref2[_j];
                if (entity.getSubject().indexOf('geonames') !== -1) {
                  value = entity.attributes['<http://www.w3.org/2003/01/geo/wgs84_pos#long>'];
                }
              }
              console.log("Latitude = ", value);
              return value;
            };
          }
          annotation.entityPromise.resolve(annotation.entities);
          return readyCb();
        });
      }
    };

    LDPlugin.prototype.recursiveFetch = function(entityUri, props, depth, cb) {
      var error, handleMerge, results, success, waitfor,
        _this = this;
      results = [];
      waitfor = 0;
      handleMerge = function() {
        return asdf;
      };
      error = function(err) {
        waitfor--;
        console.error("Couldn't load entity " + entityUri, err);
        if (!(waitfor > 0)) {
          return cb([]);
        }
      };
      success = function(res) {
        var entity, prop, redir, redirUrl, redirects, _i, _j, _len, _len1, _results;
        entity = _.detect(res, function(ent) {
          return ent.fromReference(ent.getSubject()) === ent.fromReference(entityUri);
        });
        if (entity) {
          results.push(entity);
        }
        if (depth === 0) {
          return cb(_.flatten(results));
        } else {
          redirects = [];
          if (entity) {
            for (_i = 0, _len = props.length; _i < _len; _i++) {
              prop = props[_i];
              if (_.isString(prop)) {
                redir = entity.get(prop);
                if (!(redir != null ? redir.isEntity : void 0)) {
                  redirects.push(redir);
                }
              }
              if (_.isFunction(prop)) {
                redirects.push(prop(entity));
              }
            }
          }
          redirects = _.flatten(redirects);
          redirects = _.uniq(redirects);
          redirects = _.compact(redirects);
          waitfor = redirects.length;
          if (waitfor) {
            _results = [];
            for (_j = 0, _len1 = redirects.length; _j < _len1; _j++) {
              redirUrl = redirects[_j];
              _results.push(_this.recursiveFetch(redirUrl, props, depth - 1, function(r) {
                results.push(r);
                waitfor--;
                if (waitfor <= 0) {
                  return cb(_(results).flatten());
                }
              }));
            }
            return _results;
          } else {
            return cb(_(results).flatten());
          }
        }
      };
      return this.vie.load({
        entity: entityUri
      }).using('stanbol').execute().fail(error).success(success);
    };

    return LDPlugin;

  })(window.LimePlugin);

  RDF = (function() {
    function RDF(hash) {}

    return RDF;

  })();

}).call(this);

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
            return _this.getModalContainer().html(_this.renderAnnotation(annotation));
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

    LSIImagePlugin.prototype.renderAnnotation = function(annotation) {
      var label, labelObj, result, returnResult,
        _this = this;
      returnResult = "";
      if (annotation) {
        labelObj = _(annotation.entity["rdfs:label"]).detect(function(labelObject) {
          return labelObject['@language'] === _this.lime.options.preferredLanguage;
        });
        label = labelObj['@value'];
        result = "<div class=\"LSIImageWidget\">\n <table style=\"margin:0 auto; width: 100%;\">\n   <tr>\n     <td>\n       <b class=\"utility-text\">" + (annotation.getLabel()) + " Pics </b>\n     </td>\n     <td>\n       <img class=\"utility-icon\" src=\"img/pic.png\" style=\"float: right; width: 25px; height: 25px; \" >\n    </td>\n   </tr>\n </table>\n</div>";
      }
      return result;
    };

    return LSIImagePlugin;

  })(window.LimePlugin);

}).call(this);

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

(function() {


}).call(this);

(function() {
  var _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.TVPlugin = (function(_super) {
    __extends(TVPlugin, _super);

    function TVPlugin() {
      this._getStarringList = __bind(this._getStarringList, this);
      this._loadFullDbpediaEntity = __bind(this._loadFullDbpediaEntity, this);
      this.renderActor = __bind(this.renderActor, this);
      _ref = TVPlugin.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    TVPlugin.prototype.init = function() {
      var annotation, _i, _len, _ref1, _ref2, _results;
      this.name = 'TVPlugin';
      console.info("Initialize " + this.name);
      _ref1 = this.lime.annotations;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        annotation = _ref1[_i];
        if (annotation.resource.value.indexOf("dbpedia") > 0 && ((_ref2 = annotation.relation.value) === 'http://connectme.at/ontology#explicitlyShows' || _ref2 === 'http://connectme.at/ontology#explicitlyMentions' || _ref2 === 'http://connectme.at/ontology#implicitlyShows' || _ref2 === 'http://connectme.at/ontology#implicitlyMentions')) {
          _results.push(this.handleAnnotation(annotation));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    TVPlugin.prototype.defaults = {
      actorTypes: ['<http://dbpedia.org/class/yago/Actor109765278>', '<http://dbpedia.org/class/yago/AustrianFilmActors>', '<http://dbpedia.org/class/yago/FilmActors>', '<http://dbpedia.org/class/yago/AmericanTelevisionActors>', '<http://dbpedia.org/class/yago/AmericanVoiceActors>', '<http://dbpedia.org/class/yago/AmericanActorsOfEnglishDescent>', '<http://dbpedia.org/class/yago/AmericanSoapOperaActors>', '<http://dbpedia.org/class/yago/AmericanFilmActors>', '<http://dbpedia.org/class/yago/Actress109767700>', '<http://dbpedia.org/class/yago/AmericanChildActors>', '<http://dbpedia.org/class/yago/ActorsFromCalifornia>'],
      characterTypes: ["<http://dbpedia.org/ontology/FictionalCharacter>", "<http://dbpedia.org/class/yago/FictionalCharactersFromCalifornia>", "<http://dbpedia.org/class/yago/FictionalCharacter109587565>"],
      directorTypes: ["<http://dbpedia.org/class/yago/Director110014939>", "<http://dbpedia.org/class/yago/EnglishFilmDirectors>", "<http://dbpedia.org/class/yago/DanishFilmDirectors>", "<http://dbpedia.org/class/yago/SilentFilmDirectors>", "<http://dbpedia.org/class/yago/ItalianFilmDirectors>", "<http://dbpedia.org/class/yago/ScottishFilmDirectors>", "<http://dbpedia.org/class/yago/EnglishTheatreDirectors>", "<http://dbpedia.org/class/yago/DutchFilmDirectors>", "<http://dbpedia.org/class/yago/ArtisticDirectors>", "<http://dbpedia.org/class/yago/IndianFilmDirectors>", "<http://dbpedia.org/class/yago/TurkishFilmDirectors>", "<http://dbpedia.org/class/yago/HindiFilmDirectors>", "<http://dbpedia.org/class/yago/PolishFilmDirectors>", "<http://dbpedia.org/class/yago/RomanianFilmDirectors>", "<http://dbpedia.org/class/yago/MuslimAmericanFilmDirectors>", "<http://dbpedia.org/class/yago/SpanishFilmDirectors>", "<http://dbpedia.org/class/yago/BelgianFilmDirectors>", "<http://dbpedia.org/class/yago/EgyptianFilmDirectors>", "<http://dbpedia.org/class/yago/PakistaniFilmDirectors>", "<http://dbpedia.org/class/yago/IranianFilmDirectors>", "<http://dbpedia.org/class/yago/ItalianBritishFilmDirectors>", "<http://dbpedia.org/class/yago/BrazilianFilmDirectors>", "<http://dbpedia.org/class/yago/IcelandicFilmDirectors>", "<http://dbpedia.org/class/yago/AustralianTelevisionDirectors>", "<http://dbpedia.org/class/yago/M%C3%A9tisFilmDirectors>", "<http://dbpedia.org/class/yago/BengaliFilmDirectors>", "<http://dbpedia.org/class/yago/ColombianFilmDirectors>", "<http://dbpedia.org/class/yago/KannadaFilmDirectors>", "<http://dbpedia.org/class/yago/AmericanFilmDirectorsOfArmenianDescent>", "<http://dbpedia.org/class/yago/BangladeshiFilmDirectors>", "<http://dbpedia.org/class/yago/KurdishFilmDirectors>", "<http://dbpedia.org/class/yago/NativeAmericanFilmDirectors>", "<http://dbpedia.org/class/yago/PortuguEseFilmDirectors>", "<http://dbpedia.org/class/yago/AmericanFilmDirectors>", "<http://dbpedia.org/class/yago/English-languAgeFilmDirectors>", "<http://dbpedia.org/class/yago/AmericanTelevisionDirectors>"]
    };

    TVPlugin.prototype.handleAnnotation = function(annotation) {
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
          if (entity && entity.isof('dbpedia:Person')) {
            return _this.processAnnotation(annotation);
          }
        }
      });
    };

    TVPlugin.prototype.processAnnotation = function(annotation) {
      var widget, widgetType;
      if (_.intersection(annotation.entities[0].attributes['@type'], this.options.actorTypes).length) {
        console.info('Render Actor widget');
        widgetType = 'ActorWidget';
        widget = this._initWidget(annotation, widgetType, this.renderActor, {
          thumbnail: "img/starIcon.png",
          title: "" + (annotation.getLabel()) + " (Actor)",
          type: widgetType,
          sortBy: function() {
            return 10000 * annotation.start + annotation.end;
          }
        });
      }
      if (_.intersection(annotation.entities[0].attributes['@type'], this.options.characterTypes).length) {
        console.info('Render Character widget');
        widgetType = 'CharacterWidget';
        widget = this._initWidget(annotation, widgetType, this.renderCharacter, {
          thumbnail: "img/characterIcon.png",
          title: "" + (annotation.getLabel()) + " (Character)",
          type: widgetType,
          sortBy: function() {
            return 10000 * annotation.start + annotation.end;
          }
        });
      }
      if (_.intersection(annotation.entities[0].attributes['@type'], this.options.directorTypes).length) {
        console.info('Render Director widget');
        widgetType = 'DirectorWidget';
        return widget = this._initWidget(annotation, widgetType, this.renderDirector, {
          thumbnail: "img/directorIcon.png",
          title: "" + (annotation.getLabel()) + " (Director)",
          type: widgetType,
          sortBy: function() {
            return 10000 * annotation.start + annotation.end;
          }
        });
      }
    };

    TVPlugin.prototype.renderActor = function(annotation, container) {
      var awardsItem, awardsList, awardsListArray, birthDate, birthDateValue, birthPlace, birthPlaceValue, comment, error, label, lime, modalContent, page, result, starringList, starringListArray, startTime, _i, _len,
        _this = this;
      modalContent = jQuery(container);
      modalContent.css("width", "450px");
      modalContent.css("height", "auto");
      startTime = new Date().getTime();
      label = annotation.getLabel();
      page = annotation.getPage();
      starringListArray = [];
      starringList = "";
      this._getStarringList(annotation.resource.value, function(data, result) {
        var show, starringItem, _i, _j, _len, _len1, _ref1;
        result = [];
        _ref1 = data.results.bindings;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          show = _ref1[_i];
          result.push("<" + show.date.value + "> - <" + show.show.value + ">");
        }
        starringListArray = result;
        if (starringListArray) {
          for (_j = 0, _len1 = starringListArray.length; _j < _len1; _j++) {
            starringItem = starringListArray[_j];
            starringItem = _this._cleanupLabel(starringItem) + "<\/br>";
            starringList += starringItem;
          }
          jQuery('#infoText').append("<div id=\"infoTextCareerTitle\" style=\"font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange;\">\n                      Movies and TV Series</div>\n                      <div id=\"infoTextCareer\" style=\"font: Helvetica; width: 100%; position: relative; float: left; height: auto; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; line-height: normal;\">\n" + starringList + "</div>");
        }
        console.log('1) starringListArray = ', starringListArray);
        return result;
      });
      console.log('2) starringListArray = ', starringListArray);
      awardsListArray = [];
      awardsListArray = annotation._detectProperty('dcterms:subject');
      awardsList = "";
      if (awardsListArray) {
        for (_i = 0, _len = awardsListArray.length; _i < _len; _i++) {
          awardsItem = awardsListArray[_i];
          awardsItem = this._cleanupLabel(awardsItem) + "<\/br>";
          if (awardsItem.indexOf("winners") > 0 || awardsItem.indexOf("award") > 0 || awardsItem.indexOf("awards") > 0) {
            if (awardsItem.indexOf("winners") > 0) {
              awardsItem = awardsItem.replace(/winners/, "");
            }
            awardsList += awardsItem;
          }
        }
      }
      console.log("awardsListArray = ", awardsList, " from this list: ", awardsListArray);
      lime = this.lime;
      comment = annotation.getDescription();
      comment = comment.split(". ")[0] + ". ";
      birthDate = "";
      try {
        birthDateValue = annotation._detectProperty('dbprop:birthDate');
        if (birthDateValue !== void 0) {
          birthDateValue = birthDateValue.split("T")[0];
          birthDate += 'Birth date: ' + birthDateValue + '<br>';
        }
      } catch (_error) {
        error = _error;
        try {
          birthDateValue = annotation._detectProperty('dbprop:dateOfBirth');
          birthDateValue = birthDateValue.split("T")[0];
          if (birthDateValue !== void 0) {
            birthDate += 'Birth date: ' + birthDateValue + '<br>';
          }
        } catch (_error) {
          error = _error;
        }
      }
      birthPlace = "";
      try {
        birthPlaceValue = annotation._detectProperty('dbprop:birthPlace')['@value'];
        if (birthPlaceValue !== void 0) {
          birthPlace += 'Birth place: ' + birthPlaceValue + '<br>';
        }
      } catch (_error) {
        error = _error;
        try {
          birthPlaceValue = annotation._detectProperty('dbprop:placeOfBirth')['@value'];
          if (birthPlaceValue !== void 0) {
            birthPlace += 'Birth place: ' + birthPlaceValue + '<br>';
          }
        } catch (_error) {
          error = _error;
        }
      }
      result = "         <div id=\"ifoWidgetExpanded\" style=\"border: 1px dotted lightgray; position: relative;height: auto; width: 100%;\">\n         <div id=\"infoWidget\" style=\"background-color: rgba(37, 37, 37, 0.7); height: 40px; left: 0px; width: 100%; position: relative; float: left;\">\n         <div class=\"infoWidgeticon\" style=\"border-right: 1px dotted lightgray; position: relative; height: 100%; float: left; background-color: #3f3e3e; width: 8%;\">\n         <span data-dojo-type=\"shapes.Text\" id=\"iconLabel\" style=\"font: Times; position: relative; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: #f38f0b; font-family: 'Times New Roman',Times,serif; font-style: italic;\">i</span>\n         </div>\n         <div class=\"infoWidgetTitle\" style=\"font: Arial; position: relative; float: left; height: 100%; width: 86%; font-family: Arial,Helvetica,sans-serif; font-size: 26px; color: white; font-weight: normal; text-align: left; vertical-align: middle; text-indent: 1em; line-height: 140%;\">\n" + label + "</div>\n         </div>\n         <div id=\"infoText\" style=\"padding: 10px; position: relative; float: left; background-color: rgba(68, 68, 68, 0.7); height: auto; font-style: normal; width: 96%;\">\n         <div id=\"infoTextBioTitle\" style=\"font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange; height: auto;\">\n         Bio</div>\n         <div id=\"infoTextBio\" style=\"font: Helvetica; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; float: left; line-height: normal; position: relative; height: auto; width: 100%;\">\n" + comment + " <br>\n" + birthDate + "\n" + birthPlace + "\n\n         </div>";
      /*
      if (starringList.length > 0)
        result += """
                  <div id="infoTextCareerTitle" style="font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange;">
                  Movies and TV Series</div>
                       <div id="infoTextCareer" style="font: Helvetica; width: 100%; position: relative; float: left; height: auto; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; line-height: normal;">
        #{starringList}</div>
                      """
      */

      if (awardsList.length > 0) {
        result += " <div id=\"infoTextAwardsTitle\" style=\"font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange;\">\n Awards</div>\n <div id=\"infoTextAwards\" style=\"font: Helvetica; width: 100%; position: relative; float: left; height: auto; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; line-height: normal;\">\n" + awardsList + "</div>";
      }
      result += "</div>\n</div>";
      return container.append(result);
      /*
      #widget controls
      jQuery(".close").click (e) =>
        endTime = new Date().getTime()
        timeSpent = endTime - startTime
        eventLabel = annotation.widgets[@name].options.title
        try
          _gaq.push ['_trackEvent', @name, 'viewed', eventLabel, timeSpent]
          _gaq.push ['_trackTiming', @name, eventLabel, timeSpent, 'viewed']
        catch error
      
      jQuery('#mask').click (e) =>
        endTime = new Date().getTime()
        timeSpent = endTime - startTime
        eventLabel = annotation.widgets[@name].options.title
        try
          _gaq.push ['_trackEvent', @name, 'viewed', eventLabel, timeSpent]
          _gaq.push ['_trackTiming', @name, eventLabel, timeSpent, 'viewed']
        catch error
      */

    };

    TVPlugin.prototype.renderCharacter = function(annotation, container) {
      var comment, error, firstAppearance, label, modalContent, nationality, nick, nickname, nicknameList, occupation, page, portrayer, result, startTime, _i, _len;
      modalContent = jQuery(container);
      modalContent.css("width", "450px");
      modalContent.css("height", "auto");
      startTime = new Date().getTime();
      label = annotation.getLabel();
      page = annotation.getPage();
      comment = annotation.getDescription();
      occupation = "";
      try {
        occupation = annotation._detectProperty('dbprop:occupation');
        occupation = this._cleanupLabel(occupation);
        occupation = "<b>Occupation:</b> " + occupation + "<br>";
      } catch (_error) {
        error = _error;
      }
      nationality = "";
      try {
        nationality = annotation._detectProperty('dbprop:nationality');
        nationality = this._cleanupLabel(nationality);
        nationality = "<b>Nationality:</b> " + nationality + "<br>";
      } catch (_error) {
        error = _error;
      }
      firstAppearance = "";
      try {
        firstAppearance = annotation._detectProperty('dbprop:firstAppearance');
        firstAppearance = this._cleanupLabel(firstAppearance);
        firstAppearance = "<b>First Appearance:</b> " + firstAppearance + "<br>";
      } catch (_error) {
        error = _error;
      }
      nickname = "";
      try {
        nickname = "<b>Nick name:</b> ";
        nicknameList = annotation._detectProperty('foaf:nick');
        for (_i = 0, _len = nicknameList.length; _i < _len; _i++) {
          nick = nicknameList[_i];
          nickname += nick['@value'] + "<br>";
        }
      } catch (_error) {
        error = _error;
      }
      portrayer = "";
      try {
        portrayer = annotation._detectProperty('dbprop:portrayer');
        portrayer = this._cleanupLabel(portrayer);
        portrayer = "<b>Played by:</b> " + portrayer + "<br>";
      } catch (_error) {
        error = _error;
      }
      result = "         <div id=\"ifoWidgetExpanded\" style=\"border: 1px dotted lightgray; position: relative;height: auto; width: 100%;\">\n         <div id=\"infoWidget\" style=\"background-color: rgba(37, 37, 37, 0.7); height: 40px; left: 0px; width: 100%; position: relative; float: left;\">\n         <div class=\"infoWidgeticon\" style=\"border-right: 1px dotted lightgray; position: relative; height: 100%; float: left; background-color: #3f3e3e; width: 8%;\">\n         <span data-dojo-type=\"shapes.Text\" id=\"iconLabel\" style=\"font: Times; position: relative; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: #f38f0b; font-family: 'Times New Roman',Times,serif; font-style: italic;\">i</span>\n         </div>\n         <div class=\"infoWidgetTitle\" style=\"font: Arial; position: relative; float: left; height: 100%; width: 86%; font-family: Arial,Helvetica,sans-serif; font-size: 26px; color: white; font-weight: normal; text-align: left; vertical-align: middle; text-indent: 1em; line-height: 140%;\">\n" + label + "</div>\n         </div>\n         <div id=\"infoText\" style=\"padding: 10px; position: relative; float: left; background-color: rgba(68, 68, 68, 0.7); height: auto; font-style: normal; width: 96%;\">\n         <div id=\"infoTextBioTitle\" style=\"font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange; height: auto;\">\n         Bio</div>\n         <div id=\"infoTextBio\" style=\"font: Helvetica; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; float: left; line-height: normal; position: relative; height: auto; width: 100%;\">\n" + portrayer + "\n" + firstAppearance + "\n" + nationality + "\n" + occupation + "\n" + nickname + "\n          <br>\n\n         </div>\n         </div>\n         </div>";
      return container.append(result);
      /*
      #widget controls
      jQuery(".close").click (e) =>
        endTime = new Date().getTime()
        timeSpent = endTime - startTime
        eventLabel = annotation.widgets[@name].options.title
        try
          _gaq.push ['_trackEvent', @name, 'viewed', eventLabel, timeSpent]
          _gaq.push ['_trackTiming', @name, eventLabel, timeSpent, 'viewed']
        catch error
      
      jQuery('#mask').click (e) =>
        endTime = new Date().getTime()
        timeSpent = endTime - startTime
        eventLabel = annotation.widgets[@name].options.title
        try
          _gaq.push ['_trackEvent', @name, 'viewed', eventLabel, timeSpent]
          _gaq.push ['_trackTiming', @name, eventLabel, timeSpent, 'viewed']
        catch error
      */

    };

    TVPlugin.prototype.renderDirector = function(annotation, container) {
      var awardsItem, awardsList, awardsListArray, birthDate, birthDateValue, birthPlace, birthPlaceValue, comment, error, label, lime, modalContent, page, result, starringItem, starringList, starringListArray, startTime, _i, _j, _len, _len1;
      modalContent = jQuery(container);
      modalContent.css("width", "450px");
      modalContent.css("height", "auto");
      startTime = new Date().getTime();
      label = annotation.getLabel();
      page = annotation.getPage();
      console.log(page);
      starringListArray = [];
      starringListArray = annotation._detectProperty('dbprop:knownFor');
      starringList = "";
      if (starringListArray) {
        for (_i = 0, _len = starringListArray.length; _i < _len; _i++) {
          starringItem = starringListArray[_i];
          starringList += this._cleanupLabel(starringItem);
        }
      }
      awardsListArray = [];
      awardsListArray = annotation._detectProperty('dcterms:subject');
      awardsList = "";
      if (awardsListArray) {
        for (_j = 0, _len1 = awardsListArray.length; _j < _len1; _j++) {
          awardsItem = awardsListArray[_j];
          awardsItem = this._cleanupLabel(awardsItem) + "<\/br>";
          if (awardsItem.indexOf("winners") > 0 || awardsItem.indexOf("award") > 0 || awardsItem.indexOf("awards") > 0) {
            awardsList += awardsItem;
          }
        }
      }
      console.log("awardsListArray = ", awardsList, " from this list: ", awardsListArray);
      lime = this.lime;
      comment = annotation.getDescription();
      birthDate = "";
      try {
        birthDateValue = annotation._detectProperty('dbprop:birthDate');
        if (birthDateValue !== void 0) {
          birthDateValue = birthDateValue.split("T")[0];
          birthDate += 'Birth date: ' + birthDateValue + '<br>';
        }
      } catch (_error) {
        error = _error;
        try {
          birthDateValue = annotation._detectProperty('dbprop:dateOfBirth');
          if (birthDateValue !== void 0) {
            birthDateValue = birthDateValue.split("T")[0];
            birthDate += 'Birth date: ' + birthDateValue + '<br>';
          }
        } catch (_error) {
          error = _error;
        }
      }
      birthPlace = "";
      try {
        birthPlaceValue = annotation._detectProperty('dbprop:birthPlace')['@value'];
        if (birthPlaceValue !== void 0) {
          birthPlace += 'Birth place: ' + birthPlaceValue + '<br>';
        }
      } catch (_error) {
        error = _error;
        try {
          birthPlaceValue = annotation._detectProperty('dbprop:placeOfBirth')['@value'];
          if (birthPlaceValue !== void 0) {
            birthPlace += 'Birth place: ' + birthPlaceValue + '<br>';
          }
        } catch (_error) {
          error = _error;
        }
      }
      result = "         <div id=\"ifoWidgetExpanded\" style=\"border: 1px dotted lightgray; position: relative;height: auto; width: 100%;\">\n         <div id=\"infoWidget\" style=\"background-color: rgba(37, 37, 37, 0.7); height: 40px; left: 0px; width: 100%; position: relative; float: left;\">\n         <div class=\"infoWidgeticon\" style=\"border-right: 1px dotted lightgray; position: relative; height: 100%; float: left; background-color: #3f3e3e; width: 8%;\">\n         <span data-dojo-type=\"shapes.Text\" id=\"iconLabel\" style=\"font: Times; position: relative; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: #f38f0b; font-family: 'Times New Roman',Times,serif; font-style: italic;\">i</span>\n         </div>\n         <div class=\"infoWidgetTitle\" style=\"font: Arial; position: relative; float: left; height: 100%; width: 86%; font-family: Arial,Helvetica,sans-serif; font-size: 26px; color: white; font-weight: normal; text-align: left; vertical-align: middle; text-indent: 1em; line-height: 140%;\">\n" + label + "</div>\n         </div>\n         <div id=\"infoText\" style=\"padding: 10px; position: relative; float: left; background-color: rgba(68, 68, 68, 0.7); height: auto; font-style: normal; width: 96%;\">\n         <div id=\"infoTextBioTitle\" style=\"font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange; height: auto;\">\n         Bio</div>\n         <div id=\"infoTextBio\" style=\"font: Helvetica; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; float: left; line-height: normal; position: relative; height: auto; width: 100%;\">\n" + birthDate + "\n" + birthPlace + "  <br>\n" + comment + "\n\n         </div>";
      if (starringList.length > 3) {
        result += "          <div id=\"infoTextCareerTitle\" style=\"font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange;\">\n          Movies and TV Series</div>\n               <div id=\"infoTextCareer\" style=\"font: Helvetica; width: 100%; position: relative; float: left; height: auto; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; line-height: normal;\">\n" + starringList + "</div>";
      }
      if (awardsList.length > 3) {
        result += " <div id=\"infoTextAwardsTitle\" style=\"font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange;\">\n          Awards</div>\n             <div id=\"infoTextAwards\" style=\"font: Helvetica; width: 100%; position: relative; float: left; height: auto; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; line-height: normal;\">\n" + awardsList + "</div>";
      }
      result += "</div>\n</div>";
      return container.append(result);
      /*
      #widget controls
      jQuery(".close").click (e) =>
        endTime = new Date().getTime()
        timeSpent = endTime - startTime
        eventLabel = annotation.widgets[@name].options.title
        try
          _gaq.push ['_trackEvent', @name, 'viewed', eventLabel, timeSpent]
          _gaq.push ['_trackTiming', @name, eventLabel, timeSpent, 'viewed']
        catch error
      
      jQuery('#mask').click (e) =>
        endTime = new Date().getTime()
        timeSpent = endTime - startTime
        eventLabel = annotation.widgets[@name].options.title
        try
          _gaq.push ['_trackEvent', @name, 'viewed', eventLabel, timeSpent]
          _gaq.push ['_trackTiming', @name, eventLabel, timeSpent, 'viewed']
        catch error
      */

    };

    TVPlugin.prototype._cleanupLabel = function(label) {
      label = label.replace(/<http:\/\/dbpedia.org\/resource\/(Category:)?/, "");
      label = label.replace(/_/g, " ");
      label = label.replace(/[<>]/g, "");
      label = decodeURIComponent(label);
      return label;
    };

    TVPlugin.prototype._loadFullDbpediaEntity = function(entity, callback) {
      var _this = this;
      return this.vie.load({
        entity: entity
      }).using('dbpedia').execute().success(function(fullEntity) {
        entity.set(fullEntity);
        return callback(fullEntity);
      });
    };

    TVPlugin.prototype._getStarringList = function(dbpediaResourceURI, callback) {
      var query, result, url;
      result = [];
      query = "PREFIX foaf: <http://xmlns.com/foaf/0.1/>\nPREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\nPREFIX dcterms: <http://purl.org/dc/terms/>\nPREFIX dbpedia-owl: <http://dbpedia.org/ontology/>\nPREFIX dbprop: <http://dbpedia.org/property/>\nPREFIX dbcat: <http://dbpedia.org/resource/Category:>\nPREFIX skos: <http://www.w3.org/2004/02/skos/core#>\nSELECT DISTINCT ?show ?date WHERE {\n     ?show dbprop:starring <" + dbpediaResourceURI + "> .\n     ?show <http://dbpedia.org/ontology/releaseDate> ?date .\n    } ORDER BY DESC(?date)\n    LIMIT 5";
      url = "http://dbpedia.org/sparql?query=" + escape(query) + "&format=json";
      jQuery.getJSON(url, callback);
      return result;
    };

    TVPlugin.prototype._initWidget = function(annotation, widgetType, renderMethod, widgetOptions) {
      var widget,
        _this = this;
      widget = this.lime.allocateWidgetSpace(this, widgetOptions);
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
        return renderMethod.apply(_this, [annotation, _this.getModalContainer()]);
      });
      annotation.widgets[widgetType] = widget;
      jQuery(annotation).bind("becomeActive", function(e) {
        var error, eventActiveLabel, eventCategory;
        try {
          eventActiveLabel = e.target.widgets[_this.name].options.title;
          eventCategory = _this.name;
          _gaq.push(['_trackEvent', eventCategory, 'becameActive', eventActiveLabel]);
        } catch (_error) {
          error = _error;
        }
        return annotation.widgets[widgetType].setActive();
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
        return annotation.widgets[widgetType].setInactive();
      });
    };

    return TVPlugin;

  })(window.LimePlugin);

}).call(this);

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

(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.AdminPlugin = (function(_super) {
    __extends(AdminPlugin, _super);

    function AdminPlugin() {
      _ref = AdminPlugin.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    AdminPlugin.prototype.init = function() {
      var annotation,
        _this = this;
      this.name = 'AdminPlugin';
      annotation = void 0;
      console.info("Initialize AdminPlugin");
      return $("div .admin").click(function() {
        _this.lime.player.pause();
        return _this.displayAdminSettingsInModal();
      });
    };

    AdminPlugin.prototype.renderAdminSettingsInModalWindow = function() {
      var modalContent, result;
      result = "<iframe allowtransparency=\"true\" src=\"http://form.jotformeu.com/form/23474683902358\" frameborder=\"0\" style=\"width:100%; height:863px; border:none;\" scrolling=\"no\"></iframe>";
      modalContent = $("#modalContent");
      modalContent.css('overflow', 'auto');
      return modalContent.append(result);
    };

    AdminPlugin.prototype.displayAdminSettingsInModal = function() {
      var mask, maskHeight, maskWidth, modalcontainer, winH, winW,
        _this = this;
      if (this.lime.player.isFullScreen) {
        modalcontainer = $(".modalwindow");
      } else {
        modalcontainer = $("#modalWindow");
      }
      mask = void 0;
      if (this.lime.player.isFullScreen) {
        mask = $(".mask");
      } else {
        mask = $("#mask");
      }
      $(modalcontainer).css("height", "70%");
      $(modalcontainer).css("max-height", "1200px");
      $(modalcontainer).empty();
      $(modalcontainer).append("<a href=\"#\" class=\"close\" role=\"button\"><img src=\"img/close-icon.png\" style=\"width: 22px; height: 22px;\"/></a>");
      $(modalcontainer).append("<div id=\"modalContent\" style=\"height: 95%; width: 100%; position: relative; margin: 0 auto; color: black; \"> &nbsp");
      $(modalcontainer).append("</div>");
      maskHeight = $(window).height();
      maskWidth = $(window).width();
      $(mask).css({
        width: maskWidth,
        height: maskHeight
      });
      $(mask).fadeIn(100);
      $(mask).fadeTo("fast", 0.8);
      winH = $(window).height();
      winW = $(window).width();
      $(modalcontainer).css("top", winH / 2 - $(modalcontainer).height() / 2);
      $(modalcontainer).css("left", winW / 2 - $(modalcontainer).width() / 2);
      $(modalcontainer).fadeIn(100);
      $(".close").click(function(e) {
        e.preventDefault();
        $(mask).hide();
        return $(modalcontainer).hide();
      });
      $(mask).click(function(e) {
        $(mask).hide();
        $(modalcontainer).hide();
        return $(modalcontainer).empty();
      });
      $(window).resize(function(e) {
        maskHeight = $(document).height();
        maskWidth = $(document).width();
        $(mask).css({
          width: maskWidth,
          height: maskHeight
        });
        winH = $(window).height();
        winW = $(window).width();
        $(modalcontainer).css("top", winH / 2 - $(modalcontainer).height() / 2);
        return $(modalcontainer).css("left", winW / 2 - $(modalcontainer).width() / 2);
      });
      return this.renderAdminSettingsInModalWindow();
    };

    return AdminPlugin;

  })(window.LimePlugin);

}).call(this);

(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.StatisticsPlugin = (function(_super) {
    __extends(StatisticsPlugin, _super);

    function StatisticsPlugin() {
      _ref = StatisticsPlugin.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    StatisticsPlugin.prototype.init = function() {
      var annotation,
        _this = this;
      this.name = 'StatisticsPlugin';
      annotation = void 0;
      console.info("Initialize StatisticsPlugin");
      return $("div .stats").click(function() {
        _this.lime.player.pause();
        return _this.displayStatisticsInModal();
      });
    };

    StatisticsPlugin.prototype.renderStatisticsInModalWindow = function() {
      var modalContent, result;
      result = "<div class=\"statistic\" ><img src=\"img/stats.png\" style=\"width: 90%;  display:block; /*images must be set to block in order use auto margins*/ margin:0 auto; /*centers images in most browsers*/   text-align:center; /*centers images in older browsers*/\" /></div>";
      modalContent = $("#modalContent");
      modalContent.css('overflow', 'auto');
      return modalContent.append(result);
    };

    StatisticsPlugin.prototype.displayStatisticsInModal = function() {
      var mask, maskHeight, maskWidth, modalcontainer, winH, winW,
        _this = this;
      if (this.lime.player.isFullScreen) {
        modalcontainer = $(".modalwindow");
      } else {
        modalcontainer = $("#modalWindow");
      }
      mask = void 0;
      if (this.lime.player.isFullScreen) {
        mask = $(".mask");
      } else {
        mask = $("#mask");
      }
      $(modalcontainer).css("height", "70%");
      $(modalcontainer).css("max-height", "1200px");
      $(modalcontainer).empty();
      $(modalcontainer).append("<a href=\"#\" class=\"close\" role=\"button\"><img src=\"img/close-icon.png\" style=\"width: 22px; height: 22px;\"/></a>");
      $(modalcontainer).append("<div id=\"modalContent\" style=\"height: 95%; width: 100%; position: relative; margin: 0 auto; color: black; \"> &nbsp");
      $(modalcontainer).append("</div>");
      maskHeight = $(window).height();
      maskWidth = $(window).width();
      $(mask).css({
        width: maskWidth,
        height: maskHeight
      });
      $(mask).fadeIn(100);
      $(mask).fadeTo("fast", 0.8);
      winH = $(window).height();
      winW = $(window).width();
      $(modalcontainer).css("top", winH / 2 - $(modalcontainer).height() / 2);
      $(modalcontainer).css("left", winW / 2 - $(modalcontainer).width() / 2);
      $(modalcontainer).fadeIn(100);
      $(".close").click(function(e) {
        e.preventDefault();
        $(mask).hide();
        return $(modalcontainer).hide();
      });
      $(mask).click(function(e) {
        $(mask).hide();
        $(modalcontainer).hide();
        return $(modalcontainer).empty();
      });
      $(window).resize(function(e) {
        maskHeight = $(document).height();
        maskWidth = $(document).width();
        $(mask).css({
          width: maskWidth,
          height: maskHeight
        });
        winH = $(window).height();
        winW = $(window).width();
        $(modalcontainer).css("top", winH / 2 - $(modalcontainer).height() / 2);
        return $(modalcontainer).css("left", winW / 2 - $(modalcontainer).width() / 2);
      });
      return this.renderStatisticsInModalWindow();
    };

    return StatisticsPlugin;

  })(window.LimePlugin);

}).call(this);

(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.UserSettingsPlugin = (function(_super) {
    __extends(UserSettingsPlugin, _super);

    function UserSettingsPlugin() {
      _ref = UserSettingsPlugin.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    UserSettingsPlugin.prototype.init = function() {
      var annotation, button, widget,
        _this = this;
      this.name = 'UserSettingsPlugin';
      annotation = void 0;
      console.info("Initialize UserSettingsPlugin");
      $("div .usersettings").click(function() {
        _this.lime.player.pause();
        return _this.renderUserSettingsInModalWindow();
      });
      button = $("<div class='vjs-control usersettings' title='User settings' alt='User settings'><div></div></div>");
      button.click(function(e) {
        _this.lime.player.pause();
        return _this.renderUserSettingsInModalWindow();
      });
      $(this.lime.player.buttonContainer).append(button);
      if (this.options.permanentWidget) {
        console.info('Permanent widgets are on.');
        widget = this.lime.allocateWidgetSpace(this, {
          thumbnail: "img/settingsWidget.png",
          title: "User settings",
          type: "UserSettingsWidget",
          sortBy: function() {
            return 100000000;
          }
        });
        jQuery(widget).bind('activate', function(e) {
          _this.lime.player.pause();
          return _this.renderUserSettingsInModalWindow();
        });
        return _.defer(function() {
          return widget.setActive();
        });
      }
    };

    UserSettingsPlugin.prototype.defaults = {
      unhidable: [],
      permanentWidget: false
    };

    UserSettingsPlugin.prototype.getAllWidgetTypes = function() {
      var res;
      res = _(this.lime.widgets).chain().map(function(widget) {
        return widget.options.type;
      }).uniq().sort().difference(this.defaults.unhidable, 'UserSettingsWidget').value();
      return res;
    };

    UserSettingsPlugin.prototype.getHiddenWidgetTypes = function() {
      return JSON.parse(localStorage.getItem('hiddenWidgetTypes')) || [];
    };

    UserSettingsPlugin.prototype.setHiddenWidgetTypes = function(types) {
      var toBeShown;
      localStorage.setItem('hiddenWidgetTypes', JSON.stringify(types));
      toBeShown = _(this.getAllWidgetTypes()).difference(types).concat(this.defaults.unhidable);
      return this.lime.updateDeactivatedWidgetStates(toBeShown);
    };

    UserSettingsPlugin.prototype.hideWidgetType = function(type) {
      var hiddenTypes;
      hiddenTypes = this.getHiddenWidgetTypes();
      hiddenTypes.push(type);
      hiddenTypes = _(hiddenTypes).uniq();
      return this.setHiddenWidgetTypes(hiddenTypes);
    };

    UserSettingsPlugin.prototype.unhideWidgetType = function(type) {
      var hiddenTypes, index;
      hiddenTypes = this.getHiddenWidgetTypes();
      index = hiddenTypes.indexOf(type);
      hiddenTypes.splice(index, 1);
      return this.setHiddenWidgetTypes(hiddenTypes);
    };

    UserSettingsPlugin.prototype.renderUserSettingsInModalWindow = function() {
      var checked, modalContent, settingsElement, settingssection, widgetType, _i, _len, _ref1,
        _this = this;
      modalContent = this.getModalContainer();
      modalContent.css("width", "600px");
      modalContent.css("height", "auto");
      modalContent.css('overflow', 'auto');
      console.info("widget types:", this.getAllWidgetTypes());
      modalContent.append('<div class="settingscontent" style="color: white; width: 100%; height: auto; margin-top: 0; background: rgba(0,0,0,0.6);">');
      settingsElement = $('.settingscontent', modalContent);
      settingsElement.append("<span class=\"settingstitle\" style=\"font-size: 20px; margin-left: 10px;\">LIME player settings </span>");
      /*
      settingsElement.append """
        <p class="settingssection" style="font-size: 16px; "> Annotations </p>
        <form style="margin: 0 auto; text-align: left; font-size: 14px;width: 75%;">
          <div class="settingssection overlay-plugins" style="margin: 0 auto; ">
            <label><input type="checkbox" class="annotationspatialoverlay " checked="checked"> Show annotation overlays on the video</label><br/>
            <label><input type="checkbox" class="annotationtimelineoverlay setting" checked="checked"> Show annotation overlays on the timeline</label>
          </div>
        </form>
      """
      */

      $('.annotationspatialoverlay', settingssection).click(function(e) {});
      $('.annotationtimelineoverlay', settingssection).click(function(e) {});
      settingsElement.append("<p class=\"settingssection\" style=\"font-size: 16px; margin-left: 10px;\"> Widgets </p>\n<form style=\"margin: 0 auto; text-align: left; font-size: 14px; width: 75%;\" >\n  <div class=\"settingssection widget-types\" style=\"margin: 0 auto;\"></div>\n</form>\n<br/>");
      settingssection = $('div.settingssection.widget-types', settingsElement);
      _ref1 = this.getAllWidgetTypes();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        widgetType = _ref1[_i];
        checked = this.getHiddenWidgetTypes().indexOf(widgetType) === -1 ? 'checked' : '';
        settingssection.append("<div><label><input type='checkbox' name='" + widgetType + "' class='" + widgetType + " setting' " + checked + " > Show '" + widgetType + "' widgets</label></div>");
      }
      return $('.setting', settingssection).click(function(e) {
        var widgetName, widgetShown;
        widgetName = e.target.name;
        widgetShown = e.target.checked;
        if (widgetShown) {
          return _this.unhideWidgetType(widgetName);
        } else {
          return _this.hideWidgetType(widgetName);
        }
      });
    };

    return UserSettingsPlugin;

  })(window.LimePlugin);

}).call(this);
