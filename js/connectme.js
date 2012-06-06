// JavaScript Document
//this document holds external JS non-connected to the VideoJS player itself




/* Other functions
================================================================================ */
function show_widget(widgetid, resource, relation, timefragment, priority){
	//just a demo, should be replaced by a call to the VIE infobox, once we have a VIE connector for DBPedia, Geonames, etc
	$(".east").prepend("<div class='widget' id='"+widgetid+"'><a href='"+resource+ "'>"+resource+ "</a> ");
}

function generateUID() {
   return Math.floor(Math.random()*100000 + 1);
}

function loadAnnotations(){
	var LimePlayer=_V_("videoplayer");
	var spAnnotComponent= new _V_.SpatialAnnotComponent(LimePlayer, {});	//will hold all the spatial annotations objects
	var AnnotationArray=[];			//an attempt to hold the spatial annotation objects the way VideoJS stores them in an array
	var ALL_ANNOT=[];	//to store core annotation info in an array, for later attaching it to the player
	
	var video=LimePlayer.values.src;

	
	var framework_url = "http://labs.newmedialab.at/SKOS/";
	var query = "PREFIX oac: <http://www.openannotation.org/ns/>"+
                "PREFIX ma: <http://www.w3.org/ns/ma-ont#> "+
                "SELECT ?annotation ?fragment ?resource ?relation "+
                "WHERE { <"+video+">  ma:hasFragment ?f."+
                "   ?f ma:locator ?fragment."+
                "   ?annotation oac:target ?f."+
                "   ?annotation oac:body ?resource."+
                "   ?f ?relation ?resource."+
                "}";
	//console.log(query);
	function init() {
    	$.getJSON(framework_url+"sparql/select?query="+encodeURIComponent(query)+"&output=json",function(data){
            var list = data.results.bindings;
			//loadAnnotations.allAnnotations=list;
			
            for(var i in list) {	//loop through all the annotations
                var ann = list[i].annotation.value;
                var frg = UTILS.model.uri.create(list[i].fragment.value).getFragment();
                var res = list[i].resource.value;
                var rel = list[i].relation.value;
				var uid = generateUID();	//unique ID, could have used the variable ann though...
				if(frg.region == undefined) {	//adding coordinates 0,0,0,0 to temporal-only annotations, if they are not defined
					frg.region={x: 0, y: 0, w: 0, h: 0, type: "percent"};
				}
				ALL_ANNOT.push({uid: uid, annotation: ann, fragment: frg, resource: res, relation: rel});	//build an array of annotations to later attach to the player
				
				//just for debugging
				$("#meta2").append(i+". "+ann + " - " + res + " - " + rel+", Time: " + frg.time.start+ "-"+frg.time.end);
				if(frg.region) $("#meta2").append(", Coordinates: xywh: "+frg.region.x + ", "+frg.region.y + ", "+frg.region.w + ", "+frg.region.h);
				$("#meta2").append("<br><hr>");
            }
			LimePlayer.AnnotationsArray=ALL_ANNOT;	//attach annotations array to player for later use
			setTimeout(checkAnnotations, 1000);
			//console.log(LimePlayer);
            ready=true;	
	    });
	}
	init();
	

	function checkAnnotations() {
			time=timeofvideo();
			var annot=LimePlayer.AnnotationsArray;
			//console.log(LimePlayer.AnnotationsArray);
			for(var i in annot) {
				var temporal=0;
				var frg = annot[i].fragment;
				var ann = annot[i].annotation;
                var res = annot[i].resource;
                var rel = annot[i].relation;
				var uid = annot[i].uid;
				
				if((frg.region.x==0)&& (frg.region.y==0)) {	//adding coordinates 0,0,0,0 to temporal-only annotations, if they are not defined
					temporal=1;
				}
				 
				var a=".annotation-wrapper_"+uid;	//spatial annotation id
				var t="#"+uid;
				//console.log(a);
				if((frg.time.start<=time) && (frg.time.end>=time)){	//the fragment should be active
					if($(a).length==0) 
						createSpatialAnnotation(uid, ann, res, frg, rel);	//just for spatial annotations
						if((temporal==1) && ($(t).length==0)) show_widget(uid, res, rel, frg, 1);
				}
				else {		//the fragment has expired, remove it			
					if($(a).length>0) $(a).remove();
					if($(t).length>0) $(t).remove();
				}
			}
			LimePlayer.addComponent(spAnnotComponent);
			//console.log(spAnnotComponent);
			setTimeout(checkAnnotations, 1000);
			
	}	
	
	//this creates individual spatial annotations as "player buttons" (Spatialannot) and then adds them to the main spatial annotation component, 
	function createSpatialAnnotation(uid, annotation,resource,fragment,relation){
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
			uid: uid
		};
		

		if ((opts.x!=0) && (opts.y!=0) && (opts.w!=0) && (opts.h!=0)){ //spatial annotations only
			//add button with individual annotation to component - not happy with this though, it overwrites the previos values and only keeps the last one in the Component; I got it working, but it's a hack
			var s= new _V_.Spatialannot(LimePlayer,opts);
			spAnnotComponent.addItem(s);	
			
			//THIS IS WHAT I NEED TO LOOK AT, too tired to do it now
			AnnotationArray.push(new _V_.Spatialannot(LimePlayer,opts));	//store all the spatial annotation buttons into an array of buttons, then somehow attach it to the component
			//see example - the way the player addssubtitles 
			//menu.addItem(new _V_.OffTextTrackMenuItem(this.player, { kind: this.kind }))

		}
		else {//just temporal annotations, doens't apply here
		}
	}
}
/*

/* COMPONENT TO DISPLAY 4 REGIONS OF ANNOTATIONS
===========================================================*/
/* TO DO: 
- implement a config 
- annotations - toggle on/off individually
- decide whether we detach annotation elements and place them over the video, or just copy content over to generate 2 views
- implement interaction patterns for annotations 
*/
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
	this.player.AnnotationsVisible = true;	//control variable -  attach to player to use for toggling annotations on/off - default to true
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
	
	 //this copies content from the 4 external annotation fields, it doesn't detact & reattach them over the player - to be explored whether we want to go this way or not - there are advantages for both implementations
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
/* TO DO: 
*/
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
	this.player.AnnotationsVisible = true;	//parameter to use for toggling annotations on/off - default to true
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
	 // show_widget(component.options.uid, component.options.resource, 1);
    }));
  }  	
});
/* END - COMPONENT TO WRAP AND DISPLAY SPATIAL ANNOTATIONS
===========================================================*/

