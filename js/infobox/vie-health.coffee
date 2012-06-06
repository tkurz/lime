# TODO 
# * add visualization options

# uncomment this line if you'd like to be able to debug
# debugger

Vhealth = {}
# Define Vhealth methods
this.Vhealth = _(Vhealth).extend
  lsName: "vhealthConfig"
  # uri to curie
  shortenUri: (u) ->
    try
      return @vie.namespaces.curie(u)
    catch e
      console.warn e.message
      return u.replace(/^<|>$/g, "")

  # append msg to #results
  log: (msg) ->
    jQuery("#results").append JSON.stringify(msg) + "<br/" + ">"

  reloadEntity: ->
    Vhealth.showEntity Vhealth.entityUri

  # Load and show entity
  showEntity: (entityUri) ->
    @entityUri = entityUri
    @vie.load(entity: entityUri).using("stanbol").execute().success (entities) ->
      selectedEntity = _(entities).detect (ent) ->
        ent.getSubject().indexOf(entityUri) isnt -1
      Vhealth.addBreadcrumb entityUri, VIE.Util.getPreferredLangForPreferredProperty selectedEntity, ["skos:prefLabel", "rdfs:label"], ["en", "de"]
      Vhealth.loadConfigEditor selectedEntity
      jQuery(".infoBox").html("").infobox
        vie: Vhealth.vie
        config: Vhealth.getConfig
        entity: selectedEntity
        valueProcess: (value, fieldConfig) ->
          Vhealth.humanReadableValue value
        keyProcess: Vhealth.shortenUri
        getMatchingConfig: Vhealth.getMatchingConfig
      # show Entity label
      jQuery(".entityLabel").html VIE.Util.getPreferredLangForPreferredProperty selectedEntity, ['skos:prefLabel', 'rdfs:label'], ["en", "de"]

      Vhealth.showTypesFor selectedEntity

      Vhealth.showInPropertyList selectedEntity
      event = new jQuery.Event("viehealthEntitySelection")
      event.selectedEntity = selectedEntity
      jQuery(".collector .vhealth-portlet").trigger event
      console.log selectedEntity
    .fail (e) ->
      console.error e
      alert e
    false

  showTypesFor: (selectedEntity) ->
    # # handle types
    # hide owl:Thing as type
    types = _([selectedEntity.get('@type')]).flatten()
    configuredTypes = _(Vhealth.getConfig()).keys()
    types = _(types).filter (type) ->
      Vhealth.shortenUri(type.toString()) isnt "owl:Thing"
    jQuery(".entity-types").html ""
    types = _(types).each (type) ->
      configured = _(configuredTypes).contains type.id
      typeEl = jQuery """
        <button class='saveConfig'>save config for <b>#{Vhealth.shortenUri type.toString()}</b></button>
        <button class='removeConfig'><i class='icon-trash'/></button>
        <br/>
      """
      jQuery(".entity-types").append typeEl
      if configured
        typeEl.filter(".saveConfig").addClass "savedTypeButton"
        typeEl.filter(".removeConfig").button
          entityType: type
        .click ->
          type = jQuery(@).button "option", "entityType"
          Vhealth.removeConfig type.toString()
      else
        typeEl.filter(".removeConfig").remove()


      typeEl.filter(".saveConfig").button
        entityType: type
      .click ->
        type = jQuery(@).button "option", "entityType"
        Vhealth.saveConfig type.toString()
      

  # The propertyList is where all the draggable properties are listed
  showInPropertyList: (entity) ->
    jQuery(".info .content").html ""
    keys = _(entity.attributes).keys()
    keys = _(keys).sortBy (key) ->
      Vhealth.shortenUri(key)
    _(keys).each (key) =>
      i = 0

      # Don't process it if it's on the hidden property's list
      while i < @hiddenList.length
        hiddenItem = @hiddenList[i]
        return  if Vhealth.shortenUri(key).indexOf(hiddenItem) is 0
        i++
      # Don't process it if the property name begins with @
      return  if key.indexOf("@") is 0
      value = entity.get(key)
      val = @humanReadableValue value
      @createPortlet Vhealth.shortenUri(key), val, entity, key, ".info .content"

    jQuery(".portlets").sortable connectWith: ".portlets"
