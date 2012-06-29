// JavaScript Document
//this document holds external JS non-connected to the VideoJS player itself

/* Global Vars
================================================================================ */
var LimeAnnotations= [],
	activeAnnotations = [],
	WidgetPool;
//var VideoJS_Player = [];

/* Init
================================================================================ */
function LIMEPlayer(opts){
	var options = {	//default values
		AnnotFrameworkURL: "http://labs.newmedialab.at/SKOS/",
		ContainerDiv: "mainwrapper",
		VideoPlayerSize: {"width": 640, "height": 360},
		VPlayer: "VideoJS",
		AnnotFrameworkURL: "http://labs.newmedialab.at/SKOS/",	//LMF URL
		Widgets: ["infobox", "imagebox"],	//list of allowed widgets
		Platform: "web",			//autodetecting
		Fullscreen: "false",		//toggle true/false
		DimensionsNWSE: {"AnnotationNorth": 50, "AnnotationWest": 300, "AnnotationSouth": 50, "AnnotationEast": 300},	//how big should be the annotation areas surrounding the video
		UsedSpaceNWSE: {"north": 0, "west": 0, "south": 0, "east": 0},	//space used by annotations
		AnnotationsVisible : true,
		TimeInterval: 1000,
	}
	if(opts) $.extend(options, opts);
	this.options = options;	//attach to object for quick use
	
	var parent = this;
	
	initVideoPlayer = function(vplayer, containerdiv){
		var displaysrc='';
		for(i in options.Video){ 
			displaysrc = displaysrc + '<source src="' + options.Video[i] + '"  type="video/' + returnFileExtension(options.Video[i]) + '" />';
		}
		//create div elements as specified in the settings - if dimension is zero, they don't get created
		if(options.DimensionsNWSE.AnnotationNorth>0)
			$("#"+containerdiv).append("<div id='north' class='north' style='height: "+ options.DimensionsNWSE.AnnotationNorth +"px'></div>");
		if(options.DimensionsNWSE.AnnotationWest>0)
			$("#"+containerdiv).append("<div id='west' class='west' style='width: "+ options.DimensionsNWSE.AnnotationWest +"px'></div>");
		//create center div with player, <video> id is 'videoplayer' - this gets passed to the VideoJS initializer
		$("#"+containerdiv).append('<div class="videowrapper" id="videowrapper"><video id="video_player" class="video-js vjs-default-skin" controls preload="metadata"   width="640" height="360"  data-setup="{}" poster="img/connectme-video-poster.jpg">' + displaysrc + '</video></div>');// width="' + options.VideoPlayerSize.width+'" height="' + options.VideoPlayerSize.height + '"
		if(options.DimensionsNWSE.AnnotationEast>0)
			$("#"+containerdiv).append("<div id='east' class='east' style='width: "+ options.DimensionsNWSE.AnnotationEast +"px'></div>");
		if(options.DimensionsNWSE.AnnotationSouth>0)
			$("#"+containerdiv).append("<div id='south' class='south' style='height: "+ options.DimensionsNWSE.AnnotationSouth +"px'></div>");

		if(vplayer=="VideoJS") {
			VideoJS_Player = _V_('video_player');
			VideoJS_Player.ready(function(){
			//_V_("videoplayer", {}, function(){
				console.info("Setting up VideoJS Player");
				VideoJS_Player.play();	
				//VideoJS_Player.addEvent("loadedmetadata", autoseekvideo);
				//VideoJS_Player.addEvent("loadedmetadata", scale);
				//$(parent).trigger('VideoJSReady');	//
				initController();
			});
			return VideoJS_Player;
		}
	}
	
	initController = function(){	//init controller
		LimeControl = new LimeController(options);
	}
	initWidgets = function(widgetarray){
		//todo 
	}
	
	initVideoPlayer(options.VPlayer, options.ContainerDiv);	//init VideoJS Player
	
	initWidgets(options.Widgets);	//init widgets - maybe we don't need this
	
	$(parent).on('AnnotationsLoadedOK', function () {
			console.info( 'Annotations Loaded' );
			console.log(LimeControl);
			console.log(Annotations);
			console.log(VideoJS_Player);
			LimeControl.CheckAndDisplayAnnotations();	//triggers display of annotations - i need to change this to make it the other way around (widgets request display space)	
	});
}

