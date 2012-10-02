(function() {
	var RDF, __bind = function(fn, me) {
		return function() {
			return fn.apply(me, arguments);
		};
	}, __hasProp = {}.hasOwnProperty, __extends = function(child, parent) {
		for (var key in parent) {
			if (__hasProp.call(parent, key))
				child[key] = parent[key];
		}
		function ctor() {
			this.constructor = child;
		}


		ctor.prototype = parent.prototype;
		child.prototype = new ctor;
		child.__super__ = parent.prototype;
		return child;
	};

	window.AnnotationModalWindow = (function(_super) {

		__extends(AnnotationModalWindow, _super);

		AnnotationModalWindow.name = 'AnnotationModalWindow';

		function AnnotationModalWindow() {
			return AnnotationModalWindow.__super__.constructor.apply(this, arguments);
		}

var isPaused = false;
		AnnotationModalWindow.prototype.init = function() {
			var annotation, _i, _len, _ref, _results, _this = this;
			console.info("Initialize AnnotationModalWindow");

			var modalcontainer = jQuery('body');
			//div created by the AnnotationOverlaysComponent component of VideoJS
			limeplayer = this.lime;

			//modalcontainer = jQuery('video');
			
			console.log("video:", modalcontainer);
			modalcontainer.keydown(function(event) {//click behaviour - highlight the related widgets by adding a class to them
				if (event.which == 99) {
					$(".textAbstract:first").trigger('click');
					isPaused = false;
				}
				if (event.which == 101) {// numpad 5 = OK
					if(isPaused){limeplayer.player.play();}
					
					isPaused = false;
				}
				if (event.which == 105) {// numpad 9 = GREEN
					
					$(".geonamesMap:first").trigger('click');
					isPaused = false;					
					console.log(" ---- GREEN ----");
				}
				if (event.which == 103) {// numpad 7 = RED
					
					$(".googleWeather:first").trigger('click');
					isPaused = false;
					console.log(" ---- RED ----");
				}
				if (event.which == 97) {// numpad 3 = YELLOW
					$(".depictionWidget:first").trigger('click');
					isPaused = false;
					console.log(" ---- YELLOW ----");
				}
				if (event.which == 8) {// numpad backspace = ESC
					event.preventDefault();
					$('.close').trigger('click');
					console.log(" ---- ESC ----");
					isPaused = true;
				}
			});

		}

		return AnnotationModalWindow;
	})(window.LimePlugin);

}).call(this);



