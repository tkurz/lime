// Generated by CoffeeScript 1.3.3
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.TVPlugin = (function(_super) {

    __extends(TVPlugin, _super);

    function TVPlugin() {
      this._loadFullDbpediaEntity = __bind(this._loadFullDbpediaEntity, this);
      return TVPlugin.__super__.constructor.apply(this, arguments);
    }

    TVPlugin.prototype.init = function() {
      var annotation, _i, _len, _ref, _results;
      this.name = 'TVPlugin';
      console.info("Initialize " + this.name);
      _ref = this.lime.annotations;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        annotation = _ref[_i];
        if (annotation.resource.value.indexOf("dbpedia") > 0) {
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
      directorTypes: ["<http://dbpedia.org/class/yago/Director110014939>", "<http://dbpedia.org/class/yago/EnglishFilmDirectors>", "<http://dbpedia.org/class/yago/DanishFilmDirectors>", "<http://dbpedia.org/class/yago/SilentFilmDirectors>", "<http://dbpedia.org/class/yago/ItalianFilmDirectors>", "<http://dbpedia.org/class/yago/ScottishFilmDirectors>", "<http://dbpedia.org/class/yago/EnglishTheatreDirectors>", "<http://dbpedia.org/class/yago/DutchFilmDirectors>", "<http://dbpedia.org/class/yago/ArtisticDirectors>", "<http://dbpedia.org/class/yago/IndianFilmDirectors>", "<http://dbpedia.org/class/yago/TurkishFilmDirectors>", "<http://dbpedia.org/class/yago/HindiFilmDirectors>", "<http://dbpedia.org/class/yago/PolishFilmDirectors>", "<http://dbpedia.org/class/yago/RomanianFilmDirectors>", "<http://dbpedia.org/class/yago/MuslimAmericanFilmDirectors>", "<http://dbpedia.org/class/yago/SpanishFilmDirectors>", "<http://dbpedia.org/class/yago/BelgianFilmDirectors>", "<http://dbpedia.org/class/yago/EgyptianFilmDirectors>", "<http://dbpedia.org/class/yago/PakistaniFilmDirectors>", "<http://dbpedia.org/class/yago/IranianFilmDirectors>", "<http://dbpedia.org/class/yago/ItalianBritishFilmDirectors>", "<http://dbpedia.org/class/yago/BrazilianFilmDirectors>", "<http://dbpedia.org/class/yago/IcelandicFilmDirectors>", "<http://dbpedia.org/class/yago/AustralianTelevisionDirectors>", "<http://dbpedia.org/class/yago/M%C3%A9tisFilmDirectors>", "<http://dbpedia.org/class/yago/BengaliFilmDirectors>", "<http://dbpedia.org/class/yago/ColombianFilmDirectors>", "<http://dbpedia.org/class/yago/KannadaFilmDirectors>", "<http://dbpedia.org/class/yago/AmericanFilmDirectorsOfArmenianDescent>", "<http://dbpedia.org/class/yago/BangladeshiFilmDirectors>", "<http://dbpedia.org/class/yago/KurdishFilmDirectors>", "<http://dbpedia.org/class/yago/NativeAmericanFilmDirectors>", "<http://dbpedia.org/class/yago/PortuguEseFilmDirectors>", "<http://dbpedia.org/class/yago/AmericanFilmDirectors>", "<http://dbpedia.org/class/yago/English-languAgeFilmDirectors>"]
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
            return _this._loadFullDbpediaEntity(entity, function(fullEntity) {
              return _this.processAnnotation(annotation, fullEntity);
            });
          }
        }
      });
    };

    TVPlugin.prototype.processAnnotation = function(annotation, typeArray) {
      var widget, widgetType;
      if (_.intersection(typeArray.attributes['@type'], this.options.actorTypes).length) {
        console.info('Render Actor widget');
        widgetType = 'ActorWidget';
        widget = this._initWidget(annotation, widgetType, this.renderActor, {
          thumbnail: "img/info.png",
          title: "" + (annotation.getLabel()) + " (Actor)",
          type: widgetType,
          sortBy: function() {
            return 10000 * annotation.start + annotation.end;
          }
        });
      }
      if (_.intersection(typeArray.attributes['@type'], this.options.characterTypes).length) {
        console.info('Render Character widget');
        widgetType = 'CharacterWidget';
        widget = this._initWidget(annotation, widgetType, this.renderCharacter, {
          thumbnail: "img/info.png",
          title: "" + (annotation.getLabel()) + " (Character)",
          type: widgetType,
          sortBy: function() {
            return 10000 * annotation.start + annotation.end;
          }
        });
      }
      if (_.intersection(typeArray.attributes['@type'], this.options.directorTypes).length) {
        console.info('Render Director widget');
        widgetType = 'DirectorWidget';
        return widget = this._initWidget(annotation, widgetType, this.renderDirector, {
          thumbnail: "img/info.png",
          title: "" + (annotation.getLabel()) + " (Director)",
          type: widgetType,
          sortBy: function() {
            return 10000 * annotation.start + annotation.end;
          }
        });
      }
    };

    TVPlugin.prototype.renderActor = function(annotation, container) {
      var comment, label, lime, modalContent, page, result, starringList;
      modalContent = $(container);
      modalContent.css("width", "600px");
      modalContent.css("height", "auto");
      label = annotation.getLabel();
      page = annotation.getPage();
      starringList = annotation.getStarring();
      console.log("---- Movies", starringList);
      lime = this.lime;
      comment = annotation.getDescription();
      result = "         <div id=\"ifoWidgetExpanded\" style=\"border: 1px dotted lightgray; position: relative;height: auto; width: 600px;\">\n         <div id=\"infoWidget\" style=\"background-color: rgba(37, 37, 37, 0.7); height: 40px; left: 0px; width: 100%; position: relative; float: left;\">\n         <div class=\"infoWidgeticon\" style=\"border-right: 1px dotted lightgray; position: relative; height: 100%; float: left; background-color: #3f3e3e; width: 8%;\">\n         <span data-dojo-type=\"shapes.Text\" id=\"iconLabel\" style=\"font: Times; position: relative; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: #f38f0b; font-family: 'Times New Roman',Times,serif; font-style: italic;\">i</span>\n         </div>\n         <div class=\"infoWidgetTitle\" style=\"font: Arial; position: relative; float: left; height: 100%; width: 86%; font-family: Arial,Helvetica,sans-serif; font-size: 26px; color: white; font-weight: normal; text-align: left; vertical-align: middle; text-indent: 1em; line-height: 140%;\">\n" + label + "</div>\n         </div>\n         <div id=\"infoText\" style=\"padding: 10px; position: relative; float: left; background-color: rgba(68, 68, 68, 0.7); height: auto; font-style: normal; width: 96%;\">\n         <div id=\"infoTextBioTitle\" style=\"font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange; height: auto;\">\n         Bio</div>\n         <div id=\"infoTextBio\" style=\"font: Helvetica; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; float: left; line-height: normal; position: relative; height: auto; width: 100%;\">\n" + comment + "\n         </div>\n         <div id=\"infoTextCareerTitle\" style=\"font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange;\">\n         Movies</div>\n               <div id=\"infoTextCareer\" style=\"font: Helvetica; width: 100%; position: relative; float: left; height: auto; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; line-height: normal;\">\n" + starringList + "</div>\n               <div id=\"infoTextAwardsTitle\" style=\"font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange;\">\n               Awards</div>\n               <div id=\"infoTextAwards\" style=\"font: Helvetica; width: 100%; position: relative; float: left; height: auto; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; line-height: normal;\">\n               Spaghetti Master</div>\n               </div>\n               </div>";
      return container.append(result);
    };

    TVPlugin.prototype.renderCharacter = function(annotation, container) {
      var label, modalContent, page, result;
      modalContent = $(container);
      modalContent.css("width", "600px");
      modalContent.css("height", "auto");
      label = annotation.getLabel();
      page = annotation.getPage();
      result = "         <div id=\"ifoWidgetExpanded\" style=\"border: 1px dotted lightgray; position: relative;height: auto; width: 600px;\">\n         <div id=\"infoWidget\" style=\"background-color: rgba(37, 37, 37, 0.7); height: 40px; left: 0px; width: 100%; position: relative; float: left;\">\n         <div class=\"infoWidgeticon\" style=\"border-right: 1px dotted lightgray; position: relative; height: 100%; float: left; background-color: #3f3e3e; width: 8%;\">\n         <span data-dojo-type=\"shapes.Text\" id=\"iconLabel\" style=\"font: Times; position: relative; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: #f38f0b; font-family: 'Times New Roman',Times,serif; font-style: italic;\">i</span>\n         </div>\n         <div class=\"infoWidgetTitle\" style=\"font: Arial; position: relative; float: left; height: 100%; width: 86%; font-family: Arial,Helvetica,sans-serif; font-size: 26px; color: white; font-weight: normal; text-align: left; vertical-align: middle; text-indent: 1em; line-height: 140%;\">\n" + label + "</div>\n         </div>\n         <div id=\"infoText\" style=\"padding: 10px; position: relative; float: left; background-color: rgba(68, 68, 68, 0.7); height: auto; font-style: normal; width: 96%;\">\n         <div id=\"infoTextBioTitle\" style=\"font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange; height: auto;\">\n         Bio</div>\n         <div id=\"infoTextBio\" style=\"font: Helvetica; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; float: left; line-height: normal; position: relative; height: auto; width: 100%;\">\n" + comment + "\n         </div>\n         <div id=\"infoTextCareerTitle\" style=\"font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange;\">\n         Movies</div>\n         <div id=\"infoTextCareer\" style=\"font: Helvetica; width: 100%; position: relative; float: left; height: auto; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; line-height: normal;\">\n         The Big Bang Theory</div>\n         <div id=\"infoTextAwardsTitle\" style=\"font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange;\">\n         Awards</div>\n         <div id=\"infoTextAwards\" style=\"font: Helvetica; width: 100%; position: relative; float: left; height: auto; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; line-height: normal;\">\n         Spaghetti Master</div>\n         </div>\n         </div>";
      return container.append(result);
    };

    TVPlugin.prototype.renderDirector = function(annotation, container) {
      var label, modalContent, page, result;
      modalContent = $(container);
      modalContent.css("width", "600px");
      modalContent.css("height", "auto");
      label = annotation.getLabel();
      page = annotation.getPage();
      result = "         <div id=\"ifoWidgetExpanded\" style=\"border: 1px dotted lightgray; position: relative;height: auto; width: 600px;\">\n         <div id=\"infoWidget\" style=\"background-color: rgba(37, 37, 37, 0.7); height: 40px; left: 0px; width: 100%; position: relative; float: left;\">\n         <div class=\"infoWidgeticon\" style=\"border-right: 1px dotted lightgray; position: relative; height: 100%; float: left; background-color: #3f3e3e; width: 8%;\">\n         <span data-dojo-type=\"shapes.Text\" id=\"iconLabel\" style=\"font: Times; position: relative; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: #f38f0b; font-family: 'Times New Roman',Times,serif; font-style: italic;\">i</span>\n         </div>\n         <div class=\"infoWidgetTitle\" style=\"font: Arial; position: relative; float: left; height: 100%; width: 86%; font-family: Arial,Helvetica,sans-serif; font-size: 26px; color: white; font-weight: normal; text-align: left; vertical-align: middle; text-indent: 1em; line-height: 140%;\">\n" + label + "</div>\n         </div>\n         <div id=\"infoText\" style=\"padding: 10px; position: relative; float: left; background-color: rgba(68, 68, 68, 0.7); height: auto; font-style: normal; width: 96%;\">\n         <div id=\"infoTextBioTitle\" style=\"font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange; height: auto;\">\n         Bio</div>\n         <div id=\"infoTextBio\" style=\"font: Helvetica; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; float: left; line-height: normal; position: relative; height: auto; width: 100%;\">\n" + comment + "\n         </div>\n         <div id=\"infoTextCareerTitle\" style=\"font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange;\">\n         Movies</div>\n         <div id=\"infoTextCareer\" style=\"font: Helvetica; width: 100%; position: relative; float: left; height: auto; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; line-height: normal;\">\n         The Big Bang Theory</div>\n         <div id=\"infoTextAwardsTitle\" style=\"font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: orange;\">\n         Awards</div>\n         <div id=\"infoTextAwards\" style=\"font: Helvetica; width: 100%; position: relative; float: left; height: auto; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; line-height: normal;\">\n         Spaghetti Master</div>\n         </div>\n         </div>";
      return container.append(result);
    };

    TVPlugin.prototype._loadFullDbpediaEntity = function(entity, callback) {
      var _this = this;
      return this.vie.load({
        entity: entity.getSubject()
      }).using('dbpedia').execute().success(function(fullEntity) {
        entity.set(fullEntity);
        return callback(fullEntity);
      });
    };

    TVPlugin.prototype._initWidget = function(annotation, widgetType, renderMethod, widgetOptions) {
      var widget,
        _this = this;
      widget = this.lime.allocateWidgetSpace(this, widgetOptions);
      widget.annotation = annotation;
      jQuery(widget).bind('activate', function(e) {
        return renderMethod(annotation, _this.getModalContainer());
      });
      annotation.widgets[widgetType] = widget;
      jQuery(annotation).bind("becomeActive", function(e) {
        return annotation.widgets[widgetType].setActive();
      });
      return jQuery(annotation).bind("becomeInactive", function(e) {
        return annotation.widgets[widgetType].setInactive();
      });
    };

    return TVPlugin;

  })(window.LimePlugin);

}).call(this);