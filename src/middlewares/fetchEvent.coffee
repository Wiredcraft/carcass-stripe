debug = require('debug')('carcass:Stripe:middlewares:fetchEvent')

module.exports = (stripe) ->
    return (req, res, next) ->
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