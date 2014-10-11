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
     * Create card
     *
    ###
    Model::createCard = (customerId, card, done = ->) ->
        stripe = @stripeClient()

        stripe
          .customers
          .createCard(customerId, {card: card}, (err, card) ->
            return done(httpError(err)) if err

            done(null, card)
        )

        return @

    ###*
     * Create customer
     *
     * @return {this}
    ###
    Model::createCustomer = (options = {}, done = ->) ->
        stripe = @stripeClient()

        stripe
          .customers
          .create(options, (err, customer) ->
            return done(httpError(err)) if err

            done(null, customer)
        )

        return @

    ###*
    * Create subscription
    *
    * @return {this}
    ###
    Model::createSubscription = (customerId, planId, options = {}, done = ->) ->
        stripe = @stripeClient()
        options.plan = planId

        stripe
          .customers
          .createSubscription(customerId, options, (err, subscription) ->
            return done(httpError(err)) if err

            done(null, subscription)
        )

        return @

    ###*
    * Update subscription
    *
    * @return {this}
    ###
    Model::updateSubscription = (customerId, subscriptionId, planId, options = {}, done = ->) ->
        stripe = @stripeClient()
        options.plan = planId

        stripe
          .customers
          .updateSubscription(customerId, subscriptionId, options, (err, newSub) ->
            return done(httpError(err)) if err

            done(null, newSub)
        )

        return @
