var Stripe, carcass, config, debug, highland, httpError, stripe;

debug = require('debug')('carcass:Stripe');

stripe = require('stripe');

carcass = require('carcass');

config = require('carcass-config');

httpError = carcass.httpError;

highland = carcass.highland;


/**
 * Represents a StripeDB connection.
 */

module.exports = Stripe = (function() {

  /**
   * Constructor.
   */
  function Stripe(options) {
    this.id(options);
    debug('initializing the %s Stripe.', this.id());
  }


  /**
   * Cache of the connection.
   *
   * @type {Function}
   */

  Stripe.prototype.client = carcass.helpers.accessor('_stripe_client');


  /**
   * Get a client instance.
   *
   * @public
   */

  Stripe.prototype.getClient = function(secretKey) {
    var client, _ref;
    client = this.client();
    if (client != null) {
      return client;
    }
    config = (_ref = this.config()) != null ? _ref : {};
    debug('Stripe secret key', secretKey);
    debug('Stripe %s, configs %j', this.id(), config);
    client = stripe(secretKey);
    this.client(client);
    return client;
  };

  return Stripe;

})();


/**
 * Mixins.
 */

carcass.mixable(Stripe);

Stripe.prototype.mixin(carcass.proto.uid);

Stripe.prototype.mixin(config.proto.consumer);
