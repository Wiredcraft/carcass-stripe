debug = require('debug')('carcass:Stripe')

stripe = require('stripe')
carcass = require('carcass')
config = require('carcass-config')

httpError = carcass.httpError
highland = carcass.highland

###*
 * Represents a StripeDB connection.
###
module.exports = class Stripe
    ###*
     * Constructor.
    ###
    constructor: (options) ->
        @id(options)
        debug('initializing the %s Stripe.', @id())

    ###*
     * Cache of the connection.
     *
     * @type {Function}
    ###
    client: carcass.helpers.accessor('_stripe_client')

    ###*
     * Get a client instance.
     *
     * @public
    ###
    getClient: (apiKey) ->
        client = @client()
        if client?
            return client
        config = @config() ? {}

        debug('Stripe api key', apiKey)
        debug('Stripe %s, configs %j', @id(), config)
        client = stripe(apiKey)
        # Cache client
        @client(client)
        return client

    ###*
     * Helper.
     *
     * Build an HTTP Error from a Cradle Error (not necessarily a real error).
    ###
    httpError: (res) ->
        return httpError() if not res?
        code =
            if res.headers? and res.headers.status? then res.headers.status
            else 500
        message =
            if util.isError(res) then res
            else if res.error? and res.reason? then res.error + ' (' + res.reason + ')'
            else if res.error? then res.error
            else null
        err = httpError(code, message)
        Error.captureStackTrace(err, @httpError)
        return err

###*
 * Mixins.
###
carcass.mixable(Stripe)
Stripe::mixin(carcass.proto.uid)
Stripe::mixin(config.proto.consumer)
