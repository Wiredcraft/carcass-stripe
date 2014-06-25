var CouchDB, Promise, carcass, config, debug, highland, httpError, through2, util, _,
  __slice = [].slice;

debug = require('debug')('carcass:couch:db');

_ = require('lodash');

util = require('util');

Promise = require('bluebird');

through2 = require('through2');

carcass = require('carcass');

config = require('carcass-config');

httpError = require('build-http-error');

highland = carcass.highland;


/**
 * Represents a CouchDB database.
 */

module.exports = CouchDB = (function() {

  /**
   * Constructor.
   */
  function CouchDB(options) {
    this.id(options);
    this.id(this.id().toLowerCase().replace(/^[^a-z]+/, ''));
    debug('initializing the %s db.', this.id());
  }


  /**
   * Cache of the couch instance.
   *
   * @type {Function}
   */

  CouchDB.prototype.couch = carcass.helpers.accessor('_couch');


  /**
   * Cache of the db instance.
   *
   * @type {Function}
   */

  CouchDB.prototype.db = carcass.helpers.accessor('_db');


  /**
   * Declare.
   *
   * @public
   */

  CouchDB.prototype.declare = function(done) {
    var fulfilled, promise, _ref;
    if (done == null) {
      done = function() {};
    }
    fulfilled = function(db) {
      return done(null, db);
    };
    promise = this.db();
    if (promise != null) {
      promise.then(fulfilled, done);
      return this;
    }
    config = (_ref = this.config()) != null ? _ref : {};
    debug('getting db %s from CouchDB', this.id(), config);
    promise = new Promise((function(_this) {
      return function(resolve, reject) {
        return _this.couch().connect(function(err, conn) {
          var db;
          if (err) {
            return reject(err);
          }
          db = conn.database(_this.id());
          return db.exists(function(err, exists) {
            if (err) {
              return reject(err);
            }
            if (exists) {
              return resolve(db);
            }
            return db.create(function(err) {
              var doc, key, _ref1;
              if (err) {
                return reject(err);
              }
              if (config.design != null) {
                _ref1 = config.design;
                for (key in _ref1) {
                  doc = _ref1[key];
                  db.save('_design/' + key, doc, function(err) {
                    if (err) {
                      return debug(err);
                    }
                  });
                }
              }
              return resolve(db);
            });
          });
        });
      };
    })(this));
    this.db(promise);
    promise.then(fulfilled, done);
    return this;
  };


  /**
   * Destroy.
   *
   * @public
   */

  CouchDB.prototype.destroy = function(done) {
    var promise;
    if (done == null) {
      done = function() {};
    }
    promise = this.db();
    if (promise == null) {
      done();
      return this;
    }
    promise.then(function(db) {
      return db.destroy(done);
    }, done);
    this.db(null);
    return this;
  };


  /**
   * Save design documents.
   */

  CouchDB.prototype.saveDesignDocs = function(done) {
    var _ref;
    if (done == null) {
      done = function() {};
    }
    config = (_ref = this.config()) != null ? _ref : {};
    this.declare(function(err, db) {
      if (err) {
        return done(err);
      }
      if (config.design == null) {
        return done();
      }
      return highland(_.pairs(config.design)).flatMap(function(pair) {
        return highland.wrapInvoke('save', '_design/' + pair[0], pair[1])(db);
      }).on('error', function(err) {
        return done(err);
      }).toArray(function(res) {
        return done(null, res);
      });
    });
    return this;
  };


  /**
   * Route read to get.
   *
   * @public
   */

  CouchDB.prototype.read = function() {
    var args, done, _i;
    args = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), done = arguments[_i++];
    if (done == null) {
      done = function() {};
    }
    return this.declare(function(err, db) {
      if (err) {
        return done(err);
      } else {
        return db.get.apply(db, __slice.call(args).concat([done]));
      }
    });
  };


  /**
   * Route save.
   *
   * @public
   */

  CouchDB.prototype.save = function() {
    var args, done, _i;
    args = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), done = arguments[_i++];
    if (done == null) {
      done = function() {};
    }
    return this.declare(function(err, db) {
      if (err) {
        return done(err);
      } else {
        return db.save.apply(db, __slice.call(args).concat([done]));
      }
    });
  };


  /**
   * Route remove.
   *
   * @public
   */

  CouchDB.prototype.remove = function() {
    var args, done, _i;
    args = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), done = arguments[_i++];
    if (done == null) {
      done = function() {};
    }
    return this.declare(function(err, db) {
      if (err) {
        return done(err);
      } else {
        return db.remove.apply(db, __slice.call(args).concat([done]));
      }
    });
  };


  /**
   * Save and read; just a shortcut.
   *
   * @public
   */

  CouchDB.prototype.saveAndRead = function() {
    var args, done, _i;
    args = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), done = arguments[_i++];
    if (done == null) {
      done = function() {};
    }
    this.save.apply(this, __slice.call(args).concat([(function(_this) {
      return function(err, res) {
        if (err) {
          return done(err);
        } else {
          return _this.read(res.id, res.rev, done);
        }
      };
    })(this)]));
    return this;
  };


  /**
   * Route view.
   *
   * @public
   */

  CouchDB.prototype.view = function() {
    var args, done, _i;
    args = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), done = arguments[_i++];
    if (done == null) {
      done = function() {};
    }
    return this.declare(function(err, db) {
      if (err) {
        return done(err);
      } else {
        return db.view.apply(db, __slice.call(args).concat([done]));
      }
    });
  };


  /**
   * Route all.
   *
   * @public
   */

  CouchDB.prototype.all = function() {
    var args, done, _i;
    args = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), done = arguments[_i++];
    if (done == null) {
      done = function() {};
    }
    return this.declare(function(err, db) {
      if (err) {
        return done(err);
      } else {
        return db.all.apply(db, __slice.call(args).concat([done]));
      }
    });
  };


  /**
   * Stream APIs.
   *
   * TODO: handle errors?
   */


  /**
   * Read data through a stream, where you pipe in an id or an object and pipe
   *   out a result or an error.
   *
   * @return {Transform} a transform stream
   *
   * @public
   */

  CouchDB.prototype.streamRead = function() {
    var self;
    self = this;
    return through2.obj(function(chunk, enc, done) {
      var id, rev, _ref, _ref1, _ref2, _ref3;
      if (_.isString(chunk)) {
        self.read(chunk, (function(_this) {
          return function(err, doc) {
            if (err) {
              return done(self.httpError(err));
            }
            _this.push(doc);
            return done();
          };
        })(this));
        return;
      }
      id = (_ref = (_ref1 = chunk._id) != null ? _ref1 : chunk.id) != null ? _ref : null;
      rev = (_ref2 = (_ref3 = chunk._rev) != null ? _ref3 : chunk.rev) != null ? _ref2 : null;
      if (id == null) {
        return done(new Error('id is required'));
      }
      return self.read(id, rev, (function(_this) {
        return function(err, doc) {
          if (err) {
            return done(self.httpError(err));
          }
          _this.push(doc);
          return done();
        };
      })(this));
    });
  };


  /**
   * Save data through a stream, where you pipe in data and pipe out the
   *   result.
   *
   * @return {Transform} a transform stream
   *
   * @public
   */

  CouchDB.prototype.streamSave = function() {
    var self;
    self = this;
    return through2.obj(function(chunk, enc, done) {
      var id, rev, _ref, _ref1, _ref2, _ref3;
      id = (_ref = (_ref1 = chunk._id) != null ? _ref1 : chunk.id) != null ? _ref : null;
      rev = (_ref2 = (_ref3 = chunk._rev) != null ? _ref3 : chunk.rev) != null ? _ref2 : null;
      if ((id != null) && (rev != null)) {
        return self.save(id, rev, chunk, (function(_this) {
          return function(err, res) {
            if (err) {
              return done(self.httpError(err));
            }
            _this.push(res);
            return done();
          };
        })(this));
      } else if (id != null) {
        return self.save(id, chunk, (function(_this) {
          return function(err, res) {
            if (err) {
              return done(self.httpError(err));
            }
            _this.push(res);
            return done();
          };
        })(this));
      } else {
        return self.save(chunk, (function(_this) {
          return function(err, res) {
            if (err) {
              return done(self.httpError(err));
            }
            _this.push(res);
            return done();
          };
        })(this));
      }
    });
  };


  /**
   * Save data through a stream, ...
   *
   * @return {Transform} a transform stream
   *
   * @public
   */

  CouchDB.prototype.streamSaveAndRead = function() {
    var self;
    self = this;
    return through2.obj(function(chunk, enc, done) {
      var id, rev, _ref, _ref1, _ref2, _ref3;
      id = (_ref = (_ref1 = chunk._id) != null ? _ref1 : chunk.id) != null ? _ref : null;
      rev = (_ref2 = (_ref3 = chunk._rev) != null ? _ref3 : chunk.rev) != null ? _ref2 : null;
      if ((id != null) && (rev != null)) {
        return self.saveAndRead(id, rev, chunk, (function(_this) {
          return function(err, doc) {
            if (err) {
              return done(self.httpError(err));
            }
            _this.push(doc);
            return done();
          };
        })(this));
      } else if (id != null) {
        return self.saveAndRead(id, chunk, (function(_this) {
          return function(err, doc) {
            if (err) {
              return done(self.httpError(err));
            }
            _this.push(doc);
            return done();
          };
        })(this));
      } else {
        return self.saveAndRead(chunk, (function(_this) {
          return function(err, doc) {
            if (err) {
              return done(self.httpError(err));
            }
            _this.push(doc);
            return done();
          };
        })(this));
      }
    });
  };


  /**
   * Read a view through a stream, where you pipe in a key or an object and
   *   pipe out the results or an error.
   *
   * @param {String} view the view name e.g. 'myDesign/myView'
   *
   * @return {Transform} a transform stream
   *
   * @public
   */

  CouchDB.prototype.streamView = function(view) {
    var self;
    self = this;
    return through2.obj(function(chunk, enc, done) {
      if (!_.isObject(chunk)) {
        chunk = chunk != null ? {
          key: chunk
        } : {};
      }
      return self.view(view, chunk, (function(_this) {
        return function(err, docs) {
          var doc, _i, _len;
          if (err) {
            return done(self.httpError(err));
          }
          for (_i = 0, _len = docs.length; _i < _len; _i++) {
            doc = docs[_i];
            _this.push(doc);
          }
          return done();
        };
      })(this));
    });
  };


  /**
   * Read all docs through a stream, where you pipe in the options (can be
   *   empty) and pipe out the results or an error.
   *
   * @return {Transform} a transform stream
   *
   * @public
   */

  CouchDB.prototype.streamAll = function() {
    var self;
    self = this;
    return through2.obj(function(chunk, enc, done) {
      if (!_.isObject(chunk)) {
        chunk = {};
      }
      return self.all(chunk, (function(_this) {
        return function(err, docs) {
          var doc, _i, _len;
          if (err) {
            return done(self.httpError(err));
          }
          for (_i = 0, _len = docs.length; _i < _len; _i++) {
            doc = docs[_i];
            _this.push(doc);
          }
          return done();
        };
      })(this));
    });
  };


  /**
   * Helper.
   *
   * Build an HTTP Error from a Cradle Error (not necessarily a real error).
   */

  CouchDB.prototype.httpError = function(res) {
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

  return CouchDB;

})();


/**
 * Mixins.
 */

carcass.mixable(CouchDB);

CouchDB.prototype.mixin(carcass.proto.uid);

CouchDB.prototype.mixin(config.proto.consumer);
