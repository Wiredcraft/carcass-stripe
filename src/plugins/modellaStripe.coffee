# debug = require('debug')('carcass:plugin:modella')

_ = require('lodash')
carcass = require('carcass')

httpError = carcass.httpError
highland = carcass.highland

###*
 * Plugin for Modella.
 *
 * Add the ability of doing CRUD with CouchDB to a model.
###
module.exports = (Model) ->

    ###*
     * Meant to be overridden.
     *
     * @return {Object} an instance of CouchDB.
    ###
    Model.stripeClient = -> throw new Error('require a stripe client')

    ###*
     * Accessor.
    ###
    Model::stripeClient = carcass.helpers.accessor('_stripe_client', {
        getDefault: -> return @model.stripeClient()
    })

    ###*
     * Create customer
     *
     * @return {this}
    ###
    Model::createCustomer = (email, card, done = ->) ->
        stripe = @stripeClient()

        stripe.customers.create({email: email, card: card}, (err, customer) ->
            return done(httpError(err)) if err

            done(null, customer)
        )

        return @

    ###*
    * Create ubscription
    *
    * @return {this}
    ###

    Model::createSubscription = (customerId, planId, done = ->) ->
        stripe = @stripeClient()

        stripe.customers.createSubscription(customerId, {plan: planId}, (err, subscription) ->
            return done(httpError(err)) if err

            done(null, subscription)
        )

        return @