/* Controller
================================================================================ */
function LimeController(opts) {
	var options = {	//default values
			videodiv : "#video_player",
			activeAnnotations: [],
			areasAvailable: "",
	}
	var parent = this;
	if(opts) $.extend(options, opts);
	for(var i in options) {
  		parent[i] = options[i];
	}	
	
	init = function(){
		console.info("Initalizing controller");
		Annotations = new AnnotationsModel(options.Video, options.AnnotFrameworkURL);	//loads Annotations		
	}
	init();
	
	this.CheckAndDisplayAnnotations = function(){
		var UID_annotation;
		var tempannotIDs=[];
		currenttime=timeofvideo();
		for(var i in LimeAnnotations) {
			UID_annotation = Annotations.GetUIDFromAnnotation(LimeAnnotations[i].annotation);
			if((LimeAnnotations[i].fragment.time.start<=currenttime) && (LimeAnnotations[i].fragment.time.end>=currenttime)){	//active annotation
				if($.inArray(UID_annotation, activeAnnotations)<0) {	//annotation should display, it's not in the annotations currently being displayed
					activeAnnotations.push(UID_annotation);
					ShowWidget(UID_annotation, LimeAnnotations[i].resource, LimeAnnotations[i].relation, LimeAnnotations[i].fragment, 1);
				}
				else {	
					//do nothing, it's already displaying
				}
			}
			else {	//annotation is not inside its display time
				RemoveWidget(UID_annotation);
				removeItemFromArray(activeAnnotations, UID_annotation);
				
			}
		}
		console.log(activeAnnotations);
		setTimeout(parent.CheckAndDisplayAnnotations, options.TimeInterval);	
	}
	
	
	//checks for available space on the annotation areas, if space found, creates the div and returns id of div created, if no space found, returns false
	this.AllocateSpace = function(w, h, pos, annotationID){	
		var southHeight = parseInt($(".south").height());
		var southWidth = parseInt($(".south").css("max-width").match(/\d+/));
		var northHeight = parseInt($(".north").height());
		var northWidth = parseInt($(".north").css("max-width").match(/\d+/));
		var eastHeight = parseInt($(".east").css("max-height").match(/\d+/));
		var eastWidth = parseInt($(".east").width());
		var westHeight = parseInt($(".west").css("max-height").match(/\d+/));
		var westWidth = parseInt($(".west").width());
		
		if(southWidth > $(window).width()) southWidth = $(window).width();
		if(northWidth > $(window).width()) northWidth = $(window).width();
	
		//simple prioritizing mechanism
		var target, result;
		if(!pos) {
			if((w >= eastWidth) || (w >= westWidth)) pos = horizontal;	//doesn't fit in the side annotation areas - suggestion to fit in in the top/bottom
			else if((h >= northHeight) || (h >= southHeight)) pos = vertical;	//doesn't fit in the top/bottom annotation areas - suggestion to fit in in the side ones
		}
		if((pos == "vertical") || (h>w)){	//widget is requesting vertical display - first options are E and W
			if((westHeight-LimePlayer.options.UsedSpaceNWSE.west) > h) target="west";
			else if((eastHeight-LimePlayer.options.UsedSpaceNWSE.east) > h) target="east";
		}
		else if((pos == "horizontal")  || (h<w)){	//widget is requesting horizontal display  - first options are N and S
			if((southWidth-LimePlayer.options.UsedSpaceNWSE.south) > w) target="south";
			else if((northWidth-LimePlayer.options.UsedSpaceNWSE.north) > w) target="north";
		}
		if(target){
			$("."+target).append("<div class='widget "+annotationID+"' id='"+annotationID+"'>"+annotationID+"</div>");	//create div
			$("#"+annotationID).css({"width": w, "height": h});
			if(pos == "horizontal") $("#"+annotationID).css({"position": "relative", "float": "left"});	// for the horizontal areas to display side by side instead of vertically
			result = annotationID;
			if((target == "north") || (target == "south")) LimePlayer.options.UsedSpaceNWSE[target] = (LimePlayer.options.UsedSpaceNWSE[target] + w);
			else LimePlayer.options.UsedSpaceNWSE[target] = (parseInt(LimePlayer.options.UsedSpaceNWSE[target]) + parseInt(h));
			console.log("target "+annotationID + ": "+target+"; Used space "+target+": "+LimePlayer.options.UsedSpaceNWSE[target]);
		}
		else result = false;	//no space found
		return(result);
	}
}

