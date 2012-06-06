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

        config = {"<http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugbank/drugs>":[[{"property":"<http://www.w3.org/2004/02/skos/core#prefLabel>","fieldLabel":"Name"},{"property":"<http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugbank/description>","fieldLabel":"Description"}],[],[{"property":"<http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugbank/target>","fieldLabel":"Targets"}],[{"property":"<http://www4.wiwiss.fu-berlin.de/drugbank/resource/drugbank/toxicity>","fieldLabel":"Toxicity"}]]}

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

# Demo

Go to the [configurator](http://szabyg.github.com/VIE.infobox/config.html) to see how you can browse a VIE repository and create configurations.
Or go to the [infobox demo](http://szabyg.github.com/VIE.infobox/infobox.html) and see how it can be shown.
