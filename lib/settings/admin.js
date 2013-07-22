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
