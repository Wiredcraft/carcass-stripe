var DB, carcass, config, debug, isObject, isString, last, through2,
  __slice = [].slice;

debug = require('debug')('carcass:couch:db');

carcass = require('carcass');

config = require('carcass-config');

through2 = require('through2');

isString = carcass.String.isString;

isObject = carcass.Object.isObject;

last = carcass.Array.prototype.last;


/**
 * Represents a CouchDB database.
 */

module.exports = DB = (function() {

  /**
   * Constructor.
   */
  function DB(options) {
    this.id(options);
    this.id(this.id().toLowerCase().replace(/^[^a-z]+/, ''));
    debug('initializing the %s db.', this.id());
  }


  /**
   * Cache of the couch instance.
   *
   * @type {Function}
   */

  DB.prototype.couch = carcass.helpers.accessor('_couch');


  /**
   * Cache of the db instance.
   *
   * @type {Function}
   */

  DB.prototype.db = carcass.helpers.accessor('_db');


  /**
   * Declare.
   *
   * @public
   */

  DB.prototype.declare = function(done) {
    var db, _ref;
    if (done == null) {
      done = function() {};
    }
    db = this.db();
    if (db != null) {
      done(null, db);
      return this;
    }
    config = (_ref = this.config()) != null ? _ref : {};
    debug('getting db %s from CouchDB', this.id(), config);
    this.couch().connect((function(_this) {
      return function(err, conn) {
        if (err) {
          return done(err);
        }
        db = conn.database(_this.id());
        _this.db(db);
        return db.exists(function(err, exists) {
          if (err) {
            return done(err);
          }
          if (exists) {
            return done(null, db);
          }
          return db.create(function(err) {
            var doc, key, _ref1;
            if (err) {
              return done(err);
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
            return done(null, db);
          });
        });
      };
    })(this));
    return this;
  };


  /**
   * Destroy.
   *
   * @public
   */

  DB.prototype.destroy = function(done) {
    var _ref;
    if (done == null) {
      done = function() {};
    }
    if ((_ref = this.db()) != null) {
      _ref.destroy(done);
    }
    this.db(null);
    return this;
  };


  /**
   * Route read to get.
   *
   * @public
   */

  DB.prototype.read = function() {
    var args, done;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    done = last.call(args);
    return this.declare(function(err, db) {
      if (err) {
        return typeof done === "function" ? done(err) : void 0;
      } else {
        return db.get.apply(db, args);
      }
    });
  };


  /**
   * Route save.
   *
   * @public
   */

  DB.prototype.save = function() {
    var args, done;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    done = last.call(args);
    return this.declare(function(err, db) {
      if (err) {
        return typeof done === "function" ? done(err) : void 0;
      } else {
        return db.save.apply(db, args);
      }
    });
  };


  /**
   * Route remove.
   *
   * @public
   */

  DB.prototype.remove = function() {
    var args, done;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    done = last.call(args);
    return this.declare(function(err, db) {
      if (err) {
        return typeof done === "function" ? done(err) : void 0;
      } else {
        return db.remove.apply(db, args);
      }
    });
  };


  /**
   * Save and read; just a shortcut.
   *
   * @public
   */

  DB.prototype.saveAndRead = function() {
    var args, done;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    done = args.pop();
    args.push((function(_this) {
      return function(err, res) {
        if (err) {
          return typeof done === "function" ? done(err) : void 0;
        } else {
          return _this.read(res.id, res.rev, done);
        }
      };
    })(this));
    this.save.apply(this, args);
    return this;
  };


  /**
   * Route view.
   *
   * @public
   */

  DB.prototype.view = function() {
    var args, done;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    done = last.call(args);
    return this.declare(function(err, db) {
      if (err) {
        return typeof done === "function" ? done(err) : void 0;
      } else {
        return db.view.apply(db, args);
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

  DB.prototype.streamRead = function() {
    var self;
    self = this;
    return through2.obj(function(chunk, enc, done) {
      var id, rev, _ref, _ref1, _ref2, _ref3;
      if (isString(chunk)) {
        self.read(chunk, (function(_this) {
          return function(err, doc) {
            if (err) {
              return done();
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
        return done();
      }
      return self.read(id, rev, (function(_this) {
        return function(err, doc) {
          if (err) {
            return done();
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

  DB.prototype.streamSave = function() {
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
              return done();
            }
            _this.push(res);
            return done();
          };
        })(this));
      } else if (id != null) {
        return self.save(id, chunk, (function(_this) {
          return function(err, res) {
            if (err) {
              return done();
            }
            _this.push(res);
            return done();
          };
        })(this));
      } else {
        return self.save(chunk, (function(_this) {
          return function(err, res) {
            if (err) {
              return done();
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

  DB.prototype.streamSaveAndRead = function() {
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
              return done();
            }
            _this.push(doc);
            return done();
          };
        })(this));
      } else if (id != null) {
        return self.saveAndRead(id, chunk, (function(_this) {
          return function(err, doc) {
            if (err) {
              return done();
            }
            _this.push(doc);
            return done();
          };
        })(this));
      } else {
        return self.saveAndRead(chunk, (function(_this) {
          return function(err, doc) {
            if (err) {
              return done();
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

  DB.prototype.streamView = function(view) {
    var self;
    self = this;
    return through2.obj(function(chunk, enc, done) {
      if (!isObject(chunk)) {
        chunk = {
          key: chunk
        };
      }
      return self.view(view, chunk, (function(_this) {
        return function(err, docs) {
          var doc, _i, _len;
          if (err) {
            return done();
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

  return DB;

})();


/**
 * Mixins.
 */

carcass.mixable(DB);

DB.prototype.mixin(carcass.proto.uid);

DB.prototype.mixin(config.proto.consumer);
