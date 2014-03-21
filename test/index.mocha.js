var lib = require('../');

describe('Index:', function() {

    it('should be an object', function() {
        lib.should.be.type('object');
    });

    it('should have classes', function() {
        lib.should.have.property('classes').with.type('object');
        lib.classes.should.have.property('Couch').with.type('function');
        lib.classes.should.have.property('DB').with.type('function');
    });

    it('should have singletons', function() {
        lib.should.have.property('singletons').with.type('object');
        lib.singletons.should.have.property('couch').with.type('object');
    });
});
