class window.UserSettingsPlugin extends window.LimePlugin
  init: ->
    @name = 'UserSettingsPlugin'
    annotation = undefined
    console.info "Initialize UserSettingsPlugin"

    # insert widget click function
    $("div .usersettings").click => #click behaviour - highlight the related widgets by adding a class to them
      @lime.player.pause()
      @displayUserSettingsInModal()

  renderUserSettingsInModalWindow: ->
    hasGeoNamesMapPlugin = if @lime.options.plugins.hasOwnProperty("GeoNamesMapPlugin") then "checked" else " "
    hasGoogleWeatherPlugin = if @lime.options.plugins.hasOwnProperty("GoogleWeatherPlugin") then "checked" else " "
    hasDBPediaInfoPlugin = if @lime.options.plugins.hasOwnProperty("DBPediaInfoPlugin") then "checked" else " "
    hasLSIImagePlugin = if @lime.options.plugins.hasOwnProperty("LSIImagePlugin") then "checked" else " "
    hasLSIVideoPlugin = if @lime.options.plugins.hasOwnProperty("LSIVideoPlugin") then "checked" else " "

    result = """
          <div class="settingscontent" style="color: white;">
          <p class="settingstitle" style="font-size: 20px; "> Video Settings </p>
          <p class="settingssection" style="font-size: 16px; "> Annotations </p>
          <div style="margin: 0 auto; width: 75%;">
          <form style="margin: 0 auto; text-align: center; font-size: 14px;">
          <input type="checkbox" class="annotationspatialoverlay " checked="checked"> Show annotation overlays on the video &nbsp; &nbsp; &nbsp;
          <input type="checkbox" class="annotationtimelineoverlay setting" checked="checked"> Show annotation overlays on the timeline
          </form>
          </div>
          <br>
          <p class="settingssection" style="font-size: 16px; "> Widgets </p>
          <div style="margin: 0 auto; width: 50%;">
          <form style="margin: 0 auto; text-align: left; font-size: 14px; margin-left: 45%;" >
          <div><input type="checkbox" class="informationwidgets setting" #{hasDBPediaInfoPlugin}> Show information widgets  </div>
          <div><input type="checkbox" class="picturewidgets setting" #{hasLSIImagePlugin}> Show picture widgets  </div>
          <div><input type="checkbox" class="mapwidgets setting" #{hasGeoNamesMapPlugin}> Show map widgets  </div>
          <div><input type="checkbox" class="weatherwidgets setting" #{hasGoogleWeatherPlugin}> Show weather widgets  </div>
          <div><input type="checkbox" class="videowidgets setting" #{hasLSIVideoPlugin}> Show video widgets </div>
          </form>
          </div>
          </div>
    """;
    modalContent = $("#modalContent");
    modalContent.css('overflow','auto');
    modalContent.append(result);

  displayUserSettingsInModal: -> # Modal window script usin jquery
    # Get Modal Window
    #var modalcontainer;
    if @lime.player.isFullScreen
      modalcontainer = $(".modalwindow")
    else
      modalcontainer = $("#modalWindow")

    # Get mask element
    mask = undefined
    if @lime.player.isFullScreen
      mask = $(".mask")
    else
      mask = $("#mask")
    $(modalcontainer).css "height", "70%"
    $(modalcontainer).css "max-height", "1200px"
    $(modalcontainer).empty()
    $(modalcontainer).append "<a href=\"#\" class=\"close\" role=\"button\"><img src=\"img/close-icon.png\" style=\"width: 22px; height: 22px;\"/></a>"
    $(modalcontainer).append "<div id=\"modalContent\" style=\"height: 95%; width: 100%; position: relative; margin: 0 auto; color: black; \"> &nbsp"

    $(modalcontainer).append "</div>"

    #Get the screen height and width
    maskHeight = $(window).height()
    maskWidth = $(window).width()

    #Set heigth and width to mask to fill up the whole screen
    $(mask).css
      width: maskWidth
      height: maskHeight


    #transition effect
    $(mask).fadeIn 100
    $(mask).fadeTo "fast", 0.8

    #Get the window height and width
    winH = $(window).height()
    winW = $(window).width()

    #Set the popup window to center
    $(modalcontainer).css "top", winH / 2 - $(modalcontainer).height() / 2
    $(modalcontainer).css "left", winW / 2 - $(modalcontainer).width() / 2

    #transition effect
    $(modalcontainer).fadeIn 100

    #if close button is clicked
    $(".close").click (e) =>

      #Cancel the link behavior
      e.preventDefault()
      $(mask).hide()
      $(modalcontainer).hide()


    #if mask is clicked
    $(mask).click (e) =>
      $(mask).hide()
      $(modalcontainer).hide()
      $(modalcontainer).empty()

    $(window).resize (e)=>

      #Get the screen height and width
      maskHeight = $(document).height()
      maskWidth = $(document).width()

      #Set height and width to mask to fill up the whole screen
      $(mask).css
        width: maskWidth
        height: maskHeight

      #Get the window height and width
      winH = $(window).height()
      winW = $(window).width()

      #Set the popup window to center
      $(modalcontainer).css "top", winH / 2 - $(modalcontainer).height() / 2
      $(modalcontainer).css "left", winW / 2 - $(modalcontainer).width() / 2

    #box.blur(function() { setTimeout(<bluraction>, 100); });
    @renderUserSettingsInModalWindow()