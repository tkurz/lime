(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.CreditsPlugin = (function(_super) {
    __extends(CreditsPlugin, _super);

    function CreditsPlugin() {
      _ref = CreditsPlugin.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    CreditsPlugin.prototype.init = function() {
      var annotation, button, widget,
        _this = this;
      this.name = 'Credits';
      annotation = void 0;
      console.info("Initialize Credits");
      $("div .help").click(function() {
        if (_this.lime.options.pauseOnWidgetopen) {
          _this.lime.player.pause();
        }
        return _this.renderCreditsInModalWindow();
      });
      button = $("<div class='vjs-control credits' title='Credits' alt='Credits' style='font-size: 18px;top: 2px;float: right;'>&copy;<div></div></div>");
      button.click(function(e) {
        if (_this.lime.options.pauseOnWidgetopen) {
          _this.lime.player.pause();
        }
        return _this.renderCreditsInModalWindow();
      });
      $(this.lime.player.buttonContainer).append(button);
      if (this.options.permanentWidget) {
        console.info('Permanent widgets are on.');
        widget = this.lime.allocateWidgetSpace(this, {
          thumbnail: "img/creditsWidget.png",
          title: "Credits",
          type: "CreditsWidget",
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
          if (_this.lime.options.pauseOnWidgetopen) {
            _this.lime.player.pause();
          }
          return _this.renderCreditsInModalWindow();
        });
        return _.defer(function() {
          return widget.setActive();
        });
      }
    };

    CreditsPlugin.prototype.defaults = {
      unhidable: [],
      permanentWidget: false
    };

    CreditsPlugin.prototype.renderCreditsInModalWindow = function() {
      var modalContent;
      modalContent = this.getModalContainer();
      modalContent.css("width", "600px");
      modalContent.css("height", "auto");
      modalContent.css('overflow', 'auto');
      return modalContent.append("<div>\n<p>The <a href=\"https://github.com/szabyg/lime\" target=\"_blank\">ConnectME LIME player</a> was originally developed in the\n<a href=\"http://www.connectme.at\" target=\"_blank\">ConnectME project</a> funded by the\n<a href=\"http://www.ffg.at/coin\" target=\"_blank\">FFG in the COIN program by\n<a href=\"http://www.salzburgresearch.at\" target=\"_blank\">Salzburg Research</a>,\n<a href=\"http://www.sti2.org\" target=\"_blank\">STI International</a> and\n<a href=\"http://www.seekda.com\" target=\"_blank\">Seekda GmbH</a>.\nDevelopment by Szaby Grünwald, Cristian Bara and Sorin Petan.</p>\n<br/>\n<p>&copy; 2013 Salzburg Research, STI International and Seekda GmbH.<br/>\nAvailable under Apache 2.0 license at http://szabyg.github.io/lime.</p>\n<p>For more information contact szaby.gruenwald@salzburgresearch.at</p>\n</div>");
    };

    return CreditsPlugin;

  })(window.LimePlugin);

}).call(this);
