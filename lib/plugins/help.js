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
