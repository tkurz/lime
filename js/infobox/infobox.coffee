###
# Infobox widget
The Infobox widget allows you to show an info box as a side panel in a generic way.
Given you have some sort of data source connected through VIE, providing VIE entities,
and a list of configurations (plain JSON object) describing how a specific entity
is to be shown depending what type entity has. Now when you simply give the 
Infobox widget a VIE entity or simply an entity URI which the widget can load 
from your data source, through VIE, the widget can automatically show the information
in the way it's described by the configuration object.

## Usage
## Instantiate VIE

      vie = new VIE()
        vie.use new vie.StanbolService(
          url: "http://dev.iks-project.eu:8081"
          enhancerUrlPostfix: "/enhancer/chain/ehealth"
          entityhubSite: "ehealth"
          proxyDisabled: true
          getSources: [
            uri: "www4.wiwiss.fu-berlin.de"
            label: "ehealth"
          ]
        )

        config = {
            "<http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugbank/drugs>":[[
                {
                    "property":"<http://www.w3.org/2004/02/skos/core#prefLabel>"
                    "fieldLabel":"Name"
                    "template": "<img src='#{value}'/>"
                }
                {"property":"<http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugbank/description>","fieldLabel":"Description"}
            ],[],[{"property":"<http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugbank/target>","fieldLabel":"Targets"}],[{"property":"<http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugbank/toxicity>","fieldLabel":"Toxicity"}]]}

