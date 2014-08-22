var debug;

debug = require('debug')('carcass:Stripe:middlewares:fetchEvent');

module.exports = function(stripe) {
  return function(req, res, next) {
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
