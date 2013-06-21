class window.UserSettingsPlugin extends window.LimePlugin
  init: ->
    @name = 'UserSettingsPlugin'
    annotation = undefined
    console.info "Initialize UserSettingsPlugin"

    # insert widget click function
    $("div .usersettings").click => #click behaviour - highlight the related widgets by adding a class to them
      @lime.player.pause()
      @renderUserSettingsInModalWindow()

    button = $ "<div class='vjs-control usersettings' title='User settings' alt='User settings'><div></div></div>"
    button.click (e) =>
      @lime.player.pause()
      @renderUserSettingsInModalWindow()

    $(@lime.player.buttonContainer).append button

    if @options.permanentWidget
      # Render a permanently shown widget for accessing the user settings e.g. on a TV where the control bar is hidden
      console.info 'Permanent widgets are on.'
      widget = @lime.allocateWidgetSpace @,
        thumbnail: "img/settingsWidget.png" # should go into CSS
        title: "User settings"
        type: "UserSettingsWidget"
        sortBy: ->
          100000000

      jQuery(widget).bind 'activate', (e) =>
        @lime.player.pause()
        @renderUserSettingsInModalWindow()

      _.defer ->
        widget.setActive()


  defaults:
    # List of widgets (type names) that are not offered to be hidden
    unhidable: []
    permanentWidget: false

  getAllWidgetTypes: ->
    res = _(@lime.widgets).chain()
      .map (widget) ->
        widget.options.type
      .uniq()
      .sort()
      .difference(@defaults.unhidable, 'UserSettingsWidget')
      .value()
    res

  getHiddenWidgetTypes: ->
    JSON.parse(localStorage.getItem('hiddenWidgetTypes')) or []

  setHiddenWidgetTypes: (types) ->
    localStorage.setItem('hiddenWidgetTypes', JSON.stringify(types))
    toBeShown = _(@getAllWidgetTypes()).difference(types).concat @defaults.unhidable
    @lime.updateDeactivatedWidgetStates toBeShown

  hideWidgetType: (type) ->
    hiddenTypes = @getHiddenWidgetTypes()
    hiddenTypes.push type
    hiddenTypes = _(hiddenTypes).uniq()
    @setHiddenWidgetTypes hiddenTypes

  unhideWidgetType: (type) ->
    hiddenTypes = @getHiddenWidgetTypes()
    index = hiddenTypes.indexOf type
    hiddenTypes.splice index, 1
    @setHiddenWidgetTypes hiddenTypes

  renderUserSettingsInModalWindow: ->
    modalContent = @getModalContainer()
    modalContent.css "width", "600px"
    modalContent.css "height", "auto"
    modalContent.css('overflow','auto');
    console.info "widget types:", @getAllWidgetTypes()

    modalContent.append '<div class="settingscontent" style="color: white; width: 100%; height: auto; margin-top: 0; background: rgba(0,0,0,0.6);">'
    settingsElement = $('.settingscontent', modalContent)
    settingsElement.append """
      <span class="settingstitle" style="font-size: 20px; margin-left: 10px;">LIME player settings </span>
    """
    ###
    settingsElement.append """
      <p class="settingssection" style="font-size: 16px; "> Annotations </p>
      <form style="margin: 0 auto; text-align: left; font-size: 14px;width: 75%;">
        <div class="settingssection overlay-plugins" style="margin: 0 auto; ">
          <label><input type="checkbox" class="annotationspatialoverlay " checked="checked"> Show annotation overlays on the video</label><br/>
          <label><input type="checkbox" class="annotationtimelineoverlay setting" checked="checked"> Show annotation overlays on the timeline</label>
        </div>
      </form>
    """
    ###

    $('.annotationspatialoverlay', settingssection).click (e) =>
      #TODO: implement

    $('.annotationtimelineoverlay', settingssection).click (e) =>
      #TODO: implement

    settingsElement.append """
      <p class="settingssection" style="font-size: 16px; margin-left: 10px;"> Widgets </p>
      <form style="margin: 0 auto; text-align: left; font-size: 14px; width: 75%;" >
        <div class="settingssection widget-types" style="margin: 0 auto;"></div>
      </form>
      <br/>
    """

    settingssection = $('div.settingssection.widget-types', settingsElement)
    for widgetType in @getAllWidgetTypes()
      checked = if @getHiddenWidgetTypes().indexOf(widgetType) is -1 then 'checked' else ''
      settingssection.append "<div><label><input type='checkbox' name='#{widgetType}' class='#{widgetType} setting' #{checked} > Show '#{widgetType}' widgets</label></div>"

    $('.setting', settingssection).click (e) =>
      widgetName = e.target.name
      widgetShown = e.target.checked
      if widgetShown
        @unhideWidgetType widgetName
      else
        @hideWidgetType widgetName

