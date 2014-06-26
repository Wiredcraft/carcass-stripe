var carcass, _;

_ = require('lodash');

carcass = require('carcass');


/**
 * Plugin for Modella.
 *
 * Add the ability of doing CRUD with CouchDB to a model.
 */

module.exports = function(Model) {

  /**
   * Meant to be overridden.
   *
   * @return {Object} a doc that will be saved to DB.
   */
  Model.prototype.toDoc = function() {
    return this.toJSON();
  };

  /**
   * Meant to be overridden.
   *
   * @return {Object} an instance of CouchDB.
   */
  Model.db = function() {
    throw new Error('require a DB instance');
  };

  /**
   * Accessor.
   */
  Model.prototype.db = carcass.helpers.accessor('_db', {
    getDefault: function() {
      return this.model.db();
    }
  });

  /**
   * Shortcut to load data from DB and instantiate a new model.
   *
   * @return {Object} the loaded model.
   */
  Model.load = function(id, done) {
    if (done == null) {
      done = function() {};
    }
    return (new Model({
      _id: id
    })).load(done);
  };

  /**
   * Load.
   *
   * @return {this}
   */
  Model.prototype.load = function(done) {
    var db;
    if (done == null) {
      done = function() {};
    }
    db = this.db();
    db.read(this.primary(), (function(_this) {
      return function(err, doc) {
        if (err) {
          return done(db.httpError(err));
        }
        _this.set(doc);
        _this.dirty = {};
        return _this.run('loading', function(err) {
          if (!_.isEmpty(_this.dirty)) {
            return _this.save(done);
          }
          _this.model.emit('load', _this);
          _this.emit('load');
          return done(null, _this);
        });
      };
    })(this));
    return this;
  };

  /**
   * Route save to CouchDB.
   *
   * @return {this}
   */
  Model.save = function(done) {
    var db;
    if (done == null) {
      done = function() {};
    }
    db = this.db();
    this.db().saveAndRead(this.toDoc(), function(err, res) {
      return this._onSaved(err, res, done);
    });
    return this;
  };

  /**
   * Route update to CouchDB.
   *
   * @return {this}
   */
  Model.update = function(done) {
    var db;
    if (done == null) {
      done = function() {};
    }
    db = this.db();
    this.db().saveAndRead(this.primary(), this.toDoc(), (function(_this) {
      return function(err, res) {
        return _this._onSaved(err, res, done);
      };
    })(this));
    return this;
  };

  /**
   * Route remove to CouchDB.
   */
  Model.remove = function(done) {
    if (done == null) {
      done = function() {};
    }
    this.db().remove(this.primary(), function(err, res) {
      if (err) {
        return done(db.httpError(err));
      }
      return done(null, res);
    });
    return this;
  };

  /**
   * Handle the save result.
   *
   * @return {this}
   */
  return Model.prototype._onSaved = function(err, res, done) {
    var db, self, status;
    if (done == null) {
      done = function() {};
    }
    if ((err == null) || (err.headers == null) || (err.headers.status == null)) {
      done(null, res);
      return this;
    }
    self = this;
    db = this.db();
    status = err.headers.status;
    if (status === 409) {
      Model.load(this.primary(), function(err, model) {
        if (err) {
          return done(db.httpError(err));
        }
        if (model.mergeConflict != null) {
          model.mergeConflict(self);
          return model.save(function(err, model) {
            if (err) {
              return done(db.httpError(err));
            }
            return done(null, model.toJSON());
          });
        } else {
          return done(null, model.toJSON());
        }
      });
    } else {
      done(db.httpError(err));
    }
    return this;
  };
};
