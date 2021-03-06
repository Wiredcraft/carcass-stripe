var carcass, highland, httpError, _;

_ = require('lodash');

carcass = require('carcass');

httpError = carcass.httpError;

highland = carcass.highland;


/**
 * Plugin for Modella.
 *
 * Add the ability of doing CRUD with CouchDB to a model.
 */

module.exports = function(Model) {

  /**
   * Meant to be overridden.
   *
   * @return {Object} an instance of CouchDB.
   */
  Model.stripeClient = function() {
    throw new Error('require a stripe client');
  };

  /**
   * Accessor.
   */
  Model.prototype.stripeClient = carcass.helpers.accessor('_stripe_client', {
    getDefault: function() {
      return this.model.stripeClient();
    }
  });

  /**
   * Create card
   *
   */
  Model.prototype.createCard = function(customerId, card, done) {
    var stripe;
    if (done == null) {
      done = function() {};
    }
    stripe = this.stripeClient();
    stripe.customers.createCard(customerId, {
      card: card
    }, function(err, card) {
      if (err) {
        return done(httpError(err));
      }
      return done(null, card);
    });
    return this;
  };

  /**
   * Create customer
   *
   * @return {this}
   */
  Model.prototype.createCustomer = function(options, done) {
    var stripe;
    if (options == null) {
      options = {};
    }
    if (done == null) {
      done = function() {};
    }
    stripe = this.stripeClient();
    stripe.customers.create(options, function(err, customer) {
      if (err) {
        return done(httpError(err));
      }
      return done(null, customer);
    });
    return this;
  };

  /**
  * Create subscription
  *
  * @return {this}
   */
  Model.prototype.createSubscription = function(customerId, planId, options, done) {
    var stripe;
    if (options == null) {
      options = {};
    }
    if (done == null) {
      done = function() {};
    }
    stripe = this.stripeClient();
    options.plan = planId;
    stripe.customers.createSubscription(customerId, options, function(err, subscription) {
      if (err) {
        return done(httpError(err));
      }
      return done(null, subscription);
    });
    return this;
  };

  /**
  * Update subscription
  *
  * @return {this}
   */
  return Model.prototype.updateSubscription = function(customerId, subscriptionId, planId, options, done) {
    var stripe;
    if (options == null) {
      options = {};
    }
    if (done == null) {
      done = function() {};
    }
    stripe = this.stripeClient();
    options.plan = planId;
    stripe.customers.updateSubscription(customerId, subscriptionId, options, function(err, newSub) {
      if (err) {
        return done(httpError(err));
      }
      return done(null, newSub);
    });
    return this;
  };
};