see [config utility](http://szabyg.github.com/vie-health/app.html) for 
creating such configurations

## Instantiating the widget:

        jQuery(".infoBox").infobox
          vie: vie
          service: "stanbol"
          config: ->
            localStorage.infoboxConfig

## Telling the widget what entity to show

        jQuery('.infobox').infobox 'option', 'entity', 'http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugs/DB00945'
        jQuery('.infobox').infobox('methodName', par1, par2)

###
jQuery.widget "Vie.infobox", 
  options:
    title: "default title"
    vie: null
    service: "stanbol"
    # entity can be a URI or a VIE entity
    entity: null
    config: {}
    valueProcess: (value, fieldConfig) ->
      @_humanReadableValue value
    keyProcess: (key) ->
      _(key).escape()

  _create: ->
    @_setEntity @options.entity
    @uniq = @_generateUUID()
    @element.addClass @uniq
    @element.addClass 'vie-infobox'

  _destroy: ->
    @element.removeClass @uniq
    @element.removeClass 'vie-infobox'

  _init: ->
    if @options.entity
      @showInfo()

  _setOption: ( key, value ) ->
    switch key
      when "entity"
        @_setEntity value

  # Set the entity for showing
  _setEntity: (entity) ->
    if entity
      if typeof entity is "string"
        # it's a URI
        @loadEntity entity, (res) =>
          @entity = res
          @showInfo()
      else
        # it's already a VIE entity
        @entity = entity
        @showInfo()
    else
      @cleanUp()

  # Load an entity from VIE and run callback
  loadEntity: (entityUri, cb) ->
    @entityUri = entityUri
    @options.vie.load(entity: entityUri).using(@options.service).execute().success (entities) ->
      cb _(entities).detect (ent) ->
        ent.getSubject().indexOf(entityUri) isnt -1

  # Display this.options.entity
  showInfo: ->
    @cleanUp()
    console.info "showing info in", @element
    matchingConfig = @_getMatchingConfig @entity, @_getConfig()

    console.info "config:", matchingConfig
    _(matchingConfig).each (box, i) =>
      boxEl = jQuery "<div class='box'></div>"
      _(box).each (field) =>
        fieldLabel = @options.keyProcess field.property
        value = @entity.get field.property
        humanReadableValue = @options.valueProcess.apply @, [value, field]
        boxEl.append portletEl = jQuery("<div class='' title='#{field.fieldLabel}'>#{humanReadableValue}</div>")
        portletEl.portlet
          open: i is 0
      @element.append boxEl
  cleanUp: ->
    @element.html ""
  _getMatchingConfig: (entity, config) ->
    types = _([entity.get("@type")])
    .flatten()
    .map (typeObj) ->
      typeObj.toString()
    console.info config, types
    matchingConfigs = []
    for key, value of config
      if _(types).indexOf(key) isnt -1
        matchingConfigs.push value
        console.info "matching config", key, value
    unless matchingConfigs.length
      console.warn "No config for", entity
      alert "No config found for the selected entity. See more details in the console."
    matchingConfigs[0]

  # get configutration object
  _getConfig: (conf) ->
    c = conf or @options.config
    res = c
    if typeof c is "string"
      res = JSON.parse(c or "{}")
    if typeof c is "function"
      res = @_getConfig c()
    res

  _humanReadableValue: (value) ->
    val = ""
    if typeof value is "string"
      val = value.replace(/^<|>$/g, "")
    else if value instanceof Array
      val = "<ul>"
      _(value).each (v) =>
        if @options.vie.namespaces.isUri(v)
          uri = v.replace(/^<|>$/g, "")
          label =  """
            #{@_shortenUri(v)}&nbsp;
            <small>(<a href="javascript:jQuery('.#{@uniq}').infobox('option', 'entity', '#{v}')">follow</a>&nbsp;
            &nbsp;<a href='#{uri}' target='_blank'>browser</a>)</small>
          """
        else 
          label = v.toString()
        val += "<li>" + label + "</li>"

      val += "</ul>"
    else if typeof value is "object" and value["@value"]
      val = value.toString()
    else
      val = JSON.stringify(value)
    val
  _shortenUri: (u) ->
    try
      return @options.vie.namespaces.curie(u)
    catch e
      console.warn e.message
      return u.replace(/^<|>$/g, "")

  _generateUUID: ->
    S4 = ->
      ((1 + Math.random()) * 0x10000|0).toString(16).substring 1
    "#{S4()}#{S4()}-#{S4()}-#{S4()}-#{S4()}-#{S4()}#{S4()}#{S4()}"


# Plain portlet
jQuery.widget "Vie.portlet", 
  options:
    title: "default title"
    open: true
    configHtml: ""
    alt: ""
    configInit: (el) ->
  _create: ->
    @options.title = @element.attr("title") or @options.title
    @element.addClass "infobox-portlet ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"
    content = @element.contents()
    @element.append """
      <div class='portlet-header'>
        <span class='portlet-header-label' alt=#{@options.alt} title=#{@options.alt}>#{@options.title}</span>
      </div>
    """
    if @options.configHtml 
      @element.append "<div class='portlet-content vie-portlet-config'>#{@options.configHtml}</div>"
      @configEl = jQuery ".vie-portlet-config", @element
      @options.configInit @configEl
    @element.append "<div class='portlet-content vie-portlet-content'></div>"
    @contentEl = jQuery '.vie-portlet-content', @element
    @configEl = jQuery '.vie-portlet-config', @element
    content.appendTo @contentEl

    @headerEl = jQuery '.portlet-header', @element
    @headerEl.addClass "ui-widget-header ui-corner-all"
    if @options.configHtml then @headerEl.prepend " <i class='settings-button fa-icon icon-cog'></i> "
    @headerEl.prepend " <i class='toggle-button fa-icon icon-plus'></i> "
    @headerEl.prepend " <i class='x-button fa-icon icon-remove'></i> "

    jQuery(".toggle-button, .portlet-header-label", @element).click (e) ->
      jQuery(this).parent().find(".toggle-button").toggleClass("icon-minus").toggleClass "icon-plus"
      if jQuery(this).parent().find(".toggle-button").hasClass "icon-plus" # collapsed
        jQuery(this).parents(".infobox-portlet:first").find(".vie-portlet-content, .vie-portlet-config").hide()
      else
        jQuery(this).parents(".infobox-portlet:first").find(".vie-portlet-content").show()
      e.preventDefault()
    jQuery(".x-button", @element).click =>
      element = @element
      @destroy()
      element.remove()
    @configEl.hide()
    jQuery(".settings-button", @element).click =>
      @configEl.toggle()
    if @options.open
      @expand()
    else
      @collapse()

  _destroy: ->
    @element.removeClass 'infobox-portlet ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'
    content = @contentEl.contents()
    content.appendTo @element
    @contentEl.remove()
    @headerEl.remove()

  collapse: ->
    jQuery(".toggle-button", @element).removeClass("icon-minus").addClass "icon-plus"
    @contentEl.hide()
    @configEl.hide()

  expand: ->
    jQuery(".toggle-button", @element).addClass("icon-minus").removeClass "icon-plus"
    @contentEl.show()

  setContent: (newContent) ->
    @contentEl.html newContent

