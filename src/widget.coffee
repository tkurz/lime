# A Lime widget makes the look and behaviour of the widgets from all plugins somewhat uniform.
class LimeWidget
  constructor: (@plugin, @element, options) ->
    defaults =
      type: 'defaultwidget'

    @options = _(defaults).extend @options, options
    _.defer => @_init()

    @element.html """
                  <div class="#{@name}">
                  <table style="margin:0 auto; width: 100%;">
                  <tr>
                  <td><b class="utility-text">#{@options.title}</b></td>
                  <td><img class="utility-icon" src="#{@options.thumbnail}" style="float: right; width: 25px; height: 25px; " ></td>
                  </tr>
                  </table>
                  </div>
                  """
    jQuery(@element).data 'widget', @
    jQuery(@element).data 'plugin', @plugin
    jQuery(@element).click (e) =>
      widget = jQuery(e.target).data().widget
      plugin = jQuery(e.target).data().plugin
      @plugin.lime.pause()
      jQuery(@).trigger 'activate',
        plugin: plugin
        widget: widget

    # Wrap element methods for convenience on the widget
    defMethod = (o, m) =>
      @[m] = ->
        console.info "calling #{m} on ", o
        o[m].call o, arguments
    for m in ['addClass', 'html', 'removeClass']
      defMethod @element, m

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
  deactivate: ->
    grayThumbnail = @options.thumbnail.replace('.png', '')
    @element.find(".utility-icon").attr "src", grayThumbnail+"_gr.png"
    @element.find(".utility-text").css "color", "#c6c4c4"
    console.info "It's to be implemented, how a widget should look like when it's deactivated..."

