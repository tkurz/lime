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
          <div><input type="checkbox" class="informationwidgets setting" checked="checked"> Show information widgets  </div>
          <div><input type="checkbox" class="picturewidgets setting" checked="checked"> Show picture widgets  </div>
          <div><input type="checkbox" class="mapwidgets setting" checked="checked" > Show map widgets  </div>
          <div><input type="checkbox" class="weatherwidgets setting" checked="checked"> Show weather widgets  </div>
          <div><input type="checkbox" class="videowidgets setting" checked="checked"> Show video widgets</div>
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

    #	$(modalcontainer).append("<div id=\"mapLabel\" style=\"width: inherit; height: 25%; font-family:verdana; font-size:14px; /media/EXPRESSGATE/MyWorks/For_Seekda/TV Emulator/Dev/ConnectMe_1.2/img/sport.pngkground-image: -ms-linear-gradient(bottom, rgb(33,26,20) 32%, rgb(69,61,55) 66%, rgb(28,22,21) 15%); background-image: -webkit-gradient(	linear,	left bottom, left top, color-stop(0.32, rgb(33,26,20)), color-stop(0.66, rgb(69,61,55)), color-stop(0.15, rgb(28,22,21))); color: white\"> " + "<table> <tr> <td> <img src=\"img/mapIcon.png\" style=\"width: 40px; height: 40px;\" ></td><td><em style=\"font-size:18px; color: white;\">" + locationName + "</em></td></tr></table>" + "&nbsp;&nbsp;  lat: " + latitude + "; long: " + longitude + "</div>");
    $(modalcontainer).append "</div>"

    #console.log("$(modalcontainer) = " + $(modalcontainer).html() + " modalcontainer " + modalcontainer.html());

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

      #var box = modalcontainer;

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