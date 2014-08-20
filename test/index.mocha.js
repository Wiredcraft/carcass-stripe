var lib = require('../');
var example = require('../example');

describe('Index:', function() {

    it('should be an object', function() {
        lib.should.be.type('object');
    });

    it('should have classes', function() {
        lib.should.have.property('classes').with.type('object');
        lib.classes.should.have.property('Couch').with.type('function');
        lib.classes.should.have.property('CouchDB').with.type('function');
        lib.classes.should.have.property('Stripe').with.type('function');
    });

});

describe('Example:', function() {

    it('should be an object', function() {
        example.should.be.type('object');
    });

    it('should have classes', function() {
        example.should.have.property('classes').with.type('object');
        example.classes.should.have.property('Couch').with.type('function');
        example.classes.should.have.property('CouchDB').with.type('function');
        example.classes.should.have.property('Stripe').with.type('function');
    });

    it('should have singletons', function() {
        example.should.have.property('singletons').with.type('object');
        example.singletons.should.have.property('couch').with.type('object');
        example.singletons.should.have.property('stripe').with.type('object');
    });

});
