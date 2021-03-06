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
