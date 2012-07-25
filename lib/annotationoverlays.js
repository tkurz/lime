(function() {
  var RDF,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  window.AnnotationOverlays = (function(_super) {

    __extends(AnnotationOverlays, _super);

    AnnotationOverlays.name = 'AnnotationOverlays';

    function AnnotationOverlays() {
      return AnnotationOverlays.__super__.constructor.apply(this, arguments);
    }

    AnnotationOverlays.prototype.init = function() {
      var annotation, _i, _len, _ref, _results,
        _this = this;
      console.info("Initialize AnnotationOverlays");
	  
	  this.lime.player.addComponent("AnnotationOverlaysComponent");	  //add separate VideoJS component that holds overlays
	  this.lime.player.AnnotationOverlaysComponent.show();
	  container = jQuery('.annotation-overlays-wrapper');      	//div created by the AnnotationOverlaysComponent component of VideoJS
	  limeplayer=this.lime;
	  
      jQuery(this.lime).bind('timeupdate', function(e) {});
      _ref = this.lime.annotations;
      _results = [];      
	  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        annotation = _ref[_i];
        jQuery(annotation).bind('becomeActive', function(e) {
          //console.info(e.annotation, 'became active');
		  if(e.annotation.isSpacial && (e.annotation.w>0) && (e.annotation.h>0)){
			
			container.prepend(_this.renderAnnotation(e.annotation)); //display the overlay widget
			var domEl =  jQuery('.spatial_annotation:first', container.element);	//get the DOM element that holds the overlay
			
			domEl.hover(function(){ //hover behaviour
				$(this).fadeOut(50);
				$(this).fadeIn(50);
			})
		
			domEl.click(function(){ //click behaviour - highlight the related widgets by adding a class to them
				limeplayer.player.pause();
				for (var i in e.annotation.widgets){
					if(i!="AnnotationOverlays"){						
						var widgets = e.annotation.widgets[i];
						widgets.addClass("lime-widget-highlighted").delay(2000).queue(function(next){$(this).removeClass("lime-widget-highlighted");next();});
					}
				}
			});

			e.annotation.widgets.AnnotationOverlays = domEl;
            return domEl;
          } else {
            //debugger;
          }
        });
		
		_results.push(jQuery(annotation).bind("becomeInactive", function(e) {
			if(e.annotation.isSpacial && (e.annotation.w>0) && (e.annotation.h>0)) {
				e.annotation.widgets.AnnotationOverlays.remove();
				delete e.annotation.widgets.AnnotationOverlays;
				return;
			}
			else return false;
		}));
      }
      return _results;
    };

    AnnotationOverlays.prototype.renderAnnotation = function(annotation) {
      var depiction, label, page, props, _ref, _ref1;
	  var percentpixel = "px";
	  if(annotation.isPercent)	percentpixel = "%"; 	//percent values for overlays
      //console.info("rendering", annotation);
      if(annotation.ldLoaded) {
		  props = annotation.entity[annotation.resource.value];
	      label = _(props['http://www.w3.org/2000/01/rdf-schema#label']).detect(function(labelObj) {
        return labelObj.lang === 'en';
      }).value;
	  }
	  if(label==undefined) label = "";	//label will be put inside the spacial annotation
	  return "<div class='spatial_annotation' style='position: absolute; width: "+annotation.w + percentpixel + "; height: "+annotation.h + percentpixel + "; left: "+annotation.x + percentpixel + "; top: "+annotation.y + percentpixel + "'>"+label+"</div>";
    };

    return AnnotationOverlays;
  })(window.LimePlugin);



/*AnnotationOverlaysComponent VideoJS component -  displays overlays on top of video */	  
_V_.AnnotationOverlaysComponent = _V_.Component.extend({
  options: {
    loadEvent: "play",
  },
	
  init: function(player, options){
    this._super(player, options);
	this.player.AnnotationOverlaysComponent = this;	//attach Component for sidebar annotations to player
  },

  createElement: function(){	//we create a "annotation-overlays-wrapper" div which will hold the overlays written in via jQuery
	var d = _V_.createElement("div", {
      className: "annotation-overlays-wrapper",
    });
	return d;
  },
  
  fadeIn: function(){
    this._super();
  },

  fadeOut: function(){
    this._super();
  },

  lockShowing: function(){
    this.el.style.opacity = "1";
  }
}); 


}).call(this);