/* Spatial annot - creates individual spatial annotations as buttons, to be then all assembled in the SpatialAnnotComponent Component
================================================================================ */
_V_.Spatialannot = _V_.Button.extend({
  options: { 
	},
  buttonText: "Spatial Annotation",
  /*buildCSSClass: function(){
    return "vjs-logobox " + this._super();
  },*/
  createElement: function(){
	  var x = this.options.x,
	  	y = this.options.y,
		w = this.options.w,
		h = this.options.h,
		type = this.options.type,
		uid = this.options.uid,
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
	  className: "annotation-wrapper_"+uid,
      innerHTML: "<span class='spatial_annotation "+uid+"' style='margin-left: "+x+"; margin-top: "+y+"; width: "+w+"; height: "+h+"'>"+this.options.resource+"</span>",
	  id: uid
    });
	
  },
  onClick: function(e){		//controller should trigger  an annotation on sidebars
	  var x = this.options.x,
	  	y = this.options.y,
		w = this.options.w,
		h = this.options.h,
		type = this.options.type,
		uid = this.options.uid
		start = this.options.start,
		end = this.options.end;
		relation = this.options.relation; 
	 show_widget(e.target.id, e.target.innerHTML, this.player.Relation, start, end);	//not happy with this, need to rethink it
	
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
/* END Spatial Annot
==============================================================================*/


/* ANNOTATIONS TOGGLER - toggles two components - Annotations (sidebars) and SpatialAnnotComponent (spatial overlays) - using a custom-added player variable, Annotations
================================================================================ */
_V_.AnnotationToggle = _V_.Button.extend({
  buttonText: "Annotations On/Off",
  buildCSSClass: function(){
    return "vjs-annotationstoggler " + this._super();
  },
  onClick: function(){
    if(this.player.AnnotationsVisible == false){	//if annotations are not visible, show them
	    this.player.AnnotationsVisible = true;
		this.player.SpatialAnnotComponent.fadeIn();
		if (this.player.isFullScreen) {	   
			 this.player.addComponent("Annotations");	
		}
		else {	//do nothing, side annotation overlay areas shouldn't be active when video is not fullscreen
		}
	}
	else {	// annotations are visible, hide them
		this.player.SpatialAnnotComponent.fadeOut();
		if(this.player.Annotations) {	//on first click, the object is undefined, if fullscreen has never been entered
			this.player.Annotations.fadeOut();
		}
		this.player.AnnotationsVisible = false;
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
	  if(this.player.AnnotationsVisible == true) this.player.addComponent("Annotations");	//create the side annotations overlays when entering fullscreen, and checking that the user didn't disable annotations
    } else {
      this.player.cancelFullScreen();
	  this.player.Annotations.hide();	//removing  side annotations overlays when exiting fullscreen
    }
  }
});
/* END Fullscreen Toggle Behaviors - MODIFIED BY SORIN
================================================================================ */

/* CUSTOM LOGO - ADDED BY SORIN
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
/* END CUSTOM LOGO - ADDED BY SORIN
==============================================================================*/

/* Control Bar - MODIFIED TO INCLUDE FEW EXTRA BUTTONS
================================================================================ */
_V_.ControlBar = _V_.Component.extend({

  options: {
    loadEvent: "play",
    components: {
      "playToggle": {},
      "fullscreenToggle": {},
	  "CustomLOGO": {},	// SORIN - added custom LOGO
	  "AnnotationToggle": {},	// SORIN - added button to toggle Annotations on/off
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
/* END Control Bar - MODIFIED BY SORIN
================================================================================ */

/* Big Play Button
================================================================================ */
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
  //    this.player.currentTime(0);	//modified by SORIN for mediafragments - show when ending a time segment
	  }
    this.player.play();
  }
});


/* MISC
================================================================================ */
//click tracking
/*
function trackUI(){
	var LimePlayer=_V_("videoplayer");	//$("#videoplayer")
    $("#videoplayer").click(function(e){
	var x = e.pageX - $('#videoplayer').offset().left;
	var y = e.pageY - $('#videoplayer').offset().top;
	var w = $("#videoplayer").width();
	var h = $("#videoplayer").height(); 
	var clickedtime = Math.round(LimePlayer.currentTime());
	if(LimePlayer.paused() == true) var action="Video was paused";
	else var action="Video resumed playing";
	
	//just for demo / debugging
    $('#mouse-xy').html('Click absolute coordinates: '+e.pageX +', '+ e.pageY+' - (res: '+screen.width+'x'+screen.height+'px) <br />relative coordinates in video: '+x+', '+y+' (for video size: '+w+'x'+h+'px)<br />Action: '+action+" at second "+clickedtime+"<br /><em>click tracker needs work for fullscreen and for annotation interaction</em>");
	$("#mouseclick_indicator").css({'top': e.pageY, 'left': e.pageX, 'display': 'block', 'z-index': '2'}).fadeIn(600).fadeOut(600);	
	 
	 //DO SOMETHING - STORE user interaction into Database via AJAX
	 //....
   }); 
}*/

function timeofvideo(){	//shows video time - for debugging
	var LimePlayer = _V_('videoplayer');
    var currentTime = Math.round(LimePlayer.currentTime());
	var videoLength = Math.round(LimePlayer.duration());
	$('#north').html("<strong>"+currentTime+"</strong> seconds of <strong>"+ videoLength+"</strong> total");
	//if(currentTime==10) $(".west").append("<div class='widget'>Some annotation triggered at sec. 10</div>");
	setTimeout("timeofvideo()",1000);
	return currentTime;
};

function scale(){ //not used at this moment, but might be needed if using region dimension in px instead of percent
//	var video = $("video")[0];
	var videowidth=$("video")[0].videoWidth,
		videoheight=$("video")[0].videoHeight,
		playerheight=_V_('videoplayer').height(),
		playerwidth=_V_('videoplayer').width(),
		scalewidth=playerwidth/videowidth,
		scaleheight=playerheight/videoheight;
	//console.log($("video")[0]);
	//console.log(playerwidth, playerheight,scalewidth, scaleheight);
	if(scalewidth<=scaleheight) return scaleheight;
	else return scaleheight;	
}