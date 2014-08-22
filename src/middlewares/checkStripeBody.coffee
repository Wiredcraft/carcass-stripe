debug = require('debug')('carcass:Stripe:middlewares:checkStripeBody')

_ = require('lodash')

module.exports = (required = []) ->
    return (req, res, next) ->
        debug('Required %j', required)

        properties = Object.keys(req.body or {})
        debug('Properties %j', properties)

        intersection = _.intersection(properties, required)
        debug('Intersection %j', intersection)
        return res.send(400) if _.isEmpty(intersection)

        differences = _.difference(intersection, required)
        debug('Diffrences %j', differences)
        return res.send(400) if not _.isEmpty(differences)

        req.stripe = req.body

        next()
