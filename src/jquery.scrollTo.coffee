#!
# * jQuery.ScrollTo
# * Copyright (c) 2007-2012 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
# * Dual licensed under MIT and GPL.
# * Date: 12/14/2012
# *
# * @projectDescription Easy element scrolling using jQuery.
# * http://flesler.blogspot.com/2007/10/jqueryscrollto.html
# * @author Ariel Flesler
# * @version 1.4.5 BETA
# *
# * @id jQuery.scrollTo
# * @id jQuery.fn.scrollTo
# * @param {String, Number, DOMElement, jQuery, Object} target Where to scroll the matched elements.
# *      The different options for target are:
# *		- A number position (will be applied to all axes).
# *		- A string position ('44', '100px', '+=90', etc ) will be applied to all axes
# *		- A jQuery/DOM element ( logically, child of the element to scroll )
# *		- A string selector, that will be relative to the element to scroll ( 'li:eq(2)', etc )
# *		- A hash { top:x, left:y }, x and y can be any kind of number/string like above.
# *		- A percentage of the container's dimension/s, for example: 50% to go to the middle.
# *		- The string 'max' for go-to-end.
# * @param {Number, Function} duration The OVERALL length of the animation, this argument can be the settings object instead.
# * @param {Object,Function} settings Optional set of settings or the onAfter callback.
# *	 @option {String} axis Which axis must be scrolled, use 'x', 'y', 'xy' or 'yx'.
# *	 @option {Number, Function} duration The OVERALL length of the animation.
# *	 @option {String} easing The easing method for the animation.
# *	 @option {Boolean} margin If true, the margin of the target element will be deducted from the final position.
# *	 @option {Object, Number} offset Add/deduct from the end position. One number for both axes or { top:x, left:y }.
# *	 @option {Object, Number} over Add/deduct the height/width multiplied by 'over', can be { top:x, left:y } when using both axes.
# *	 @option {Boolean} queue If true, and both axis are given, the 2nd axis will only be animated after the first one ends.
# *	 @option {Function} onAfter Function to be called after the scrolling ends.
# *	 @option {Function} onAfterFirst If queuing is activated, this function will be called after the first scrolling ends.
# * @return {jQuery} Returns the same jQuery object, for chaining.
# *
# * @desc Scroll to a fixed position
# * @example $('div').scrollTo( 340 );
# *
# * @desc Scroll relatively to the actual position
# * @example $('div').scrollTo( '+=340px', { axis:'y' } );
# *
# * @desc Scroll using a selector (relative to the scrolled element)
# * @example $('div').scrollTo( 'p.paragraph:eq(2)', 500, { easing:'swing', queue:true, axis:'xy' } );
# *
# * @desc Scroll to a DOM element (same for jQuery object)
# * @example var second_child = document.getElementById('container').firstChild.nextSibling;
# *			$('#container').scrollTo( second_child, { duration:500, axis:'x', onAfter:function(){
# *				alert('scrolled!!');
# *			}});
# *
# * @desc Scroll on both axes, to different values
# * @example $('div').scrollTo( { top: 300, left:'+=200' }, { axis:'xy', offset:-20 } );
#
(($) ->

  # Returns the element that needs to be animated to scroll the window.
  # Kept for backwards compatibility (specially for localScroll & serialScroll)

  # Hack, hack, hack :)
  # Returns the real elements to scroll (supports window/iframes, documents and regular nodes)

  # Speed is still recognized for backwards compatibility

  # Make sure the settings are given right

  # Let's keep the overall duration

  # Null target yields nothing, just like jQuery does

  # A number will pass the regex

  # We are done

  # Relative selector, no break!

  # DOMElement / jQuery

  # Get the real position of the target
  # jQuery / DOMElement

  # If it's a dom element, reduce the margin

  # Scroll to a fraction of its width/height

  # Handle percentage values

  # Number or 'number'

  # Check the limits

  # Queueing axes

  # Don't waste time animating, if there's no need.

  # Intermediate animation

  # Don't animate this axis again in the next iteration.

  # Max scrolling position, works on quirks mode
  # It only fails (not too badly) on IE, quirks mode.
  both = (val) ->
    (if typeof val is "object" then val else
      top: val
      left: val
    )
  $scrollTo = $.scrollTo = (target, duration, settings) ->
    $(window).scrollTo target, duration, settings

  $scrollTo.defaults =
    axis: "xy"
    duration: (if parseFloat($.fn.jquery) >= 1.3 then 0 else 1)
    limit: true

  $scrollTo.window = (scope) ->
    $(window)._scrollable()

  $.fn._scrollable = ->
    @map ->
      elem = this
      isWin = not elem.nodeName or $.inArray(elem.nodeName.toLowerCase(), ["iframe", "#document", "html", "body"]) isnt -1
      return elem  unless isWin
      doc = (elem.contentWindow or elem).document or elem.ownerDocument or elem
      (if /webkit/i.test(navigator.userAgent) or doc.compatMode is "BackCompat" then doc.body else doc.documentElement)


  $.fn.scrollTo = (target, duration, settings) ->
    if typeof duration is "object"
      settings = duration
      duration = 0
    settings = onAfter: settings  if typeof settings is "function"
    target = 9e9  if target is "max"
    settings = $.extend({}, $scrollTo.defaults, settings)
    duration = duration or settings.duration
    settings.queue = settings.queue and settings.axis.length > 1
    duration /= 2  if settings.queue
    settings.offset = both(settings.offset)
    settings.over = both(settings.over)
    @_scrollable().each(->
      animate = (callback) ->
        $elem.animate attr, duration, settings.easing, callback and ->
          callback.call this, target, settings

      return  unless target?
      elem = this
      $elem = $(elem)
      targ = target
      toff = undefined
      attr = {}
      win = $elem.is("html,body")
      switch typeof targ
        when "number", "string"
          if /^([+-]=?)?\d+(\.\d+)?(px|%)?$/.test(targ)
            targ = both(targ)
            break
          targ = $(targ, this)
          return  unless targ.length
        when "object"
          toff = (targ = $(targ)).offset()  if targ.is or targ.style
      $.each settings.axis.split(""), (i, axis) ->
        Pos = (if axis is "x" then "Left" else "Top")
        pos = Pos.toLowerCase()
        key = "scroll" + Pos
        old = elem[key]
        max = $scrollTo.max(elem, axis)
        if toff
          attr[key] = toff[pos] + ((if win then 0 else old - $elem.offset()[pos]))
          if settings.margin
            attr[key] -= parseInt(targ.css("margin" + Pos)) or 0
            attr[key] -= parseInt(targ.css("border" + Pos + "Width")) or 0
          attr[key] += settings.offset[pos] or 0
          attr[key] += targ[(if axis is "x" then "width" else "height")]() * settings.over[pos]  if settings.over[pos]
        else
          val = targ[pos]
          attr[key] = (if val.slice and val.slice(-1) is "%" then parseFloat(val) / 100 * max else val)
        attr[key] = (if attr[key] <= 0 then 0 else Math.min(attr[key], max))  if settings.limit and /^\d+$/.test(attr[key])
        if not i and settings.queue
          animate settings.onAfterFirst  unless old is attr[key]
          delete attr[key]

      animate settings.onAfter
    ).end()

  $scrollTo.max = (elem, axis) ->
    Dim = (if axis is "x" then "Width" else "Height")
    scroll = "scroll" + Dim
    return elem[scroll] - $(elem)[Dim.toLowerCase()]()  unless $(elem).is("html,body")
    size = "client" + Dim
    html = elem.ownerDocument.documentElement
    body = elem.ownerDocument.body
    Math.max(html[scroll], body[scroll]) - Math.min(html[size], body[size])
) jQuery