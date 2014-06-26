var Lorem, debug, lib, modella, validation;

debug = require('debug')('carcass:model:lorem');

lib = require('../');

modella = require('modella');

validation = require('modella-validators');

module.exports = Lorem = modella('Lorem');

Lorem.use(validation);

Lorem.use(lib.plugins.modella);


/**
 * Attributes.
 */

Lorem.attr('name', {
  type: 'string'
});


/**
 * _id and _rev are for CouchDB.
 */

Lorem.attr('_id');

Lorem.attr('_rev');


/**
 * The DB instance.
 */

Lorem.db = function() {
  var config, dbName, _ref, _ref1, _ref2;
  config = (_ref = lib.get('Lorem')) != null ? _ref : {};
  dbName = (_ref1 = config.dbName) != null ? _ref1 : 'lorems';
  return (_ref2 = lib.singletons.dbs[dbName]) != null ? _ref2 : lib.singletons.couch.getDB(dbName);
};


/**
 * Just an example.
 */

Lorem.on('saving', function(lorem, done) {
  lorem.name(lorem.name().toLowerCase());
  return done();
});


/**
 * Just an example.
 */

Lorem.on('loading', function(lorem, done) {
  lorem.name(lorem.name().toLowerCase());
  return done();
});


/**
 * Just an example.
 *
 * @param {Object} model the model that just failed to update (conflict with
 *   `this`).
 */

Lorem.prototype.mergeConflict = function(model) {
  return debug(model.toJSON());
};
