var debug, _;

debug = require('debug')('carcass:Stripe:middlewares:checkStripeBody');

_ = require('lodash');

module.exports = function(required) {
  if (required == null) {
    required = [];
  }
  return function(req, res, next) {
    var differences, intersection, properties;
    debug('Required %j', required);
    properties = Object.keys(req.body || {});
    debug('Properties %j', properties);
    intersection = _.intersection(properties, required);
    debug('Intersection %j', intersection);
    if (_.isEmpty(intersection)) {
      return res.send(400);
    }
    differences = _.difference(intersection, required);
    debug('Diffrences %j', differences);
    if (!_.isEmpty(differences)) {
      return res.send(400);
    }
    req.stripe = req.body;
    return next();
  };
};
