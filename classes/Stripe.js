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


  /**
   * Helper.
   *
   * Build an HTTP Error from a Cradle Error (not necessarily a real error).
   */

  Stripe.prototype.httpError = function(res) {
    var code, err, message;
    if (res == null) {
      return httpError();
    }
    code = (res.headers != null) && (res.headers.status != null) ? res.headers.status : 500;
    message = util.isError(res) ? res : (res.error != null) && (res.reason != null) ? res.error + ' (' + res.reason + ')' : res.error != null ? res.error : null;
    err = httpError(code, message);
    Error.captureStackTrace(err, this.httpError);
    return err;
  };

  return Stripe;

})();


/**
 * Mixins.
 */

carcass.mixable(Stripe);

Stripe.prototype.mixin(carcass.proto.uid);

Stripe.prototype.mixin(config.proto.consumer);
