// var debug = require('debug')('carcass:test');

var should = require('should');
var carcass = require('carcass');
var _ = carcass.highland;
var uid = require('uid2');
var lib = require('../');

describe('Class / DB:', function() {

    var DB = lib.classes.DB;

    before(function(done) {
        lib.reload(done);
    });

    it('should be a class', function() {
        DB.should.be.type('function');
        (new DB()).should.be.type('object');
    });

    describe('An instance:', function() {

        var couch = null;
        var db = null;

        before(function() {
            couch = lib.singletons.couch;
            db = new DB();
        });

        it('should be an object', function() {
            db.should.be.type('object');
        });

        it('should be mixable', function() {
            db.should.have.property('mixin').with.type('function');
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

        it('can have a config manager', function() {
            db.configManager(lib).should.equal(db);
            db.configManager().should.equal(lib);
        });

        it('can have a couch', function() {
            db.should.have.property('couch').with.type('function');
            db.couch(couch).should.equal(db);
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
            should.not.exist(db.db());
            db.declare(function(err, _db) {
                db.db().should.equal(_db);
                done(err);
            }).should.equal(db);
        });

        it('can declare again', function(done) {
            db.declare(function(err, _db) {
                db.db().should.equal(_db);
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
                _([id]).pipe(db.streamRead()).on('data', function(doc) {
                    doc.should.be.type('object').with.property('_id', id);
                    done();
                });
            }).should.equal(db);
        });

        it('can save and read with stream', function(done) {
            var id = uid(7);
            db.save(id, {}, function(err, res) {
                if (err) return done(err);
                _([res]).pipe(db.streamRead()).on('data', function(doc) {
                    doc.should.be.type('object').with.property('_id', id);
                    done();
                });
            }).should.equal(db);
        });

        it('can save and read with stream', function(done) {
            var id = uid(7);
            db.save(id, {}, function(err, res) {
                if (err) return done(err);
                _([{
                    id: res.id
                }]).pipe(db.streamRead()).on('data', function(doc) {
                    doc.should.be.type('object').with.property('_id', id);
                    done();
                });
            }).should.equal(db);
        });

        it('can save with stream and read with stream', function(done) {
            var id = uid(7);
            _([{
                id: id
            }]).pipe(db.streamSave()).pipe(db.streamRead()).on('data', function(doc) {
                doc.should.be.type('object').with.property('_id', id);
                done();
            });
        });

        it('can save with stream and read with stream', function(done) {
            var id = uid(7);
            _([{
                id: id
            }]).pipe(db.streamSave()).pipe(db.streamRead()).on('data', function(doc) {
                doc.should.be.type('object').with.property('_id', id);
                done();
            });
        });

        it('can save and read with a saveAndRead stream', function(done) {
            var id = uid(7);
            _([{
                id: id
            }]).pipe(db.streamSaveAndRead()).on('data', function(doc) {
                doc.should.be.type('object').with.property('_id', id);
                done();
            });
        });

        it('can save and read with a saveAndRead stream', function(done) {
            var id = uid(7);
            _([{
                id: id
            }]).pipe(db.streamSaveAndRead()).on('data', function(doc) {
                doc.should.be.type('object').with.property('_id', id);
                done();
            });
        });

        it('can destroy', function(done) {
            db.destroy(done).should.equal(db);
        });
    });
});
