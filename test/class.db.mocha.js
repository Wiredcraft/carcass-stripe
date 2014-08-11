var debug = require('debug')('carcass:test');

var should = require('should');
var carcass = require('carcass');
var highland = carcass.highland;
var uid = require('uid2');
var lib = require('../');
var example = require('../example');

describe('Class / CouchDB:', function() {

    var CouchDB = lib.classes.CouchDB;

    before(function(done) {
        example.reload(done);
    });

    it('should be a class', function() {
        CouchDB.should.be.type('function');
        (new CouchDB()).should.be.type('object');
    });

    describe('An instance:', function() {

        var couch = example.singletons.couch;
        var db = null;

        before(function() {
            db = couch.getDB();
        });

        it('should be an object', function() {
            db.should.be.type('object');
        });

        it('should have an id', function() {
            db.should.have.property('id').with.type('function');
            db.id().should.be.type('string');
        });

        it('should be a config consumer', function() {
            db.should.have.property('configManager').with.type('function');
            db.should.have.property('configName').with.type('function');
            db.should.have.property('config').with.type('function');
        });

        it('should have a config manager', function() {
            db.configManager().should.equal(example);
        });

        it('should have a couch', function() {
            db.should.have.property('couch').with.type('function');
            db.couch().should.equal(couch);
        });

        it('can build a read stream', function() {
            db.should.have.property('streamRead').with.type('function');
            db.streamRead().should.be.type('object');
        });

        it('can build a save stream', function() {
            db.should.have.property('streamSave').with.type('function');
            db.streamSave().should.be.type('object');
        });

        it('can build a saveAndRead stream', function() {
            db.should.have.property('streamSaveAndRead').with.type('function');
            db.streamSaveAndRead().should.be.type('object');
        });

        it('can declare', function(done) {
            // Declare twice at the same time.
            var instance = null;
            should.not.exist(db.db());
            db.declare(function(err, _db) {
                _db.should.be.type('object');
                instance = _db;
                // done(err);
            }).should.equal(db);
            db.declare(function(err, _db) {
                _db.should.be.type('object');
                _db.should.equal(instance);
                done(err);
            }).should.equal(db);
        });

        it('can declare again', function(done) {
            db.declare(function(err, _db) {
                _db.should.be.type('object');
                done(err);
            }).should.equal(db);
        });

        it('can save', function(done) {
            var id = uid(7);
            db.save(id, {}, function(err, res) {
                res.should.have.property('ok', true);
                res.should.have.property('id', id);
                done(err);
            }).should.equal(db);
        });

        it('can save', function(done) {
            var id = uid(7);
            db.save(id, {}, function(err, res) {
                res.should.have.property('ok', true);
                res.should.have.property('id', id);
                done(err);
            }).should.equal(db);
        });

        it('can save and read', function(done) {
            var id = uid(7);
            db.save(id, {}, function(err) {
                if (err) return done(err);
                db.read(id, function(err, doc) {
                    doc.should.have.property('_id', id);
                    done(err);
                }).should.equal(db);
            }).should.equal(db);
        });

        it('can save and read', function(done) {
            var id = uid(7);
            db.save(id, {}, function(err) {
                if (err) return done(err);
                db.read(id, function(err, doc) {
                    doc.should.have.property('_id', id);
                    done(err);
                }).should.equal(db);
            }).should.equal(db);
        });

        it('can save and remove', function(done) {
            var id = uid(7);
            db.save(id, {}, function(err) {
                if (err) return done(err);
                db.remove(id, function(err, res) {
                    res.should.have.property('ok', true);
                    res.should.have.property('id', id);
                    done(err);
                }).should.equal(db);
            }).should.equal(db);
        });

        it('can save and remove', function(done) {
            var id = uid(7);
            db.save(id, {}, function(err) {
                if (err) return done(err);
                db.remove(id, function(err, res) {
                    res.should.have.property('ok', true);
                    res.should.have.property('id', id);
                    done(err);
                }).should.equal(db);
            }).should.equal(db);
        });

        it('can save and read with saveAndRead', function(done) {
            var id = uid(7);
            db.saveAndRead(id, {
                lorem: uid(7)
            }, function(err, doc) {
                // debug('doc', doc);
                doc.should.have.property('_id', id);
                done(err);
            }).should.equal(db);
        });

        it('can save and read with saveAndRead', function(done) {
            var id = uid(7);
            db.saveAndRead(id, {
                lorem: uid(7)
            }, function(err, doc) {
                // debug('doc', doc);
                doc.should.have.property('_id', id);
                done(err);
            }).should.equal(db);
        });

        it('can save and read with stream', function(done) {
            var id = uid(7);
            db.save(id, {}, function(err) {
                if (err) return done(err);
                highland.pipeThrough([id], db.streamRead()).on('data', function(doc) {
                    doc.should.be.type('object').with.property('_id', id);
                    done();
                });
            }).should.equal(db);
        });

        it('can save and read with stream', function(done) {
            var id = uid(7);
            db.save(id, {}, function(err, res) {
                if (err) return done(err);
                highland.pipeThrough([res], db.streamRead()).on('data', function(doc) {
                    doc.should.be.type('object').with.property('_id', id);
                    done();
                });
            }).should.equal(db);
        });

        it('can save and read with stream', function(done) {
            var id = uid(7);
            db.save(id, {}, function(err, res) {
                if (err) return done(err);
                highland.pipeThrough([{
                    id: res.id
                }], db.streamRead()).on('data', function(doc) {
                    doc.should.be.type('object').with.property('_id', id);
                    done();
                });
            }).should.equal(db);
        });

        it('can save with stream and read with stream', function(done) {
            var id = uid(7);
            highland.pipeThrough([{
                id: id
            }], db.streamSave(), db.streamRead()).on('data', function(doc) {
                doc.should.be.type('object').with.property('_id', id);
                done();
            });
        });

        it('can save with stream and read with stream', function(done) {
            var id = uid(7);
            highland.pipeThrough([{
                id: id
            }], db.streamSave(), db.streamRead()).on('data', function(doc) {
                doc.should.be.type('object').with.property('_id', id);
                done();
            });
        });

        it('can save and read with a saveAndRead stream', function(done) {
            var id = uid(7);
            highland.pipeThrough([{
                id: id
            }], db.streamSaveAndRead()).on('data', function(doc) {
                doc.should.be.type('object').with.property('_id', id);
                done();
            });
        });

        it('can save and read with a saveAndRead stream', function(done) {
            var id = uid(7);
            highland.pipeThrough([{
                id: id
            }], db.streamSaveAndRead()).on('data', function(doc) {
                doc.should.be.type('object').with.property('_id', id);
                done();
            });
        });

        it('can read with stream and handle errors', function(done) {
            highland.pipeThrough([{}], db.streamRead())
                .on('error', function(err) {
                    err.should.be.instanceOf(Error);
                    err.should.have.property('status', 500);
                    done();
                })
                .toArray(function(res) {
                    debug('res', res);
                    done(new Error('expected an error'));
                });
        });

        it('can read with stream and handle errors', function(done) {
            highland.pipeThrough([uid(7)], db.streamRead())
                .on('error', function(err) {
                    err.should.be.instanceOf(Error);
                    err.should.have.property('status', 404);
                    done();
                })
                .toArray(function(res) {
                    debug('res', res);
                    done(new Error('expected an error'));
                });
        });

        it('can save with stream and handle errors', function(done) {
            var id = uid(7);
            highland.pipeThrough([{
                id: id
            }], db.streamSaveAndRead()).on('data', function(doc) {
                doc.should.be.type('object').with.property('_id', id);
                highland.pipeThrough([doc, doc], db.streamSaveAndRead())
                    .on('error', function(err) {
                        err.should.be.instanceOf(Error);
                        err.should.have.property('status', 409);
                        done();
                    })
                    .toArray(function(res) {
                        debug('res', res);
                        done(new Error('expected an error'));
                    });
            });
        });

        it('can save and remove with stream', function(done) {
            var id = uid(7);
            db.save(id, {}, function(err) {
                if (err) return done(err);
                highland.pipeThrough([id], db.streamRemove()).on('data', function(res) {
                    res.should.be.type('object').with.property('_id', id);
                    done();
                });
            }).should.equal(db);
        });

        it('can save and remove with stream', function(done) {
            var id = uid(7);
            db.save(id, {}, function(err, res) {
                if (err) return done(err);
                highland.pipeThrough([res], db.streamRemove()).on('data', function(doc) {
                    doc.should.be.type('object').with.property('_id', id);
                    done();
                });
            }).should.equal(db);
        });

        it('can save and remove with stream', function(done) {
            var id = uid(7);
            db.save(id, {}, function(err, res) {
                if (err) return done(err);
                highland.pipeThrough([{
                    id: res.id
                }], db.streamRemove()).on('data', function(doc) {
                    doc.should.be.type('object').with.property('_id', id);
                    done();
                });
            }).should.equal(db);
        });

        it('can remove with stream and handle errors', function(done) {
            highland.pipeThrough([{}], db.streamRemove())
                .on('error', function(err) {
                    err.should.be.instanceOf(Error);
                    err.should.have.property('status', 500);
                    done();
                })
                .toArray(function(res) {
                    debug('res', res);
                    done(new Error('expected an error'));
                });
        });

        it('can remove with stream and handle errors', function(done) {
            highland.pipeThrough([uid(7)], db.streamRemove())
                .on('error', function(err) {
                    err.should.be.instanceOf(Error);
                    err.should.have.property('status', 404);
                    done();
                })
                .toArray(function(res) {
                    debug('res', res);
                    done(new Error('expected an error'));
                });
        });

        it('can destroy', function(done) {
            db.destroy(done).should.equal(db);
        });

        it('can destroy again', function(done) {
            db.destroy(done).should.equal(db);
        });

    });

    describe('The lorem instance:', function() {

        var couch = example.singletons.couch;
        var db = null;

        before(function() {
            db = couch.getDB('lorem');
        });

        it('can declare', function(done) {
            should.not.exist(db.db());
            db.declare(function(err, _db) {
                _db.should.be.type('object');
                done(err);
            }).should.equal(db);
        });

        it('can save the views', function(done) {
            db.saveDesignDocs(function(err, res) {
                debug('res', res);
                done(err);
            }).should.equal(db);
        });

        it('can save', function(done) {
            var id = uid(7);
            db.save(id, {
                something: 'a'
            }, function(err, res) {
                res.should.have.property('ok', true);
                res.should.have.property('id', id);
                done(err);
            }).should.equal(db);
        });

        it('can save', function(done) {
            var id = uid(7);
            db.save(id, {
                something: 'a'
            }, function(err, res) {
                res.should.have.property('ok', true);
                res.should.have.property('id', id);
                done(err);
            }).should.equal(db);
        });

        it('can save', function(done) {
            var id = uid(7);
            db.save(id, {
                something: 'b'
            }, function(err, res) {
                res.should.have.property('ok', true);
                res.should.have.property('id', id);
                done(err);
            }).should.equal(db);
        });

        it('can save', function(done) {
            var id = uid(7);
            db.save(id, {
                nothing: true
            }, function(err, res) {
                res.should.have.property('ok', true);
                res.should.have.property('id', id);
                done(err);
            }).should.equal(db);
        });

        it('can view', function(done) {
            db.view('find/bySomething', function(err, res) {
                res.should.be.instanceOf(Array).with.lengthOf(3);
                done(err);
            }).should.equal(db);
        });

        it('can view', function(done) {
            db.view('find/bySomething', {
                key: 'a'
            }, function(err, res) {
                res.should.be.instanceOf(Array).with.lengthOf(2);
                done(err);
            }).should.equal(db);
        });

        it('can view', function(done) {
            db.view('find/bySomething', {
                key: 'b'
            }, function(err, res) {
                res.should.be.instanceOf(Array).with.lengthOf(1);
                done(err);
            }).should.equal(db);
        });

        it('can view', function(done) {
            db.view('find/bySomething', {
                key: 'c'
            }, function(err, res) {
                res.should.be.instanceOf(Array).with.lengthOf(0);
                done(err);
            }).should.equal(db);
        });

        it('can view with stream', function(done) {
            highland.pipeThrough([{}], db.streamView('find/bySomething')).toArray(function(res) {
                res.should.be.instanceOf(Array).with.lengthOf(3);
                done();
            });
        });

        it('can view with stream (another syntax)', function(done) {
            var stream = db.streamView('find/bySomething');
            stream.write({});
            stream.end();
            highland(stream).toArray(function(res) {
                res.should.be.instanceOf(Array).with.lengthOf(3);
                done();
            });
        });

        it('can view with stream', function(done) {
            highland.pipeThrough(['a'], db.streamView('find/bySomething')).toArray(function(res) {
                res.should.be.instanceOf(Array).with.lengthOf(2);
                done();
            });
        });

        it('can view with stream (another syntax)', function(done) {
            highland.pipeThrough([{
                key: 'a'
            }], db.streamView('find/bySomething')).toArray(function(res) {
                res.should.be.instanceOf(Array).with.lengthOf(2);
                done();
            });
        });

        it('can view with stream (another syntax)', function(done) {
            var stream = db.streamView('find/bySomething');
            stream.write('a');
            stream.end();
            highland(stream).toArray(function(res) {
                res.should.be.instanceOf(Array).with.lengthOf(2);
                done();
            });
        });

        it('can view with stream', function(done) {
            highland.pipeThrough(['b'], db.streamView('find/bySomething')).toArray(function(res) {
                res.should.be.instanceOf(Array).with.lengthOf(1);
                done();
            });
        });

        it('can view with stream', function(done) {
            highland.pipeThrough(['c'], db.streamView('find/bySomething')).toArray(function(res) {
                res.should.be.instanceOf(Array).with.lengthOf(0);
                done();
            });
        });

        it('can get all', function(done) {
            db.all(function(err, res) {
                res.should.be.instanceOf(Array).with.lengthOf(6);
                done(err);
            }).should.equal(db);
        });

        it('can get all with stream', function(done) {
            highland.pipeThrough(['whatever'], db.streamAll()).toArray(function(res) {
                debug('res', res);
                res.should.be.instanceOf(Array).with.lengthOf(6);
                done();
            });
        });

        it('can destroy', function(done) {
            db.destroy(done).should.equal(db);
        });

    });

    describe('An instance with a bad connection:', function() {

        var couch = null;
        var db = null;

        before(function() {
            couch = example.getConsumer('Couch', 'badCouch');
            db = couch.getDB('lorem');
        });

        it('can not declare', function(done) {
            should.not.exist(db.db());
            db.declare(function(err, _db) {
                debug('err', err);
                should.exist(err);
                should.not.exist(_db);
                done();
            }).should.equal(db);
        });

        it('can not destroy', function(done) {
            db.destroy(function(err) {
                should.exist(err);
                done();
            }).should.equal(db);
        });

    });

});
