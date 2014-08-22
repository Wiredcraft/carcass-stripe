// var debug = require('debug')('carcass:test');

var should = require('should');
var lib = require('../');
var example = require('../example');

describe('Class / Stripe:', function() {

    var Stripe = lib.classes.Stripe;

    before(function(done) {
        example.reload(done);
    });

    it('should be a class', function() {
        Stripe.should.be.type('function');
        (new Stripe()).should.be.type('object');
    });

    describe('An instance:', function() {

        var stripe = null;

        before(function() {
            stripe = example.getConsumer('Stripe');
        });

        it('should be an object', function() {
            stripe.should.be.type('object');
        });

        it('should have an id', function() {
            stripe.should.have.property('id').with.type('function');
            stripe.id().should.be.type('string');
        });

        it('should be a config consumer', function() {
            stripe.should.have.property('configManager').with.type('function');
            stripe.should.have.property('configName').with.type('function');
            stripe.should.have.property('config').with.type('function');
        });

        it('should have a config manager', function() {
            stripe.configManager().should.equal(example);
        });

        it('can get a client instance', function() {
            var client = stripe.getClient();
            client.should.be.type('object');
        });

    });

    describe('An instance with an id that links to a config:', function() {

        var stripe = null;

        before(function() {
            stripe = example.getConsumer('Stripe', 'stripe');
        });

        it('should have a config', function() {
            stripe.config().should.be.type('object');
        });
    });
});
