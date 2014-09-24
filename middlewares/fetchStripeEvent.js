var debug;

debug = require('debug')('carcass:Stripe:middlewares:fetchStripeEvent');

module.exports = function(stripe, options) {
  if (options == null) {
    options = {};
  }
  debug('Options: %j', options);
  return function(req, res, next) {
    if (options.dev || options.test) {
      req.stripeEvent = req.body || {};
      return next();
    }
    if (req.body.object !== 'event') {
      return res.send(400);
    }
    debug('Request %j', req);
    debug('Response %j', res);
    return stripe.events.retrieve(req.body.id, function(err, event) {
      if (err || (event == null)) {
        return res.send(401);
      }
      req.stripeEvent = event;
      return next();
    });
  };
};
