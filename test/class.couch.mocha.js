// var debug = require('debug')('carcass:test');

var should = require('should');
var lib = require('../');
var example = require('../example');

describe('Class / Couch:', function() {

    var Couch = lib.classes.Couch;

    before(function(done) {
        example.reload(done);
    });

    it('should be a class', function() {
        Couch.should.be.type('function');
        (new Couch()).should.be.type('object');
    });

    describe('An instance:', function() {

        var couch = null;

        before(function() {
            couch = example.getConsumer('Couch');
        });

        it('should be an object', function() {
            couch.should.be.type('object');
        });

        it('should have an id', function() {
            couch.should.have.property('id').with.type('function');
            couch.id().should.be.type('string');
        });

        it('should be a config consumer', function() {
            couch.should.have.property('configManager').with.type('function');
            couch.should.have.property('configName').with.type('function');
            couch.should.have.property('config').with.type('function');
        });

        it('should have a config manager', function() {
            couch.configManager().should.equal(example);
        });

        it('can connect', function(done) {
            should.not.exist(couch.connection());
            couch.connect(function(err, conn) {
                conn.should.be.type('object');
                done(err);
            }).should.equal(couch);
        });

        it('can disconnect', function() {
            couch.disconnect().should.equal(couch);
        });

        it('can get a DB instance', function() {
            var db = couch.getDB();
            db.should.be.type('object');
            db.couch().should.equal(couch);
            db.configManager().should.equal(couch.configManager());
        });

    });

    describe('An instance with an id that links to a config:', function() {

        var couch = null;

        before(function() {
            couch = example.getConsumer('Couch', 'couch');
        });

        it('should have a config', function() {
            couch.config().should.be.type('object');
        });

        it('can connect', function(done) {
            should.not.exist(couch.connection());
            couch.connect(function(err, conn) {
                conn.should.be.type('object');
                done(err);
            }).should.equal(couch);
        });

        it('can disconnect', function() {
            couch.disconnect().should.equal(couch);
        });

    });

});
