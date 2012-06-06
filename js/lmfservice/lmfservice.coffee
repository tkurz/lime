###
VIE LMFService

# Example usage:

## Instantiate VIE

        v = new VIE
        v.use new v.LMFService
            lmfUri: 'http://localhost:8080/LMF'

## Loading an entity:

        resUri = 'http://example.com/abcd'

        v.load
            uri: resUri
        .using('lmf')
        .execute()
        .success (res) ->
            # res is a VIE Entity
            console.info 'lmfservice.load success:', res

###

class VIE::LMFService
    constructor: (options) ->
        defaults =
            name : 'lmf'
            lmfUrl: 'http://localhost:8080/LMF'

        # the options are merged with the default options
        @options = jQuery.extend(true, defaults, options ? options : {})

        @vie = null; # this.vie will be set via VIE.use()
        # overwrite options.name if you want to set another name
        @name = @options.name
    init: ->
        c = new LMFClient @options.lmfUrl
        @client = c.resourceClient

    load: (loadable) ->
        console.info loadable
        @client.getResourceMetadata loadable.options.uri, (res) =>
            console.info 'Got', loadable.options.uri, 'from LMF:', res
            entities = VIE.Util.rdf2Entities @, res
            loadable.resolve entities
        , (err) ->
            loadable.reject err
    save: (savable) ->
        # call create and update
        if true
            savable.resolve
                result:
                    test: true
        else
            savable.reject
                err:
                    123

