class window.Annotation
  constructor: (hash) ->
    hash.fragment.value = hash.fragment.value.replace("?","#")
    hash.fragment.type = 'uri'
    @annotation = hash.annotation.value
    # default start and end
    @start = 0
    @end = -1 # -1 means end of movie
    @state = 'inactive'
    @widgets = {} #stores what plugins use this annotation; hash of plugin: [widgets]
    jQuery(@).bind "mouseenter", (e) =>
      for widgetname, widget of @widgets
        jQuery(widget).addClass "hover"
    jQuery(@).bind "mouseleave", (e) =>
      for widgetname, widget of @widgets
        jQuery(widget).removeClass "hover"
    if hash.fragment.type = 'uri'
      @fragment = new URI hash.fragment.value
      fragmentHash = @fragment.hash
      t = fragmentHash.match /t=([0-9,]*)/
      if t
        # t= "2,5" or "2"
        t = t[1]
        # startEnd = ["2,5", "2", "5"] or ["2", "2"]
        startEnd = t.match /([0-9]{1,})/g
        if startEnd
          @start = Number startEnd[0]
          @end = Number(startEnd[1]) || -1

      xywh = fragmentHash.match /xywh=([a-z0-9,:]*)/
      if xywh
        @isPercent = xywh[1].indexOf('percent') isnt -1
        # convert the matches to numbers
        [@x,@y,@w,@h] = _(xywh[1].match(/([0-9]{1,})/g)).map (n) -> Number n
    @isSpacial = @x isnt undefined or (@x is @y is @w is @h is 0)

    @resource = new URI hash.resource.value
    @relation = new URI hash.relation.value
  toString: ->
    @resource.value

class URI
  constructor: (uri) ->
    @value = decodeURIComponent uri
    hash = uri.match(/^.*?#([a-zA-Z0-9,&=:]*)$/)
    if hash
      @hash = hash[1]
    else
      @hash = ''
    @type = 'uri'
  toString: ->
    @value
