class window.CreditsPlugin extends window.LimePlugin
  init: ->
    @name = 'Credits'
    annotation = undefined
    console.info "Initialize Credits"

    # insert widget click function
    $("div .help").click => #click behaviour - highlight the related widgets by adding a class to them
      if @lime.options.pauseOnWidgetopen
        @lime.player.pause()
      @renderCreditsInModalWindow()

    button = $ "<div class='vjs-control credits' title='Credits' alt='Credits' style='font-size: 18px;top: 2px;float: right;'>&copy;<div></div></div>"
    button.click (e) =>
      if @lime.options.pauseOnWidgetopen
        @lime.player.pause()
      @renderCreditsInModalWindow()

    $(@lime.player.buttonContainer).append button

    if @options.permanentWidget
      # Render a permanently shown widget for accessing the user settings e.g. on a TV where the control bar is hidden
      console.info 'Permanent widgets are on.'
      widget = @lime.allocateWidgetSpace @,
        thumbnail: "img/creditsWidget.png" # should go into CSS
        title: "Credits"
        type: "CreditsWidget"
        sortBy: ->
          100000000

      jQuery(widget).bind 'activate', (e) =>
        try
          eventClickedLabel = e.target.options.title
          eventCategory = @name
          _gaq.push ['_trackEvent',eventCategory, 'clicked',eventClickedLabel]
        catch error
        if @lime.options.pauseOnWidgetopen
          @lime.player.pause()
        @renderCreditsInModalWindow()

      _.defer ->
        widget.setActive()


  defaults:
  # List of widgets (type names) that are not offered to be hidden
    unhidable: []
    permanentWidget: false

  renderCreditsInModalWindow: ->
    modalContent = @getModalContainer()
    modalContent.css "width", "600px"
    modalContent.css "height", "auto"
    modalContent.css('overflow','auto');
    modalContent.append """
      <div>
      <p>The <a href="https://github.com/szabyg/lime" target="_blank">ConnectME LIME player</a> was originally developed in the
      <a href="http://www.connectme.at" target="_blank">ConnectME project</a> funded by the
      <a href="http://www.ffg.at/coin" target="_blank">FFG in the COIN program by
      <a href="http://www.salzburgresearch.at" target="_blank">Salzburg Research</a>,
      <a href="http://www.sti2.org" target="_blank">STI International</a> and
      <a href="http://www.seekda.com" target="_blank">Seekda GmbH</a>.
      Development by Szaby Grünwald, Cristian Bara and Sorin Petan.</p>
      <br/>
      <p>&copy; 2013 Salzburg Research, STI International and Seekda GmbH.<br/>
      Available under Apache 2.0 license at http://szabyg.github.io/lime.</p>
      <p>For more information contact szaby.gruenwald@salzburgresearch.at</p>
      </div>
      """
