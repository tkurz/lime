/* Lime Player 2.1.0 - Linked Media Player
by Szaby Gruenwald, Cristian Bara and the ConnectMe Project.
Available under the Apache License, Version 2.0
See http://connectme.sti2.org/ for more information.
*/
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
        pauseOnWidgetopen: true,
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
          LDPlugin: {},
          CreditsPlugin: {}
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
        return [item.hash.resource.value, item.hash.fragment.value, item.hash.annotation.value].join('');
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
      if (this.options.widgetVisibility === 'scrolling-list' && this._isWidgetToBeShown(res)) {
        res.render();
        this.widgets.push(res);
        res.show();
        res.setInactive();
        if (this.getHiddenWidgetTypes().indexOf(options.type) !== -1) {
          res.element.addClass('deactivated');
        }
        this.updateWidgetsList();
      }
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
  var URI;

  window.Annotation = (function() {
    function Annotation(hash) {
      var fragmentHash, startEnd, t, xywh, _ref, _ref1, _ref2, _ref3, _ref4,
        _this = this;
      this.hash = hash;
      hash = this.hash;
      this._res = this.hash.resource.value;
      this._prefLabel = (_ref = this.hash.prefLabel) != null ? _ref.value : void 0;
      hash.fragment.value = hash.fragment.value.replace("?", "#");
      hash.fragment.type = 'uri';
      this.annotation = hash.annotation.value;
      this.start = 0;
      this.end = -1;
      this.state = 'inactive';
      this.widgets = {};
      jQuery(this).bind("mouseenter", function(e) {
        var widget, widgetname, _ref1, _results;
        _ref1 = _this.widgets;
        _results = [];
        for (widgetname in _ref1) {
          widget = _ref1[widgetname];
          _results.push(jQuery(widget).addClass("hover"));
        }
        return _results;
      });
      jQuery(this).bind("mouseleave", function(e) {
        var widget, widgetname, _ref1, _results;
        _ref1 = _this.widgets;
        _results = [];
        for (widgetname in _ref1) {
          widget = _ref1[widgetname];
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
          _ref1 = _(xywh[1].match(/([0-9]{1,})/g)).map(function(n) {
            return Number(n);
          }), this.x = _ref1[0], this.y = _ref1[1], this.w = _ref1[2], this.h = _ref1[3];
        }
      }
      this.isSpacial = this.x !== void 0 || ((((this.x === (_ref4 = this.y) && _ref4 === (_ref3 = this.w)) && _ref3 === (_ref2 = this.h)) && _ref2 === 0));
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
          if (_this.lime.options.pauseOnWidgetopen) {
            _this.plugin.lime.pause();
          }
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
          if (_this.lime.options.pauseOnWidgetopen) {
            plugin.lime.player.play();
          }
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
      return "PREFIX oac: <http://www.openannotation.org/ns/>\nPREFIX mao: <http://www.w3.org/ns/ma-ont#>\nPREFIX cma: <http://connectme.at/ontology#>\nPREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>\nSELECT DISTINCT ?annotation ?fragment ?resource ?relation ?type ?prefLabel ?latitude ?longitude\nWHERE {\n<" + resource + ">  mao:hasFragment ?f.\n?f mao:locator ?fragment.\n?annotation oac:hasTarget ?f.\n?annotation a ?type.\nOPTIONAL{?annotation cma:preferredLabel ?prefLabel.}\nOPTIONAL{?resource geo:lat ?latitude.}\nOPTIONAL{?resource geo:long ?longitude.}\n?annotation oac:hasBody ?resource.\n?f ?relation ?resource.\n}";
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
              if (annotation.hash.latitude) {
                console.info('annotation.hash.latitude:', annotation.hash, annotation.hash.latitude);
                return annotation.hash.latitude.value;
              } else {
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
              }
            };
            annotation.getLongitude = function() {
              var entity, value, _j, _len1, _ref2;
              if (annotation.hash.longitude) {
                return annotation.hash.longitude.value;
              } else {
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
              }
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
        if (_this.lime.options.pauseOnWidgetopen) {
          _this.lime.player.pause();
        }
        return _this.renderUserSettingsInModalWindow();
      });
      button = $("<div class='vjs-control usersettings' title='User settings' alt='User settings'><div></div></div>");
      button.click(function(e) {
        if (_this.lime.options.pauseOnWidgetopen) {
          _this.lime.player.pause();
        }
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
          if (_this.lime.options.pauseOnWidgetopen) {
            _this.lime.player.pause();
          }
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

function Utils() {
}
this.UTILS = this.UTILS || new Utils();

UTILS.getParameterByName = function(name)
{
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.search);
    if(results == null)
        return "";
    else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
}