class window.Help extends window.LimePlugin
  init: ->
    @name = 'Help'
    annotation = undefined
    console.info "Initialize Help"

    # insert widget click function
    $("div .help").click => #click behaviour - highlight the related widgets by adding a class to them
      @lime.player.pause()
      @renderHelpInModalWindow()

    button = $ "<div class='vjs-control help' title='Help' alt='Help' style='font-size: 18px;top: 2px;'>?<div></div></div>"
    button.click (e) =>
      @lime.player.pause()
      @renderHelpInModalWindow()

    $(@lime.player.buttonContainer).append button

    if @options.permanentWidget
      # Render a permanently shown widget for accessing the user settings e.g. on a TV where the control bar is hidden
      console.info 'Permanent widgets are on.'
      widget = @lime.allocateWidgetSpace @,
        thumbnail: "img/help.png" # should go into CSS
        title: "Help"
        type: "HelpWidget"
        sortBy: ->
          100000000

      jQuery(widget).bind 'activate', (e) =>
        @lime.player.pause()
        @renderHelpInModalWindow()

      _.defer ->
        widget.setActive()


  defaults:
  # List of widgets (type names) that are not offered to be hidden
    unhidable: []
    permanentWidget: false

  renderHelpInModalWindow: ->
    modalContent = @getModalContainer()
    modalContent.append """
                        <img src='img/helpMC.png'/>

                        """
