// JavaScript Document
//This script deals with media fragments
//http://tomayac.com/mediafragments/mediafragments.html
//http://books.google.at/books?id=CypiQKqHMesC&pg=PA280&lpg=PA280&dq=media+fragments+parse+url+hash+time&source=bl&ots=MuRMXSXxhl&sig=IPyhDkWoyvUAeBuXFAMZrXdGxjo&hl=en&sa=X&ei=YmiwT_DDI5OL4gTB7qC6CQ&redir_esc=y#v=onepage&q=media%20fragments%20parse%20url%20hash%20time&f=false
//http://svn.annodex.net/itext/mediafrag.html
//http://www.w3.org/TR/media-frags/

//time fragments
function retrieveTimeFragment(url) {	//parses time fragment from a URL, returns time in a string such as: 12,15   (startsec,endsec) for a fragment
    var pageoffset = 0;
    var offsettime = 0;
      if (url.split("#")[1] != null) {
      pageoffset = url.split("#")[1];
      if (pageoffset.substring(2) != null) {
        offsettime = pageoffset.substring(2);
      }
    }
    return offsettime;		
    }

function autoseekvideo(){	//to get time fragments referenced by #t=* in the URL, calls seekvideo afterwards to do the actual jumping
	var currenturl = location.href;
 	var offsettime = retrieveTimeFragment(currenturl);
	if(offsettime) {
		seekvideo(offsettime); 
	}
}

function seekvideo(timefragment){	// jumps in video to the chosen start second; gets a time fragment string parameter like  4,12  or  6   
	if (timefragment.substring(2) != null) {
		var time={};
		timevalue = timefragment.substring(2);
		if (timefragment.indexOf(",") > -1) {		//timefragment has more than one parameter - ie time is:  6,12 (has start and end)
			timefragment = timefragment.split(",", 2);
			time.start = timefragment[0];
			time.end = timefragment[1];
		} else {							//timefragment has just one parameter (start), end is undefined
			time.start = timefragment;
		}
    }
	var myPlayer = _V_('videoplayer');
    myPlayer.currentTime(time.start);
	var newurl = "t="+time.start;
	if(time.end != undefined) {	//triggers the stopping function checkendfragment only if we have a second time parameter
		newurl += ","+time.end;
		checkendfragment(time.end);
	}
	location.hash = newurl;
	myPlayer.play();
};
function checkendfragment(endtime) {	// stops video playback when reaching the end of fragment, reloads every second
	var myPlayer = _V_('videoplayer');
	if(myPlayer.currentTime()>=endtime) {	//
		myPlayer.pause();
		myPlayer.addComponent("BigPlayButton");	//I also modified the behavior of the BigPlayButton component so that it doesn't play video from the beginning when reaching end of fragment
	}
	else setTimeout(function(){checkendfragment(endtime)}, 1000);	//check every second to see if we passed the end marker
}

function getFragment(URI){
	return URI.hash;
}
function getQueryParameters(URI) {
        var searchString = window.location.search.substring(1), params = searchString.split("&"), hash = {};
        for (var i = 0; i < params.length; i++) {
            var val = params[i].split("=");
            hash[decodeURIComponent(val[0])] = decodeURIComponent(val[1]);
        }
        return URI.hash;
}
function parseRegion(region_string) {
		var region = {type:"px"};
		if((/^percent:/).test(region_string)) {
			region_string = region_string.substring(8);
			region.type="percent";
		}
		var region_array = region_string.split(",", 4);
		region.x = parseInt(region_array[0]);
		region.y = parseInt(region_array[1]);
		region.w = parseInt(region_array[2]);
		region.h = parseInt(region_array[3]);
		return region;
}