/* Model
================================================================================ */
function AnnotationsModel(video, AnnotFrameworkURL){
	//var spAnnotComponent= new _V_.SpatialAnnotComponent(VideoJS_Player, {});	//will hold all the spatial annotations objects
	//var AnnotationArray=[];			//an attempt to hold the spatial annotation objects the way VideoJS stores them in an array
	console.info("Loading annotations from LMF");
	var AnnotationsArray=[];	//to hold annotations
	var query = "PREFIX oac: <http://www.openannotation.org/ns/>"+
                "PREFIX ma: <http://www.w3.org/ns/ma-ont#> "+
                "SELECT ?annotation ?fragment ?resource ?relation "+
                "WHERE { <" + video + ">  ma:hasFragment ?f."+
                "   ?f ma:locator ?fragment."+
                "   ?annotation oac:target ?f."+
                "   ?annotation oac:body ?resource."+
                "   ?f ?relation ?resource."+
                "}";
	var parent = this;
   	$.getJSON(AnnotFrameworkURL+"sparql/select?query="+encodeURIComponent(query)+"&output=json",function(data){																								
            var list = data.results.bindings;	
			for(var i in list) {	//loop through all the annotations
                var ann = list[i].annotation.value;
                var frg = UTILS.model.uri.create(list[i].fragment.value).getFragment();
                var res = list[i].resource.value;
                var rel = list[i].relation.value;
				if(frg.region == undefined) {	//adding coordinates 0,0,0,0 to temporal-only annotations, if they are not defined
					frg.region={x: 0, y: 0, w: 0, h: 0, type: "percent"};
				}
				AnnotationsArray.push({annotation: ann, fragment: frg, resource: res, relation: rel});	//build an array of annotations			
				//just for debugging
				/*$("#east").append(i+". "+ann + " - " + res + " - " + rel+", Time: " + frg.time.start+ "-"+frg.time.end);
				if(frg.region) $("#east").append(", Coordinates: xywh: "+frg.region.x + ", "+frg.region.y + ", "+frg.region.w + ", "+frg.region.h);
				$("#east").append("<br><hr>");*/
            }
			LimeAnnotations=AnnotationsArray;
            ready=true;	
			if(AnnotationsArray.length>0) {	
				$(LimePlayer).trigger('AnnotationsLoadedOK');
			}
	});
	
	this.GetUIDFromAnnotation = function (string){
		return string.substring(string.lastIndexOf('/')+1);	//to obtain the last part of the annotation URL - to use as unique identifier for the annotation
	}
}
	

