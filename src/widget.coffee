# A Lime widget makes the look and behaviour of the widgets from all plugins somewhat uniform.
# The state of a widget goes through the following states:
# initialized -> rendered ->
class window.LimeWidget
  constructor: (@plugin, @element, options) ->
    @lime = @plugin.lime
    defaults =
      type: 'defaultwidget'

    @options = _(defaults).extend @options, options
    _.defer => @_init()
  render: ->
    # console.info "rendering widget", @
    @element.html """
      <div class="#{@plugin.name}">
        <table style="margin:0 auto; width: 100%;">
          <tr>
            <td><img class="utility-icon" src="#{@options.thumbnail}" style="float: left; width: 45px; height: 27px; " ></td>
            <td><b class="utility-text" style="float: left;">#{@options.title}</b></td>            
          </tr>
        </table>
      </div>
    """
    jQuery(@element).parent().data('sorted', false)
    jQuery(@element).data 'widget', @
    jQuery(@element).data 'plugin', @plugin
    jQuery(@element).click (e) =>
      widget = jQuery(e.currentTarget).data().widget
      plugin = jQuery(e.currentTarget).data().plugin
      if widget.isActive()
        @plugin.lime.pause()
        console.info "activating widget", @
        jQuery(@).trigger 'activate',
          plugin: plugin
          widget: widget
        time = @lime.player.currentTime()

        history.pushState { annotation: widget.annotation.hash.annotation.value, widgetType: widget.options.type, time: time }, 'state123', "#time=#{time}&widgetType=#{widget.options.type}"
        @lime.claimKeyEvents widget
      else
        plugin.lime.player.seek widget.annotation.start
        plugin.lime.player.play()

      # If a widget is clicked, it should also be marked as active for clear navigation.
      plugin.lime.navActivateWidget widget.element

    # Wrap element methods for convenience on the widget
    defMethod = (o, m) =>
      @[m] = ->
        console.info "calling #{m} on ", o
        o[m].call o, arguments
    for m in ['addClass', 'html', 'removeClass']
      defMethod @element, m
    @isRendered = true

  html: (content) ->
    @element.html content
  options:
    showSpeed: 500
    label: 'Default label'
  _init: ->
    @state = 'hidden'
  show: ->
    @element.slideDown @options.showSpeed
    @state = 'visible'
  hide: ->
    @element.slideUp @options.showSpeed

  setActive: ->
    unless @isRendered
      @render()
    @show()
    @state = 'active'
    @element.find(".utility-icon").attr "src", @options.thumbnail
    # @element.find(".utility-text").css "color", ''
    @element.removeClass 'inactive'
    console.info "Widget active, triggering update", @element
    console.info "Jump up this widget", @
    @element.parent().prepend(@element)
    @lime.updateWidgetsList()
  setInactive: ->
    @state = 'inactive'
    grayThumbnail = @options.thumbnail.replace('.png', '')
    @element.find(".utility-icon").attr "src", grayThumbnail+"_gr.png"
    @element.addClass 'inactive'
    # @element.find(".utility-text").css "color", "#c6c4c4"
    console.info "Widget inactive, triggering update", @element
    @lime.updateWidgetsList()

  isActive: ->
    @state is 'active'