#    jQuery(".portlets").disableSelection()
    false

  loadConfigEditor: (entity) ->
    configCollectors = jQuery ".collector"
    configCollectors.html ""

    config = @getMatchingConfig entity, @getConfig()
    _(config).each (box, i) =>
      boxEl = jQuery "<div class='box'></div>"
      _(box).each (field) =>
        fieldLabel = Vhealth.shortenUri field.property
        key = field.property
        value = entity.get field.property
        humanReadableValue = Vhealth.humanReadableValue value, field
        Vhealth.createPortlet field.fieldLabel, humanReadableValue, entity, key, configCollectors[i]

  getConfig: ->
    JSON.parse(localStorage[Vhealth.lsName] or "{}")

  # Make a value human readable. Meaning collections to <li>, uris to curie links, etc
  humanReadableValue: (value) ->
    val = ""
    if typeof value is "string"
      val = value.replace(/^<|>$/g, "")
    else if value instanceof Array
      val = "<ul>"
      _(value).each (v) =>
        if @vie.namespaces.isUri(v)
          uri = v.replace(/^<|>$/g, "")
          label =  Vhealth.shortenUri(v) + 
            "&nbsp;<small>(<a href='javascript:Vhealth.showEntity(\"" + v + "\")'>follow</a>&nbsp;" +
            "&nbsp;<a href='#{uri}' target='_blank'>browser</a>)</small>" 
        else 
          label = v.toString()
        val += "<li>" + label + "</li>"

      val += "</ul>"
    else if typeof value is "object" and value["@value"]
      val = value.toString()
    else
      val = JSON.stringify(value)
    val

  # Process one property as portlet in the info box
  createPortlet: (title, content, entity, key, target) ->
    # create portlet markup and init a portlet on it
    jQuery("<div title='#{title}'>#{content}</div>").appendTo(target).portlet
      open: false
      entity: entity
      key: key
      alt: _(key).escape()
      configHtml: "<input class='field-label' value='#{title}'/>"
      # when it's created subscribe on the event 'viehealthEntitySelection'
      create: ->
        jQuery(@).bind "viehealthEntitySelection", (e) =>
          entity = e.selectedEntity
          content = Vhealth.humanReadableValue entity.get key
          if content
            jQuery(@).portlet "setContent", content
            jQuery(@).portlet "expand"
          else
            jQuery(@).portlet "setContent", ""
            jQuery(@).portlet "collapse"
  # Extract config JSONs from the collector elements and save it in the local storage
  saveConfig: (type) ->
    localStorage[Vhealth.lsName] ?= "{}"
    ls = null
    try
      ls = JSON.parse localStorage[Vhealth.lsName]
    catch e
      ls = {}
    collectors = jQuery ".collector"
    ls[type] = _(collectors).map (collector) ->
      _(jQuery(".vhealth-portlet", collector)).map (portlet) ->
        property: jQuery(portlet).portlet('option', 'key')
        fieldLabel: jQuery('input.field-label', portlet).val()
    console.info type, ls[type]
    localStorage[Vhealth.lsName] = JSON.stringify ls
    console.info localStorage[Vhealth.lsName]
    Vhealth.reloadEntity()

  removeConfig: (typeUri) ->
    localStorage[Vhealth.lsName] ?= "{}"
    ls = null
    try
      ls = JSON.parse localStorage[Vhealth.lsName]
    catch e
      ls = {}
    delete ls[typeUri]
    localStorage[Vhealth.lsName] = JSON.stringify ls
    console.info localStorage[Vhealth.lsName]
    Vhealth.reloadEntity()
  configInit: ->
    initConfig = JSON.parse """
{"<http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugbank/drugs>":[[{"property":"<http://www.w3.org/2004/02/skos/core#prefLabel>","fieldLabel":"Name"},{"property":"<http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugbank/description>","fieldLabel":"Description"}],[],[{"property":"<http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugbank/target>","fieldLabel":"Targets"}],[{"property":"<http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugbank/toxicity>","fieldLabel":"Toxicity"}]]}
    """
    stored = JSON.parse(localStorage[Vhealth.lsName] or "{}")
    localStorage[Vhealth.lsName] = JSON.stringify(_(stored).extend initConfig)
    Vhealth.reloadEntity()
  addBreadcrumb: (entityUri, label) ->
    skip = false
    commands = jQuery(".breadcrumbs a").map -> 
      jQuery(@).attr 'href'
    _(commands).each (command) ->
      if command.indexOf(entityUri) isnt -1
        skip = true
    console.info "breadcrumbs:", commands
    unless skip
      jQuery(".breadcrumbs").append """
        &nbsp;| <a href='javascript:Vhealth.showEntity("#{entityUri}")' title="#{entityUri}" alt="#{entityUri}">#{label}</a>
      """

  getMatchingConfig: (entity, config) ->
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
    matchingConfigs[0]

  # Initialize namespaces for nicer 
  addNamespaces: ->
    @vie.namespaces.add "drugbank",       "http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugbank/"
    @vie.namespaces.add "drugcategory",   "http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugcategory/"
    @vie.namespaces.add "drugtargets",    "http://www4.wiwiss.fu-berlin.de/drugbank/resource/targets/"
    @vie.namespaces.add "drugtype",       "http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugtype/"
    @vie.namespaces.add "drugs",          "http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugs/"
    @vie.namespaces.add "dosageforms",    "http://www4.wiwiss.fu-berlin.de/drugbank/resource/dosageforms/"
    @vie.namespaces.add "drugbank-class", "http://www4.wiwiss.fu-berlin.de/drugbank/vocab/resource/class/"
    @vie.namespaces.add "side_effects",   "http://www4.wiwiss.fu-berlin.de/sider/resource/side_effects/"
    @vie.namespaces.add "diseasome",      "http://www4.wiwiss.fu-berlin.de/diseasome/resource/diseasome/"
    @vie.namespaces.add "genes",          "http://www4.wiwiss.fu-berlin.de/diseasome/resource/genes/"
    @vie.namespaces.add "diseases",       "http://www4.wiwiss.fu-berlin.de/diseasome/resource/diseases/"
    @vie.namespaces.add "diseaseClass",   "http://www4.wiwiss.fu-berlin.de/diseasome/resource/diseaseClass/"
    @vie.namespaces.add "sider-drugs",    "http://www4.wiwiss.fu-berlin.de/sider/resource/drugs/"
    @vie.namespaces.add "dailymed",       "http://www4.wiwiss.fu-berlin.de/dailymed/resource/dailymed/"
    @vie.namespaces.add "dailymed-drugs", "http://www4.wiwiss.fu-berlin.de/dailymed/resource/drugs/"
    @vie.namespaces.add "ingredient",     "http://www4.wiwiss.fu-berlin.de/dailymed/resource/ingredient/"
    @vie.namespaces.add "fu-berlin-other","http://www4.wiwiss.fu-berlin.de/"

    @vie.namespaces.add "lct-intervention","http://data.linkedct.org/resource/intervention/"
    @vie.namespaces.add "lct-condition",   "http://data.linkedct.org/resource/condition/"
    @vie.namespaces.add "tcm-disease",     "http://purl.org/net/tcm/tcm.lifescience.ntu.edu.tw/id/disease/"

    @vie.namespaces.add "wdbp",            "http://www.dbpedia.org/resource/"
    @vie.namespaces.add "dbp",             "http://dbpedia.org/resource/"
    @vie.namespaces.add "dbpedia-page",    "http://dbpedia.org/"