/* Basic Widget
================================================================================ */
function generic_widget(resource, opts){
	var options = {	//default values
		Title : "",
		Content: "",
		Context: "",
		AreaNeeded: {"width": 200, "height": 100},
		PreferredLocation: "West",
		Orientation: "wide",
		Importance: 1,
		UID_annotation: "",
		MinimumWidgetDisplayTime: 5000,
		Resource: resource,
	} 
	var parent = this;
	if(opts) $.extend(options, opts);
	for(var i in options) {
  		parent[i] = options[i];
	}
	
	this.init = function(){
		var UID_annotation;
		//currenttime=timeofvideo();
		for(var i in LimeAnnotations) {
			this.UID_annotation = Annotations.GetUIDFromAnnotation(LimeAnnotations[i].annotation);
			if((LimeAnnotations[i].fragment.time.start<=currenttime) && (LimeAnnotations[i].fragment.time.end>=currenttime)){	//active annotation
				if($.inArray(UID_annotation, activeAnnotations)<0) {	
					activeAnnotations.push(UID_annotation);
					ShowWidget(UID_annotation, LimeAnnotations[i].resource, LimeAnnotations[i].relation, LimeAnnotations[i].fragment, 1);
				}
			}
		}
	}
	
	this.display = function(widgetid){	
		var locationDiv = LimeControl.AllocateSpace(options.AreaNeeded.width, options.AreaNeeded.height, options.Orientation, UID_annotation); 
		console.log(locationDiv);
		$("#"+locationDiv).prepend("<div class='widget' id='"+this.UID_annotation+"'><a href='"+this.Resource+ "'>"+this.Resource+ "</a> ");
	}
	
	this.createWidget = function(widgetid){	
		$(".east").prepend("<div class='widget' id='"+this.UID_annotation+"'><a href='"+this.Resource+ "'>"+this.Resource+ "</a> ");
	}
	
	this.destroy = function(){
		$("#"+UID_annotation).remove();
	}
	this.onclick = function(){		//to do
	}
	this.onmouseover = function(){
		//to do
	}
	
	/*
	function checkWidgets() {
			time=timeofvideo();
			var annot=LimePlayer._LimeAnnotationsArray;
			//console.log(LimePlayer._LimeAnnotationsArray);
			for(var i in annot) {
				var temporal=0;
				var frg = annot[i].fragment;
				var ann = annot[i].annotation;
                var res = annot[i].resource;
                var rel = annot[i].relation;
				
				if((frg.region.x==0)&& (frg.region.y==0)) {	//adding coordinates 0,0,0,0 to temporal-only annotations, if they are not defined
					temporal=1;
				}
				 
				var a=".annotation-wrapper_"+uid;	//spatial annotation id
				var t="#"+uid;
				//console.log(a);
				if((frg.time.start<=time) && (frg.time.end>=time)){	//the fragment should be active
					if($(a).length==0) 
						createSpatialAnnotation(ann, res, frg, rel);	//just for spatial annotations
						if((temporal==1) && ($(t).length==0)) ShowWidget(ann, res, rel, frg, 1);
				}
				else {		//the fragment has expired, remove it			
					if($(a).length>0) $(a).remove();
					if($(t).length>0) $(t).remove();
				}
			}
			VideoJS_Player.addComponent(spAnnotComponent);
			//console.log(spAnnotComponent);
			setTimeout(checkWidgets, 1000);
			
	}	
	
	//this creates individual spatial annotations as "player buttons" (Spatialannot) and then adds them to the main spatial annotation component, 
	function createSpatialAnnotation(annotation,resource,fragment,relation){
		var opts = {	//to pass on to annotation component
			annotation : annotation,
			resource : resource,
			relation : relation,
			x : fragment.region.x,
			y : fragment.region.y,
			w : fragment.region.w,
			h : fragment.region.h,
			type : fragment.region.type,
			start : fragment.time.start,
			end : fragment.time.end,	
		};
		

		if ((opts.x!=0) && (opts.y!=0) && (opts.w!=0) && (opts.h!=0)){ //spatial annotations only
			//add button with individual annotation to component - not happy with this though, it overwrites the previos values and only keeps the last one in the Component; I got it working, but it's a hack
			var s= new _V_.Spatialannot(VideoJS_Player,opts);
			spAnnotComponent.addItem(s);	
			
			//THIS IS WHAT I NEED TO LOOK AT, too tired to do it now
			AnnotationArray.push(new _V_.Spatialannot(VideoJS_Player,opts));	//store all the spatial annotation buttons into an array of buttons, then somehow attach it to the component
			//see example - the way the player addssubtitles 
			//menu.addItem(new _V_.OffTextTrackMenuItem(this.player, { kind: this.kind }))

		}
		else {//just temporal annotations, doens't apply here
		}
	}*/


}

/* Other functions
================================================================================ */
function ShowWidget(widgetid, resource, relation, timefragment, priority){		//this is just a demo - I need to change this
	$(".east").prepend("<div class='widget' id='"+widgetid+"'><a href='"+resource+ "'>"+resource+ "</a> ");
}

function RemoveWidget(widgetid){
	$("#"+widgetid).remove();
}


