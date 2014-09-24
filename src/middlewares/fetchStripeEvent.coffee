debug = require('debug')('carcass:Stripe:middlewares:fetchStripeEvent')

# This middleware required to pass it a stripe client object
module.exports = (stripe, options = {}) ->
    debug('Options: %j', options)
    return (req, res, next) ->
        # Not fetch real stripe event in development
        if options.dev or options.test
            req.stripeEvent = req.body or {}
            return next()

        #first, make sure the posted data looks like we expect
        if (req.body.object != 'event')
            return res.send(400) #respond with HTTP bad request

        debug('Request %j', req)
        debug('Response %j', res)
        stripe.events.retrieve(req.body.id, (err, event) ->
            return res.send(401) if err or not event?

            req.stripeEvent = event

            next()
        )
