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
    getClient: (secretKey) ->
        client = @client()
        if client?
            return client
        config = @config() ? {}

        debug('Stripe secret key', secretKey)
        debug('Stripe %s, configs %j', @id(), config)
        client = stripe(secretKey)
        # Cache client
        @client(client)
        return client

###*
 * Mixins.
###
carcass.mixable(Stripe)
Stripe::mixin(carcass.proto.uid)
Stripe::mixin(config.proto.consumer)