/* VIDEOJS COMPONENT TO DISPLAY 4 REGIONS OF ANNOTATIONS
===========================================================*/
_V_.Annotations = _V_.Component.extend({	//for  annotations on the sidebars
  options: {
    loadEvent: "play",
	AnnotWest: true,
	AnnotEast: true,
	AnnotNorth: true,
	AnnotSouth: true
  },
	
  init: function(player, options){
    this._super(player, options);
	player.addEvent("fullscreenchange", this.proxy(function(){	//for hiding overlay annotations when not in fullscreen
		if(this.player.isFullScreen==false) 
			this.hide();
			//this.destroy();	//not sure if we need/want this
	}));
    player.addEvent("play", this.proxy(function(){
      this.fadeIn();
      this.player.addEvent("mouseover", this.proxy(this.fadeIn));
     // this.player.addEvent("mouseout", this.proxy(this.fadeOut));		/should hide when mouse out perhaps
    }));
	LimePlayer.options.AnnotationsVisible = true;	//control variable -  attach to player to use for toggling annotations on/off - default to true
	this.player.Annotations = this;	//attach Component for sidebar annotations to player
  },
//create divs that will hold annotations - copying the content of the external annotation divs
  createElement: function(){
	  var w=document.getElementById("west").innerHTML;	//copy content from the outside annotation divs
	  var e=document.getElementById("east").innerHTML;
	  var n=document.getElementById("north").innerHTML;
	  var s=document.getElementById("south").innerHTML;
	 
      var annotwrapper = _V_.createElement("div", {		//fullscreen wrapper to hold the 4 annotation regions
      	className: "annotation-wrapper",
		id: "annotation-wrapper"
  	  });
	
	 //this copies content from the 4 external annotation fields, it doesn't detact & reattach them over the player - there are advantages for both implementations
	 if(this.options.AnnotNorth==true){
		 this.content = _V_.createElement("div", {	//append content from external annotation div, adding id and class 
			 className: "north fullscreen-annotation-north",
			 innerHTML: n,	
			 id: "north"
	  	 }),
		 annotwrapper.appendChild(_V_.createElement("div").appendChild(this.content));
	 };
	 
	 if(this.options.AnnotSouth==true) {
		 this.content = _V_.createElement("div", {
			className: "south fullscreen-annotation-south",
			innerHTML: s,
			id: "south"
		}),
		  annotwrapper.appendChild(_V_.createElement("div").appendChild(this.content));
	 };

	 if(this.options.AnnotEast==true){
		 this.content = _V_.createElement("div", {
		 	className: "east fullscreen-annotation-east",
			innerHTML: e,
		 	id: "east"
		 }),
		 annotwrapper.appendChild(_V_.createElement("div").appendChild(this.content));
	 };
	
	 if(this.options.AnnotWest==true) {
		 this.content = _V_.createElement("div", {
			className: "west fullscreen-annotation-west",
			innerHTML: w,
			id: "west"
		 }),	
		annotwrapper.appendChild(_V_.createElement("div").appendChild(this.content));		
		//annotwrapper.appendChild(w);
	 }
	return annotwrapper; 
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
/* END - COMPONENT TO DISPLAY 4 REGIONS OF ANNOTATIONS
===========================================================*/


/* COMPONENT TO WRAP AND DISPLAY SPATIAL ANNOTATIONS
===========================================================*/
/*
_V_.SpatialAnnotComponent = _V_.Component.extend({
  options: {
    loadEvent: "play",
    components: { }
  },
  init: function(player, options){
    this._super(player, options);
    player.addEvent("play", this.proxy(function(){
      this.fadeIn();
      this.player.addEvent("mouseover", this.proxy(this.fadeIn));
     // this.player.addEvent("mouseout", this.proxy(this.fadeOut));		/should hide when mouse out or not?
	 
    }));
	LimePlayer.options.AnnotationsVisible = true;	//parameter to use for toggling annotations on/off - default to true
	this.player.SpatialAnnotComponent = this;	//attach to player
  },
  fadeIn: function(){
    this._super();
  },
  fadeOut: function(){
    this._super();
  },
  lockShowing: function(){
    this.el.style.opacity = "1";
  },

  //todo: add annots in array
  createAnnots: function(){
    var items = [];
    this.each(this.player.textTracks, function(track){
      if (track.kind === this.kind) {
        items.push(new _V_.TextTrackMenuItem(this.player, {
          track: track
        }));
      }
    });
    return items;
	//working on this
  },
 
  addItem: function(component){
    this.addComponent(component);
	//debugger;
    component.addEvent("click", this.proxy(function(){
	
      //this.unlockShowing();
	 // ShowWidget(component.options.uid, component.options.resource, 1);
    }));
  }  	
});
*/

/* END - COMPONENT TO WRAP AND DISPLAY SPATIAL ANNOTATIONS
===========================================================*/

/* Spatial annot - creates individual spatial annotations as buttons, to be then all assembled in the SpatialAnnotComponent Component
================================================================================ */
/*
_V_.Spatialannot = _V_.Button.extend({
  options: { 
	},
  buttonText: "Spatial Annotation",
  buildCSSClass: function(){
    return "vjs-logobox " + this._super();
  },
  createElement: function(){
	  var x = this.options.x,
	  	y = this.options.y,
		w = this.options.w,
		h = this.options.h,
		type = this.options.type,
		relation = this.options.relation;
		resource = this.options.resource;
		annotation= this.options.annotation;
	 if(type=="percent") {	// i need to do math processing
		 x=x+"%";
		 y=y+"%";
		 w=w+"%";
		 h=h+"%";
		 //console.log("relation:"+relation);
	 }
	 else {
		 x=x+"px";
		 y=y+"px";
		 w=w+"px";
		 h=h+"px";
	 }

    return this._super("div", { 
	  className: "annotation-wrapper_"+annotation,
      innerHTML: "<span class='spatial_annotation "+annotation+"' style='margin-left: "+x+"; margin-top: "+y+"; width: "+w+"; height: "+h+"'>"+this.options.resource+"</span>",
	  id: annotation
    });
	
  },
  onClick: function(e){		//controller should trigger  an annotation on sidebars
	  var x = this.options.x,
	  	y = this.options.y,
		w = this.options.w,
		h = this.options.h,
		type = this.options.type,
		start = this.options.start,
		end = this.options.end;
		relation = this.options.relation; 
	 ShowWidget(e.target.id, e.target.innerHTML, this.player.Relation, start, end);	//not happy with this, need to rethink it
	
	//console.log(e.target.id, e.target.innerHTML, relation, start, end);
	//  console.log(this.player.ANN);
	 // debugger;
  },
  fadeIn: function(){
    this._super();
  },
  fadeOut: function(){
    this._super();
  },
	   
});
*/
/* END Spatial Annot
==============================================================================*/


/* ANNOTATIONS TOGGLER - player button that toggles visibility for two components - Annotations (sidebars) and SpatialAnnotComponent (spatial overlays) - using a custom-added player variable, Annotations
================================================================================ */
_V_.AnnotationToggle = _V_.Button.extend({
  buttonText: "Annotations On/Off",
  buildCSSClass: function(){
    return "vjs-annotationstoggler " + this._super();
  },
  onClick: function(){
    if(LimePlayer.options.AnnotationsVisible == false){	//if annotations are not visible, show them
	    LimePlayer.options.AnnotationsVisible = true;
		//this.player.SpatialAnnotComponent.fadeIn();
		if (this.player.isFullScreen) {	   
			 this.player.addComponent("Annotations");	
		}
		else {	//do nothing, side annotation overlay areas shouldn't be active when video is not fullscreen
		}
	}
	else {	// annotations are visible, hide them
		//this.player.SpatialAnnotComponent.fadeOut();
		if(this.player.Annotations) {	//on first click, the object is undefined, if fullscreen has never been entered
			this.player.Annotations.fadeOut();
		}
		LimePlayer.options.AnnotationsVisible = false;
	}
  }
});


/* END ANNOTATIONS TOGGLER - ADDED
==============================================================================*/

/* Fullscreen Toggle Behaviors - MODIFIED
================================================================================ */


_V_.FullscreenToggle = _V_.Button.extend({	//modifies behavior on entering fullscreen - adds the top+bottom+side annotation areas
  buttonText: "Fullscreen",
  buildCSSClass: function(){
    return "vjs-fullscreen-control " + this._super();
  },
  onClick: function(){
    if (!this.player.isFullScreen) {
      this.player.requestFullScreen();
	  if(LimePlayer.options.AnnotationsVisible == true) this.player.addComponent("Annotations");	//create the side annotations overlays when entering fullscreen, and checking that the user didn't disable annotations
    } else {
      this.player.cancelFullScreen();
	  this.player.Annotations.hide();	//removing  side annotations overlays when exiting fullscreen
    }
  }
});

/* END Fullscreen Toggle Behaviors - CUSTOM ConnectME
================================================================================ */

/* CUSTOM LOGO - perhaps not needed for ConnectME
================================================================================ */
_V_.CustomLOGO = _V_.Button.extend({
  buttonText: "LOGO",
  buildCSSClass: function(){
    return "vjs-logobox " + this._super();
  },
  onClick: function(){
	window.open("http://connectme.sti2.org/");
  }
});
/* END CUSTOM LOGO
==============================================================================*/

/* Control Bar - MODIFIED TO INCLUDE FEW EXTRA BUTTONS
================================================================================ */


_V_.ControlBar = _V_.Component.extend({

  options: {
    loadEvent: "play",
    components: {
      "playToggle": {},
      "fullscreenToggle": {},
	  //"CustomLOGO": {},	// Custom ConnectME component
	  "AnnotationToggle": {},	//  Custom ConnectME component - added button to toggle Annotations on/off
      "currentTimeDisplay": {},
      "durationDisplay": {},
      "remainingTimeDisplay": {},
      "progressControl": {},
      "volumeControl": {},
      "muteToggle": {}
    }
  },

  init: function(player, options){
    this._super(player, options);
    player.addEvent("play", this.proxy(function(){
      this.fadeIn();
      this.player.addEvent("mouseover", this.proxy(this.fadeIn));
      this.player.addEvent("mouseout", this.proxy(this.fadeOut));
    }));
  },

  createElement: function(){
    return _V_.createElement("div", {
      className: "vjs-controls"
    });
  },

  fadeIn: function(){
    this._super();
    this.player.triggerEvent("controlsvisible");
  },

  fadeOut: function(){
    this._super();
    this.player.triggerEvent("controlshidden");
  },

  lockShowing: function(){
    this.el.style.opacity = "1";
  }

});

/* END Control Bar - CUSTOM ConnectME
================================================================================ */

/* Big Play Button
================================================================================ */
/*
_V_.BigPlayButton = _V_.Button.extend({
	
	init: function(player, options){
    this._super(player, options);

    player.addEvent("play", _V_.proxy(this, this.hide));
    player.addEvent("ended", _V_.proxy(this, this.show));
	
  },

  createElement: function(){
    return this._super("div", {
      className: "vjs-big-play-button",
      innerHTML: "<span></span>"
    });
  },

  onClick: function(){
    if(this.player.currentTime()) {
  //    this.player.currentTime(0);	//CUSTOM ConnectME for mediafragments - show when ending a time segment
	  }
    this.player.play();
  }
});
*/

/* MISC
================================================================================ */
//click tracking
/*
function trackUI(){
    $("#videoplayer").click(function(e){
	var x = e.pageX - $('#videoplayer').offset().left;
	var y = e.pageY - $('#videoplayer').offset().top;
	var w = $("#videoplayer").width();
	var h = $("#videoplayer").height(); 
	var clickedtime = Math.round(VideoJS_Player.currentTime());
	if(VideoJS_Player.paused() == true) var action="Video was paused";
	else var action="Video resumed playing";
	
	//just for demo / debugging
    $('#mouse-xy').html('Click absolute coordinates: '+e.pageX +', '+ e.pageY+' - (res: '+screen.width+'x'+screen.height+'px) <br />relative coordinates in video: '+x+', '+y+' (for video size: '+w+'x'+h+'px)<br />Action: '+action+" at second "+clickedtime+"<br /><em>click tracker needs work for fullscreen and for annotation interaction</em>");
	$("#mouseclick_indicator").css({'top': e.pageY, 'left': e.pageX, 'display': 'block', 'z-index': '2'}).fadeIn(600).fadeOut(600);	
	 
	 //DO SOMETHING - STORE user interaction into Database via AJAX
	 //....
   }); 
}*/

function timeofvideo(){	//shows video time - for debugging
		var currentTime = Math.round(VideoJS_Player.currentTime());
		var videoLength = Math.round(VideoJS_Player.duration());
		//$('#timer').html("<strong>"+currentTime+"</strong> seconds of <strong>"+ videoLength+"</strong> total");
		//if(currentTime==10) $(".west").append("<div class='widget'>Some annotation triggered at sec. 10</div>");
		setTimeout("timeofvideo()",1000);
		return currentTime;
};

function scale(){ //not used at this moment, but might be needed if using region dimension in px instead of percent
//	var video = $("video")[0];
	var videowidth=$("video")[0].videoWidth,
		videoheight=$("video")[0].videoHeight,
		playerheight=VideoJS_Player.height(),
		playerwidth=VideoJS_Player.width(),
		scalewidth=playerwidth/videowidth,
		scaleheight=playerheight/videoheight;
	//console.log($("video")[0]);
	//console.log(playerwidth, playerheight,scalewidth, scaleheight);
	if(scalewidth<=scaleheight) return scaleheight;
	else return scaleheight;	
}

function removeItemFromArray(arr, value){
    for(var i in arr){
		if(arr[i]==value){
			arr.splice(i,1);
			//break;
		}
	}
    return arr;
}
function returnFileExtension(string){
	return string.substr( (string.lastIndexOf('.') +1) );
}