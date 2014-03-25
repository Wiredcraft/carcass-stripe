var Couch, carcass, config, cradle, debug;

debug = require('debug')('carcass:couch');

cradle = require('cradle');

carcass = require('carcass');

config = require('carcass-config');


/**
 * Represents a CouchDB connection.
 */

module.exports = Couch = (function() {

  /**
   * Constructor.
   */
  function Couch(options) {
    this.id(options);
    debug('initializing the %s couch.', this.id());
  }


  /**
   * Cache of the connection.
   *
   * @type {Function}
   */

  Couch.prototype.connection = carcass.helpers.accessor('_connection');


  /**
   * Connect.
   *
   * @public
   */

  Couch.prototype.connect = function(done) {
    var conn, _ref;
    if (done == null) {
      done = function() {};
    }
    conn = this.connection();
    if (conn != null) {
      done(null, conn);
      return this;
    }
    config = (_ref = this.config()) != null ? _ref : {};
    debug('%s connecting to CouchDB', this.id(), config);
    conn = new cradle.Connection(config);
    this.connection(conn);
    done(null, conn);
    return this;
  };


  /**
   * Disconnect.
   *
   * @public
   */

  Couch.prototype.disconnect = function() {
    this.connection(null);
    return this;
  };


  /**
   * Get a DB instance.
   *
   * @public
   */

  Couch.prototype.getDB = function(options) {
    return this.configManager().getConsumer('DB', options).couch(this);
  };

  return Couch;

})();


/**
 * Mixins.
 */

carcass.mixable(Couch);

Couch.prototype.mixin(carcass.proto.uid);

Couch.prototype.mixin(config.proto.consumer);
